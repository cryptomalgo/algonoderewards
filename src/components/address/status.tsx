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
} from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/mobile-tooltip";

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
  if (account.lastHeartbeat === undefined) {
    return <DotBadge className="text-md" color="red" label="No heartbeat" />;
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
            <HeartPulseIcon className="size-4" /> Last heartbeat:{" "}
            {`${Number(account.round) - account.lastHeartbeat} rounds ago`}
          </span>
        </TooltipTrigger>
        <TooltipContent>Round {account.lastHeartbeat}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LastBlockProposedBadge({ account }: { account: Account }) {
  if (account.lastProposed === undefined) {
    return (
      <DotBadge className="text-md" color="red" label="No block proposed" />
    );
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
            <BoxIcon className="size-4" /> Last proposed block:{" "}
            {Number(account.round) - account.lastProposed} rounds ago
          </span>
        </TooltipTrigger>
        <TooltipContent>Round {account.lastProposed}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ParticipationKeyBadge({ account }: { account: Account }) {
  if (!account.participation) {
    return (
      <DotBadge className="text-md" color="red" label="No participation key" />
    );
  }

  const remainingRounds = account.participation.voteLastValid - account.round;

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

  const [isBalanceHidden, setIsBalanceHidden] = React.useState(false);
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
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
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
