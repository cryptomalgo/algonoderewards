import { resolveNFD } from "@/hooks/queries/useNFD";
import * as React from "react";
import { ResolvedAddress } from "@/components/heatmap/types.ts";
import { toast } from "sonner";

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
              const resolvedAddr = await resolveNFD(address);
              // If NFD resolution fails (expired, not found, etc.), skip it
              if (!resolvedAddr || resolvedAddr.length !== 58) {
                toast.error(
                  `NFD "${address}" could not be resolved. It may be expired or not found.`,
                );
                return null;
              }
              return { address: resolvedAddr, nfd: address };
            }
            return { address, nfd: null };
          }),
        );

        // Filter out any null values from failed NFD resolutions
        const validAddresses = resolved.filter(
          (addr): addr is ResolvedAddress => addr !== null,
        );
        setResolvedAddresses(validAddresses);

        // If we had addresses but none resolved successfully, that's an error state
        if (addresses.length > 0 && validAddresses.length === 0) {
          setError(true);
        }
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
