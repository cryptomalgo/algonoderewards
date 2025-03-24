import React, { useEffect } from "react";
import { cn } from "@/lib/utils.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip.tsx";
import AlgoAmountDisplay from "@/components/algo-amount-display.tsx";
import { DayWithRewards } from "@/components/heatmap/types.ts";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useTheme } from "@/components/theme-provider.tsx";
function getDayColorShade(
  value: number,
  max: number,
  isDarkMode: boolean,
): {
  textColor: string;
  backgroundColor: string;
  colorRGB: { r: number; g: number; b: number };
} {
  const clamped = Math.min(Math.max(value, 0), max);
  const ratio = clamped / max;

  // Light mode colors
  const lightModeStart = { r: 255, g: 255, b: 255 };
  const lightModeEnd = { r: 45, g: 45, b: 241 };

  // Dark mode colors - deeper blue that looks good in dark mode
  //oklch(0.21 0.034 264.665)
  const darkModeStart = { r: 16, g: 24, b: 40 };
  const darkModeEnd = { r: 97, g: 95, b: 255 };

  const start = isDarkMode ? darkModeStart : lightModeStart;
  const end = isDarkMode ? darkModeEnd : lightModeEnd;

  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 140 ? "black" : "white"; // Adjusted threshold for dark mode

  return {
    textColor: textColor,
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    colorRGB: { r, g, b },
  };
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
  totalDays: number;
}> = ({ day, dayIdx, maxRewardCount, month, totalDays }) => {
  // Get dark mode status from theme context
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const dayDate = new Date(day.date);
  const isCurrentMonth = dayDate.getMonth() === month;

  const colorData = isCurrentMonth
    ? getDayColorShade(day.count, maxRewardCount, isDarkMode)
    : {
        textColor: isDarkMode ? "#6b7280" : "#99a1af",
        backgroundColor: isDarkMode ? "#030712" : "#fbf9fa",
        colorRGB: isDarkMode
          ? { r: 3, g: 7, b: 18 }
          : { r: 251, g: 249, b: 250 },
      };

  // Motion values for animating
  const rValue = useMotionValue(colorData.colorRGB.r);
  const gValue = useMotionValue(colorData.colorRGB.g);
  const bValue = useMotionValue(colorData.colorRGB.b);
  const textColorValue = useMotionValue(colorData.textColor);

  // Transform motion values to create the backgroundColor
  const animatedBgColor = useTransform(
    [rValue, gValue, bValue],
    ([r, g, b]) =>
      `rgb(${Math.round(Number(r))}, ${Math.round(Number(g))}, ${Math.round(Number(b))})`,
  );
  useEffect(() => {
    if (isCurrentMonth) {
      const { colorRGB, textColor } = getDayColorShade(
        day.count,
        maxRewardCount,
        isDarkMode,
      );
      rValue.set(colorRGB.r);
      gValue.set(colorRGB.g);
      bValue.set(colorRGB.b);
      textColorValue.set(textColor);
    } else {
      // Empty day color for current theme
      if (isDarkMode) {
        rValue.set(3);
        gValue.set(7);
        bValue.set(18);
        textColorValue.set("#6b7280");
      } else {
        rValue.set(251);
        gValue.set(249);
        bValue.set(250);
        textColorValue.set("#99a1af");
      }
    }
  }, [
    day.count,
    maxRewardCount,
    isCurrentMonth,
    rValue,
    gValue,
    bValue,
    textColorValue,
    isDarkMode,
  ]);

  const formattedDate = dayDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const daysPerWeek = 7;
  const lastRowStartIdx = totalDays - daysPerWeek;
  const isLastRowStart = dayIdx === lastRowStartIdx;
  const isLastRowEnd = dayIdx === totalDays - 1;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <motion.span
            style={{
              backgroundColor: animatedBgColor,
              color: textColorValue,
            }}
            initial={{
              backgroundColor: colorData.backgroundColor,
              color: colorData.textColor,
            }}
            animate={{
              backgroundColor: colorData.backgroundColor,
              color: colorData.textColor,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={cn(
              dayIdx === 0 && "rounded-tl-lg",
              dayIdx === 6 && "rounded-tr-lg",
              isLastRowStart && "rounded-bl-lg",
              isLastRowEnd && "rounded-br-lg",
              "relative py-1.5 hover:bg-gray-100 focus:z-10 dark:hover:bg-gray-700",
              !isCurrentMonth && "text-gray-400",
              "data-[state=open]:ring-2 data-[state=open]:ring-gray-500 dark:data-[state=open]:ring-gray-400",
              dayIdx === dayIdx - 7 && "rounded-bl-lg",
              dayIdx === dayIdx - 1 && "rounded-br-lg",
              "relative py-1.5 hover:bg-gray-100 focus:z-10 dark:hover:bg-gray-700",
              !isCurrentMonth && "text-gray-400 dark:text-gray-500",
              "data-[state=open]:ring-2 data-[state=open]:ring-gray-500 dark:data-[state=open]:ring-gray-400",
            )}
          >
            <time
              dateTime={day.date}
              className={cn(
                isCurrentDate(day.date) &&
                  "bg-indigo-900 text-white dark:bg-indigo-700 dark:text-white",
                "mx-auto flex size-7 items-center justify-center rounded-full",
              )}
            >
              {dayDate.toLocaleDateString("en-US", {
                day: "2-digit",
              })}
            </time>
          </motion.span>
        </TooltipTrigger>
        {isCurrentMonth && (
          <TooltipContent className="flex flex-col gap-1 p-2">
            <p className="text-sm font-semibold">{formattedDate}</p>
            <div className={"flex flex-col gap-1"}>
              <span className="font-medium">
                {day.count} {day.count > 1 ? "blocks" : "block"}
              </span>
              <AlgoAmountDisplay
                showAnimation={false}
                microAlgoAmount={day.totalAmount}
              />
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default DayView;
