import { executePaginatedRequest } from "@algorandfoundation/algokit-utils";
import { BlockHeadersResponse } from "algosdk/client/indexer";
import { ResolvedAddress } from "@/components/heatmap/types";
import { indexerClient } from "@/lib/indexer-client";
import {
  getBlocksFromCache,
  getMaxRoundFromCache,
  saveBlocksToCache,
} from "./block-storage";
import { MinimalBlock, toMinimalBlock } from "./block-types";

const REWARDS_START_ROUND = 46512890;

// Global progress tracker to ensure monotonic progress across all concurrent operations
const globalProgressTracker = { lastProgress: 0 };

async function loadCachedBlocks(addresses: ResolvedAddress[]) {
  return Promise.all(
    addresses.map(async (addr) => ({
      address: addr.address,
      blocks: await getBlocksFromCache(addr.address),
    })),
  );
}

// When multiple addresses: use the highest cached round to avoid refetching
// This ensures no blocks are missed, though it may refetch some data
async function calculateMinStartRound(addresses: ResolvedAddress[]) {
  const maxRounds = await Promise.all(
    addresses.map((addr) => getMaxRoundFromCache(addr.address)),
  );

  const validMaxRounds = maxRounds.filter((r): r is number => r !== null);

  if (validMaxRounds.length > 0) {
    // Use the highest cached round + 1 to ensure no gaps
    return Math.max(...validMaxRounds) + 1;
  }

  return REWARDS_START_ROUND;
}

async function fetchNewBlocksFromAPI(
  addresses: ResolvedAddress[],
  minStartRound: number,
  options?: {
    currentRound?: number;
    onProgress?: (
      syncedUntilRound: number,
      startRound: number,
      currentRound: number,
      remainingRounds: number,
    ) => void;
  },
) {
  const currentRound = options?.currentRound ?? 0;
  const onProgress = options?.onProgress;
  const totalRounds = currentRound - REWARDS_START_ROUND;

  // Track the maximum round fetched so far, start with minStartRound to show initial progress
  let maxRoundFetched = minStartRound;

  // Debounce progress updates to prevent race conditions
  let progressUpdateTimeout: NodeJS.Timeout | null = null;

  const apiBlocks = await executePaginatedRequest(
    (response: BlockHeadersResponse) => {
      // Update max round from the current response only if it's higher (blocks are sorted, last is max)
      if (response.blocks.length > 0) {
        const lastBlockRound = Number(
          response.blocks[response.blocks.length - 1].round,
        );
        maxRoundFetched = Math.max(maxRoundFetched, lastBlockRound);
      }

      // Calculate progress based on max round fetched
      const currentProgress = maxRoundFetched - REWARDS_START_ROUND;

      // Only update progress if it's higher than the global last progress
      if (currentProgress > globalProgressTracker.lastProgress) {
        const processedRounds = Math.min(currentProgress, totalRounds);

        // Debounce the progress update to ensure proper ordering
        if (progressUpdateTimeout) {
          clearTimeout(progressUpdateTimeout);
        }
        progressUpdateTimeout = setTimeout(() => {
          // Double-check the progress is still higher before updating
          if (processedRounds > globalProgressTracker.lastProgress) {
            const remaining = currentRound - maxRoundFetched;
            onProgress?.(
              maxRoundFetched,
              REWARDS_START_ROUND,
              currentRound,
              remaining,
            );
            globalProgressTracker.lastProgress = processedRounds;
          }
        }, 10); // Small delay to allow for proper ordering
      }

      return response.blocks;
    },
    (nextToken) => {
      let s = indexerClient
        .searchForBlockHeaders()
        .minRound(minStartRound)
        .limit(1000)
        .proposers(addresses.map((a: ResolvedAddress) => a.address));
      if (nextToken) {
        s = s.nextToken(nextToken);
      }
      return s;
    },
  );

  return apiBlocks
    .map(toMinimalBlock)
    .filter((block): block is MinimalBlock => block !== null);
}

function mergeAndDeduplicateBlocks(
  cachedBlocks: MinimalBlock[],
  newBlocks: MinimalBlock[],
  address: string,
) {
  const allBlocks = [...cachedBlocks];

  // Filter new blocks for this address (proposer is already an address string)
  const addressNewBlocks = newBlocks.filter(
    (block) => block.proposer === address,
  );

  allBlocks.push(...addressNewBlocks);
  allBlocks.sort((a, b) => a.round - b.round);

  return allBlocks.filter(
    (block, index, self) =>
      index === self.findIndex((b) => b.round === block.round),
  );
}

async function updateCaches(
  mergedBlocksByAddress: Map<string, MinimalBlock[]>,
) {
  await Promise.all(
    Array.from(mergedBlocksByAddress.entries()).map(([address, blocks]) =>
      saveBlocksToCache(address, blocks),
    ),
  );
}

function combineAndConvertBlocks(
  mergedBlocksByAddress: Map<string, MinimalBlock[]>,
): MinimalBlock[] {
  const allMinimalBlocks: MinimalBlock[] = [];
  for (const blocks of mergedBlocksByAddress.values()) {
    allMinimalBlocks.push(...blocks);
  }

  allMinimalBlocks.sort((a, b) => a.round - b.round);
  const uniqueBlocks = allMinimalBlocks.filter(
    (block, index, self) =>
      index === self.findIndex((b) => b.round === block.round),
  );

  return uniqueBlocks;
}

export async function fetchBlocksWithCache(
  addresses: ResolvedAddress[],
  options?: {
    disableCache?: boolean;
    currentRound?: number;
    onProgress?: (
      syncedUntilRound: number,
      startRound: number,
      currentRound: number,
      remainingRounds: number,
    ) => void;
  },
): Promise<MinimalBlock[]> {
  if (addresses.length === 0) {
    return [];
  }

  const disableCache = options?.disableCache ?? false;
  const currentRound = options?.currentRound ?? 0;
  const onProgress = options?.onProgress;

  // If cache is disabled, fetch directly from API
  if (disableCache) {
    const newBlocks = await fetchNewBlocksFromAPI(
      addresses,
      REWARDS_START_ROUND,
      { currentRound, onProgress },
    );
    const mergedBlocksByAddress = new Map<string, MinimalBlock[]>();

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const merged = mergeAndDeduplicateBlocks([], newBlocks, addr.address);
      mergedBlocksByAddress.set(addr.address, merged);
    }

    return combineAndConvertBlocks(mergedBlocksByAddress);
  }

  // Normal cache-enabled flow
  const cacheResults = await loadCachedBlocks(addresses);
  const minStartRound = await calculateMinStartRound(addresses);
  const newBlocks = await fetchNewBlocksFromAPI(addresses, minStartRound, {
    currentRound,
    onProgress,
  });

  const mergedBlocksByAddress = new Map<string, MinimalBlock[]>();

  for (let i = 0; i < cacheResults.length; i++) {
    const { address, blocks: cachedBlocks } = cacheResults[i];
    const merged = mergeAndDeduplicateBlocks(
      cachedBlocks || [],
      newBlocks,
      address,
    );
    mergedBlocksByAddress.set(address, merged);
  }

  await updateCaches(mergedBlocksByAddress);

  return combineAndConvertBlocks(mergedBlocksByAddress);
}
