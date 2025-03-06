import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Transaction } from "algosdk/client/indexer";
import AlgoAmountDisplay from "@/components/algo-amount-display.tsx";

function isCurrentDate(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const currentDate = new Date();

  return (
    inputDate.getFullYear() === currentDate.getFullYear() &&
    inputDate.getMonth() === currentDate.getMonth() &&
    inputDate.getDate() === currentDate.getDate()
  );
}

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

interface DisplayMonth {
  month: number;
  year: number;
}

interface DayWithRewards {
  date: string;
  count: number;
  totalAmount: bigint;
}

function generateDays(
  month: number,
  year: number,
  startOnMonday: boolean = true,
): Date[] {
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

  // Get the first day to display (Monday or Sunday of the week containing the 1st of the month)
  const start = new Date(firstDayOfMonth);
  while (start.getUTCDay() !== (startOnMonday ? 1 : 0)) {
    start.setUTCDate(start.getUTCDate() - 1);
  }

  // Get the last day to display (Sunday or Saturday of the week containing the last day of the month)
  const end = new Date(lastDayOfMonth);
  while (end.getUTCDay() !== (startOnMonday ? 0 : 6)) {
    end.setUTCDate(end.getUTCDate() + 1);
  }

  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}

const MonthView: React.FC<{
  month: number;
  year: number;
  daysWithRewards: DayWithRewards[];
  maxRewardCount: number;
}> = ({ month, year, daysWithRewards, maxRewardCount }) => {
  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });

  const totalRewards = daysWithRewards.reduce((sum, day) => sum + day.count, 0);
  const totalAmount = daysWithRewards.reduce(
    (sum, day) => sum + day.totalAmount,
    0n,
  );

  return (
    <section className="mx-auto min-w-xs text-center">
      <h2 className="text-sm font-semibold text-gray-900">{monthName}</h2>
      <div className="flex flex-col items-center text-xs text-gray-500">
        <span>{totalRewards} blocks</span>
        <AlgoAmountDisplay microAlgoAmount={totalAmount} iconSize={10} />
      </div>
      <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500">
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>
      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
        {daysWithRewards.map((day, dayIdx) => (
          <DayView
            dayIdx={dayIdx}
            month={month}
            key={day.date}
            day={day}
            maxRewardCount={maxRewardCount}
          />
        ))}
      </div>
    </section>
  );
};

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
    <span
      style={{ backgroundColor, color: textColor }}
      className={cn(
        dayIdx === 0 && "rounded-tl-lg",
        dayIdx === 6 && "rounded-tr-lg",
        dayIdx === dayIdx - 7 && "rounded-bl-lg",
        dayIdx === dayIdx - 1 && "rounded-br-lg",
        "relative py-1.5 hover:bg-gray-100 focus:z-10",
        !isCurrentMonth && "bg-gray-50 text-gray-400",
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <time
              dateTime={day.date}
              className={cn(
                isCurrentDate(day.date) && "bg-indigo-900 text-white",
                "mx-auto flex size-7 items-center justify-center rounded-full",
              )}
            >
              {day.date.split("-").pop()?.replace(/^0/, "")}
            </time>
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
    </span>
  );
};

const Heatmap: React.FC<{ transactions: Transaction[] }> = ({
  transactions,
}) => {
  const [displayMonths, setDisplayMonths] = React.useState<DisplayMonth[]>(
    () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const twoMonthsAgo =
        currentMonth <= 1 ? 11 + (currentMonth - 1) : currentMonth - 2;
      const currentYear = now.getFullYear();
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const twoYearsAgo = currentMonth <= 1 ? currentYear - 1 : currentYear;

      return [
        { month: twoMonthsAgo, year: twoYearsAgo },
        { month: previousMonth, year: previousYear },
        { month: currentMonth, year: currentYear },
      ];
    },
  );

  const handlePreviousMonth = () => {
    setDisplayMonths((prev) => {
      const newMonth = prev[0].month === 0 ? 11 : prev[0].month - 1;
      const newYear = prev[0].month === 0 ? prev[0].year - 1 : prev[0].year;
      return [{ month: newMonth, year: newYear }, prev[0], prev[1]];
    });
  };

  const handleNextMonth = () => {
    setDisplayMonths((prev) => {
      const newMonth = prev[2].month === 11 ? 0 : prev[2].month + 1;
      const newYear = prev[2].month === 11 ? prev[2].year + 1 : prev[2].year;
      return [prev[1], prev[2], { month: newMonth, year: newYear }];
    });
  };

  const getMaxRewardCount = (): number => {
    const countMap = new Map<string, number>();
    transactions.forEach((tx) => {
      const dateStr = new Date((tx.roundTime ?? 0) * 1000)
        .toISOString()
        .split("T")[0];
      countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
    });
    return Math.max(...Array.from(countMap.values()), 1);
  };

  const getDaysWithRewards = (
    month: number,
    year: number,
  ): DayWithRewards[] => {
    const days = generateDays(month, year, true);

    return days.map((day) => {
      const dateStr = day.toISOString().split("T")[0];
      const dayTransactions = transactions.filter(
        (tx) =>
          new Date((tx.roundTime ?? 0) * 1000).toISOString().split("T")[0] ===
          dateStr,
      );

      return {
        date: dateStr,
        count: dayTransactions.length,
        totalAmount: dayTransactions.reduce(
          (sum, tx) => sum + (tx.paymentTransaction?.amount ?? 0n),
          0n,
        ),
      };
    });
  };

  const maxRewardCount = getMaxRewardCount();

  return (
    <div className={"my-4"}>
      <div className="relative mx-auto flex flex-wrap gap-10">
        <button
          type="button"
          className="absolute -top-1 -left-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          onClick={handlePreviousMonth}
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="absolute -top-1 -right-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          onClick={handleNextMonth}
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="size-5" aria-hidden="true" />
        </button>
        {displayMonths.map((month, monthIdx) => (
          <MonthView
            key={monthIdx}
            month={month.month}
            year={month.year}
            daysWithRewards={getDaysWithRewards(month.month, month.year)}
            maxRewardCount={maxRewardCount}
          />
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
