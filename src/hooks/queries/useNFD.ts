import { useQuery } from "@tanstack/react-query";

interface NFDRecord {
  depositAccount: string;
  name: string;
  owner: string;
}

// Private API calls - not exported

/**
 * Resolves an NFD name to its Algorand address
 * @param nfd - The NFD name (e.g., "silvio.algo")
 * @returns The Algorand address associated with the NFD
 */
export async function resolveNFD(nfd: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.nf.domains/nfd/${nfd.toLowerCase()}`,
    );

    if (!response.ok) {
      throw new Error(`NFD not found: ${nfd}`);
    }

    const data: NFDRecord = await response.json();
    return data.depositAccount;
  } catch (error) {
    console.error("Error resolving NFD:", error);
    return "";
  }
}

/**
 * Reverse lookup: resolves an Algorand address to its primary NFD name
 * @param address - The Algorand address to lookup
 * @returns The primary NFD name (without .algo suffix) or empty string if none found
 */
async function reverseResolveNFD(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.nf.domains/nfd/lookup?address=${address}&view=tiny&allowUnverified=true`,
    );

    if (!response.ok) {
      throw new Error(`No NFD found for address: ${address}`);
    }

    const data: Record<string, NFDRecord> = await response.json();

    // The API returns an object with the address as key
    const nfdRecord = data[address];

    if (!nfdRecord?.name) {
      return "";
    }

    // Remove .algo suffix if present
    return nfdRecord.name.replace(/\.algo$/, "");
  } catch (error) {
    console.error("Error reverse resolving NFD:", error);
    return "";
  }
}

// Public hooks

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
