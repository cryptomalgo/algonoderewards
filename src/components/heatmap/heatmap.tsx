import React, { useMemo, useCallback, useState, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Block } from "algosdk/client/indexer";
import MonthView from "@/components/heatmap/month-view.tsx";
import { DayWithRewards, DisplayMonth } from "@/components/heatmap/types.ts";
function generateDays(
  month: number,
  year: number,
  startOnMonday: boolean = true,
): Date[] {
  // Create dates without time components to avoid timezone issues
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const start = new Date(firstDayOfMonth);
  // Use getDay instead of getUTCDay
  while (start.getDay() !== (startOnMonday ? 1 : 0)) {
    start.setDate(start.getDate() - 1);
  }

  const end = new Date(lastDayOfMonth);
  while (end.getDay() !== (startOnMonday ? 0 : 6)) {
    end.setDate(end.getDate() + 1);
  }

  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

const Heatmap: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  const [displayMonths, setDisplayMonths] = useState<DisplayMonth[]>(() => {
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
  });

  // Process transactions once into a date-based lookup map
  const { transactionsByDate, maxCount } = useMemo(() => {
    const dateMap = new Map<string, { count: number; totalAmount: number }>();
    let maxCount = 0;

    blocks.forEach((block) => {
      if (!block.timestamp) return;

      const date = new Date(block.timestamp * 1000);
      const dateStr = date.toLocaleDateString("en-US");

      const existing = dateMap.get(dateStr) || { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += block?.proposerPayout ?? 0;

      dateMap.set(dateStr, existing);

      if (existing.count > maxCount) maxCount = existing.count;
    });

    return { transactionsByDate: dateMap, maxCount: Math.max(maxCount, 1) };
  }, [blocks]);

  // Cache generated days to avoid redundant calculations
  const daysCache = useRef(new Map<string, Date[]>());

  const getDaysWithRewards = useCallback(
    (month: number, year: number): DayWithRewards[] => {
      const cacheKey = `${month}-${year}`;
      let days = daysCache.current.get(cacheKey);

      if (!days) {
        days = generateDays(month, year, true);
        daysCache.current.set(cacheKey, days);
      }

      return days.map((day) => {
        const dateStr = day.toLocaleDateString("en-US");
        const dayData = transactionsByDate.get(dateStr) || {
          count: 0,
          totalAmount: 0,
        };

        return {
          date: dateStr,
          count: dayData.count,
          totalAmount: dayData.totalAmount,
        };
      });
    },
    [transactionsByDate],
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
        {displayMonths.map((month) => (
          <MonthView
            key={`${month.month}-${month.year}`}
            month={month.month}
            year={month.year}
            daysWithRewards={getDaysWithRewards(month.month, month.year)}
            maxRewardCount={maxCount}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Heatmap);
