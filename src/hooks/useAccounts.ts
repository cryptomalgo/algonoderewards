import { ResolvedAddress } from "@/components/heatmap/types";
import { indexerClient } from "@/lib/indexer-client";
import { useQueries, useQuery } from "@tanstack/react-query";

const getAccount = (address: string) => {
  return indexerClient
    .lookupAccountByID(address)
    .includeAll()
    .do()
    .then((res) => res.account);
};

export const useAccount = (address: ResolvedAddress) => {
  return useQuery({
    queryKey: ["account", address.address],
    queryFn: () => getAccount(address.address),
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });
};

export const useAccounts = (addresses: ResolvedAddress[]) => {
  return useQueries({
    queries: addresses.map((address) => ({
      queryKey: ["account", address.address],
      queryFn: () => getAccount(address.address),
      refetchInterval: 1000 * 60 * 15, // 15 minutes
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      };
    },
  });
};
