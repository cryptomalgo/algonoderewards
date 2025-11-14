import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes } from "@/lib/format-bytes";

interface CacheStatsProps {
  loading: boolean;
  addressCount: number;
  totalBlocks: number;
  totalSize: number;
}

export function CacheStats({
  loading,
  addressCount,
  totalBlocks,
  totalSize,
}: CacheStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-3 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">Addresses</p>
        <div className="text-xl font-semibold sm:text-2xl dark:text-gray-100">
          {loading ? (
            <Skeleton className="h-6 w-8 sm:h-8 sm:w-12" />
          ) : (
            addressCount
          )}
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-3 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">Total Blocks</p>
        <div className="text-xl font-semibold sm:text-2xl dark:text-gray-100">
          {loading ? (
            <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
          ) : (
            totalBlocks
          )}
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-3 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">Total Size</p>
        <div className="whitespace-nowrap text-xl font-semibold sm:text-2xl dark:text-gray-100">
          {loading ? (
            <Skeleton className="h-6 w-16 sm:h-8 sm:w-20" />
          ) : (
            formatBytes(totalSize)
          )}
        </div>
      </div>
    </div>
  );
}
