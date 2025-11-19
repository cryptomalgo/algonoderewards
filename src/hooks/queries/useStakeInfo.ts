import { useQuery } from "@tanstack/react-query";

// https://afmetrics.api.nodely.io/v1/api-docs/#get-/v1/realtime/participation/online

type RewardsStats = {
  apy_pct: number; // Annual Percentage Yield (annualized rate with compounding)
  as_of_round: string; // Data valid as of round
  avg_payout_24hr: number; // Avg block reward payout in microAlgo
  eligible: number; // Number of rewards eligible online accounts
  eligible_stake_micro_algo: string; // Total eligible stake in microAlgo
  max_stake: string; // Maximum stake
  online: number; // Number of online accounts
  online_above30k: number; // Number of online accounts above 30K Algo
  p10_stake: string; // 10th percentile stake
  p25_stake: string; // 25th percentile stake
  p50_stake: string; // Median stake
  reward_rate_pct: number; // Last 24hr reward rate in pct (annualized)
  stake_micro_algo: string; // Total stake in microAlgo
};

// Private API call - not exported
const fetchStakeInfo = async (): Promise<RewardsStats> => {
  const response = await fetch(
    "https://afmetrics.api.nodely.io/v1/realtime/participation/online",
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch stake information: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export function useStakeInfo() {
  return useQuery({
    queryKey: ["stakeInfo"],
    queryFn: fetchStakeInfo,
  });
}
