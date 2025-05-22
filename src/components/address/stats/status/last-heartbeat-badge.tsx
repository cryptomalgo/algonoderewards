import { DotBadge } from "@/components/dot-badge";
import { ExplorerLink } from "@/components/explorer-link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { useBlock } from "@/hooks/useBlock";
import { Account } from "algosdk/client/indexer";
import { format, formatDistanceToNow } from "date-fns";
import { HeartPulseIcon } from "lucide-react";

export function LastHeartbeatBadge({ account }: { account: Account }) {
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
