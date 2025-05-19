import { ResolvedAddress } from "../heatmap/types";
import { useAccount } from "@/hooks/useAccounts";
import Spinner from "../spinner";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import AlgoAmountDisplay from "../algo-amount-display";
import { ALGO_BALANCE_THRESHOLD_FOR_REWARDS } from "@/constants";
import { DotBadge } from "../dot-badge";
import { Account } from "algosdk/client/indexer";
import {
  BoxIcon,
  CoinsIcon,
  EyeIcon,
  EyeOffIcon,
  HeartPulseIcon,
  KeyRoundIcon,
  Loader,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/mobile-tooltip";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAverageBlockTime } from "@/hooks/useAverageBlockTime";
import { format, formatDistanceToNow } from "date-fns";
import { useBlock } from "@/hooks/useBlock";
import { ExplorerLink } from "../explorer-link";
import React from "react";

function BalanceBadge({ account }: { account: Account }) {
  const isBalanceOverThreshold =
    new AlgoAmount({ microAlgos: account.amount }) >=
    new AlgoAmount({ algos: ALGO_BALANCE_THRESHOLD_FOR_REWARDS });

  if (isBalanceOverThreshold) {
    return (
      <DotBadge
        className="text-md"
        color="green"
        label="Balance over threshold"
      />
    );
  }
  return (
    <DotBadge className="text-md" color="red" label="Balance under threshold" />
  );
}

function IncentiveEligibilityBadge({ account }: { account: Account }) {
  if (account.incentiveEligible) {
    return (
      <DotBadge className="text-md" color="green" label="Incentive eligible" />
    );
  }
  return (
    <DotBadge
      className="text-md"
      color="red"
      label="Not eligible to incentive"
    />
  );
}

function LastHeartbeatBadge({ account }: { account: Account }) {
  const { data: block } = useBlock(account.lastHeartbeat);

  if (account.lastHeartbeat === undefined || block === undefined) {
    return <DotBadge className="text-md" color="red" label="No heartbeat" />;
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
            <HeartPulseIcon className="size-4" /> Last heartbeat:{" "}
            {formatDistanceToNow(new Date(block.timestamp * 1000), {
              addSuffix: true,
            })}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {" "}
          <ExplorerLink
            className="text-indigo-300 underline hover:text-indigo-400"
            type={"block"}
            id={block.round.toString()}
          >
            Block #{block.round}
          </ExplorerLink>{" "}
          {format(new Date(block.timestamp * 1000), "PPpp")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LastBlockProposedBadge({ account }: { account: Account }) {
  const { data: block } = useBlock(account.lastProposed);
  // Add a state to trigger re-renders
  const [, setForceUpdate] = React.useState(0);

  // Set up an interval to update the component every minute
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setForceUpdate((prev) => prev + 1); // Increment to trigger re-render
    }, 60000); // 60000ms = 1 minute

    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  if (account.lastProposed === undefined || block === undefined) {
    return (
      <DotBadge className="text-md" color="red" label="No block proposed" />
    );
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
            <BoxIcon className="size-4" />
            Last block:{" "}
            {formatDistanceToNow(new Date(block.timestamp * 1000), {
              addSuffix: true,
            })}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <ExplorerLink
            className="text-indigo-300 underline hover:text-indigo-400"
            type={"block"}
            id={account.lastProposed.toString()}
          >
            Block #{account.lastProposed}
          </ExplorerLink>{" "}
          {format(new Date(block.timestamp * 1000), "PPpp")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ParticipationKeyBadge({ account }: { account: Account }) {
  const { data: averageBlockTime, isPending } = useAverageBlockTime();

  if (isPending) return <Loader className="size-4 animate-spin" />;

  if (!account.participation) {
    return (
      <DotBadge className="text-md" color="red" label="No participation key" />
    );
  }
  const remainingRounds = account.participation.voteLastValid - account.round;

  if (!averageBlockTime)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
              <KeyRoundIcon className="size-4" />
              {`Participation key remaining rounds: ${remainingRounds}`}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Until round {account.participation.voteLastValid}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

  const expirationTimeInSeconds = Number(remainingRounds) * averageBlockTime;
  const expirationDate = new Date(Date.now() + expirationTimeInSeconds * 1000);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
            <KeyRoundIcon className="size-4" />
            {`Participation key expiration: ${formatDistanceToNow(
              expirationDate,
              { addSuffix: true },
            )}`}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Key expire on round {account.participation.voteLastValid}. That's{" "}
          {remainingRounds} rounds from now.
          <br />
          With an average block time of {averageBlockTime} seconds, it will
          expire approximately on {format(expirationDate, "PPpp")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusBadge({ account }: { account: Account }) {
  if (account.status === "Offline") {
    return <DotBadge className="text-md" color="red" label="Node offline" />;
  }
  if (account.status === "Online") {
    return <DotBadge className="text-md" color="green" label="Node online" />;
  }
  return null;
}

export default function AccountStatus({
  address,
}: {
  address: ResolvedAddress;
}) {
  const { data: account, isPending, isError, error } = useAccount(address);

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

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error fetching account status: {error.message}
      </div>
    );
  }

  return (
    <div className="my-2">
      <div className="text-md flex w-fit min-w-40 flex-col gap-x-1.5 rounded-md px-3 py-2 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
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
      <div className="my-2 flex flex-wrap items-center gap-2">
        <StatusBadge account={account} />
        <BalanceBadge account={account} />
        <IncentiveEligibilityBadge account={account} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <LastHeartbeatBadge account={account} />
        <LastBlockProposedBadge account={account} />
        <ParticipationKeyBadge account={account} />
      </div>
    </div>
  );
}
