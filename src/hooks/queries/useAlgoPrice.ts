import { useQuery } from "@tanstack/react-query";
import { fetchAlgoPrice, type Currency } from "@/lib/currencies";

export function useAlgoPrice(currency: Currency = "USD") {
  return useQuery({
    queryKey: ["algoPrice", currency],
    queryFn: () => fetchAlgoPrice(currency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
