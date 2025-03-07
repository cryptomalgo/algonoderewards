import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Transaction } from "algosdk/client/indexer";
import MonthView from "@/components/heatmap/month-view.tsx";
import { DayWithRewards, DisplayMonth } from "@/components/heatmap/types.ts";

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
      const dateStr = day.toLocaleDateString("en-US");
      const dayTransactions = transactions.filter(
        (tx) =>
          new Date((tx.roundTime ?? 0) * 1000).toLocaleDateString("en-US") ===
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
