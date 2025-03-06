import { createFileRoute } from "@tanstack/react-router";
import { useTransactions } from "@/hooks/useRewardTransactions.ts";
import Spinner from "@/components/spinner.tsx";
import { Transaction } from "algosdk/client/indexer";
import Heatmap from "@/components/heatmap.tsx";
import AlgoAmountDisplay from "@/components/algo-amount-display.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { useAlgorandAddress } from "@/hooks/useAlgorandAddress.ts";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { displayAlgoAddress } from "@/lib/utils.ts";
import CopyButton from "@/components/copy-to-clipboard.tsx";

export const Route = createFileRoute("/$address")({
  component: Address,
});

function Address() {
  const { address } = Route.useParams();

  const { resolvedAddress } = useAlgorandAddress(address);
  const {
    data: transactions,
    loading,
    hasError,
  } = useTransactions(resolvedAddress);

  if (hasError) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-pretty text-red-900 sm:text-6xl">
          Cannot load transactions
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          Sorry, we couldn’t get your transactions. Please verify your address
          and try again later.
        </p>
        <div className="mt-10">
          <a href="/" className="text-sm/7 font-semibold text-indigo-600">
            <span aria-hidden="true">&larr;</span> Back to home
          </a>
        </div>
      </main>
    );
  }

  const totalRewards = transactions.reduce(
    (acc: bigint, transaction: Transaction) => {
      return acc + (transaction?.paymentTransaction?.amount ?? 0n);
    },
    0n,
  );

  const totalNbOfBlocksWithRewards = transactions.length;
  const maxRewardTransaction: { amount: bigint; date: number } =
    transactions.reduce(
      (acc, transaction) => {
        const amount = transaction?.paymentTransaction?.amount ?? 0n;
        const date = transaction.roundTime ?? 0;

        return acc.amount > amount ? acc : { amount, date };
      },
      { amount: 0n, date: 0 },
    );

  const minRewardTransaction: { amount: bigint; date: number } =
    transactions.reduce(
      (acc, transaction) => {
        const amount = transaction?.paymentTransaction?.amount ?? 0n;
        // Provide a default value of 0 if roundTime is undefined
        const date = transaction.roundTime ?? 0;

        return acc.amount < amount ? acc : { amount, date };
      },
      // Use a safer initial value that doesn't depend on transactions[0] existing
      {
        amount:
          transactions.length > 0
            ? (transactions[0]?.paymentTransaction?.amount ?? 0n)
            : 0n,
        date: transactions.length > 0 ? (transactions[0]?.roundTime ?? 0) : 0,
      },
    );

  const maxReward = maxRewardTransaction.amount;
  const maxRewardDate = new Date(
    maxRewardTransaction.date * 1000,
  ).toLocaleString();

  const minReward =
    transactions.length === 0 ? 0n : minRewardTransaction.amount;
  const minRewardDate = new Date(
    minRewardTransaction.date * 1000,
  ).toLocaleString();

  return (
    <div className="min-h-full">
      <main className="mt-4">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-5">
            <nav aria-label="Breadcrumb" className="flex">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div>
                    <a href="/" className="text-gray-400 hover:text-gray-500">
                      <HomeIcon
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                      <span className="sr-only">Home</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-gray-400"
                    />
                    <a
                      href={""}
                      aria-current={"page"}
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {address}
                    </a>
                  </div>
                </li>
              </ol>
            </nav>
            <div className={"flex flex-wrap items-center gap-2"}>
              <h2 className="text-xl/7 font-bold text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
                {resolvedAddress ? (
                  <a href={`https://allo.info/account/${resolvedAddress}`}>
                    {displayAlgoAddress(resolvedAddress)}
                  </a>
                ) : (
                  <Spinner />
                )}
              </h2>
              <CopyButton address={resolvedAddress ?? ""}></CopyButton>
            </div>
          </div>
          <div className="rounded-lg px-5 py-6 sm:px-6">
            <div className="rounded-lg bg-indigo-500">
              <div className="mx-auto max-w-7xl rounded-lg">
                <div className="grid grid-cols-1 gap-px rounded-lg sm:grid-cols-2 lg:grid-cols-4">
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Total reward
                    </p>
                    <div className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-center text-4xl font-semibold tracking-tight text-white">
                        {loading ? (
                          <Spinner />
                        ) : (
                          <AlgoAmountDisplay
                            microAlgoAmount={totalRewards}
                            iconSize={18}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Max reward
                    </p>
                    <div className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight text-white">
                        {loading ? (
                          <Spinner />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlgoAmountDisplay
                                microAlgoAmount={maxReward}
                                iconSize={18}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{maxRewardDate}</TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Min reward
                    </p>
                    <div className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight text-white">
                        {loading ? (
                          <Spinner />
                        ) : (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlgoAmountDisplay
                                microAlgoAmount={minReward}
                                iconSize={18}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{minRewardDate}</TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Total blocks with rewards
                    </p>
                    <div className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight text-white">
                        {loading ? <Spinner /> : totalNbOfBlocksWithRewards}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Heatmap transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
