import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResolvedAddress } from "@/components/heatmap/types";
import { fetchBlocksWithCache } from "@/lib/block-fetcher";
import { useState, useEffect } from "react";

interface UseBlocksQueryOptions {
  enableCache?: boolean;
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

      try {
        const blocks = await fetchBlocksWithCache(addresses, {
          enableCache: options?.enableCache,
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
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
        console.error("Addresses:", addresses.map((a) => a.address));
        console.error("Options:", options);
        setProgressState((prev) => ({ ...prev, showProgress: false }));
        throw error;
      }
    },
    enabled: addresses.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Close progress modal when query finishes loading/fetching
  useEffect(() => {
    if (!query.isLoading && !query.isFetching) {
      // Use a small timeout to ensure any final progress updates are shown
      const timer = setTimeout(() => {
        setProgressState((prev) => ({ ...prev, showProgress: false }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query.isLoading, query.isFetching]);

  // Show progress when query is actively loading or when internal state says to show it
  const shouldShowProgress =
    (query.isLoading || query.isFetching || progressState.showProgress) &&
    !query.isError;

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    hasError: query.isError,
    progress: {
      ...progressState,
      showProgress: shouldShowProgress,
    },
    refetch: query.refetch,
    closeProgress: () =>
      setProgressState((prev) => ({ ...prev, showProgress: false })),
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
