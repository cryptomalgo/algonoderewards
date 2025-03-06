import { resolveNFD } from "@/fetchTransactionsWithRewards.ts";
import * as React from "react";

export const useAlgorandAddress = (address: string) => {
  const [resolvedAddress, setResolvedAddress] = React.useState<string | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [hasError, setError] = React.useState(false);

  React.useEffect(() => {
    const resolveAddress = async () => {
      try {
        if (address.toLowerCase().endsWith(".algo")) {
          setResolvedAddress(await resolveNFD(address));
          return;
        }
        setResolvedAddress(address);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    resolveAddress();
  }, [address]);

  return { resolvedAddress, loading, hasError };
};
