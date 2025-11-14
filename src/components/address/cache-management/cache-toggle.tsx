import { Label } from "@/components/ui/label";
import { CustomToggle } from "@/components/ui/custom-toggle";

interface CacheToggleProps {
  isCacheDisabled: boolean;
  onToggle: (disabled: boolean) => void;
}

export function CacheToggle({ isCacheDisabled, onToggle }: CacheToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:gap-4 sm:p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
        <Label className="text-xs font-medium sm:text-sm dark:text-gray-100">
          Enable Caching
        </Label>
        <p className="text-[10px] leading-tight text-gray-500 sm:text-xs sm:leading-normal dark:text-gray-400">
          {isCacheDisabled
            ? "Caching is disabled. Data is fetched directly from the API."
            : "Caching is enabled. Blocks are stored locally for faster access."}
        </p>
      </div>
      <CustomToggle
        checked={!isCacheDisabled}
        onCheckedChange={(checked) => onToggle(!checked)}
        name="cache-enabled"
        ariaLabel="Toggle cache"
      />
    </div>
  );
}
