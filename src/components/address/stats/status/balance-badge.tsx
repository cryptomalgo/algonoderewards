import { DotBadge } from "@/components/dot-badge";
import { ALGO_BALANCE_THRESHOLD_FOR_REWARDS } from "@/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { Account } from "algosdk/client/indexer";

export function BalanceThresholdBadge({ account }: { account: Account }) {
  const isBalanceOverThreshold =
    new AlgoAmount({ microAlgos: account.amount }) >=
    new AlgoAmount({ algos: ALGO_BALANCE_THRESHOLD_FOR_REWARDS });

  if (isBalanceOverThreshold) {
    return (
      <DotBadge
        className="text-md"
        color="green"
        label="Balance over threshold"
      />
    );
  }
  return (
    <DotBadge className="text-md" color="red" label="Balance under threshold" />
  );
}
