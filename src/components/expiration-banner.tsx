import { AlertTriangle, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type ExpirationBannerStatus = "warning" | "critical" | "expired";

export interface ExpirationBannerAction {
  label: string;
  href: string;
}

interface ExpirationBannerProps {
  status: ExpirationBannerStatus;
  message: string;
  action?: ExpirationBannerAction;
}

const statusStyles: Record<
  ExpirationBannerStatus,
  {
    bgClass: string;
    borderClass: string;
    textClass: string;
    iconClass: string;
    actionClass: string;
  }
> = {
  warning: {
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    borderClass: "border-amber-300 dark:border-amber-700",
    textClass: "text-amber-800 dark:text-amber-200",
    iconClass: "text-amber-500 dark:text-amber-400",
    actionClass:
      "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600",
  },
  critical: {
    bgClass: "bg-red-50 dark:bg-red-950/50",
    borderClass: "border-red-300 dark:border-red-700",
    textClass: "text-red-800 dark:text-red-200",
    iconClass: "text-red-500 dark:text-red-400",
    actionClass:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
  },
  expired: {
    bgClass: "bg-red-100 dark:bg-red-950/70",
    borderClass: "border-red-400 dark:border-red-600",
    textClass: "text-red-900 dark:text-red-100",
    iconClass: "text-red-600 dark:text-red-400",
    actionClass:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
  },
};

/**
 * Full-width alert band meant to sit above the page content. Owns its own
 * dismiss state, so remount it with a `key` to reset the dismissal.
 */
export function ExpirationBanner({
  status,
  message,
  action,
}: ExpirationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const styles = statusStyles[status];

  return (
    <div
      className={cn(
        "relative w-full border-b px-4 py-3",
        styles.bgClass,
        styles.borderClass,
      )}
      role="alert"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3 sm:items-center">
          <AlertTriangle
            className={cn("mt-0.5 h-5 w-5 shrink-0 sm:mt-0", styles.iconClass)}
          />
          <p className={cn("text-sm font-medium", styles.textClass)}>
            {message}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          {action && (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                styles.actionClass,
              )}
            >
              {action.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className={cn(
              "rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10",
              styles.textClass,
            )}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
