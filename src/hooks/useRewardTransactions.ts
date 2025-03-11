import { fetchTransactionsWithRewards } from "@/fetchTransactionsWithRewards.ts";
import * as React from "react";
import { Block } from "algosdk/client/indexer";
import { ResolvedAddress } from "@/components/heatmap/types.ts";

export const useBlocks = (addresses: ResolvedAddress[]) => {
  const [data, setData] = React.useState<Block[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setError] = React.useState(false);

  React.useEffect(() => {
    if (addresses.length === 0) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchTransactionsWithRewards(addresses);
        setData(result);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [addresses]);

  return { data, loading, hasError };
};
