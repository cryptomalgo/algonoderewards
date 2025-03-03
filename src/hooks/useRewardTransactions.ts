import { fetchTransactionsWithRewards } from "@/fetchTransactionsWithRewards.ts";
import * as React from "react";
import { Transaction } from "algosdk/client/indexer";

export const useTransactions = (address: string) => {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchTransactionsWithRewards(address);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address]);

  return { data, loading, error };
};
