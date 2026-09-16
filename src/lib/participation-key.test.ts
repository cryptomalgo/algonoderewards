import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS,
  DEFAULT_PARTICIPATION_KEY_WARNING_DAYS,
  getParticipationKeyExpiration,
  selectMostUrgentParticipationKey,
  type ParticipationKeyInfo,
  type ParticipationKeyStatus,
} from "./participation-key";

const BLOCK_TIME = 3;
const SECONDS_PER_DAY = 86_400;
const ROUNDS_PER_DAY = SECONDS_PER_DAY / BLOCK_TIME;
const CURRENT_ROUND = 1_000_000n;

function accountWithRoundsRemaining(roundsRemaining: number) {
  return {
    round: CURRENT_ROUND,
    participation: {
      voteLastValid: CURRENT_ROUND + BigInt(roundsRemaining),
    },
  };
}

// At a 3 second block time one day is 28,800 rounds.
function accountExpiringInDays(days: number) {
  return accountWithRoundsRemaining(Math.round(days * ROUNDS_PER_DAY));
}

function info(
  address: string,
  status: ParticipationKeyStatus,
  daysUntilExpiration: number | null,
  secondsUntilExpiration: number | null = daysUntilExpiration === null
    ? null
    : daysUntilExpiration * SECONDS_PER_DAY,
): ParticipationKeyInfo {
  return {
    address,
    label: address,
    status,
    daysUntilExpiration,
    expiresAt: null,
    remainingRounds: 1,
    secondsUntilExpiration,
  };
}

describe("getParticipationKeyExpiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'none' when the account has no participation key", () => {
    const result = getParticipationKeyExpiration(
      { round: CURRENT_ROUND },
      BLOCK_TIME,
    );

    expect(result.status).toBe("none");
    expect(result.daysUntilExpiration).toBeNull();
    expect(result.remainingRounds).toBeNull();
  });

  it("returns 'expired' when the last valid round has already passed", () => {
    const result = getParticipationKeyExpiration(
      accountWithRoundsRemaining(-10),
      BLOCK_TIME,
    );

    expect(result.status).toBe("expired");
    expect(result.daysUntilExpiration).toBe(0);
    expect(result.remainingRounds).toBe(-10);
  });

  it("returns 'expired' when the last valid round is the current round", () => {
    const result = getParticipationKeyExpiration(
      accountWithRoundsRemaining(0),
      BLOCK_TIME,
    );

    expect(result.status).toBe("expired");
  });

  it("returns 'ok' when the key is valid well past the warning window", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(30),
      BLOCK_TIME,
    );

    expect(result.status).toBe("ok");
    expect(result.daysUntilExpiration).toBe(30);
  });

  it("returns 'warning' when the key expires inside the warning window", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(5),
      BLOCK_TIME,
    );

    expect(result.status).toBe("warning");
    expect(result.daysUntilExpiration).toBe(5);
  });

  it("treats exactly the warning threshold as a warning", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(DEFAULT_PARTICIPATION_KEY_WARNING_DAYS),
      BLOCK_TIME,
    );

    expect(result.status).toBe("warning");
    expect(result.daysUntilExpiration).toBe(
      DEFAULT_PARTICIPATION_KEY_WARNING_DAYS,
    );
  });

  it("returns 'ok' one day past the warning threshold", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(DEFAULT_PARTICIPATION_KEY_WARNING_DAYS + 1),
      BLOCK_TIME,
    );

    expect(result.status).toBe("ok");
  });

  it("returns 'critical' when the key expires inside the critical window", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS),
      BLOCK_TIME,
    );

    expect(result.status).toBe("critical");
    expect(result.daysUntilExpiration).toBe(
      DEFAULT_PARTICIPATION_KEY_CRITICAL_DAYS,
    );
  });

  it("rounds partial days up so a key with hours left is not reported as today", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(0.5),
      BLOCK_TIME,
    );

    expect(result.status).toBe("critical");
    expect(result.daysUntilExpiration).toBe(1);
  });

  it("estimates the wall clock expiration date", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(3),
      BLOCK_TIME,
    );

    expect(result.expiresAt?.toISOString()).toBe("2026-01-04T00:00:00.000Z");
  });

  it("reports the exact remaining time in seconds", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(3),
      BLOCK_TIME,
    );

    expect(result.secondsUntilExpiration).toBe(3 * SECONDS_PER_DAY);
  });

  it("reports a negative remaining time for an expired key", () => {
    const result = getParticipationKeyExpiration(
      accountWithRoundsRemaining(-10),
      BLOCK_TIME,
    );

    expect(result.secondsUntilExpiration).toBe(-10 * BLOCK_TIME);
  });

  it("has no remaining seconds when the average block time is unavailable", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(1),
      undefined,
    );

    expect(result.secondsUntilExpiration).toBeNull();
  });

  it("stays 'ok' when the average block time is unavailable", () => {
    const result = getParticipationKeyExpiration(
      accountExpiringInDays(1),
      undefined,
    );

    expect(result.status).toBe("ok");
    expect(result.daysUntilExpiration).toBeNull();
    expect(result.expiresAt).toBeNull();
  });

  it("still detects an expired key without an average block time", () => {
    const result = getParticipationKeyExpiration(
      accountWithRoundsRemaining(0),
      undefined,
    );

    expect(result.status).toBe("expired");
  });

  it("honours custom warning and critical thresholds", () => {
    const account = accountExpiringInDays(20);

    expect(getParticipationKeyExpiration(account, BLOCK_TIME).status).toBe(
      "ok",
    );
    expect(
      getParticipationKeyExpiration(account, BLOCK_TIME, 30, 7).status,
    ).toBe("warning");
  });
});

describe("selectMostUrgentParticipationKey", () => {
  it("returns null when no address needs attention", () => {
    const result = selectMostUrgentParticipationKey([
      info("a", "ok", 30),
      info("b", "none", null),
    ]);

    expect(result).toBeNull();
  });

  it("returns the soonest expiring address and counts the affected ones", () => {
    const result = selectMostUrgentParticipationKey([
      info("a", "warning", 6),
      info("b", "warning", 3),
      info("c", "ok", 40),
    ]);

    expect(result?.mostUrgent.address).toBe("b");
    expect(result?.affectedCount).toBe(2);
  });

  it("prefers an expired key over a warning", () => {
    const result = selectMostUrgentParticipationKey([
      info("a", "warning", 2),
      info("b", "expired", 0),
    ]);

    expect(result?.mostUrgent.address).toBe("b");
  });

  it("prefers a critical key over a warning even when the warning is sooner", () => {
    const result = selectMostUrgentParticipationKey([
      info("a", "warning", 1),
      info("b", "critical", 2),
    ]);

    expect(result?.mostUrgent.address).toBe("b");
  });

  it("prefers the key expiring soonest when both round up to the same day", () => {
    const laterKey = getParticipationKeyExpiration(
      accountExpiringInDays(23 / 24),
      BLOCK_TIME,
    );
    const soonerKey = getParticipationKeyExpiration(
      accountExpiringInDays(1 / 24),
      BLOCK_TIME,
    );

    // 23 hours and 1 hour both round up to a single day, so the day count
    // alone cannot tell them apart.
    expect(laterKey.daysUntilExpiration).toBe(1);
    expect(soonerKey.daysUntilExpiration).toBe(1);
    expect(laterKey.status).toBe(soonerKey.status);

    const result = selectMostUrgentParticipationKey([
      { address: "later", label: "later", ...laterKey },
      { address: "sooner", label: "sooner", ...soonerKey },
    ]);

    expect(result?.mostUrgent.address).toBe("sooner");
  });

  it("still prefers the sooner key when it appears last in the list", () => {
    const result = selectMostUrgentParticipationKey([
      info("later", "warning", 1, 23 * 3600),
      info("sooner", "warning", 1, 1 * 3600),
    ]);

    expect(result?.mostUrgent.address).toBe("sooner");
  });

  it("keeps the first address when remaining times are identical", () => {
    const result = selectMostUrgentParticipationKey([
      info("first", "warning", 3, 3 * 3600),
      info("second", "warning", 3, 3 * 3600),
    ]);

    expect(result?.mostUrgent.address).toBe("first");
  });
});
