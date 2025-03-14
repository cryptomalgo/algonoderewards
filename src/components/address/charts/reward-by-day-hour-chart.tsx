import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Block } from "algosdk/client/indexer";
import { useTheme } from "@/components/theme-provider";

const formatHourRange = (hour: number) => {
  // Format start time
  const startHour = hour % 12 || 12; // Convert 0 to 12 for 12AM
  const startAmPm = hour < 12 ? "AM" : "PM";

  // Format end time (next hour)
  const endHour = (hour + 1) % 12 || 12;
  const endAmPm = hour + 1 < 12 || hour + 1 === 24 ? "AM" : "PM";

  return `from ${startHour}${startAmPm} to ${endHour}${endAmPm}`;
};

interface RewardByDayHourChartProps {
  blocks: Block[];
}

type DayHourData = {
  x: number; // hour (0-23)
  y: number; // day (0-6, 0 is Monday)
  z: number; // count of blocks
  day: string; // day name
};

// Days starting with Monday
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function RewardByDayHourChart({
  blocks,
}: RewardByDayHourChartProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const dayHourData = useMemo(() => {
    if (!blocks?.length) return [];

    // Initialize data structure for all day/hour combinations
    const dayHourMap: Record<string, DayHourData> = {};

    // Create entries for all possible day/hour combinations
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        dayHourMap[key] = {
          x: hour,
          y: day,
          z: 0,
          day: DAYS[day],
        };
      }
    }

    // Count blocks for each day/hour combination
    blocks.forEach((block) => {
      // Use local time, not UTC
      const date = new Date(block.timestamp * 1000);
      // Convert Sunday=0 to Monday=0 format
      let day = date.getDay() - 1; // Adjust to make Monday=0
      if (day === -1) day = 6; // Sunday becomes 6

      const hour = date.getHours(); // 0-23

      const key = `${day}-${hour}`;
      if (dayHourMap[key]) {
        dayHourMap[key].z += 1;
      }
    });

    // Convert map to array, filtering out entries with no blocks
    return Object.values(dayHourMap).filter((entry) => entry.z > 0);
  }, [blocks]);

  if (!blocks?.length) {
    return (
      <div className="flex h-80 w-full items-center justify-center text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...dayHourData.map((d) => d.z));

  // Get bubble color based on count and theme
  const getBubbleColor = (count: number) => {
    const ratio = count / maxCount;

    // Light mode colors
    const lightModeStart = { r: 240, g: 240, b: 255 }; // Faded indigo (almost white)
    const lightModeEnd = { r: 79, g: 70, b: 229 }; // Dark indigo

    // Dark mode colors - deeper blue that looks good in dark mode
    const darkModeStart = { r: 30, g: 41, b: 59 }; // Faded indigo dark
    const darkModeEnd = { r: 97, g: 95, b: 255 }; // Bright indigo

    const start = isDarkMode ? darkModeStart : lightModeStart;
    const end = isDarkMode ? darkModeEnd : lightModeEnd;

    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="-mx-6 mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:mx-0 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Block Distribution by Day and Hour
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 20,
              right: 30,
              bottom: 20,
              left: 20,
            }}
          >
            <XAxis
              type="number"
              dataKey="x"
              name="Hour"
              domain={[0, 23]}
              tickCount={24}
              tick={{ fill: "currentColor" }}
              stroke="currentColor"
              tickFormatter={(hour) => `${hour}h`}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Day"
              domain={[0, 6]}
              tickCount={7}
              tick={{ fill: "currentColor" }}
              stroke="currentColor"
              tickFormatter={(day) => DAYS[day].slice(0, 3)}
              reversed={true} // Reverse the Y-axis to put Monday (0) at the top
              padding={{ top: 10, bottom: 10 }}
            />
            <ZAxis type="number" dataKey="z" range={[1, 300]} name="Count" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={(props) => {
                const { active, payload } = props;

                if (active && payload && payload.length) {
                  const data = payload[0] && payload[0].payload;

                  return (
                    <div
                      className={
                        "bg-tooltip text-tooltip-foreground m-0 max-w-52 rounded-lg p-3"
                      }
                    >
                      <p>
                        {data.z} blocks proposed on {DAYS[data.y]}s{" "}
                        {formatHourRange(data.x)}{" "}
                      </p>
                    </div>
                  );
                }

                return null;
              }}
            />
            <Scatter name="Blocks" data={dayHourData}>
              {dayHourData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBubbleColor(entry.z)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
        Bubble size and color intensity represent the number of blocks proposed
      </p>
    </div>
  );
}
