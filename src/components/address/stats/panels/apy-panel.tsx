import { ResolvedAddress } from "@/components/heatmap/types";
import { useAccounts } from "@/hooks/useAccounts";
import { BlockStats } from "@/hooks/useBlocksStats";
import { useSearch } from "@tanstack/react-router";
import StatBox from "../stat-box";
import { calculateAPYAndProjection } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import NumberDisplay from "@/components/number-display";
import AlgoAmountDisplay from "@/components/algo-amount-display";
import { Panel } from "../panel";
import React from "react";

const ApyDisplay = React.memo(function ApyDisplay({
  totalRewardsOverPeriod,
  amountStacked,
  nbDays,
  hidden,
}: {
  totalRewardsOverPeriod: number;
  amountStacked: number;
  nbDays: number;
  hidden: boolean;
}) {
  const apy = calculateAPYAndProjection(
    totalRewardsOverPeriod,
    amountStacked,
    nbDays,
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col">
          <span className="flex gap-1">
            <NumberDisplay animate value={apy.apy} />%
          </span>
          <AlgoAmountDisplay
            className="text-sm"
            showAnimation
            hidden={hidden}
            microAlgoAmount={apy.projectedTotal}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <AlgoAmountDisplay
          showAnimation={false}
          showUsdValue={false}
          microAlgoAmount={totalRewardsOverPeriod}
        />
        {` rewarded over ${nbDays} days with `}
        <AlgoAmountDisplay
          showAnimation={false}
          showUsdValue={false}
          microAlgoAmount={amountStacked}
        />{" "}
        stacked. <br />
        APY is calculated as:{" "}
        <span className={"dark:bg-accent bg-gray-700"}>
          (rewards / algoStaked) * (365 / nbDays) * 100)
        </span>
      </TooltipContent>
    </Tooltip>
  );
});

export function ApyPanel({
  stats,
  loading,
  resolvedAddresses,
}: {
  stats: BlockStats;
  loading: boolean;
  resolvedAddresses: ResolvedAddress[];
}) {
  const search = useSearch({ from: "/$addresses" });
  const isAmountHidden = search.hideBalance;

  const { data, pending } = useAccounts(resolvedAddresses);

  let totalAmount = 0n;
  if (!pending && data && data.length > 0) {
    for (const account of data) {
      if (account && account.amount) {
        totalAmount += BigInt(account.amount);
      }
    }
  }

  return (
    <Panel>
      <div className="grid grid-cols-1 gap-px rounded-lg bg-white/5 sm:grid-cols-3">
        <StatBox
          title="Estimated APY"
          loading={loading || pending}
          skeletonLines={3}
          content={
            <ApyDisplay
              totalRewardsOverPeriod={stats.allTime.totalRewards}
              amountStacked={totalAmount ? Number(totalAmount) : 0}
              nbDays={stats.allTime.totalDays}
              hidden={isAmountHidden}
            />
          }
        />
        <StatBox
          title="Estimated APY (with last 30D perfs)"
          loading={loading || pending}
          skeletonLines={3}
          content={
            <ApyDisplay
              totalRewardsOverPeriod={stats.last30Days.totalRewards}
              amountStacked={totalAmount ? Number(totalAmount) : 0}
              nbDays={30}
              hidden={isAmountHidden}
            />
          }
        />
        <StatBox
          title="Estimated APY (with last 7D perfs)"
          loading={loading || pending}
          skeletonLines={3}
          content={
            <ApyDisplay
              totalRewardsOverPeriod={stats.last7Days.totalRewards}
              amountStacked={totalAmount ? Number(totalAmount) : 0}
              nbDays={7}
              hidden={isAmountHidden}
            />
          }
        />
      </div>
    </Panel>
  );
}
