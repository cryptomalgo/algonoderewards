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
    fetchedCount: 0,
    cachedCount: 0,
    startTime: 0,
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
      const startTime = Date.now();
      setProgressState((prev) => ({ ...prev, showProgress: true, startTime }));

      try {
        const blocks = await fetchBlocksWithCache(addresses, {
          enableCache: options?.enableCache,
          currentRound: options?.currentRound,
          onProgress: (syncedUntil, start, current, remaining) => {
            setProgressState((prev) => ({
              ...prev,
              showProgress: true,
              syncedUntilRound: syncedUntil,
              startRound: start,
              currentRound: current,
              remainingRounds: remaining,
            }));
            options?.onProgress?.(syncedUntil, start, current, remaining);
          },
          onStats: (fetched, cached) => {
            setProgressState((prev) => ({
              ...prev,
              fetchedCount: fetched,
              cachedCount: cached,
            }));
          },
        });

        // Don't set showProgress to false here - let the useEffect handle it
        return blocks;
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
        console.error(
          "Addresses:",
          addresses.map((a) => a.address),
        );
        console.error("Options:", options);
        setProgressState((prev) => ({ ...prev, showProgress: false }));
        throw error;
      }
    },
    enabled: addresses.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Close progress banner when query finishes loading/fetching
  useEffect(() => {
    if (!query.isLoading && !query.isFetching && progressState.startTime > 0) {
      const elapsed = Date.now() - progressState.startTime;
      const minimumDisplayTime = 1500; // Show for at least 1.5 seconds
      const completionDisplayTime = 2000; // Show completion for 2 seconds

      // If fetch was very fast, add delay to reach minimum display time
      const delayBeforeCompletion = Math.max(0, minimumDisplayTime - elapsed);

      // Total time = delay to reach minimum + completion display time
      const totalDelay = delayBeforeCompletion + completionDisplayTime;

      const timer = setTimeout(() => {
        setProgressState((prev) => ({ ...prev, showProgress: false }));
      }, totalDelay);
      return () => clearTimeout(timer);
    }
  }, [query.isLoading, query.isFetching, progressState.startTime]);

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
