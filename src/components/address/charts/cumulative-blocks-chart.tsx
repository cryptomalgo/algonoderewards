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
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen.ts";

type ChartData = {
  date: string;
  cumulativeBlocks: number;
  dailyBlocks: number;
};

export default function CumulativeBlocksChart({ blocks }: { blocks: Block[] }) {
  const { theme } = useTheme();
  const isSmall = useIsSmallScreen(640);

  const data = useMemo(() => {
    if (!blocks.length) return [];

    // Sort blocks by timestamp
    const sortedBlocks = [...blocks].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0),
    );

    // Group blocks by day in user's timezone
    const dailyBlockCounts = new Map<string, number>();

    sortedBlocks.forEach((block) => {
      if (!block.timestamp) return;

      // Convert UTC timestamp to local date string (user's timezone)
      const date = new Date(block.timestamp * 1000);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

      const currentDayCount = dailyBlockCounts.get(dateStr) || 0;
      dailyBlockCounts.set(dateStr, currentDayCount + 1);
    });

    const allDates = generateDateRange(
      sortedBlocks.length > 0 ? sortedBlocks[0].timestamp : undefined,
    );

    // Build cumulative data with zero values for days with no blocks
    let cumulativeBlocks = 0;

    const chartData: ChartData[] = [];

    allDates.forEach((dateStr) => {
      const dayBlockCount = dailyBlockCounts.get(dateStr) || 0;
      cumulativeBlocks += dayBlockCount;

      chartData.push({
        date: dateStr,
        cumulativeBlocks,
        dailyBlocks: dayBlockCount,
      });
    });

    return chartData;
  }, [blocks]);

  if (!data.length) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Cumulative Blocks
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No blocks data available
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
        Blocks History
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
                id="cumulativeBlocksGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>

              {/* Neon blue gradient for bars */}
              <linearGradient id="blockBarGradient" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="cumulativeBlocks"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickCount={5}
              tickFormatter={(value) => `${value}`}
              width={40}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="right"
              dataKey="dailyBlocks"
              orientation="right"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickFormatter={(value) => `${value}`}
              width={40}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              itemStyle={{ color: "var(--tooltip-foreground)" }}
              formatter={(value, name) => {
                if (name === "Total Blocks") {
                  return [value, "Total Blocks"];
                }

                if (name === "Daily Blocks") {
                  return [value, "Daily Blocks"];
                }
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
              formatter={(value, entry) => {
                const { color } = entry;
                // Override color for Daily Blocks legend item
                if (value === "Daily Blocks") {
                  return <span style={{ color: "#60a8fb" }}>{value}</span>;
                }
                return <span style={{ color }}>{value}</span>;
              }}
            />

            {/* Only show bars on medium screens and up */}
            <Bar
              yAxisId="right"
              dataKey="dailyBlocks"
              name="Daily Blocks"
              fill="url(#blockBarGradient)"
              radius={[2, 2, 0, 0]}
              barSize={isSmall ? 0.5 : 3}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cumulativeBlocks"
              name="Total Blocks"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#cumulativeBlocksGradient)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
