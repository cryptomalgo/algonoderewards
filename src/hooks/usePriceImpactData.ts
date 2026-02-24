import { useMemo } from "react";
import { MinimalBlock } from "@/lib/block-types";
import { useAlgoPrice } from "@/hooks/queries/useAlgoPrice";
import { getAlgoUsdPrice } from "@/utils/algoPrice";
import { generateDateRange } from "@/lib/date-utils";

export interface PriceImpactDataPoint {
    date: string;
    rewardAlgo: number;
    blocks: number;
    priceAtReceipt: number | null;
    valueAtReceipt: number | null;
    valueAtToday: number | null;
    cumulativeValueAtReceipt: number;
    cumulativeValueAtToday: number;
}

export function usePriceImpactData(blocks: MinimalBlock[]) {
    const { data: currentPrice, isLoading: isPriceLoading } = useAlgoPrice("USD");

    const fullData = useMemo(() => {
        if (!blocks.length || currentPrice === undefined) return [];

        // Sort blocks by timestamp
        const sortedBlocks = [...blocks].sort(
            (a, b) => (a.timestamp || 0) - (b.timestamp || 0),
        );

        // Group blocks by day
        const dailyStats = new Map<string, { rewardAlgo: number; blocks: number }>();

        sortedBlocks.forEach((block) => {
            const date = new Date(block.timestamp * 1000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            const reward = block.proposerPayout / 1e6;
            const stats = dailyStats.get(dateStr) || { rewardAlgo: 0, blocks: 0 };
            dailyStats.set(dateStr, {
                rewardAlgo: stats.rewardAlgo + reward,
                blocks: stats.blocks + 1,
            });
        });

        const allDates = generateDateRange(
            sortedBlocks.length > 0 ? sortedBlocks[0].timestamp : undefined,
        );

        let cumulativeValueAtReceipt = 0;
        let cumulativeValueAtToday = 0;

        const result: PriceImpactDataPoint[] = [];

        allDates.forEach((dateStr) => {
            const stats = dailyStats.get(dateStr) || { rewardAlgo: 0, blocks: 0 };
            const priceAtReceipt = getAlgoUsdPrice(dateStr);

            let valueAtReceipt = null;
            let valueAtToday = null;

            if (stats.rewardAlgo > 0 && priceAtReceipt !== null) {
                valueAtReceipt = stats.rewardAlgo * priceAtReceipt;
                valueAtToday = stats.rewardAlgo * currentPrice;

                cumulativeValueAtReceipt += valueAtReceipt;
                cumulativeValueAtToday += valueAtToday;
            }

            result.push({
                date: dateStr,
                rewardAlgo: stats.rewardAlgo,
                blocks: stats.blocks,
                priceAtReceipt,
                valueAtReceipt,
                valueAtToday,
                cumulativeValueAtReceipt,
                cumulativeValueAtToday,
            });
        });

        return result;
    }, [blocks, currentPrice]);

    const scatterData = useMemo(() => {
        return fullData.filter(d => d.rewardAlgo > 0 && d.valueAtReceipt !== null);
    }, [fullData]);

    return {
        fullData,
        scatterData,
        currentPrice,
        isLoading: isPriceLoading,
        totalValueAtReceipt: fullData.length > 0 ? fullData[fullData.length - 1].cumulativeValueAtReceipt : 0,
        totalValueAtToday: fullData.length > 0 ? fullData[fullData.length - 1].cumulativeValueAtToday : 0,
    };
}
