import { cn } from "@/lib/utils";

export type DotBadgeColor =
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

interface DotBadgeProps {
  label: string;
  color: DotBadgeColor;
  className?: string;
}

const colorClasses: Record<DotBadgeColor, string> = {
  red: "fill-red-500 dark:fill-red-400",
  yellow: "fill-yellow-500 dark:fill-yellow-400",
  green: "fill-green-500 dark:fill-green-400",
  blue: "fill-blue-500 dark:fill-blue-400",
  indigo: "fill-indigo-500 dark:fill-indigo-400",
  purple: "fill-purple-500 dark:fill-purple-400",
  pink: "fill-pink-500 dark:fill-pink-400",
};

export function DotBadge({ label, color, className }: DotBadgeProps) {
  return (
    <span
      className={cn(
        "text-no-wrap inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800",
        className,
      )}
    >
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`size-1.5 ${colorClasses[color]}`}
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
      {label}
    </span>
  );
}
