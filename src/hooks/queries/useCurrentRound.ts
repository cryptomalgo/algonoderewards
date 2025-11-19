import { indexerClient } from "@/lib/indexer-client";
import { useQuery } from "@tanstack/react-query";

// Private API call - not exported
const getCurrentRound = () => {
  return indexerClient
    .searchForBlockHeaders()
    .limit(1)
    .do()
    .then((res) => res.currentRound);
};

export const useCurrentRound = () => {
  return useQuery({
    queryKey: ["currentRound"],
    queryFn: getCurrentRound,
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};
