import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { displayAlgoAddress } from "@/lib/utils";
import { formatBytes } from "@/lib/format-bytes";
import { useNFDReverseMultiple } from "@/hooks/queries/useNFD";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { clearCacheForAddress, clearAllCache } from "@/lib/block-storage";

interface CachedAddressInfo {
  address: string;
  blockCount: number;
  lastUpdated: number;
  sizeInBytes: number;
  nfdName?: string;
}

interface CacheListProps {
  loading: boolean;
  caches: CachedAddressInfo[];
  onCacheCleared: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function CacheList({ loading, caches, onCacheCleared }: CacheListProps) {
  const [clearing, setClearing] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use the new hook to fetch NFD names for all cached addresses
  const addresses = caches.map((cache) => cache.address);
  const { data: nfdMap = {}, isLoading: loadingNFDs } =
    useNFDReverseMultiple(addresses);

  const handleClearAddress = async (address: string) => {
    try {
      setClearing(address);
      await clearCacheForAddress(address);
      toast.success("Cleared cache for " + displayAlgoAddress(address));
      await queryClient.invalidateQueries({ queryKey: ["cache-size"] });
      await queryClient.invalidateQueries({ queryKey: ["cache-addresses"] });
      onCacheCleared();
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.error("Failed to clear cache");
    } finally {
      setClearing(null);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearing("all");
      await clearAllCache();
      toast.success("Cleared all caches");
      await queryClient.invalidateQueries({ queryKey: ["cache-size"] });
      await queryClient.invalidateQueries({ queryKey: ["cache-addresses"] });
      onCacheCleared();
    } catch (error) {
      console.error("Failed to clear all caches:", error);
      toast.error("Failed to clear all caches");
    } finally {
      setClearing(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium sm:text-sm dark:text-gray-100">
          Cached Addresses
        </Label>
        {caches.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAll}
            disabled={clearing === "all"}
            className="shrink-0"
          >
            <Trash2Icon className="mr-1 h-3 w-3 sm:mr-2" />
            <span className="text-xs sm:text-sm">Clear All</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full sm:h-20" />
          ))}
        </div>
      ) : caches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center sm:p-8 dark:border-gray-700">
          <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            No cached data found
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {caches.map((cache) => (
            <div
              key={cache.address}
              className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white p-2 sm:items-center sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="truncate font-mono text-xs font-medium sm:text-sm dark:text-gray-100">
                  {loadingNFDs ? (
                    <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                  ) : nfdMap[cache.address] ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {nfdMap[cache.address]}.algo
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            ({displayAlgoAddress(cache.address, 4)})
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] font-mono text-xs break-all">
                          {cache.address}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {displayAlgoAddress(cache.address, 6)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] font-mono text-xs break-all">
                          {cache.address}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-gray-500 sm:gap-x-4 sm:text-xs dark:text-gray-400">
                  <span className="whitespace-nowrap">
                    {cache.blockCount} blocks
                  </span>
                  <span className="whitespace-nowrap">
                    {formatBytes(cache.sizeInBytes)}
                  </span>
                  <span className="whitespace-nowrap">
                    Updated {formatDate(cache.lastUpdated)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearAddress(cache.address)}
                disabled={clearing === cache.address}
                className="h-8 w-8 shrink-0 p-0 hover:bg-red-50 hover:text-red-600 sm:h-9 sm:w-9 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              >
                <Trash2Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
