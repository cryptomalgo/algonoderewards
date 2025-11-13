import { Account } from "algosdk/client/indexer";
import { CloverIcon } from "lucide-react";
import { AnxietyBox } from "./anxiety-box";
import { BLOCK_ANXIETY_BLOG_POST_URL } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

export function AnxietyCardSkeleton() {
  return (
    <div className="text-md flex w-fit min-w-40 flex-col gap-x-1.5 rounded-md px-3 py-2 font-medium ring-1 ring-gray-200 ring-inset dark:ring-gray-800">
      <div className="flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </span>
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export function AnxietyCard({ account }: { account: Account }) {
  return (
    <div className="text-md flex w-fit min-w-40 flex-col gap-x-1.5 rounded-md px-3 py-2 font-medium text-gray-900 ring-1 ring-gray-200 ring-inset dark:text-white dark:ring-gray-800">
      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-left">
            <CloverIcon className="size-4" />
            No block probability
          </span>

          <a
            href={BLOCK_ANXIETY_BLOG_POST_URL}
            target="_blank"
            className="text-xs text-blue-500 hover:underline dark:text-blue-400"
          >
            Learn more
          </a>
        </div>
        <AnxietyBox account={account} />
      </div>
    </div>
  );
}
