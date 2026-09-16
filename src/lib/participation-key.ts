export type ParticipationKeyStatus =
  | "none"
  | "ok"
  | "warning"
  | "critical"
  | "expired";

export type ActiveParticipationKeyStatus = Exclude<
  ParticipationKeyStatus,
  "none" | "ok"
>;

// Minimal account shape needed to evaluate a participation key. Matches the
// relevant fields of the indexer `Account` model.
export type ParticipationAccount = {
  round: number | bigint;
  participation?: { voteLastValid: number | bigint } | null;
};

export type ParticipationKeyExpiration = {
  status: ParticipationKeyStatus;
  /** Whole days left before the key stops being valid, or null if unknown. */
  daysUntilExpiration: number | null;
  /** Estimated wall-clock expiration time, or null if it cannot be computed. */
  expiresAt: Date | null;
  /** Rounds left before the key stops being valid, or null when not online. */
  remainingRounds: number | null;
  /**
   * Seconds left before the key stops being valid, negative once it has passed,
   * or null when it cannot be derived. Orders keys that land inside the same
   * rounded day.
   */
  secondsUntilExpiration: number | null;
};

export type ParticipationKeyInfo = ParticipationKeyExpiration & {
  address: string;
  label: string;
};

export type ActiveParticipationKeyInfo = ParticipationKeyInfo & {
  status: ActiveParticipationKeyStatus;
};

export const DEFAULT_PARTICIPATION_KEY_WARNING_DAYS = 7;
export const DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS = 2;

const SECONDS_PER_DAY = 86_400;

/**
 * Estimates how long a registered participation key stays valid and flags it
 * once it gets close to expiring. Without an average block time only an already
 * expired key can be detected, since the remaining time cannot be derived.
 */
export function getParticipationKeyExpiration(
  account: ParticipationAccount,
  averageBlockTime: number | null | undefined,
  warningDays = DEFAULT_PARTICIPATION_KEY_WARNING_DAYS,
  criticalDays = DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS,
): ParticipationKeyExpiration {
  const { participation } = account;

  if (!participation) {
    return {
      status: "none",
      daysUntilExpiration: null,
      expiresAt: null,
      remainingRounds: null,
      secondsUntilExpiration: null,
    };
  }

  const remainingRounds =
    Number(participation.voteLastValid) - Number(account.round);
  const blockTime =
    averageBlockTime && averageBlockTime > 0 ? averageBlockTime : null;

  if (remainingRounds <= 0) {
    return {
      status: "expired",
      daysUntilExpiration: 0,
      expiresAt: null,
      remainingRounds,
      secondsUntilExpiration: blockTime ? remainingRounds * blockTime : null,
    };
  }

  if (!blockTime) {
    return {
      status: "ok",
      daysUntilExpiration: null,
      expiresAt: null,
      remainingRounds,
      secondsUntilExpiration: null,
    };
  }

  const secondsUntilExpiration = remainingRounds * blockTime;
  const daysUntilExpiration = Math.ceil(
    secondsUntilExpiration / SECONDS_PER_DAY,
  );
  const expiresAt = new Date(Date.now() + secondsUntilExpiration * 1000);

  if (daysUntilExpiration <= criticalDays) {
    return {
      status: "critical",
      daysUntilExpiration,
      expiresAt,
      remainingRounds,
      secondsUntilExpiration,
    };
  }

  if (daysUntilExpiration <= warningDays) {
    return {
      status: "warning",
      daysUntilExpiration,
      expiresAt,
      remainingRounds,
      secondsUntilExpiration,
    };
  }

  return {
    status: "ok",
    daysUntilExpiration,
    expiresAt,
    remainingRounds,
    secondsUntilExpiration,
  };
}

const STATUS_URGENCY: Record<ActiveParticipationKeyStatus, number> = {
  expired: 0,
  critical: 1,
  warning: 2,
};

export function isActiveParticipationKeyStatus(
  status: ParticipationKeyStatus,
): status is ActiveParticipationKeyStatus {
  return status === "expired" || status === "critical" || status === "warning";
}

/**
 * Picks the key that needs attention first, so a single banner can speak for
 * every tracked address.
 */
export function selectMostUrgentParticipationKey(
  infos: ParticipationKeyInfo[],
): { mostUrgent: ActiveParticipationKeyInfo; affectedCount: number } | null {
  const affected = infos.filter((info): info is ActiveParticipationKeyInfo =>
    isActiveParticipationKeyStatus(info.status),
  );

  if (affected.length === 0) {
    return null;
  }

  const mostUrgent = affected.reduce((worst, current) => {
    const urgencyDiff =
      STATUS_URGENCY[current.status] - STATUS_URGENCY[worst.status];

    if (urgencyDiff !== 0) {
      return urgencyDiff < 0 ? current : worst;
    }

    // Compare exact remaining time: the rounded day count ties for any two keys
    // expiring within the same 24 hours, which would name the wrong address.
    const currentSeconds =
      current.secondsUntilExpiration ?? Number.POSITIVE_INFINITY;
    const worstSeconds =
      worst.secondsUntilExpiration ?? Number.POSITIVE_INFINITY;

    if (currentSeconds !== worstSeconds) {
      return currentSeconds < worstSeconds ? current : worst;
    }

    return worst;
  });

  return { mostUrgent, affectedCount: affected.length };
}
