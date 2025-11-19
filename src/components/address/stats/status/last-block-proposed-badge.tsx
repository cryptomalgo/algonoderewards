import React from "react";
import { DotBadge } from "@/components/dot-badge";
import { ExplorerLink } from "@/components/explorer-link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { useBlock } from "@/hooks/queries/useBlock";
import { Account } from "algosdk/client/indexer";
import { format, formatDistanceToNow } from "date-fns";
import { BoxIcon } from "lucide-react";

export const LastBlockProposedBadge = React.memo<{
  account: Account;
  hidden: boolean;
}>(({ account, hidden }) => {
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
    <div className="flex">
      <Tooltip>
        <TooltipTrigger>
          <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
            <BoxIcon className="size-4" />
            Last block:{" "}
            {hidden
              ? "about *** ago"
              : formatDistanceToNow(new Date(block.timestamp * 1000), {
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
    </div>
  );
});
