import React, { useMemo, useState } from "react";
import { MinimalBlock } from "@/lib/block-types";
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
import { useSearch } from "@tanstack/react-router";
import { useAlgoPrice } from "@/hooks/queries/useAlgoPrice";
import { getAlgoUsdPrice } from "@/utils/algoPrice";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CURRENCIES } from "@/lib/currencies";

type ChartData = {
  date: string;
  cumulativeRewards: number;
  dailyRewards: number;
  cumulativeAlgos: number;
  dailyAlgos: number;
  cumulativeFiat: number | null;
  dailyFiat: number | null;
};

const CumulativeRewardsChart = React.memo(function CumulativeRewardsChart({
  blocks,
  hideBalance,
}: {
  blocks: MinimalBlock[];
  hideBalance?: boolean;
}) {
  const { theme } = useTheme();
  const isSmall = useIsSmallScreen(640);
  const search = useSearch({ from: "/$addresses" });
  const currency = search.currency || "USD";
  const [displayMode, setDisplayMode] = useState<"algo" | "fiat">("algo");

  const { data: currentUsdPrice } = useAlgoPrice("USD");
  const { data: currentFiatPrice } = useAlgoPrice(currency);

  const usdToFiat = useMemo(() => {
    if (currency === "USD") return 1;
    return currentUsdPrice && currentFiatPrice
      ? currentFiatPrice / currentUsdPrice
      : 1;
  }, [currency, currentUsdPrice, currentFiatPrice]);

  const currencyInfo = useMemo(() => {
    return CURRENCIES.find((c) => c.value === currency) || CURRENCIES[0];
  }, [currency]);

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

      const date = new Date(block.timestamp * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const reward = block.proposerPayout || 0;
      const currentDayReward = dailyRewards.get(dateStr) || 0;
      dailyRewards.set(dateStr, currentDayReward + reward);
    });

    const allDates = generateDateRange(
      sortedBlocks.length > 0 ? sortedBlocks[0].timestamp : undefined,
    );

    let cumulativeRewards = 0;
    let cumulativeFiat = 0;

    const chartData: ChartData[] = [];

    allDates.forEach((dateStr) => {
      const dayReward = dailyRewards.get(dateStr) || 0;
      cumulativeRewards += dayReward;

      const dailyRewardInt = Math.floor(dayReward);
      const cumulativeRewardsInt = Math.floor(cumulativeRewards);

      const usdPrice = getAlgoUsdPrice(dateStr);
      const fiatPrice = usdPrice !== null ? usdPrice * usdToFiat : null;

      const dailyFiat =
        fiatPrice !== null ? (dayReward / 1e6) * fiatPrice : null;
      if (dailyFiat !== null) {
        cumulativeFiat += dailyFiat;
      }

      chartData.push({
        date: dateStr,
        cumulativeRewards: cumulativeRewardsInt,
        dailyRewards: dailyRewardInt,
        cumulativeAlgos: cumulativeRewardsInt / 1e6,
        dailyAlgos: dailyRewardInt / 1e6,
        dailyFiat: dailyFiat,
        cumulativeFiat: cumulativeFiat,
      });
    });

    return chartData;
  }, [blocks, usdToFiat]);

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

  const parseISODate = (dateStr: string) => {
    const arr = dateStr.split("-").map((s) => Number(s));
    return new Date(arr[0], --arr[1], arr[2]);
  };

  const formatDate = (dateStr: string) => {
    const date = parseISODate(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = parseISODate(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const textColor = theme === "dark" ? "#d1d5db" : "#374151";

  const isFiat = displayMode === "fiat";
  const cumulativeDataKey = isFiat ? "cumulativeFiat" : "cumulativeAlgos";
  const dailyDataKey = isFiat ? "dailyFiat" : "dailyAlgos";

  return (
    <div className="-mx-6 mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Rewards History
        </h3>
        <ToggleGroup
          type="single"
          value={displayMode}
          onValueChange={(value) => {
            if (value) setDisplayMode(value as "algo" | "fiat");
          }}
          className="gap-0 rounded-md border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
        >
          <ToggleGroupItem
            value="algo"
            className="h-7 px-2 text-xs data-[state=on]:bg-gray-100 dark:data-[state=on]:bg-gray-700"
          >
            ALGO
          </ToggleGroupItem>
          <ToggleGroupItem
            value="fiat"
            className="h-7 px-2 text-xs data-[state=on]:bg-gray-100 dark:data-[state=on]:bg-gray-700"
          >
            {currency}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="mt-2" style={{ width: "100%", height: "320px" }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 800, height: 320 }}
        >
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
              dataKey={cumulativeDataKey}
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickCount={5}
              tickFormatter={(value) =>
                isFiat
                  ? `${currencyInfo.symbol}${value.toFixed(0)}`
                  : `${value.toFixed(0)}`
              }
              width={isFiat ? 55 : 40}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="right"
              dataKey={dailyDataKey}
              orientation="right"
              tick={{
                fontSize: 10,
                fill: textColor,
              }}
              tickFormatter={(value) =>
                isFiat ? `${value.toFixed(2)}` : `${value.toFixed()}`
              }
              width={isFiat ? 50 : 40}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              itemStyle={{ color: "var(--tooltip-foreground)" }}
              formatter={(value, name, entry) => {
                const dataPoint = entry.payload;

                if (isFiat) {
                  const val = value as number | null;
                  const displayVal =
                    val === null ? "No price data" : formatCurrency(val);
                  return [
                    <span key={name} className="font-bold">
                      {hideBalance ? "*****" : displayVal}
                    </span>,
                    name,
                  ];
                }

                if (name === "Total Rewards") {
                  return [
                    <AlgoAmountDisplay
                      key="cumulative"
                      microAlgoAmount={dataPoint.cumulativeRewards}
                      showAnimation={false}
                      hidden={hideBalance}
                    />,
                    "Total Rewards",
                  ];
                }

                return [
                  <AlgoAmountDisplay
                    key="daily"
                    microAlgoAmount={dataPoint.dailyRewards}
                    showAnimation={false}
                    hidden={hideBalance}
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
              dataKey={dailyDataKey}
              name="Daily Rewards"
              fill="url(#barGradient)"
              radius={[2, 2, 0, 0]}
              barSize={isSmall ? 0.5 : 3}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey={cumulativeDataKey}
              name="Total Rewards"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#cumulativeGradient)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default CumulativeRewardsChart;
