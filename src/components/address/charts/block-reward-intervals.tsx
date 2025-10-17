import { Block } from "algosdk/client/indexer";
import { useMemo, useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { useStakeInfo } from "@/hooks/useStakeInfo";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import Spinner from "@/components/spinner";
import { ResolvedAddress } from "@/components/heatmap/types";
import { useAccounts } from "@/hooks/useAccounts";
import { StartDatePicker } from "@/components/ui/start-date-picker";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentRound } from "@/hooks/useCurrentRound";
import { useAverageBlockTime } from "@/hooks/useAverageBlockTime";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import {
  NameType,
  Payload,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

// Chart colors constants
const CHART_COLORS = {
  actualCumulative: "#6366f1",
  expectedCumulative: "#fb923c",
  expectedRounds: "#7dd3fc",
  roundsSinceLastReward: "#c4b5fd",
  barGradient: {
    light: {
      start: "#6366f1",
      end: "#a5b4fc",
    },
    dark: {
      start: "#6366f1",
      end: "#4f46e5",
    },
  },
} as const;

function calculateIntervalConfig(totalStake: number, userStake: number) {
  if (totalStake <= 0 || userStake <= 0) {
    return {
      min: 500,
      max: 10000,
      step: 500,
      default: 2000,
    };
  }

  const stakePercent = userStake / totalStake;
  const expectedRounds = 1 / stakePercent;

  let min: number;
  let max: number;
  let step: number;
  let defaultValue: number;

  if (expectedRounds < 50) {
    // Very high stake: fine granularity needed
    min = 5;
    max = 200;
    step = 5;
    defaultValue = Math.max(5, Math.round(expectedRounds / 4));
  } else if (expectedRounds < 500) {
    // High stake: medium granularity
    min = 10;
    max = 1000;
    step = 10;
    defaultValue = Math.max(10, Math.round(expectedRounds / 5));
  } else if (expectedRounds < 5000) {
    // Medium stake: standard granularity
    min = 50;
    max = 5000;
    step = 50;
    defaultValue = Math.max(50, Math.round(expectedRounds / 5));
  } else if (expectedRounds < 25000) {
    // Lower stake: coarser granularity
    min = 100;
    max = 15000;
    step = 100;
    defaultValue = Math.max(500, Math.round(expectedRounds / 4));
  } else {
    // Very low stake: very coarse granularity
    min = 1000;
    max = 50000;
    step = 1000;
    defaultValue = Math.max(1000, Math.round(expectedRounds / 3));
  }

  // Round default to nearest step for cleaner UX
  defaultValue = Math.round(defaultValue / step) * step;

  // Ensure default is within bounds
  defaultValue = Math.max(min, Math.min(max, defaultValue));

  return {
    min,
    max,
    step,
    default: defaultValue,
  };
}

// Custom hook for responsive screen size
function useScreenSize() {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenWidth;
}
function useStartDateFilter(blocks: Block[]) {
  const minDate = useMemo(() => {
    if (blocks && blocks.length > 0) {
      const timestamps = blocks.map((block) => block.timestamp);
      const minTimestamp = Math.min(...timestamps);
      return new Date(minTimestamp * 1000);
    }
    return undefined;
  }, [blocks]);

  const [startDate, setStartDate] = useState<Date | undefined>(minDate);
  const maxDate = useMemo(() => new Date(), []); // Always today

  const filteredBlocks = useMemo(() => {
    if (!startDate) {
      return blocks;
    }

    const fromTimestamp = Math.floor(startDate.getTime() / 1000);
    const toTimestamp = Math.floor(maxDate.getTime() / 1000);

    return blocks.filter((block) => {
      const blockTimestamp = block.timestamp;
      return blockTimestamp >= fromTimestamp && blockTimestamp <= toTimestamp;
    });
  }, [blocks, startDate, maxDate]);

  const resetStartDate = () => {
    if (blocks && blocks.length > 0) {
      const timestamps = blocks.map((block) => block.timestamp);
      const minTimestamp = Math.min(...timestamps);
      setStartDate(new Date(minTimestamp * 1000));
    }
  };

  return {
    startDate,
    setStartDate,
    minDate,
    maxDate,
    filteredBlocks,
    resetStartDate,
  };
}

// Custom hook for stake calculations
function useStakeCalculations(resolvedAddresses: ResolvedAddress[]) {
  const {
    data: stakeInfo,
    isPending: isStakeInfoPending,
    error: stakeInfoError,
  } = useStakeInfo();

  const { data, pending } = useAccounts(resolvedAddresses);

  const userStake = useMemo(() => {
    if (pending || !data || data.length === 0) return 0;
    return data.reduce((sum, account) => {
      return sum + (account?.amount ? Number(account.amount) : 0);
    }, 0);
  }, [pending, data]);

  const totalStake = useMemo(() => {
    if (!stakeInfo) return 0;
    return new AlgoAmount({
      microAlgos: Number(stakeInfo.stake_micro_algo),
    });
  }, [stakeInfo]);

  const stakePercent = useMemo(() => {
    if (totalStake === 0) return 0;
    return userStake / Number(totalStake);
  }, [userStake, totalStake]);

  const notSelectedProb = useMemo(() => 1 - stakePercent, [stakePercent]);

  const expectedAverageRounds = useMemo(
    () => Math.round(1 / stakePercent),
    [stakePercent],
  );

  return {
    stakeInfo,
    isStakeInfoPending,
    stakeInfoError,
    userStake,
    totalStake,
    stakePercent,
    notSelectedProb,
    expectedAverageRounds,
  };
}

// Function to calculate interval counts
function calculateIntervalCounts(
  filteredBlocks: Block[],
  blocksInterval: number,
) {
  const intervals: Record<number, number> = {};

  if (filteredBlocks.length > 1) {
    for (let i = 1; i < filteredBlocks.length; i++) {
      const currentRound = Number(filteredBlocks[i].round || 0);
      const prevRound = Number(filteredBlocks[i - 1].round || 0);
      const difference = Math.abs(currentRound - prevRound);

      const intervalUpperBound =
        Math.ceil(difference / blocksInterval) * blocksInterval;

      intervals[intervalUpperBound] = (intervals[intervalUpperBound] || 0) + 1;
    }
  }

  return intervals;
}

// Function to process chart data
function processChartData(
  intervalCounts: Record<number, number>,
  filteredBlocks: Block[],
  blocksInterval: number,
  notSelectedProb: number,
) {
  const totalPairs = filteredBlocks.length > 1 ? filteredBlocks.length - 1 : 0;

  // First, create the existing intervals
  const existingIntervals = Object.entries(intervalCounts)
    .map(([upperBound, count]) => {
      const upperValue = parseInt(upperBound);
      const lowerValue = upperValue - blocksInterval;

      return {
        interval: `${lowerValue}-${upperValue}`,
        range: `${lowerValue.toLocaleString()}-${upperValue.toLocaleString()}`,
        count: count,
        actualPercent: totalPairs > 0 ? count / totalPairs : 0,
        lowerValue,
        upperValue,
      };
    })
    .sort((a, b) => a.lowerValue - b.lowerValue);

  // If no existing intervals, return empty array
  if (existingIntervals.length === 0) {
    return [];
  }

  // Find the full range we need to cover
  const minInterval = existingIntervals[0].lowerValue;
  const maxInterval =
    existingIntervals[existingIntervals.length - 1].upperValue;

  // Generate all intervals in the range
  const allIntervals: Array<{
    interval: string;
    range: string;
    count: number;
    actualPercent: number;
    lowerValue: number;
    upperValue: number;
  }> = [];

  for (
    let upperValue = minInterval + blocksInterval;
    upperValue <= maxInterval;
    upperValue += blocksInterval
  ) {
    const lowerValue = upperValue - blocksInterval;
    const existingInterval = existingIntervals.find(
      (i) => i.upperValue === upperValue,
    );

    if (existingInterval) {
      allIntervals.push(existingInterval);
    } else {
      // Fill in missing interval with zero values
      allIntervals.push({
        interval: `${lowerValue}-${upperValue}`,
        range: `${lowerValue.toLocaleString()}-${upperValue.toLocaleString()}`,
        count: 0,
        actualPercent: 0,
        lowerValue,
        upperValue,
      });
    }
  }

  // Calculate cumulative values
  let cumulativeActual = 0;

  return allIntervals.map((item) => {
    cumulativeActual += item.actualPercent;
    const expectedCumulative = 1 - Math.pow(notSelectedProb, item.upperValue);

    return {
      ...item,
      actualCumulative: cumulativeActual,
      expectedCumulative: expectedCumulative,
    };
  });
}

// Component for interval controls
function IntervalControls({
  blocksInterval,
  setBlocksInterval,
  intervalConfig,
}: {
  blocksInterval: number;
  setBlocksInterval: (value: number) => void;
  intervalConfig: ReturnType<typeof calculateIntervalConfig>;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="interval-slider" className="text-sm font-medium">
        Interval Size: {blocksInterval.toLocaleString()} rounds
      </Label>
      <div className="flex items-center space-x-4">
        <Slider
          id="interval-slider"
          min={intervalConfig.min}
          max={intervalConfig.max}
          step={intervalConfig.step}
          value={[blocksInterval]}
          onValueChange={(value) => setBlocksInterval(value[0])}
          className="flex-1"
        />
        <Input
          type="number"
          min={intervalConfig.min}
          max={intervalConfig.max}
          step={intervalConfig.step}
          value={blocksInterval}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (
              !isNaN(value) &&
              value >= intervalConfig.min &&
              value <= intervalConfig.max
            ) {
              setBlocksInterval(value);
            }
          }}
          className="w-24"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Groups block intervals into ranges of this size (
        {intervalConfig.min.toLocaleString()}-
        {intervalConfig.max.toLocaleString()} rounds)
      </p>
    </div>
  );
}

// Add type definitions
interface ChartDataItem {
  interval: string;
  range: string;
  count: number;
  actualPercent: number;
  lowerValue: number;
  upperValue: number;
  actualCumulative: number;
  expectedCumulative: number;
}

function ChartTooltip({
  active,
  payload,
  label,
  chartData,
  averageBlockTime,
}: {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[] | undefined;
  label?: string | number;
  chartData: ChartDataItem[];
  averageBlockTime: number;
}) {
  if (!active || !payload?.length) return null;

  const data = chartData.find((d) => d.interval === String(label));

  // Calculate time estimates
  const formatTimeRange = (lowerRounds: number, upperRounds: number) => {
    const lowerSeconds = lowerRounds * averageBlockTime;
    const upperSeconds = upperRounds * averageBlockTime;

    const lowerDuration = intervalToDuration({
      start: 0,
      end: lowerSeconds * 1000,
    });
    const upperDuration = intervalToDuration({
      start: 0,
      end: upperSeconds * 1000,
    });

    const formatOptions: { format: (keyof Duration)[]; delimiter: string } = {
      format: ["years", "months", "weeks", "days", "hours", "minutes"],
      delimiter: ", ",
    };

    const lowerFormatted =
      formatDuration(lowerDuration, formatOptions) || "0 minutes";
    const upperFormatted =
      formatDuration(upperDuration, formatOptions) || "0 minutes";

    return `${lowerFormatted} - ${upperFormatted}`;
  };

  return (
    <div
      className="bg-tooltip text-tooltip-foreground rounded-md p-2"
      style={{
        border: "1px solid var(--tooltip-border, #e5e7eb)",
      }}
    >
      <div
        style={{
          fontWeight: "normal",
          marginBottom: "4px",
        }}
      >
        Gap range: {data?.range || label} rounds between rewards
        {data && averageBlockTime > 0 && (
          <div
            style={{
              fontSize: "0.75rem",
              marginTop: "2px",
            }}
          >
            Time estimate: {formatTimeRange(data.lowerValue, data.upperValue)}
          </div>
        )}
      </div>
      {payload.map((entry, index) => {
        const { dataKey, value } = entry;
        const numValue = typeof value === "number" ? value : 0;

        if (dataKey === "count") {
          return (
            <div key={index} style={{ color: entry.color }}>
              {numValue} blocks in this gap range
            </div>
          );
        }

        if (dataKey === "actualCumulative") {
          const percentage = (numValue * 100).toFixed(1);
          return (
            <div key={index} style={{ color: entry.color }}>
              {percentage}% of your blocks with rewards took less than{" "}
              {data?.upperValue} rounds
            </div>
          );
        }

        if (dataKey === "expectedCumulative") {
          const percentage = (numValue * 100).toFixed(1);
          return (
            <div key={index} style={{ color: entry.color }}>
              {percentage}% of blocks with rewards should take less than{" "}
              {data?.upperValue} rounds
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function BlockRewardIntervals({
  blocks,
  resolvedAddresses,
}: {
  blocks: Block[];
  resolvedAddresses: ResolvedAddress[];
}) {
  const { theme } = useTheme();
  const screenWidth = useScreenSize();

  const {
    startDate,
    setStartDate,
    minDate,
    maxDate,
    filteredBlocks,
    resetStartDate,
  } = useStartDateFilter(blocks);

  const {
    isStakeInfoPending,
    stakeInfoError,
    userStake,
    totalStake,
    notSelectedProb,
    expectedAverageRounds,
  } = useStakeCalculations(resolvedAddresses);

  const {
    data: averageBlockTime,
    isPending: isAverageBlockTimePending,
    error: averageBlockTimeError,
  } = useAverageBlockTime();

  const intervalConfig = useMemo(() => {
    return calculateIntervalConfig(Number(totalStake), userStake);
  }, [totalStake, userStake]);

  // Use the computed default when we have valid stake data, otherwise use state
  const hasValidStakeData = userStake > 0 && Number(totalStake) > 0;
  const [userSetInterval, setUserSetInterval] = useState<number | null>(null);

  const blocksInterval = hasValidStakeData
    ? (userSetInterval ?? intervalConfig.default)
    : (userSetInterval ?? 1000);

  const setBlocksInterval = (value: number) => {
    setUserSetInterval(value);
  };

  const intervalCounts = useMemo(() => {
    return calculateIntervalCounts(filteredBlocks, blocksInterval);
  }, [filteredBlocks, blocksInterval]);

  const chartData = useMemo(() => {
    return processChartData(
      intervalCounts,
      filteredBlocks,
      blocksInterval,
      notSelectedProb,
    );
  }, [intervalCounts, filteredBlocks, blocksInterval, notSelectedProb]);

  const {
    data: currentRound,
    isPending: isCurrentRoundPending,
    error: currentRoundError,
  } = useCurrentRound();

  const roundsSinceLastReward = useMemo(() => {
    if (currentRoundError || !currentRound || !filteredBlocks.length) return 0;
    const lastBlock = filteredBlocks[filteredBlocks.length - 1];
    const lastBlockRound = Number(lastBlock.round || 0);
    return Number(currentRound) - lastBlockRound;
  }, [currentRound, currentRoundError, filteredBlocks]);

  if (
    isStakeInfoPending ||
    isCurrentRoundPending ||
    isAverageBlockTimePending
  ) {
    return <Spinner />;
  }

  if (stakeInfoError) {
    return (
      <div className="text-red-500">
        Error fetching stake info: {stakeInfoError.message}
      </div>
    );
  }

  if (averageBlockTimeError) {
    return (
      <div className="text-red-500">
        Error fetching block time: {averageBlockTimeError.message}
      </div>
    );
  }

  if (!filteredBlocks?.length || chartData.length === 0) {
    return (
      <div className="-mx-6 mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Block Reward Intervals
          </h3>
          <div className="mt-2 space-y-4">
            <StartDatePicker
              startDate={startDate}
              onStartDateChange={setStartDate}
              minDate={minDate}
              maxDate={maxDate}
              placeholder="Select start date"
              showReset={true}
              onReset={resetStartDate}
            />
            <IntervalControls
              blocksInterval={blocksInterval}
              setBlocksInterval={setBlocksInterval}
              intervalConfig={intervalConfig}
            />
          </div>
        </div>
        <div className="flex h-80 w-full items-center justify-center text-gray-500 dark:text-gray-400">
          {filteredBlocks?.length === 0
            ? "No blocks found in selected date range"
            : "No interval data available"}
        </div>
      </div>
    );
  }

  const textColor = theme === "dark" ? "#d1d5db" : "#374151";

  return (
    <div className="-mx-6 mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Block Reward Intervals: Expected vs Actual
        </h3>
        <div className="mt-2 space-y-4">
          <StartDatePicker
            startDate={startDate}
            onStartDateChange={setStartDate}
            minDate={minDate}
            maxDate={maxDate}
            placeholder="Select start date"
            showReset={true}
            onReset={resetStartDate}
          />
          <IntervalControls
            blocksInterval={blocksInterval}
            setBlocksInterval={setBlocksInterval}
            intervalConfig={intervalConfig}
          />
        </div>
      </div>
      <div className="mt-2 h-150">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 40,
              left: 0,
              bottom: 40,
            }}
          >
            <defs>
              <linearGradient
                id="actualBarGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={
                    theme === "light"
                      ? CHART_COLORS.barGradient.light.start
                      : CHART_COLORS.barGradient.dark.start
                  }
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={
                    theme === "light"
                      ? CHART_COLORS.barGradient.light.end
                      : CHART_COLORS.barGradient.dark.end
                  }
                  stopOpacity={theme === "dark" ? 0.3 : 0.6}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="interval"
              tick={{
                fontSize: screenWidth < 640 ? 8 : 10,
                fill: textColor,
              }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={"preserveStartEnd"}
            />
            <YAxis
              yAxisId="left"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickCount={5}
              width={40}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 1]}
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              width={50}
              axisLine={false}
              tickLine={false}
            />
            {roundsSinceLastReward > 0 && (
              <ReferenceLine
                yAxisId="left"
                x={
                  chartData.find(
                    (d) =>
                      roundsSinceLastReward >= d.lowerValue &&
                      roundsSinceLastReward <= d.upperValue,
                  )?.interval
                }
                stroke={CHART_COLORS.roundsSinceLastReward}
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{
                  value: `Rounds since last reward`,
                  position: "top",
                  style: {
                    textAnchor: "middle",
                    fontSize: "11px",
                    fill: CHART_COLORS.roundsSinceLastReward,
                    fontWeight: "bold",
                  },
                }}
              />
            )}
            <ReferenceLine
              yAxisId="left"
              x={
                chartData.find(
                  (d) =>
                    expectedAverageRounds >= d.lowerValue &&
                    expectedAverageRounds <= d.upperValue,
                )?.interval
              }
              stroke={CHART_COLORS.expectedRounds}
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                value: `Expected rounds`,
                position: "insideTop",
                style: {
                  textAnchor: "middle",
                  fontSize: "11px",
                  fill: CHART_COLORS.expectedRounds,
                  fontWeight: "bold",
                },
              }}
            />
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  chartData={chartData}
                  averageBlockTime={averageBlockTime || 0}
                  {...props}
                />
              )}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "12px",
                color: textColor,
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="count"
              name="Block Count"
              fill="url(#actualBarGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="linear"
              dataKey="actualCumulative"
              stroke={CHART_COLORS.actualCumulative}
              strokeWidth={2}
              dot={{
                fill: CHART_COLORS.actualCumulative,
                strokeWidth: 1,
                r: 1,
              }}
              name="Your Results"
            />
            <Line
              yAxisId="right"
              type="linear"
              dataKey="expectedCumulative"
              stroke={CHART_COLORS.expectedCumulative}
              strokeWidth={2}
              dot={{
                fill: CHART_COLORS.expectedCumulative,
                strokeWidth: 1,
                r: 1,
              }}
              strokeDasharray="5 2"
              name="Expected Results"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        This shows how your block reward timing compares to mathematical
        expectations using {blocksInterval.toLocaleString()}-round intervals.
        <br />
      </p>
      <div className="mx-auto mt-3 flex max-w-xl flex-col gap-1 px-5 text-left text-sm text-gray-500 dark:text-gray-400">
        <p>
          Expected rounds between blocks:{" "}
          <span
            style={{ color: CHART_COLORS.expectedRounds, fontWeight: "bold" }}
          >
            {expectedAverageRounds.toLocaleString()}
          </span>
        </p>
        <p>
          Rounds since last reward:{" "}
          <span
            style={{
              color: CHART_COLORS.roundsSinceLastReward,
              fontWeight: "bold",
            }}
          >
            {roundsSinceLastReward.toLocaleString()}
          </span>
        </p>
        <p>
          When the{" "}
          <span
            style={{
              fontWeight: "bold",
              color: CHART_COLORS.expectedCumulative,
            }}
          >
            expected results
          </span>{" "}
          and{" "}
          <span
            style={{ fontWeight: "bold", color: CHART_COLORS.actualCumulative }}
          >
            your results
          </span>{" "}
          lines are close together, your staking is working perfectly.
        </p>
        <p>
          If{" "}
          <span
            style={{ fontWeight: "bold", color: CHART_COLORS.actualCumulative }}
          >
            your results
          </span>{" "}
          line is above the{" "}
          <span
            style={{
              color: CHART_COLORS.expectedCumulative,
              fontWeight: "bold",
            }}
          >
            expected results
          </span>
          , it means you are lucky!
        </p>
      </div>
    </div>
  );
}
