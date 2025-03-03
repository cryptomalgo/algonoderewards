import { createFileRoute } from "@tanstack/react-router";
import { useTransactions } from "@/hooks/useRewardTransactions.ts";
import Spinner from "@/components/Spinner.tsx";
import { Transaction } from "algosdk/client/indexer";
import * as React from "react";
import Heatmap from "@/components/heatmap.tsx";
import { BellIcon, GlassesIcon } from "lucide-react";
import AlgoAmountDisplay from "@/components/algo-amount-display.tsx";
import { displayAlgoAddress } from "@/lib/utils.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export const Route = createFileRoute("/$address")({
  component: Address,
});

function Address() {
  const { address } = Route.useParams();

  const { data: transactions, loading, error } = useTransactions(address);

  if (error) {
    return <div className="p-4 text-red-500">Error loading transactions.</div>;
  }

  const totalRewards = transactions.reduce(
    (acc: bigint, transaction: Transaction) => {
      return acc + (transaction?.paymentTransaction?.amount ?? 0n);
    },
    0n,
  );

  const totalNbOfBlocksWithRewards = transactions.length;

  const maxRewardTransaction = transactions.reduce(
    (acc, transaction) => {
      const amount = transaction?.paymentTransaction?.amount ?? 0n;
      return acc.amount > amount
        ? acc
        : { amount, date: transaction.roundTime };
    },
    { amount: 0n, date: 0 },
  );

  const minRewardTransaction = transactions.reduce(
    (acc, transaction) => {
      const amount = transaction?.paymentTransaction?.amount ?? 0n;
      return acc.amount < amount
        ? acc
        : { amount, date: transaction.roundTime };
    },
    {
      amount: transactions[0]?.paymentTransaction?.amount ?? 999999999n,
      date: transactions[0]?.roundTime ?? 0,
    },
  );

  const maxReward = maxRewardTransaction.amount;
  const maxRewardDate = new Date(
    maxRewardTransaction.date * 1000,
  ).toLocaleString();

  const minReward = minRewardTransaction.amount;
  const minRewardDate = new Date(
    minRewardTransaction.date * 1000,
  ).toLocaleString();

  return (
    <div className="min-h-full">
      <div className="bg-indigo-600 pb-32">
        <nav className="border-b border-indigo-300/25 bg-indigo-600 lg:border-none">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400/25">
              <div className="flex items-center px-2 lg:px-0">
                <div className="shrink-0">
                  <img
                    alt="Your Company"
                    src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=300"
                    className="block size-8"
                  />
                </div>
                <div className="hidden lg:ml-10 lg:block">
                  <div className="flex space-x-4"></div>
                </div>
              </div>
              <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="grid w-full max-w-lg grid-cols-1 lg:max-w-xs">
                  <input
                    name="search"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pr-3 pl-10 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white/40 sm:text-sm/6"
                  />
                  <GlassesIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400"
                  />
                </div>
              </div>
              <div className="hidden lg:ml-4 lg:block">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="relative shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 focus:outline-none"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <header className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Stats for{" "}
                <span title={address}>{displayAlgoAddress(address)}</span>
              </h1>
            </div>
          </header>
        </nav>
      </div>

      <main className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <div className="rounded-lg bg-indigo-500">
              <div className="mx-auto max-w-7xl rounded-lg">
                <div className="grid grid-cols-1 gap-px rounded-lg sm:grid-cols-2 lg:grid-cols-4">
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Total reward
                    </p>
                    <p className="mt-2 flex items-baseline gap-x-2">
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
                    </p>
                  </div>
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Max reward
                    </p>
                    <p className="mt-2 flex items-baseline gap-x-2">
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
                    </p>
                  </div>
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Min reward
                    </p>
                    <p className="mt-2 flex items-baseline gap-x-2">
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
                    </p>
                  </div>
                  <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-sm/6 font-medium text-slate-200">
                      Total blocks with rewards
                    </p>
                    <p className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight text-white">
                        {loading ? <Spinner /> : totalNbOfBlocksWithRewards}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/*<ul className="list-disc">*/}
            {/*  <li>*/}
            {/*    Total Rewards Amount: {totalRewardAmount.algos}*/}
            {/*    {algoPrice*/}
            {/*      ? ` ($${(algoPrice * totalRewardAmount.algos).toFixed(2)})`*/}
            {/*      : ""}*/}
            {/*  </li>*/}
            {/*  <li>Total Rewards: {transactions.length}</li>*/}
            {/*  <li>Max reward amount {maxRewardAmount.algos}</li>*/}
            {/*</ul>*/}
            <Heatmap transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
