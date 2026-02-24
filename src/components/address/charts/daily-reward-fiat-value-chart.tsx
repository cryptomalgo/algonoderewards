import React from "react";
import {
    Bar,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
    ComposedChart,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { PriceImpactDataPoint } from "@/hooks/usePriceImpactData";

interface Props {
    data: PriceImpactDataPoint[];
    hideBalance?: boolean;
}

const DailyRewardFiatValueChart = React.memo(function DailyRewardFiatValueChart({
    data,
    hideBalance,
}: Props) {
    const { theme } = useTheme();

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
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const textColor = theme === "dark" ? "#d1d5db" : "#374151";

    // Existing Rewards History bar color
    const barColor = "#60a8fb";
    // Amber for the "value when received" line to match Chart A
    const lineSeriesColor = "#f59e0b";

    return (
        <div className="flex flex-col h-full">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 dark:text-gray-100">
                Daily Rewards: ALGO vs USD Value at Receipt
            </h4>
            <div className="mt-4" style={{ width: "100%", height: "280px" }}>
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 400, height: 280 }}
                >
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            className="stroke-gray-200 dark:stroke-gray-700"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: textColor }}
                            tickFormatter={formatDate}
                            minTickGap={30}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 10, fill: textColor }}
                            width={35}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'ALGO', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: textColor } }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10, fill: lineSeriesColor }}
                            tickFormatter={(v) => `$${v.toFixed(2)}`}
                            width={45}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'USD value', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: lineSeriesColor } }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--tooltip, white)",
                                border: "1px solid var(--tooltip-border, #e5e7eb)",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                color: "var(--tooltip-foreground, #374151)",
                            }}
                            labelFormatter={formatTooltipDate}
                            formatter={(value: any, name: string) => {
                                if (name === "USD Value at Receipt") {
                                    const val = value !== null ? formatCurrency(value) : "Price missing";
                                    return [hideBalance ? "*****" : val, name];
                                }
                                const algoVal = value === 0 ? "No reward" : `${value.toFixed(4)} ALGO`;
                                return [hideBalance ? "*****" : algoVal, name];
                            }}
                            // Add price to tooltip
                            itemSorter={(item) => (item.name === "Daily ALGO Reward" ? 1 : 0)}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length && typeof label === 'string') {
                                    const dataPoint = payload[0].payload as PriceImpactDataPoint;
                                    return (
                                        <div className="rounded-md border border-gray-200 bg-white p-2 shadow-md dark:border-gray-700 dark:bg-gray-800">
                                            <p className="mb-1 text-xs font-bold text-gray-900 dark:text-gray-100">{formatTooltipDate(label)}</p>
                                            <div className="space-y-1">
                                                <p className="text-xs text-[#60a8fb]">
                                                    <span className="font-semibold text-gray-500 dark:text-gray-400">ALGO:</span>{" "}
                                                    {hideBalance ? "*****" : dataPoint.rewardAlgo === 0 ? "No reward" : `${dataPoint.rewardAlgo.toFixed(4)}`}
                                                </p>
                                                <p className="text-xs text-[#f59e0b]">
                                                    <span className="font-semibold text-gray-500 dark:text-gray-400">Value at Receipt:</span>{" "}
                                                    {hideBalance
                                                        ? "*****"
                                                        : dataPoint.rewardAlgo === 0
                                                            ? "$0.00"
                                                            : dataPoint.valueAtReceipt !== null
                                                                ? formatCurrency(dataPoint.valueAtReceipt)
                                                                : "Price missing"}
                                                </p>
                                                <p className="text-xs text-green-500">
                                                    <span className="font-semibold text-gray-500 dark:text-gray-400">ALGO Price:</span>{" "}
                                                    {dataPoint.priceAtReceipt !== null ? `$${dataPoint.priceAtReceipt.toFixed(4)}` : "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />

                        <Bar
                            yAxisId="left"
                            dataKey="rewardAlgo"
                            name="Daily ALGO Reward"
                            fill={barColor}
                            radius={[2, 2, 0, 0]}
                            barSize={4}
                        />

                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="valueAtReceiptLine"
                            name="USD Value at Receipt"
                            stroke={lineSeriesColor}
                            strokeWidth={2}
                            dot={{ r: 3, fill: lineSeriesColor }}
                            activeDot={{ r: 5 }}
                            connectNulls={true}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default DailyRewardFiatValueChart;
