import { getAccountsBlockHeaders } from "@/queries/getAccountsBlockHeaders";
import * as React from "react";
import { MinimalBlock } from "@/lib/block-types";
import { ResolvedAddress } from "@/components/heatmap/types.ts";

export const useBlocks = (
  addresses: ResolvedAddress[],
  options?: { disableCache?: boolean; currentRound?: number },
) => {
  const [data, setData] = React.useState<MinimalBlock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setError] = React.useState(false);
  const [showProgress, setShowProgress] = React.useState(false);
  const [syncedUntilRound, setSyncedUntilRound] = React.useState(0);
  const [startRound, setStartRound] = React.useState(0);
  const [currentRound, setCurrentRound] = React.useState(0);
  const [remainingRounds, setRemainingRounds] = React.useState(0);

  const disableCache = options?.disableCache ?? false;
  const currentRoundOption = options?.currentRound ?? 0;

  React.useEffect(() => {
    if (addresses.length === 0) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setShowProgress(true);
        setSyncedUntilRound(0);
        setStartRound(0);
        setCurrentRound(0);
        setRemainingRounds(0);

        const result = await getAccountsBlockHeaders(addresses, {
          disableCache,
          currentRound: currentRoundOption,
          onProgress: (syncedUntil, start, current, remaining) => {
            setSyncedUntilRound(syncedUntil);
            setStartRound(start);
            setCurrentRound(current);
            setRemainingRounds(remaining);
          },
        });
        setData(result);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
        setShowProgress(false);
      }
    };

    loadData();
  }, [addresses, disableCache, currentRoundOption]);

  return {
    data,
    loading,
    hasError,
    progress: {
      showProgress,
      syncedUntilRound,
      startRound,
      currentRound,
      remainingRounds,
    },
  };
};
