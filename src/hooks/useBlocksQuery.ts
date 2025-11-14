import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResolvedAddress } from "@/components/heatmap/types";
import { fetchBlocksWithCache } from "@/lib/block-fetcher";
import { useState } from "react";

interface UseBlocksQueryOptions {
  disableCache?: boolean;
  currentRound?: number;
  onProgress?: (
    syncedUntilRound: number,
    startRound: number,
    currentRound: number,
    remainingRounds: number,
  ) => void;
}

export function useBlocksQuery(
  addresses: ResolvedAddress[],
  options?: UseBlocksQueryOptions,
) {
  const [progressState, setProgressState] = useState({
    showProgress: false,
    syncedUntilRound: 0,
    startRound: 0,
    currentRound: 0,
    remainingRounds: 0,
  });

  const query = useQuery({
    queryKey: [
      "blocks",
      addresses
        .map((a) => a.address)
        .sort()
        .join(","),
    ],
    queryFn: async () => {
      setProgressState((prev) => ({ ...prev, showProgress: true }));

      const blocks = await fetchBlocksWithCache(addresses, {
        disableCache: options?.disableCache,
        currentRound: options?.currentRound,
        onProgress: (syncedUntil, start, current, remaining) => {
          setProgressState({
            showProgress: true,
            syncedUntilRound: syncedUntil,
            startRound: start,
            currentRound: current,
            remainingRounds: remaining,
          });
          options?.onProgress?.(syncedUntil, start, current, remaining);
        },
      });

      setProgressState((prev) => ({ ...prev, showProgress: false }));
      return blocks;
    },
    enabled: addresses.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    hasError: query.isError,
    progress: progressState,
    refetch: query.refetch,
  };
}

export function useRefreshBlocks() {
  const queryClient = useQueryClient();

  const refreshBlocks = async () => {
    // Invalidate all blocks queries to trigger refetch
    await queryClient.invalidateQueries({ queryKey: ["blocks"] });
  };

  const hardRefreshBlocks = async () => {
    // Remove all blocks queries from cache and refetch
    await queryClient.resetQueries({ queryKey: ["blocks"] });
  };

  return {
    refreshBlocks,
    hardRefreshBlocks,
  };
}
