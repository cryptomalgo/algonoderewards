import { indexerClient } from "@/lib/indexer-client";
import { useQuery } from "@tanstack/react-query";

const getApplication = (applicationId: number) => {
  return indexerClient
    .lookupApplications(applicationId)
    .do()
    .then((res) => res.application);
};

export const useApplication = (applicationId: number) => {
  return useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => getApplication(applicationId),
    refetchInterval: 1000 * 60 * 60, // 1 hour
  });
};
