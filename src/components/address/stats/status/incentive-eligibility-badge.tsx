import { DotBadge } from "@/components/dot-badge";
import { Account } from "algosdk/client/indexer";

export function IncentiveEligibilityBadge({ account }: { account: Account }) {
  if (account.incentiveEligible) {
    return (
      <DotBadge className="text-md" color="green" label="Incentive eligible" />
    );
  }
  return (
    <DotBadge
      className="text-md"
      color="red"
      label="Not eligible to incentive"
    />
  );
}
