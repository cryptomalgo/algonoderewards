import { useMemo } from "react";
import { Block } from "algosdk/client/indexer";
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ComposedChart,
  Bar,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { generateDateRange } from "@/lib/date-utils";

import AlgoAmountDisplay from "@/components/algo-amount-display";
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen.ts";

type ChartData = {
  date: string;
  cumulativeRewards: number;
  dailyRewards: number;
  cumulativeAlgos: number;
  dailyAlgos: number;
};

export default function CumulativeRewardsChart({
  blocks,
}: {
  blocks: Block[];
}) {
  const { theme } = useTheme();
  const isSmall = useIsSmallScreen(640);

  const data = useMemo(() => {
    if (!blocks.length) return [];

    // Sort blocks by timestamp
    const sortedBlocks = [...blocks].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0),
    );

    // Group blocks by day in user's timezone
    const dailyRewards = new Map<string, number>();

    sortedBlocks.forEach((block) => {
      if (!block.timestamp) return;

      // Convert UTC timestamp to local date string (user's timezone)
      const date = new Date(block.timestamp * 1000);
      // Use local timezone formatting instead of UTC ISO string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone

      const reward = block.proposerPayout || 0;
      const currentDayReward = dailyRewards.get(dateStr) || 0;
      dailyRewards.set(dateStr, currentDayReward + reward);
    });

    // Create an array of all dates between first block and today
    const firstBlockDate =
      sortedBlocks.length > 0 && sortedBlocks[0].timestamp
        ? new Date(sortedBlocks[0].timestamp * 1000)
        : new Date();

    // Set to start of day in local timezone
    firstBlockDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allDates = generateDateRange(
      sortedBlocks.length > 0 ? sortedBlocks[0].timestamp : undefined,
    );

    // Build cumulative data with zero values for days with no rewards
    let cumulativeRewards = 0;

    const chartData: ChartData[] = [];

    allDates.forEach((dateStr) => {
      const dayReward = dailyRewards.get(dateStr) || 0;
      cumulativeRewards += dayReward;

      // Ensure these are integer values by using Math.floor
      const dailyRewardInt = Math.floor(dayReward);
      const cumulativeRewardsInt = Math.floor(cumulativeRewards);

      chartData.push({
        date: dateStr,
        // Store integer microAlgo values for AlgoAmountDisplay
        cumulativeRewards: cumulativeRewardsInt,
        dailyRewards: dailyRewardInt,
        // Store display values for axis labels
        cumulativeAlgos: cumulativeRewardsInt / 1e6,
        dailyAlgos: dailyRewardInt / 1e6,
      });
    });

    return chartData;
  }, [blocks]);

  if (!data.length) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Cumulative Rewards
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No rewards data available
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const textColor = theme === "dark" ? "#d1d5db" : "#374151";

  return (
    <div className="-mx-6 mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Rewards History
      </h3>
      <div className="mt-2 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 10,
              right: 5,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="cumulativeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>

              {/* Neon blue gradient for bars */}
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a8fb" stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor="#60a8fb"
                  stopOpacity={theme === "dark" ? 0.1 : 0.5}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickFormatter={formatDate}
              minTickGap={30}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="left"
              dataKey="cumulativeAlgos"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickCount={5}
              tickFormatter={(value) => `${value.toFixed(0)}`}
              width={40}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="right"
              dataKey="dailyAlgos"
              orientation="right"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickFormatter={(value) => `${value.toFixed()}`}
              width={40}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              itemStyle={{ color: "var(--tooltip-foreground)" }}
              formatter={(_, name, entry) => {
                const dataPoint = entry.payload;

                if (name === "Total Rewards") {
                  return [
                    <AlgoAmountDisplay
                      key="cumulative"
                      microAlgoAmount={dataPoint.cumulativeRewards}
                      showAnimation={false}
                    />,
                    "Total Rewards",
                  ];
                }

                return [
                  <AlgoAmountDisplay
                    key="daily"
                    microAlgoAmount={dataPoint.dailyRewards}
                    showAnimation={false}
                  />,
                  "Daily Rewards",
                ];
              }}
              labelFormatter={formatTooltipDate}
              contentStyle={{
                backgroundColor: "var(--tooltip, white)",
                border: "1px solid var(--tooltip-border, #e5e7eb)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "bold",
                color: "var(--tooltip-foreground, #374151)",
              }}
              wrapperStyle={{
                outline: "none",
              }}
            />
            <Legend
              formatter={(value) => {
                // For Daily Rewards, only show on md screens and up
                if (value === "Daily Rewards") {
                  return <span style={{ color: "#60a8fb" }}>{value}</span>;
                }
                // For Total Rewards, always show with proper color
                return <span style={{ color: "#6366f1" }}>{value}</span>;
              }}
            />

            <Bar
              yAxisId="right"
              dataKey="dailyAlgos"
              name="Daily Rewards"
              fill="url(#barGradient)"
              radius={[2, 2, 0, 0]}
              barSize={isSmall ? 0.5 : 3}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cumulativeAlgos"
              name="Total Rewards"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#cumulativeGradient)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
