import { Block } from "algosdk/client/indexer";
import { useMemo } from "react";
import Spinner from "@/components/spinner";
import AlgoAmountDisplay from "@/components/algo-amount-display";
import NumberDisplay from "@/components/number-display";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";

export default function StatsPanel({
  filteredBlocks,
  loading,
}: {
  filteredBlocks: Block[];
  loading: boolean;
}) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalRewards = filteredBlocks.reduce((acc: number, block: Block) => {
      return acc + (block?.proposerPayout ?? 0);
    }, 0);

    const totalNbOfBlocksWithRewards = filteredBlocks.length;

    const maxRewardTransaction = filteredBlocks.reduce(
      (acc, block) => {
        const amount = block?.proposerPayout ?? 0;
        const date = block.timestamp ?? 0;
        return acc.amount > amount ? acc : { amount, date };
      },
      { amount: 0, date: 0 },
    );

    const minRewardTransaction = filteredBlocks.reduce(
      (acc, block) => {
        const amount = block?.proposerPayout ?? 0;
        const date = block.timestamp ?? 0;
        return acc.amount < amount ? acc : { amount, date };
      },
      {
        amount:
          filteredBlocks.length > 0
            ? (filteredBlocks[0]?.proposerPayout ?? 0)
            : 0,
        date:
          filteredBlocks.length > 0 ? (filteredBlocks[0]?.timestamp ?? 0) : 0,
      },
    );

    return {
      totalRewards,
      totalNbOfBlocksWithRewards,
      maxReward: maxRewardTransaction.amount,
      maxRewardDate: new Date(
        maxRewardTransaction.date * 1000,
      ).toLocaleString(),
      minReward: filteredBlocks.length === 0 ? 0 : minRewardTransaction.amount,
      minRewardDate: new Date(
        minRewardTransaction.date * 1000,
      ).toLocaleString(),
    };
  }, [filteredBlocks]);

  return (
    <div className="rounded-lg bg-indigo-500">
      <div className="mx-auto max-w-7xl rounded-lg">
        <div className="grid grid-cols-1 gap-px rounded-lg sm:grid-cols-2 lg:grid-cols-4">
          <StatBox
            title="Total reward"
            loading={loading}
            content={
              <AlgoAmountDisplay
                microAlgoAmount={stats.totalRewards}
                iconSize={18}
              />
            }
          />
          <StatBox
            title="Max reward"
            loading={loading}
            content={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlgoAmountDisplay
                      microAlgoAmount={stats.maxReward}
                      iconSize={18}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{stats.maxRewardDate}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />
          <StatBox
            title="Min reward"
            loading={loading}
            content={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlgoAmountDisplay
                      microAlgoAmount={stats.minReward}
                      iconSize={18}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{stats.minRewardDate}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />
          <StatBox
            title="Total blocks with rewards"
            loading={loading}
            content={<NumberDisplay value={stats.totalNbOfBlocksWithRewards} />}
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  title,
  content,
  loading,
}: {
  title: string;
  content: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-sm/6 font-medium text-slate-200">{title}</p>
      <div className="mt-2 flex items-baseline gap-x-2">
        <span className="text-4xl font-semibold tracking-tight text-white">
          {loading ? <Spinner /> : content}
        </span>
      </div>
    </div>
  );
}
