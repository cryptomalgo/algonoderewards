import { ExpirationBanner } from "@/components/expiration-banner";
import {
  getExpirationStatus,
  type NFDExpirationStatus,
} from "@/hooks/queries/useNFD";

interface NFDExpirationBannerProps {
  nfdName: string;
  timeExpires: string | null | undefined;
  expired: boolean | undefined;
  warningDays?: number;
  criticalDays?: number;
}

const messageBuilders: Record<
  Exclude<NFDExpirationStatus, "ok">,
  (days: number | null, name: string) => string
> = {
  warning: (days, name) =>
    `Your NFD "${name}" expires in ${days} days. Renew it to keep your domain active.`,
  critical: (days, name) =>
    days === 1
      ? `Your NFD "${name}" expires tomorrow! Renew now to avoid losing your domain.`
      : `Your NFD "${name}" expires in ${days} days! Renew now to avoid losing your domain.`,
  expired: (_, name) =>
    `Your NFD "${name}" has expired! Renew immediately to reclaim your domain.`,
};

export function NFDExpirationBanner({
  nfdName,
  timeExpires,
  expired,
  warningDays,
  criticalDays,
}: NFDExpirationBannerProps) {
  const { status, daysUntilExpiration } = getExpirationStatus(
    timeExpires,
    expired,
    warningDays,
    criticalDays,
  );

  if (status === "ok") {
    return null;
  }

  const renewUrl = `https://app.nf.domains/name/${encodeURIComponent(nfdName)}`;

  return (
    <ExpirationBanner
      status={status}
      message={messageBuilders[status](daysUntilExpiration, nfdName)}
      action={{ label: "Renew NFD", href: renewUrl }}
    />
  );
}
