import { fetchTransactionsWithRewards } from "@/fetchTransactionsWithRewards.ts";
import * as React from "react";
import { Transaction } from "algosdk/client/indexer";

export const useTransactions = (address: string | null) => {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setError] = React.useState(false);

  React.useEffect(() => {
    if (!address) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchTransactionsWithRewards(address);
        setData(result);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address]);

  return { data, loading, hasError };
};
