interface FetchProgressProps {
  isVisible: boolean;
  syncedUntilRound: number;
  startRound: number;
  currentRound: number;
  remainingRounds: number;
  fetchedCount?: number;
  cachedCount?: number;
  isCacheEnabled?: boolean;
}

export function FetchProgress({
  isVisible,
  syncedUntilRound,
  startRound,
  currentRound,
  remainingRounds,
  fetchedCount = 0,
  cachedCount = 0,
  isCacheEnabled = false,
}: FetchProgressProps) {
  const totalRounds = currentRound - startRound;
  const processedRounds = syncedUntilRound - startRound;
  const progress = totalRounds > 0 ? (processedRounds / totalRounds) * 100 : 0;

  // Consider complete if we have stats (fetched or cached count > 0) OR traditional completion check
  const isComplete =
    fetchedCount > 0 ||
    cachedCount > 0 ||
    (remainingRounds <= 0 && totalRounds > 0 && progress >= 99);

  // Don't show loading UI if we don't have valid data yet
  const hasValidData = startRound > 0 && currentRound > 0;

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top sticky top-0 z-40 w-full border-b bg-white/80 shadow-sm backdrop-blur duration-300 supports-backdrop-filter:bg-white/60 dark:bg-gray-900/80 dark:supports-backdrop-filter:bg-gray-900/60">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {isComplete ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Sync Complete
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {fetchedCount.toLocaleString()}
                  </span>{" "}
                  proposed {fetchedCount === 1 ? "block" : "blocks"} fetched
                  {cachedCount > 0 && (
                    <>
                      {" • "}
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {cachedCount.toLocaleString()}
                      </span>{" "}
                      from cache
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {hasValidData
                    ? "Syncing blocks from Algorand network..."
                    : isCacheEnabled
                      ? "Loading from cache..."
                      : "Loading blocks..."}
                </p>
                {hasValidData && (
                  <div aria-hidden="true" className="mt-3">
                    <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                      <div
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        className="h-2 rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {Math.round(progress)}%
                        </span>
                        <span className="hidden sm:inline">
                          Start block:{" "}
                          <span className="font-mono">{startRound}</span>
                        </span>
                        <span className="hidden md:inline">
                          End block:{" "}
                          <span className="font-mono">{currentRound}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="hidden sm:inline">
                          Remaining blocks:{" "}
                        </span>
                        <span className="font-mono">{remainingRounds}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
