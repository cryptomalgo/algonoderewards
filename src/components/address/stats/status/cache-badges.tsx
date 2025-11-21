import { useSearch } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllCachedAddresses } from "@/lib/block-storage";
import { DotBadge } from "@/components/dot-badge";
import { formatBytes } from "@/lib/format-bytes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";

interface CacheBadgesProps {
  onClick?: () => void;
}

interface CachedAddressInfo {
  address: string;
  blockCount: number;
  lastUpdated: number;
  sizeInBytes: number;
}

export function CacheBadges({ onClick }: CacheBadgesProps) {
  const search = useSearch({ from: "/$addresses" });
  const isCacheEnabled = search.enableCache ?? false;
  const isBalanceHidden = search.hideBalance;

  const { data: totalSize = 0 } = useQuery({
    queryKey: ["cache-size"],
    queryFn: async () => {
      const caches = await getAllCachedAddresses();
      const total = caches.reduce(
        (sum: number, cache: CachedAddressInfo) => sum + cache.sizeInBytes,
        0,
      );
      return total;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchInterval: 5000, // Refetch every 5 seconds to ensure it stays in sync
  });

  return (
    <>
      {/* Cache Status Badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
            <DotBadge
              className="text-md"
              color={isCacheEnabled ? "green" : "red"}
              label={`Cache ${isCacheEnabled ? "enabled" : "disabled"}`}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {isCacheEnabled
            ? "Caching is enabled. Blocks are saved locally, only newer ones are fetched."
            : "Caching is disabled. You can speed up future loads by enabling it."}
        </TooltipContent>
      </Tooltip>

      {/* Cache Size Badge */}
      {totalSize > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
              <span className="text-md inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
                <Database className="size-3" />
                {isBalanceHidden ? "*****" : formatBytes(totalSize)}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Total size of cached block data. Only newer blocks are fetched from
            the network.
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
