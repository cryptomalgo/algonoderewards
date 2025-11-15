import { Label } from "@/components/ui/label";
import { CustomToggle } from "@/components/ui/custom-toggle";

interface CacheToggleProps {
  isCacheEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function CacheToggle({ isCacheEnabled, onToggle }: CacheToggleProps) {
  const handleToggle = () => {
    onToggle(!isCacheEnabled);
  };

  return (
    <div
      onClick={handleToggle}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 sm:gap-4 sm:p-4 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
    >
      <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
        <Label className="cursor-pointer text-xs font-medium sm:text-sm dark:text-gray-100">
          Enable Caching
        </Label>
        <p className="text-[10px] leading-tight text-gray-500 sm:text-xs sm:leading-normal dark:text-gray-400">
          {isCacheEnabled
            ? "Caching is enabled. Blocks are stored locally for faster access."
            : "Caching is disabled. Data is fetched directly from the API."}
        </p>
      </div>
      <CustomToggle
        checked={isCacheEnabled}
        onCheckedChange={(checked) => onToggle(checked)}
        name="cache-enabled"
        ariaLabel="Toggle cache"
      />
    </div>
  );
}
