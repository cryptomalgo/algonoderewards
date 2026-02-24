import { AlertTriangle, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import {
  getExpirationStatus,
  type NFDExpirationStatus,
} from "@/hooks/queries/useNFD";
import { cn } from "@/lib/utils";
import { SENSITIVE_MASK } from "@/constants";

interface NFDExpirationBannerProps {
  nfdName: string;
  timeExpires: string | null | undefined;
  expired: boolean | undefined;
  warningDays?: number;
  criticalDays?: number;
  hideSensitive?: boolean;
}

const statusConfig: Record<
  Exclude<NFDExpirationStatus, "ok">,
  {
    bgClass: string;
    borderClass: string;
    textClass: string;
    iconClass: string;
    getMessage: (days: number | null, name: string) => string;
  }
> = {
  warning: {
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    borderClass: "border-amber-300 dark:border-amber-700",
    textClass: "text-amber-800 dark:text-amber-200",
    iconClass: "text-amber-500 dark:text-amber-400",
    getMessage: (days, name) =>
      `Your NFD "${name}" expires in ${days} days. Renew it to keep your domain active.`,
  },
  critical: {
    bgClass: "bg-red-50 dark:bg-red-950/50",
    borderClass: "border-red-300 dark:border-red-700",
    textClass: "text-red-800 dark:text-red-200",
    iconClass: "text-red-500 dark:text-red-400",
    getMessage: (days, name) =>
      days === 1
        ? `Your NFD "${name}" expires tomorrow! Renew now to avoid losing your domain.`
        : `Your NFD "${name}" expires in ${days} days! Renew now to avoid losing your domain.`,
  },
  expired: {
    bgClass: "bg-red-100 dark:bg-red-950/70",
    borderClass: "border-red-400 dark:border-red-600",
    textClass: "text-red-900 dark:text-red-100",
    iconClass: "text-red-600 dark:text-red-400",
    getMessage: (_, name) =>
      `Your NFD "${name}" has expired! Renew immediately to reclaim your domain.`,
  },
};

export function NFDExpirationBanner({
  nfdName,
  timeExpires,
  expired,
  warningDays,
  criticalDays,
  hideSensitive = false,
}: NFDExpirationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { status, daysUntilExpiration } = getExpirationStatus(
    timeExpires,
    expired,
    warningDays,
    criticalDays,
  );

  if (status === "ok" || isDismissed) {
    return null;
  }

  const config = statusConfig[status];
  const displayName = hideSensitive ? SENSITIVE_MASK : nfdName;
  const message = config.getMessage(daysUntilExpiration, displayName);

  const renewUrl = `https://app.nf.domains/name/${encodeURIComponent(nfdName)}`;

  return (
    <div
      className={cn(
        "relative w-full border-b px-4 py-3",
        config.bgClass,
        config.borderClass,
      )}
      role="alert"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className={cn("h-5 w-5 shrink-0", config.iconClass)} />
          <p className={cn("text-sm font-medium", config.textClass)}>
            {message}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={renewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              status === "expired" || status === "critical"
                ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                : "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600",
            )}
          >
            Renew NFD
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => setIsDismissed(true)}
            className={cn(
              "rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10",
              config.textClass,
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
