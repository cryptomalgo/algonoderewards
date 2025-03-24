import { ErrorBoundary } from "react-error-boundary";
import { AlertCircleIcon } from "lucide-react";
import Spinner from "@/components/spinner.tsx";

export default function StatBox({
  title,
  content,
  loading,
}: {
  title: string;
  content: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-sm bg-indigo-500 px-3 py-2 sm:px-4 sm:py-3 md:py-4 lg:py-5 dark:bg-black/10">
      <p className="text-sm/6 font-medium text-slate-300 dark:text-slate-400">
        {title}
      </p>
      <div className="mt-1 flex items-baseline gap-x-2">
        <span className="text-md font-semibold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl dark:text-white/95">
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
