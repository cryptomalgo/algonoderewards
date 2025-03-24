import React from "react";
import AlgoAmountDisplay from "@/components/algo-amount-display.tsx";
import DayView from "./day-view";
import { DayWithRewards } from "./types";
import NumberDisplay from "@/components/number-display.tsx";

const MonthView: React.FC<{
  month: number;
  year: number;
  daysWithRewards: DayWithRewards[];
  maxRewardCount: number;
}> = ({ month, year, daysWithRewards, maxRewardCount }) => {
  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });

  const totalRewards = daysWithRewards.reduce((sum, day) => {
    const dayDate = new Date(day.date);
    const isCurrentMonth = dayDate.getMonth() === month;
    const isCurrentYear = dayDate.getFullYear() === year;
    return isCurrentMonth && isCurrentYear ? sum + day.count : sum;
  }, 0);

  const totalAmount = daysWithRewards.reduce((sum, day) => {
    const dayDate = new Date(day.date);
    const isCurrentMonth = dayDate.getMonth() === month;
    const isCurrentYear = dayDate.getFullYear() === year;

    return isCurrentMonth && isCurrentYear ? sum + day.totalAmount : sum;
  }, 0);

  return (
    <section className="mx-auto min-w-xs text-center">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {monthName}
      </h2>
      <div className="flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          <NumberDisplay value={totalRewards} /> blocks
        </span>
        <AlgoAmountDisplay microAlgoAmount={totalAmount} />
      </div>
      <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500 dark:text-gray-400">
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>
      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200 dark:bg-gray-700 dark:ring-gray-700">
        {daysWithRewards.map((day, dayIdx) => (
          <DayView
            dayIdx={dayIdx}
            month={month}
            key={day.date}
            day={day}
            maxRewardCount={maxRewardCount}
            totalDays={daysWithRewards.length}
          />
        ))}
      </div>
    </section>
  );
};

export default MonthView;
