import { BlockStats } from "@/hooks/useBlocksStats";
import { Panel } from "../panel";
import StatBox from "../stat-box";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import NumberDisplay from "@/components/number-display";
import PercentageChange from "../percentage-change";
import { AVERAGE_DAY_IN_MONTH } from "@/constants";

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

export function BlocksPerDayPanel({
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
          title="Average blocks per day"
          loading={loading}
          skeletonLines={1}
          content={
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
          }
        />
        <StatBox
          title="Average blocks per month"
          loading={loading}
          skeletonLines={1}
          content={
            <Tooltip>
              <TooltipTrigger>
                <NumberDisplay
                  value={stats.allTime.avgBlocksPerDay * AVERAGE_DAY_IN_MONTH}
                />
              </TooltipTrigger>
              <TooltipContent>
                {stats.allTime.startDate !== null &&
                  stats.allTime.endDate &&
                  `${stats.allTime.avgBlocksPerDay.toFixed(3)} blocks per day x ${AVERAGE_DAY_IN_MONTH} days in a month (365/12)`}
              </TooltipContent>
            </Tooltip>
          }
        />

        <StatBox
          title="Average blocks per day (last 30D)"
          loading={loading}
          skeletonLines={1}
          content={
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger>
                  <NumberDisplay value={stats.last30Days.avgBlocksPerDay} />
                </TooltipTrigger>
                <TooltipContent>
                  {`${stats.last30Days.totalBlocks} blocks proposed from ${stats.last30Days.startDate.toLocaleString()} to ${stats.last30Days.endDate.toLocaleString()}`}
                </TooltipContent>
              </Tooltip>
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
          skeletonLines={1}
          content={
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger>
                  <NumberDisplay value={stats.last7Days.avgBlocksPerDay} />
                </TooltipTrigger>
                <TooltipContent>
                  {`${stats.last7Days.totalBlocks} blocks proposed from ${stats.last7Days.startDate.toLocaleDateString()} to ${stats.last7Days.endDate.toLocaleDateString()}`}
                </TooltipContent>
              </Tooltip>
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
    </Panel>
  );
}
