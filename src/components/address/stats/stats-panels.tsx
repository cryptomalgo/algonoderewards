import { MinimalBlock } from "@/lib/block-types";
import { useBlocksStats } from "@/hooks/useBlocksStats";
import { ResolvedAddress } from "@/components/heatmap/types";
import { BlocksPerDayPanel } from "./panels/blocks-per-day-panel";
import { RewardsPerDayPanel } from "./panels/rewards-per-day-panel";
import { ApyPanel } from "./panels/apy-panel";
import { TotalsPanel } from "./panels/total-panel";
import { useSearch } from "@tanstack/react-router";

const StatsPanels = function StatsPanels({
  filteredBlocks,
  loading,
  resolvedAddresses,
}: {
  filteredBlocks: MinimalBlock[];
  loading: boolean;
  resolvedAddresses: ResolvedAddress[];
}) {
  const stats = useBlocksStats(filteredBlocks);
  const search = useSearch({ from: "/$addresses" });
  const hideBalance = search.hideBalance;

  return (
    <div className="space-y-4">
      <ApyPanel
        stats={stats}
        loading={loading}
        resolvedAddresses={resolvedAddresses}
      />
      <TotalsPanel stats={stats} loading={loading} hideBalance={hideBalance} />
      <div className={"flex justify-between gap-3 md:flex-col"}>
        <RewardsPerDayPanel
          stats={stats}
          loading={loading}
          hideBalance={hideBalance}
        />
        <BlocksPerDayPanel
          stats={stats}
          loading={loading}
          hideBalance={hideBalance}
        />
      </div>
    </div>
  );
};

export default StatsPanels;
