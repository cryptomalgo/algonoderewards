import React from "react";
import { cn } from "@/lib/utils.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip.tsx";
import AlgoAmountDisplay from "@/components/algo-amount-display.tsx";
import { DayWithRewards } from "@/components/heatmap/types.ts";

function getDayColorShade(
  value: number,
  max: number,
): {
  textColor: string;
  backgroundColor: string;
} {
  const clamped = Math.min(Math.max(value, 0), max);
  const ratio = clamped / max;

  const white = { r: 255, g: 255, b: 255 };
  const darkGreen = { r: 45, g: 45, b: 241 };

  const r = Math.round(white.r + (darkGreen.r - white.r) * ratio);
  const g = Math.round(white.g + (darkGreen.g - white.g) * ratio);
  const b = Math.round(white.b + (darkGreen.b - white.b) * ratio);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 186 ? "black" : "white";

  return { textColor: textColor, backgroundColor: `rgb(${r}, ${g}, ${b})` };
}

function isCurrentDate(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const currentDate = new Date();

  return (
    inputDate.getFullYear() === currentDate.getFullYear() &&
    inputDate.getMonth() === currentDate.getMonth() &&
    inputDate.getDate() === currentDate.getDate()
  );
}

const DayView: React.FC<{
  day: DayWithRewards;
  month: number;
  dayIdx: number;
  maxRewardCount: number;
}> = ({ day, dayIdx, maxRewardCount, month }) => {
  const dayDate = new Date(day.date);

  const isCurrentMonth = dayDate.getMonth() === month;
  const { textColor, backgroundColor } = isCurrentMonth
    ? getDayColorShade(day.count, maxRewardCount)
    : { textColor: "#99a1af", backgroundColor: "#fbf9fa" };

  const formattedDate = dayDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <span
            style={{ backgroundColor, color: textColor }}
            className={cn(
              dayIdx === 0 && "rounded-tl-lg",
              dayIdx === 6 && "rounded-tr-lg",
              dayIdx === dayIdx - 7 && "rounded-bl-lg",
              dayIdx === dayIdx - 1 && "rounded-br-lg",
              "relative py-1.5 hover:bg-gray-100 focus:z-10",
              !isCurrentMonth && "bg-gray-50 text-gray-400",
              "data-[state=open]:ring-2 data-[state=open]:ring-gray-500",
            )}
          >
            <time
              dateTime={day.date}
              className={cn(
                isCurrentDate(day.date) && "bg-indigo-900 text-white",
                "mx-auto flex size-7 items-center justify-center rounded-full",
              )}
            >
              {dayDate.toLocaleDateString("en-US", {
                day: "2-digit",
              })}
            </time>
          </span>
        </TooltipTrigger>
        {isCurrentMonth && (
          <TooltipContent className="flex flex-col gap-1 p-2">
            <p className="text-sm font-semibold">{formattedDate}</p>
            <div className={"flex flex-col gap-1"}>
              <span className="font-medium">
                {day.count} {day.count > 1 ? "blocks" : "block"}
              </span>
              <AlgoAmountDisplay
                microAlgoAmount={day.totalAmount}
                iconSize={10}
              />
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default DayView;
