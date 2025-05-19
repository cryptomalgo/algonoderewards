import AlgoAmountDisplay from "@/components/algo-amount-display";
import { BlockStats } from "@/hooks/useBlocksStats";
import { Panel } from "../panel";
import PercentageChange from "../percentage-change";
import StatBox from "../stat-box";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { AVERAGE_DAY_IN_MONTH } from "@/constants";

function PreviousRewardTooltip({
  total,
  average,
  startDate,
  endDate,
}: {
  total: number;
  average: number;
  startDate: Date;
  endDate: Date;
}) {
  return (
    <span>
      <AlgoAmountDisplay showAnimation={false} microAlgoAmount={total} />{" "}
      rewarded from {startDate.toLocaleDateString()} to{" "}
      {endDate.toLocaleDateString()}, so{" "}
      <AlgoAmountDisplay showAnimation={false} microAlgoAmount={average} /> per
      day in average
    </span>
  );
}

export function RewardsPerDayPanel({
  stats,
  loading,
}: {
  stats: BlockStats;
  loading: boolean;
}) {
  return (
    <Panel>
      <div className="grid h-full grid-cols-1 gap-px rounded-lg bg-white/5 md:grid-cols-4">
        <StatBox
          title="Average rewards per day"
          loading={loading}
          content={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlgoAmountDisplay
                    microAlgoAmount={stats.allTime.avgRewardsPerDay}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {stats.allTime.startDate !== null &&
                    stats.allTime.endDate && (
                      <>
                        <AlgoAmountDisplay
                          showAnimation={false}
                          showUsdValue={false}
                          microAlgoAmount={stats.allTime.totalRewards}
                        />
                        {` rewarded in ${stats.allTime.totalDays} days (from ${stats.allTime.startDate.toLocaleDateString()} to ${stats.allTime.endDate.toLocaleDateString()})`}
                      </>
                    )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        />{" "}
        <StatBox
          title="Average rewards per month"
          loading={loading}
          content={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlgoAmountDisplay
                    microAlgoAmount={
                      stats.allTime.avgRewardsPerDay * AVERAGE_DAY_IN_MONTH
                    }
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {stats.allTime.startDate !== null &&
                    stats.allTime.endDate && (
                      <>
                        <AlgoAmountDisplay
                          showAnimation={false}
                          showUsdValue={false}
                          microAlgoAmount={stats.allTime.avgRewardsPerDay}
                        />
                        {` by day x ${AVERAGE_DAY_IN_MONTH} days in a month (365/12)`}
                      </>
                    )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        />
        <StatBox
          title="Average rewards per day (last 30D)"
          loading={loading}
          content={
            <div className="flex flex-wrap items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlgoAmountDisplay
                      microAlgoAmount={stats.last30Days.avgRewardsPerDay}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <AlgoAmountDisplay
                      showAnimation={false}
                      showUsdValue={false}
                      microAlgoAmount={stats.last30Days.totalRewards}
                    />{" "}
                    {`rewarded from ${stats.last30Days.startDate.toLocaleDateString()} to ${stats.last30Days.endDate.toLocaleDateString()}`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PercentageChange
                className={"mt-1 self-start"}
                percentage={stats.last30Days.change.rewards.percentage}
                direction={stats.last30Days.change.rewards.direction}
                previousValueDisplay={
                  <PreviousRewardTooltip
                    startDate={stats.previous30Days.startDate}
                    endDate={stats.previous30Days.endDate}
                    total={stats.previous30Days.totalRewards}
                    average={stats.previous30Days.avgRewardsPerDay}
                  />
                }
              />
            </div>
          }
        />
        <StatBox
          title="Average rewards per day (last 7D)"
          loading={loading}
          content={
            <div className="flex flex-wrap items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlgoAmountDisplay
                      microAlgoAmount={stats.last7Days.avgRewardsPerDay}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <AlgoAmountDisplay
                      showUsdValue={false}
                      showAnimation={false}
                      microAlgoAmount={stats.last7Days.totalRewards}
                    />{" "}
                    {`rewarded from ${stats.last7Days.startDate.toLocaleDateString()} to ${stats.last7Days.endDate.toLocaleDateString()}`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <PercentageChange
                className={"mt-1 self-start"}
                percentage={stats.last7Days.change.rewards.percentage}
                direction={stats.last7Days.change.rewards.direction}
                previousValueDisplay={
                  <PreviousRewardTooltip
                    startDate={stats.previous7Days.startDate}
                    endDate={stats.previous7Days.endDate}
                    total={stats.previous7Days.totalRewards}
                    average={stats.previous7Days.avgRewardsPerDay}
                  />
                }
              />
            </div>
          }
        />
      </div>
    </Panel>
  );
}
