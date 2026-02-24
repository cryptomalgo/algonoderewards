import { MinimalBlock } from "@/lib/block-types";
import { usePriceImpactData } from "@/hooks/usePriceImpactData";
import RewardValueComparisonChart from "./charts/reward-value-comparison-chart";
import RewardScatterPlotChart from "./charts/reward-scatter-plot-chart";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  blocks: MinimalBlock[];
  hideBalance?: boolean;
}

export default function PriceImpactSection({ blocks, hideBalance }: Props) {
  const {
    fullData,
    scatterData,
    isLoading,
    totalValueAtReceipt,
    totalValueAtToday,
  } = usePriceImpactData(blocks);

  if (isLoading || !fullData.length) {
    return (
      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="mb-2 h-7 w-48" />
          <Skeleton className="mb-6 h-4 w-64" />
          <Skeleton className="mb-6 h-16 w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="h-[380px] w-full" />
        </div>
      </div>
    );
  }

  const difference = totalValueAtToday - totalValueAtReceipt;
  const isNegative = difference < 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Chart A: Cumulative story with Section Header and Stats */}
      <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Price Impact Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            How ALGO's price movement has affected the real-world value of your
            rewards over time.
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-white/5">
          <p className="text-sm font-medium text-gray-700 sm:text-base dark:text-gray-300">
            Your rewards were worth{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {hideBalance ? "*****" : formatCurrency(totalValueAtReceipt)}
            </span>{" "}
            when received. At today's price they are worth{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {hideBalance ? "*****" : formatCurrency(totalValueAtToday)}
            </span>
            .
            {!hideBalance && (
              <span
                className={`ml-1 font-bold ${isNegative ? "text-red-500" : "text-green-500"}`}
              >
                ({isNegative ? "" : "+"}
                {formatCurrency(difference)})
              </span>
            )}
          </p>
        </div>
        <div className="w-full">
          <RewardValueComparisonChart
            data={fullData}
            hideBalance={hideBalance}
          />
        </div>
      </div>

      {/* Chart B: Per-reward story (Scatter Plot) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="w-full">
          <RewardScatterPlotChart
            data={scatterData}
            hideBalance={hideBalance}
          />
        </div>
      </div>
    </div>
  );
}
