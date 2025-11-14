import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAllCachedAddresses, clearAllCache } from "@/lib/block-storage";
import { DatabaseIcon } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { CacheToggle } from "./cache-management/cache-toggle";
import { CacheStats } from "./cache-management/cache-stats";
import { CacheList } from "./cache-management/cache-list";

export function CacheManagementDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate({ from: "/$addresses" });
  const search = useSearch({ from: "/$addresses" });
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const isCacheEnabled = search.enableCache ?? false;

  const { data: caches = [], isLoading: loading } = useQuery({
    queryKey: ["cache-addresses"],
    queryFn: async () => {
      const addresses = await getAllCachedAddresses();
      // Sort by size in bytes, largest first
      return addresses.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
    },
    enabled: open,
    staleTime: 0,
    gcTime: 0,
  });

  const refreshCacheData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cache-addresses"] });
    await queryClient.invalidateQueries({ queryKey: ["cache-size"] });
  };

  const handleToggleCache = async (enabled: boolean) => {
    // If disabling cache, clear all cached data first
    if (!enabled) {
      try {
        await clearAllCache();
        toast.success("All caches cleared");

        // Invalidate both cache queries to update UI
        await refreshCacheData();
      } catch (error) {
        console.error("Failed to clear caches:", error);
        toast.error("Failed to clear caches");
        return; // Don't update URL if clearing failed
      }
    }

    navigate({
      search: (prev) => ({
        ...prev,
        enableCache: enabled,
      }),
      replace: true,
    });
  };

  const totalSize = caches.reduce((sum, cache) => sum + cache.sizeInBytes, 0);
  const totalBlocks = caches.reduce((sum, cache) => sum + cache.blockCount, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-lg flex-col p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <ErrorBoundary>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-gray-100">
              <DatabaseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Cache Management
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm dark:text-gray-400">
              Manage locally cached block data to improve loading performance.{" "}
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Learn about IndexedDB
              </a>
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-4 overflow-y-auto sm:space-y-6">
            <ErrorBoundary>
              <CacheToggle
                isCacheEnabled={isCacheEnabled}
                onToggle={handleToggleCache}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <CacheStats
                loading={loading}
                addressCount={caches.length}
                totalBlocks={totalBlocks}
                totalSize={totalSize}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <CacheList
                loading={loading}
                caches={caches}
                onCacheCleared={refreshCacheData}
              />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
