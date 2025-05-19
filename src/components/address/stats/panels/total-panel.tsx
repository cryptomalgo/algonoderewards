import AlgoAmountDisplay from "@/components/algo-amount-display";
import NumberDisplay from "@/components/number-display";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/mobile-tooltip";
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <NumberDisplay value={stats.maxBlocksInDay} />
                </TooltipTrigger>
                <TooltipContent>
                  {stats.maxBlocksInDayDateString}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        />
        <StatBox
          title="Max rewards in a day"
          loading={loading}
          content={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlgoAmountDisplay microAlgoAmount={stats.maxRewardsInDay} />
                </TooltipTrigger>
                <TooltipContent>
                  {stats.maxRewardsInDayDateString}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        />
        <StatBox
          title="Min reward"
          loading={loading}
          content={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlgoAmountDisplay microAlgoAmount={stats.minReward} />
                </TooltipTrigger>
                <TooltipContent>{stats.minRewardDate}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        />
        <StatBox
          title="Max reward"
          loading={loading}
          content={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlgoAmountDisplay microAlgoAmount={stats.maxReward} />
                </TooltipTrigger>
                <TooltipContent>{stats.maxRewardDate}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        />
      </div>
    </Panel>
  );
}
