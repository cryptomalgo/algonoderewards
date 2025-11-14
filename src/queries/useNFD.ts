import { useQuery } from "@tanstack/react-query";
import { resolveNFD } from "./resolveNFD";
import { reverseResolveNFD } from "./reverseResolveNFD";

/**
 * Hook to resolve an NFD name to its Algorand address
 * @param nfd - The NFD name (e.g., "silvio.algo")
 * @param enabled - Whether the query should run (default: true if nfd is provided)
 */
export function useNFDResolve(nfd: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["nfd", "resolve", nfd],
    queryFn: () => {
      if (!nfd) throw new Error("NFD name is required");
      return resolveNFD(nfd);
    },
    enabled: enabled && !!nfd,
    staleTime: 1000 * 60 * 60, // 1 hour - NFD mappings don't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook to reverse lookup an Algorand address to its primary NFD name
 * @param address - The Algorand address to lookup
 * @param enabled - Whether the query should run (default: true if address is provided)
 */
export function useNFDReverse(
  address: string | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["nfd", "reverse", address],
    queryFn: () => {
      if (!address) throw new Error("Address is required");
      return reverseResolveNFD(address);
    },
    enabled: enabled && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes - reverse lookups might change more often
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to reverse lookup multiple addresses at once
 * @param addresses - Array of Algorand addresses to lookup
 * @param enabled - Whether the queries should run (default: true)
 */
export function useNFDReverseMultiple(addresses: string[], enabled = true) {
  return useQuery({
    queryKey: ["nfd", "reverse", "multiple", addresses.sort()],
    queryFn: async () => {
      const results = await Promise.all(
        addresses.map(async (address) => ({
          address,
          nfd: await reverseResolveNFD(address),
        })),
      );

      // Return as a map for easy lookup
      return Object.fromEntries(
        results.map(({ address, nfd }) => [address, nfd]),
      );
    },
    enabled: enabled && addresses.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
