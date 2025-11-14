import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { useRefreshBlocks } from "@/hooks/useBlocksQuery";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshBlocks } = useRefreshBlocks();

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

  return (
    <button
      onClick={handleRefresh}
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
  );
}
