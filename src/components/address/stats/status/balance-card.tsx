import AlgoAmountDisplay from "@/components/algo-amount-display";
import { Button } from "@/components/ui/button";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Account } from "algosdk/client/indexer";
import { CoinsIcon, EyeOffIcon, EyeIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BalanceCardSkeleton() {
  return (
    <div className="text-md flex h-fit w-fit min-w-40 flex-col gap-x-1.5 rounded-md px-3 py-2 font-medium ring-1 ring-gray-200 ring-inset dark:ring-gray-800">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-12" />
        </span>
        <Skeleton className="size-4 rounded" />
      </div>
      <Skeleton className="mt-1 h-7 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function BalanceCard({ account }: { account: Account }) {
  // Read from search params instead of local state
  const search = useSearch({ from: "/$addresses" });
  const navigate = useNavigate({ from: "/$addresses" });

  const isBalanceHidden = search.hideBalance;

  // Toggle handler that updates the URL
  const toggleBalanceVisibility = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        hideBalance: !isBalanceHidden,
      }),
      replace: true, // Replace the URL to avoid adding to history stack
    });
  };

  return (
    <div className="text-md flex h-fit w-fit min-w-40 flex-col gap-x-1.5 rounded-md px-3 py-2 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1">
          <CoinsIcon className="size-4" />
          Staked
        </span>
        <Button
          variant="ghost"
          className="size-4"
          onClick={() => {
            toggleBalanceVisibility();
          }}
        >
          {isBalanceHidden ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </Button>
      </div>
      <AlgoAmountDisplay
        microAlgoAmount={account.amount}
        hidden={isBalanceHidden}
      />
    </div>
  );
}
