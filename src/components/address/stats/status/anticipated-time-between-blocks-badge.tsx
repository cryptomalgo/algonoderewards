import { formatMinutes } from "@/lib/utils";
import { ClockFadingIcon } from "lucide-react";

export default function AnticipatedTimeBetweenBlocksBadge({
  ancitipatedTimeInMinutes,
  hidden,
}: {
  ancitipatedTimeInMinutes: number;
  hidden: boolean;
}) {
  return (
    <div className="flex">
      <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
        <ClockFadingIcon className="size-4" />
        Estimated block interval:{" "}
        {hidden ? "***" : formatMinutes(Math.round(ancitipatedTimeInMinutes))}
      </span>
    </div>
  );
}
