import React from "react";
import {
    Area,
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

const RewardValueComparisonChart = React.memo(function RewardValueComparisonChart({
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

    // Prepare data for shaded area between lines
    const chartData = data.map((d) => ({
        ...d,
        // Provide range for the area
        range: [d.cumulativeValueAtToday, d.cumulativeValueAtReceipt],
    }));

    const isDepreciated = data.length > 0 &&
        data[data.length - 1].cumulativeValueAtToday < data[data.length - 1].cumulativeValueAtReceipt;

    return (
        <div className="flex flex-col h-full">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 dark:text-gray-100">
                Cumulative Reward Value: Then vs Now
            </h4>
            <div className="mt-4" style={{ width: "100%", height: "280px" }}>
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 400, height: 280 }}
                >
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="diffGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isDepreciated ? "#ef4444" : "#10b981"} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isDepreciated ? "#ef4444" : "#10b981"} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
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
                            tick={{ fontSize: 10, fill: textColor }}
                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                            width={45}
                            axisLine={false}
                            tickLine={false}
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
                                if (name === "range") return null;
                                const val = typeof value === "number" ? formatCurrency(value) : value;
                                return [hideBalance ? "*****" : val, name];
                            }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="plainline" />

                        {/* Shaded area between lines */}
                        <Area
                            dataKey="range"
                            stroke="none"
                            fill="url(#diffGradient)"
                            activeDot={false}
                            legendType="none"
                            connectNulls
                        />

                        <Area
                            type="monotone"
                            dataKey="cumulativeValueAtReceipt"
                            name="Value when received"
                            stroke="#f59e0b" // Amber
                            fill="none"
                            strokeWidth={2}
                            activeDot={{ r: 4 }}
                            connectNulls
                        />

                        <Area
                            type="monotone"
                            dataKey="cumulativeValueAtToday"
                            name="Value at today's price"
                            stroke="#6366f1" // Indigo
                            fill="none"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            activeDot={{ r: 4 }}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default RewardValueComparisonChart;
