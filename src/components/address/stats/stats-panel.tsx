import { Block } from "algosdk/client/indexer";
import AlgoAmountDisplay from "@/components/algo-amount-display";
import NumberDisplay from "@/components/number-display";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { BlockStats, useBlocksStats } from "@/hooks/useBlocksStats";
import StatBox from "./stat-box";
import PercentageChange from "./percentage-change";

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

function PreviousBlocksTooltip({
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
      {total} blocks proposed from {startDate.toLocaleDateString()} to{" "}
      {endDate.toLocaleDateString()}, so {average} per day in average
    </span>
  );
}

function TotalsPanel({
  stats,
  loading,
}: {
  stats: BlockStats;
  loading: boolean;
}) {
  return (
    <div className="mb-4 rounded-lg bg-indigo-500 shadow-lg dark:bg-white/6">
      <div className="mx-auto max-w-7xl rounded-lg">
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
                    <AlgoAmountDisplay
                      microAlgoAmount={stats.maxRewardsInDay}
                    />
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
      </div>
    </div>
  );
}

function RewardsPerDayPanel({
  stats,
  loading,
}: {
  stats: BlockStats;
  loading: boolean;
}) {
  return (
    <div className="mb-1 w-full rounded-lg bg-indigo-500 shadow-lg dark:bg-white/6">
      <div className="mx-auto max-w-7xl rounded-lg">
        <div className="grid grid-cols-1 gap-px rounded-lg bg-white/5 md:grid-cols-3">
          <StatBox
            title="Average rewards per day (all time)"
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
                            microAlgoAmount={stats.allTime.totalRewards}
                          />{" "}
                          {`rewarded in ${stats.allTime.totalDays} days (from ${stats.allTime.startDate.toLocaleDateString()} to ${stats.allTime.endDate.toLocaleDateString()})`}
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
                        showAnimation={false}
                        microAlgoAmount={stats.last30Days.avgRewardsPerDay}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <AlgoAmountDisplay
                        showAnimation={false}
                        microAlgoAmount={stats.last30Days.totalRewards}
                      />{" "}
                      {`rewarded from ${stats.last30Days.startDate.toLocaleDateString()} to ${stats.last30Days.endDate.toLocaleDateString()}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <PercentageChange
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
                        showAnimation={false}
                        microAlgoAmount={stats.last7Days.totalRewards}
                      />{" "}
                      {`rewarded from ${stats.last7Days.startDate.toLocaleDateString()} to ${stats.last7Days.endDate.toLocaleDateString()}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PercentageChange
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
      </div>
    </div>
  );
}

function BlocksPerDayPanel({
  stats,
  loading,
}: {
  stats: BlockStats;
  loading: boolean;
}) {
  return (
    <div className="mb-1 w-full rounded-lg bg-indigo-500 shadow-lg dark:bg-white/6">
      <div className="mx-auto max-w-7xl rounded-lg">
        <div className="grid grid-cols-1 gap-px rounded-lg bg-white/5 md:grid-cols-3">
          <StatBox
            title="Average blocks per day (all time)"
            loading={loading}
            content={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <NumberDisplay value={stats.allTime.avgBlocksPerDay} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {stats.allTime.startDate !== null &&
                      stats.allTime.endDate &&
                      `${stats.allTime.totalBlocks} blocks rewarded in ${stats.allTime.totalDays} days (from ${stats.allTime.startDate.toLocaleDateString()} to ${stats.allTime.endDate.toLocaleDateString()})`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />

          <StatBox
            title="Average blocks per day (last 30D)"
            loading={loading}
            content={
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <NumberDisplay value={stats.last30Days.avgBlocksPerDay} />
                    </TooltipTrigger>
                    <TooltipContent>
                      {`${stats.last30Days.totalBlocks} blocks proposed from ${stats.last30Days.startDate.toLocaleString()} to ${stats.last30Days.endDate.toLocaleString()}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <PercentageChange
                  percentage={stats.last30Days.change.blocks.percentage}
                  direction={stats.last30Days.change.blocks.direction}
                  previousValueDisplay={
                    <PreviousBlocksTooltip
                      startDate={stats.previous30Days.startDate}
                      endDate={stats.previous30Days.endDate}
                      total={stats.previous30Days.totalBlocks}
                      average={stats.previous30Days.avgBlocksPerDay}
                    />
                  }
                />
              </div>
            }
          />
          <StatBox
            title="Average blocks per day (last 7D)"
            loading={loading}
            content={
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <NumberDisplay value={stats.last7Days.avgBlocksPerDay} />
                    </TooltipTrigger>
                    <TooltipContent>
                      {`${stats.last7Days.totalBlocks} blocks proposed from ${stats.last7Days.startDate.toLocaleDateString()} to ${stats.last7Days.endDate.toLocaleDateString()}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <PercentageChange
                  percentage={stats.last7Days.change.blocks.percentage}
                  direction={stats.last7Days.change.blocks.direction}
                  previousValueDisplay={
                    <PreviousBlocksTooltip
                      startDate={stats.previous7Days.startDate}
                      endDate={stats.previous7Days.endDate}
                      total={stats.previous7Days.totalBlocks}
                      average={stats.previous7Days.avgBlocksPerDay}
                    />
                  }
                />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function StatsPanel({
  filteredBlocks,
  loading,
}: {
  filteredBlocks: Block[];
  loading: boolean;
}) {
  const stats = useBlocksStats(filteredBlocks);

  return (
    <div className="space-y-4">
      <TotalsPanel stats={stats} loading={loading} />
      <div className={"flex justify-between gap-3 md:flex-col"}>
        <RewardsPerDayPanel stats={stats} loading={loading} />
        <BlocksPerDayPanel stats={stats} loading={loading} />
      </div>
    </div>
  );
}
