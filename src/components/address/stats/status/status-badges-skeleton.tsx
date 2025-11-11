import { Skeleton } from "@/components/ui/skeleton";

export function StatusBadgesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-6 w-28 rounded-md" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="h-6 w-40 rounded-md" />
      </div>
    </div>
  );
}
