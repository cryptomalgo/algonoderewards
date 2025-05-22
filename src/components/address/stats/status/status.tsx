import { useAccount } from "@/hooks/useAccounts";
import { ResolvedAddress } from "../../../heatmap/types";
import Spinner from "@/components/spinner.tsx";
import { BalanceCard } from "./balance-card";
import { BalanceThresholdBadge } from "./balance-badge";
import { IncentiveEligibilityBadge } from "./incentive-eligibility-badge";
import { LastHeartbeatBadge } from "./last-heartbeat-badge";
import { ParticipationKeyBadge } from "./participation-key-badge";
import { StatusBadge } from "./status-badge";
import { AnxietyCard } from "./anxiety-card";

export default function AccountStatus({
  address,
}: {
  address: ResolvedAddress;
}) {
  const { data: account, isPending, isError, error } = useAccount(address);

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error fetching account status: {error.message}
      </div>
    );
  }

  return (
    <div className="my-2">
      <div className="item flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <BalanceCard account={account} />
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge account={account} />
              <BalanceThresholdBadge account={account} />
              <IncentiveEligibilityBadge account={account} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LastHeartbeatBadge account={account} />
              <ParticipationKeyBadge account={account} />
            </div>
          </div>
        </div>
        <AnxietyCard account={account} />
      </div>
    </div>
  );
}
