import { MinimalBlock } from "@/lib/block-types";
import { ResolvedAddress } from "@/components/heatmap/types.ts";
import { fetchBlocksWithCache } from "@/lib/block-fetcher";

export async function getAccountsBlockHeaders(
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
  return fetchBlocksWithCache(addresses, {
    enableCache: options?.enableCache,
    currentRound: options?.currentRound,
    onProgress: options?.onProgress,
  });
}
