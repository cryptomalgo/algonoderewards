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

  // Track the maximum round fetched so far, start with minStartRound to show initial progress
  let maxRoundFetched = minStartRound;

  const apiBlocks = await executePaginatedRequest(
    (response: BlockHeadersResponse) => {
      // Update max round from the current response only if it's higher (blocks are sorted, last is max)
      if (response.blocks.length > 0) {
        const lastBlockRound = Number(
          response.blocks[response.blocks.length - 1].round,
        );
        maxRoundFetched = Math.max(maxRoundFetched, lastBlockRound);
      }

      // Calculate remaining rounds from current position to current round
      const remaining = currentRound - maxRoundFetched;

      // Call progress callback with the current state
      // Progress bar: 0% = minStartRound, 100% = currentRound
      onProgress?.(maxRoundFetched, minStartRound, currentRound, remaining);

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
    enableCache?: boolean;
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

  const enableCache = options?.enableCache ?? false;
  const currentRound = options?.currentRound ?? 0;
  const onProgress = options?.onProgress;

  // If cache is disabled, fetch directly from API
  if (!enableCache) {
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

  // If the cache is already up to date or very close (within 10 rounds), just return cached data
  // This prevents errors when trying to fetch with minRound >= currentRound
  if (currentRound > 0 && minStartRound > currentRound - 10) {
    const mergedBlocksByAddress = new Map<string, MinimalBlock[]>();
    for (let i = 0; i < cacheResults.length; i++) {
      const { address, blocks: cachedBlocks } = cacheResults[i];
      mergedBlocksByAddress.set(address, cachedBlocks || []);
    }
    return combineAndConvertBlocks(mergedBlocksByAddress);
  }

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
