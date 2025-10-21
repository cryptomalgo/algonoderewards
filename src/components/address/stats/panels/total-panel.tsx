import AlgoAmountDisplay from "@/components/algo-amount-display";
import NumberDisplay from "@/components/number-display";
import { NumberTooltip, AmountTooltip } from "@/components/ui/memoized-tooltip";
import { BlockStats } from "@/hooks/useBlocksStats";
import StatBox from "../stat-box";
import { Panel } from "../panel";

export function TotalsPanel({
  stats,
  loading,
}: {
  stats: BlockStats;
  loading: boolean;
}) {
  return (
    <Panel>
      <div className="grid grid-cols-2 gap-px rounded-lg bg-white/5 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox
          title="Total rewards"
          loading={loading}
          content={<AlgoAmountDisplay microAlgoAmount={stats.totalRewards} />}
        />
        <StatBox
          title="Total blocks"
          loading={loading}
          content={<NumberDisplay value={stats.totalNbOfBlocksWithRewards} />}
        />
        <StatBox
          title="Max blocks in a day"
          loading={loading}
          content={
            <NumberTooltip
              value={<NumberDisplay value={stats.maxBlocksInDay} />}
              dateString={stats.maxBlocksInDayDateString}
            />
          }
        />
        <StatBox
          title="Max rewards in a day"
          loading={loading}
          content={
            <AmountTooltip
              amount={
                <AlgoAmountDisplay microAlgoAmount={stats.maxRewardsInDay} />
              }
              dateString={stats.maxRewardsInDayDateString}
            />
          }
        />
        <StatBox
          title="Min reward"
          loading={loading}
          content={
            <AmountTooltip
              amount={<AlgoAmountDisplay microAlgoAmount={stats.minReward} />}
              dateString={stats.minRewardDate}
            />
          }
        />
        <StatBox
          title="Max reward"
          loading={loading}
          content={
            <AmountTooltip
              amount={<AlgoAmountDisplay microAlgoAmount={stats.maxReward} />}
              dateString={stats.maxRewardDate}
            />
          }
        />
      </div>
    </Panel>
  );
}
