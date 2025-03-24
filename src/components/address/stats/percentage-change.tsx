import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export default function PercentageChange({
  percentage,
  direction,
  previousValueDisplay,
}: {
  percentage: number;
  direction: "up" | "down" | "none";
  previousValueDisplay: React.ReactNode;
}) {
  if (direction === "none") return null;

  const Icon = direction === "up" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={"ml-1 flex items-center"}>
          <span
            className={cn(
              "inline-flex items-center text-sm font-semibold",
              direction === "up"
                ? "text-green-400 dark:text-green-500"
                : "text-red-400 dark:text-red-500",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0 self-center",
                direction === "up"
                  ? "text-green-400 dark:text-green-500"
                  : "text-red-400 dark:text-red-500",
              )}
            />
            {percentage}%
          </span>
        </TooltipTrigger>
        <TooltipContent>{previousValueDisplay}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
