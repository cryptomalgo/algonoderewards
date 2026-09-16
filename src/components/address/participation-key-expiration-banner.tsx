import { format } from "date-fns";
import { ExpirationBanner } from "@/components/expiration-banner";
import type { ResolvedAddress } from "@/components/heatmap/types";
import { PARTICIPATION_KEY_MANAGEMENT_DOCS_URL } from "@/constants";
import { useAccounts } from "@/hooks/queries/useAccounts";
import { useAverageBlockTime } from "@/hooks/queries/useAverageBlockTime";
import {
  DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS,
  DEFAULT_PARTICIPATION_KEY_WARNING_DAYS,
  getParticipationKeyExpiration,
  selectMostUrgentParticipationKey,
  type ActiveParticipationKeyInfo,
  type ParticipationKeyInfo,
} from "@/lib/participation-key";
import { displayAlgoAddress } from "@/lib/utils";

interface ParticipationKeyExpirationBannerProps {
  resolvedAddresses: ResolvedAddress[];
  warningDays?: number;
  criticalDays?: number;
}

function formatTimeRemaining(days: number, expiresAt: Date | null): string {
  const approximateDate = expiresAt
    ? ` (around ${format(expiresAt, "PP")})`
    : "";

  if (days === 1) {
    return `within a day${approximateDate}`;
  }

  return `in ${days} days${approximateDate}`;
}

function buildMessage(
  info: ActiveParticipationKeyInfo,
  affectedCount: number,
): string {
  const otherAddresses = affectedCount - 1;
  const alsoAffected =
    otherAddresses > 0
      ? ` ${otherAddresses} other address${otherAddresses === 1 ? "" : "es"} also need${otherAddresses === 1 ? "s" : ""} attention.`
      : "";

  if (info.status === "expired") {
    return `Participation key for ${info.label} has expired. Register a new key to resume proposing blocks.${alsoAffected}`;
  }

  const timeRemaining = formatTimeRemaining(
    info.daysUntilExpiration ?? 0,
    info.expiresAt,
  );

  if (info.status === "critical") {
    return `Participation key for ${info.label} expires ${timeRemaining}! Register a new key now to keep proposing blocks.${alsoAffected}`;
  }

  return `Participation key for ${info.label} expires ${timeRemaining}. Register a new key to keep proposing blocks.${alsoAffected}`;
}

export function ParticipationKeyExpirationBanner({
  resolvedAddresses,
  warningDays = DEFAULT_PARTICIPATION_KEY_WARNING_DAYS,
  criticalDays = DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS,
}: ParticipationKeyExpirationBannerProps) {
  const { data: accounts, pending: accountsPending } =
    useAccounts(resolvedAddresses);
  const { data: averageBlockTime, isPending: averageBlockTimePending } =
    useAverageBlockTime();

  if (accountsPending || averageBlockTimePending) {
    return null;
  }

  const infos = resolvedAddresses.flatMap<ParticipationKeyInfo>(
    (resolvedAddress, index) => {
      const account = accounts?.[index];

      if (!account) {
        return [];
      }

      return [
        {
          address: resolvedAddress.address,
          label:
            resolvedAddress.nfd ?? displayAlgoAddress(resolvedAddress.address),
          ...getParticipationKeyExpiration(
            account,
            averageBlockTime,
            warningDays,
            criticalDays,
          ),
        },
      ];
    },
  );

  const urgent = selectMostUrgentParticipationKey(infos);

  if (!urgent) {
    return null;
  }

  return (
    <ExpirationBanner
      key={urgent.mostUrgent.address}
      status={urgent.mostUrgent.status}
      message={buildMessage(urgent.mostUrgent, urgent.affectedCount)}
      action={{
        label: "How to register",
        href: PARTICIPATION_KEY_MANAGEMENT_DOCS_URL,
      }}
    />
  );
}
