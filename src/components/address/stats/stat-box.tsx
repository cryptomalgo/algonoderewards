import { ErrorBoundary } from "react-error-boundary";
import { AlertCircleIcon } from "lucide-react";
import Spinner from "@/components/spinner.tsx";
import { useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export default function StatBox({
  title,
  content,
  loading,
}: {
  title: string;
  content: React.ReactNode;
  loading: boolean;
}) {
  const search = useSearch({ from: "/$addresses" });
  const statsPanelTheme = search.statsPanelTheme;
  return (
    <div
      className={cn(
        statsPanelTheme === "indigo"
          ? "bg-indigo-500 text-slate-300"
          : "bg-slate-50 text-black",
        "rounded-sm px-3 py-2 sm:px-4 sm:py-3 md:py-4 lg:py-5 dark:bg-black/10",
      )}
    >
      <p className="text-sm/6 font-medium dark:text-slate-400">{title}</p>
      <div className="mt-1 flex items-baseline gap-x-2">
        <span
          className={cn(
            statsPanelTheme === "indigo" ? "text-white" : "text-indigo-500",
            "text-md font-semibold tracking-tight sm:text-lg md:text-xl lg:text-2xl dark:text-white/95",
          )}
        >
          <ErrorBoundary
            fallback={
              <div className="flex items-center text-sm text-red-300">
                <AlertCircleIcon className="mr-1 h-4 w-4" />
                Error loading stat
              </div>
            }
          >
            {loading ? <Spinner /> : content}
          </ErrorBoundary>
        </span>
      </div>
    </div>
  );
}
