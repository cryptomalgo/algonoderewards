import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { PriceImpactDataPoint } from "@/hooks/usePriceImpactData";

interface Props {
  data: PriceImpactDataPoint[];
  hideBalance?: boolean;
}

const RewardScatterPlotChart = React.memo(function RewardScatterPlotChart({
  data,
  hideBalance,
}: Props) {
  const { theme } = useTheme();

  const parseISODate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map((s) => Number(s));
    return Date.UTC(year, month - 1, day);
  };

  const formatDate = (time: number) => {
    return new Date(time).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatTooltipDate = (time: number) => {
    return new Date(time).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Convert dates to timestamps for X-axis
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      timestamp: parseISODate(d.date),
    }));
  }, [data]);

  const { xMin, xMax } = useMemo(() => {
    if (chartData.length === 0) {
      const now = Date.now();
      return { xMin: now - 24 * 60 * 60 * 1000, xMax: now };
    }

    let minTs = Infinity;
    let maxTs = -Infinity;

    chartData.forEach((d) => {
      if (d.timestamp < minTs) minTs = d.timestamp;
      if (d.timestamp > maxTs) maxTs = d.timestamp;
    });

    const span = Math.max(1, maxTs - minTs);
    const padMs = Math.max(6 * 60 * 60 * 1000, Math.floor(span * 0.015));

    const now = new Date();
    const todayEndUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    );
    const paddedMin = minTs - padMs;
    const clampedMax = Math.min(maxTs + padMs, todayEndUtc);

    return {
      xMin: paddedMin,
      xMax: Math.max(paddedMin, clampedMax),
    };
  }, [chartData]);

  const { maxUSD, minUSD, minAlgo } = useMemo(() => {
    let maxU = 0;
    let minU = Infinity;
    let minA = Infinity;
    data.forEach((d) => {
      if ((d.valueAtReceipt || 0) > maxU) maxU = d.valueAtReceipt || 0;
      if ((d.valueAtReceipt || 0) < minU) minU = d.valueAtReceipt || 0;
      if (d.rewardAlgo < minA) minA = d.rewardAlgo;
    });
    return {
      maxUSD: maxU,
      minUSD: minU === Infinity ? 0 : minU,
      minAlgo: minA === Infinity ? 0 : minA,
    };
  }, [data]);

  const getColor = (usdValue: number) => {
    const range = maxUSD - minUSD || 1;
    const ratio = (usdValue - minUSD) / range;

    // Gradient: Blue -> Purple -> Pink -> Orange
    // Removing Amber (#f59e0b) to avoid yellow tones as requested
    if (ratio < 0.25) return "#312e81"; // Blue
    if (ratio < 0.5) return "#7c3aed"; // Purple
    if (ratio < 0.75) return "#db2777"; // Pink
    return "#ea580c"; // Orange
  };

  const textColor = theme === "dark" ? "#d1d5db" : "#374151";
  const yMin = Math.max(0, Math.floor(minAlgo - 1));

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Reward Value at Receipt
        </h4>
        <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
          Reward size reflects Algorand's declining block reward schedule over
          time. Colour indicates USD value at time of receipt using finalized
          daily close prices (UTC), so the current UTC day may appear after the
          next price refresh.
        </p>
      </div>

      <div className="mt-4" style={{ width: "100%", height: "350px" }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 800, height: 350 }}
        >
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={[xMin, xMax]}
              allowDataOverflow={true}
              padding={{ left: 12, right: 20 }}
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: textColor }}
              minTickGap={30}
            />
            <YAxis
              type="number"
              dataKey="rewardAlgo"
              name="Rewards"
              unit=" A"
              domain={[yMin, "auto"]}
              allowDataOverflow={true}
              tick={{ fontSize: 10, fill: textColor }}
              width={45}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis
              type="number"
              dataKey="rewardAlgo"
              range={[40, 400]} // Dot radius area range
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as PriceImpactDataPoint & {
                    timestamp: number;
                  };
                  return (
                    <div className="rounded-md border border-gray-200 bg-white p-2 shadow-md dark:border-gray-700 dark:bg-gray-800">
                      <p className="mb-1 text-xs font-bold text-gray-900 dark:text-gray-100">
                        {formatTooltipDate(d.timestamp)}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className="flex justify-between gap-4">
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            Rewards:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {hideBalance
                              ? "*****"
                              : `${d.rewardAlgo.toFixed(4)} ALGO`}
                          </span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            Value at Receipt:
                          </span>
                          <span className="font-bold text-amber-500">
                            {hideBalance
                              ? "*****"
                              : formatCurrency(d.valueAtReceipt || 0)}
                          </span>
                        </p>
                        <p className="mt-1 flex justify-between gap-4 border-t border-gray-100 pt-1 dark:border-gray-700">
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            ALGO Price then:
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            ${d.priceAtReceipt?.toFixed(4)}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Rewards" data={chartData} shape="circle">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.valueAtReceipt || 0)}
                  fillOpacity={0.65}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Legends */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 px-2 pb-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            USD Value at Receipt
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Low
            </span>
            <div
              className="h-2 w-32 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #312e81, #7c3aed, #db2777, #ea580c)",
              }}
            />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              High
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Size
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              ALGO Amount
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RewardScatterPlotChart;
