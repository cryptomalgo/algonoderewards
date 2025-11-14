import { Progress } from "@/components/ui/progress";
import Spinner from "@/components/spinner";
import { XIcon } from "lucide-react";

interface FetchProgressScreenProps {
  isVisible: boolean;
  syncedUntilRound: number;
  startRound: number;
  currentRound: number;
  remainingRounds: number;
  isCacheDisabled?: boolean;
  onClose?: () => void;
}

export function FetchProgressScreen({
  isVisible,
  syncedUntilRound,
  startRound,
  currentRound,
  remainingRounds,
  isCacheDisabled = false,
  onClose,
}: FetchProgressScreenProps) {
  const totalRounds = currentRound - startRound;
  const processedRounds = syncedUntilRound - startRound;
  const progress = totalRounds > 0 ? (processedRounds / totalRounds) * 100 : 0;

  if (!isVisible) return null;

  // Show loading spinner until we have actual data
  const hasData = startRound > 0 && currentRound > 0;

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-card relative mx-4 w-full max-w-md space-y-4 rounded-lg border p-4 shadow-lg sm:space-y-6 sm:p-6">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}

        <div className="space-y-1.5 text-center sm:space-y-2">
          <h2 className="text-base font-semibold sm:text-lg">
            Fetching Block Data
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Loading block reward data for your addresses. This may take a few
            moments.
          </p>
        </div>

        {!hasData ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-mono text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
                  {startRound}
                </span>
                <span className="font-mono text-[10px] text-gray-500 sm:text-xs dark:text-gray-400">
                  {currentRound}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-between text-[10px] text-gray-600 sm:text-xs dark:text-gray-400">
                <span>
                  Synced:{" "}
                  <span className="font-mono font-semibold">
                    {syncedUntilRound}
                  </span>
                </span>
                <span>
                  Remaining:{" "}
                  <span className="font-mono font-semibold">
                    {remainingRounds}
                  </span>
                </span>
              </div>
            </div>

            {!isCacheDisabled && (
              <div className="text-muted-foreground text-center text-[10px] sm:text-xs">
                Only newer blocks are fetched from the network. Cached data is
                used when available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
