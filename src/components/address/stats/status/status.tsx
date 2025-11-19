import { useAccount } from "@/hooks/queries/useAccounts";
import { ResolvedAddress } from "../../../heatmap/types";
import { BalanceCard, BalanceCardSkeleton } from "./balance-card";
import { BalanceThresholdBadge } from "./balance-badge";
import { IncentiveEligibilityBadge } from "./incentive-eligibility-badge";
import { LastHeartbeatBadge } from "./last-heartbeat-badge";
import { ParticipationKeyBadge } from "./participation-key-badge";
import { StatusBadge } from "./status-badge";
import { AnxietyCard, AnxietyCardSkeleton } from "./anxiety-card";
import { StatusBadgesSkeleton } from "./status-badges-skeleton";
import { CacheBadges } from "./cache-badges";
import { CacheManagementDialog } from "@/components/address/cache-management-dialog";

export default function AccountStatus({
  address,
}: {
  address: ResolvedAddress;
}) {
  const { data: account, isPending, isError, error } = useAccount(address);

  if (isPending) {
    return (
      <div className="my-2">
        <div className="item flex flex-col gap-2">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <BalanceCardSkeleton />
            <StatusBadgesSkeleton />
          </div>
          <AnxietyCardSkeleton />
        </div>
      </div>
    );
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
        <div className="flex flex-wrap items-center gap-2">
          <CacheManagementDialog>
            <CacheBadges />
          </CacheManagementDialog>
        </div>
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
