import { indexerClient } from "@/lib/indexer-client";
import { useQuery } from "@tanstack/react-query";

const getBlock = (round: number) => {
  return indexerClient.lookupBlock(round).do();
};

export const useBlock = (round?: number) => {
  return useQuery({
    queryKey: ["block", round],
    enabled: round !== undefined,
    queryFn: () => {
      // Safety check inside query function
      if (round === undefined) {
        throw new Error("Block round is required");
      }
      return getBlock(round);
    },
  });
};
