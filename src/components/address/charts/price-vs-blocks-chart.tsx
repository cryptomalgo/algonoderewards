import React, { useState } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
    data: PriceImpactDataPoint[];
}

const PriceVsBlocksChart = React.memo(function PriceVsBlocksChart({
    data,
}: Props) {
    const { theme } = useTheme();
    const [metric, setMetric] = useState<"blocks" | "reward">("blocks");

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

    const textColor = theme === "dark" ? "#d1d5db" : "#374151";

    // Interpolate missing prices for a continuous line
    const interpolatedData = React.useMemo(() => {
        const result = [...data];
        for (let i = 0; i < result.length; i++) {
            if (result[i].priceAtReceipt === null) {
                // Find next available price
                let nextIndex = i + 1;
                while (nextIndex < result.length && result[nextIndex].priceAtReceipt === null) {
                    nextIndex++;
                }

                if (nextIndex < result.length && i > 0) {
                    const prevPrice = result[i - 1].priceAtReceipt!;
                    const nextPrice = result[nextIndex].priceAtReceipt!;
                    const step = (nextPrice - prevPrice) / (nextIndex - (i - 1));
                    result[i] = { ...result[i], priceAtReceipt: prevPrice + step * (i - (i - 1)) };
                } else if (i > 0) {
                    result[i] = { ...result[i], priceAtReceipt: result[i - 1].priceAtReceipt! };
                } else if (nextIndex < result.length) {
                    result[i] = { ...result[i], priceAtReceipt: result[nextIndex].priceAtReceipt! };
                }
            }
        }
        return result;
    }, [data]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Block Activity vs ALGO Price
                </h4>
                <ToggleGroup
                    type="single"
                    value={metric}
                    onValueChange={(v) => v && setMetric(v as any)}
                    className="gap-0 rounded-md border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
                >
                    <ToggleGroupItem value="blocks" className="h-6 px-2 text-[10px]">Blocks</ToggleGroupItem>
                    <ToggleGroupItem value="reward" className="h-6 px-2 text-[10px]">ALGO</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="mt-4" style={{ width: "100%", height: "280px" }}>
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 400, height: 280 }}
                >
                    <ComposedChart
                        data={interpolatedData}
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
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10, fill: "#10b981" }}
                            tickFormatter={(v) => `$${v.toFixed(2)}`}
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
                                if (name === "ALGO Price") return [`$${value.toFixed(4)}`, name];
                                return [value, name];
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />

                        <Bar
                            yAxisId="left"
                            dataKey={metric === "blocks" ? "blocks" : "rewardAlgo"}
                            name={metric === "blocks" ? "Blocks Won" : "ALGO Awarded"}
                            fill="#60a8fb"
                            radius={[2, 2, 0, 0]}
                            barSize={4}
                        />

                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="priceAtReceipt"
                            name="ALGO Price"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default PriceVsBlocksChart;
