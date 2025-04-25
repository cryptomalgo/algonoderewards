import { resolveNFD } from "@/queries/getResolvedNFD";
import * as React from "react";
import { ResolvedAddress } from "@/components/heatmap/types.ts";

export const useAlgorandAddresses = (addresses: string[]) => {
  const [resolvedAddresses, setResolvedAddresses] = React.useState<
    ResolvedAddress[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setError] = React.useState(false);

  React.useEffect(() => {
    const resolveAddress = async () => {
      try {
        // Use Promise.all to wait for all the async operations to complete
        const resolved = await Promise.all(
          addresses.map(async (address) => {
            if (address.toLowerCase().endsWith(".algo")) {
              return { address: await resolveNFD(address), nfd: address };
            }
            return { address, nfd: null };
          }),
        );

        setResolvedAddresses(resolved);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    resolveAddress();
  }, [addresses]);

  return { resolvedAddresses, loading, hasError };
};
