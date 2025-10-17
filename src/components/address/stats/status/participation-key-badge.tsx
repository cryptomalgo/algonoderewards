import { DotBadge } from "@/components/dot-badge";
import Spinner from "@/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { useAverageBlockTime } from "@/hooks/useAverageBlockTime";
import { Account } from "algosdk/client/indexer";
import { format, formatDistanceToNow } from "date-fns";
import { KeyRoundIcon } from "lucide-react";
import { useMemo } from "react";

export function ParticipationKeyBadge({ account }: { account: Account }) {
  const { data: averageBlockTime, isPending } = useAverageBlockTime();

  const remainingRounds = account.participation
    ? account.participation.voteLastValid - account.round
    : 0;

  // Calculate expiration time in seconds (pure calculation)
  const expirationTimeInSeconds = useMemo(() => {
    if (!averageBlockTime) return null;
    return Number(remainingRounds) * averageBlockTime;
  }, [remainingRounds, averageBlockTime]);

  if (isPending) return <Spinner />;

  if (!account.participation) {
    return (
      <DotBadge className="text-md" color="red" label="No participation key" />
    );
  }

  if (!averageBlockTime || !expirationTimeInSeconds)
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

  // Create date objects here, outside of render but only when needed
  const now = new Date();
  const expirationDate = new Date(
    now.getTime() + expirationTimeInSeconds * 1000,
  );

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
