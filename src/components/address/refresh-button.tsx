import { useState } from "react";
import { RefreshCwIcon, DatabaseZapIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLongPress } from "@/hooks/useLongPress";
import { useRefreshBlocks } from "@/hooks/useBlocksQuery";
import { toast } from "sonner";
import { clearAllCache } from "@/lib/block-storage";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { refreshBlocks, hardRefreshBlocks } = useRefreshBlocks();

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshBlocks();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleHardRefresh = async () => {
    try {
      setIsRefreshing(true);
      await clearAllCache();
      await hardRefreshBlocks();
      toast.success("Cache cleared and data refreshed");
    } catch (error) {
      console.error("Error during hard refresh:", error);
      toast.error("Failed to clear cache and refresh");
    } finally {
      setIsRefreshing(false);
      setIsDropdownOpen(false);
    }
  };

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      setIsDropdownOpen(true);
    },
    onClick: handleRefresh,
    delay: 500,
  });

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          {...longPressHandlers}
          disabled={isRefreshing}
          className={cn(
            "rounded-md p-2 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800",
            isRefreshing && "cursor-not-allowed",
          )}
          aria-label="Refresh data"
        >
          <RefreshCwIcon
            className={cn(
              "h-5 w-5 transition-transform",
              isRefreshing && "animate-spin",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:border-gray-700 dark:bg-gray-800"
      >
        <DropdownMenuItem
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="cursor-pointer"
        >
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Refresh
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleHardRefresh}
          disabled={isRefreshing}
          className="cursor-pointer"
        >
          <DatabaseZapIcon className="mr-2 h-4 w-4" />
          Empty cache and hard reload
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
