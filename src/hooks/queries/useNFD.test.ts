import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExpirationStatus } from "./useNFD";

describe("getExpirationStatus", () => {
  beforeEach(() => {
    // Mock current date to Dec 31, 2025
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-31T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'expired' when the expired flag is true", () => {
    const result = getExpirationStatus("2026-03-03T21:39:44Z", true);
    expect(result.status).toBe("expired");
    expect(result.daysUntilExpiration).toBeNull();
  });

  it("returns 'ok' when timeExpires is null", () => {
    const result = getExpirationStatus(null, false);
    expect(result.status).toBe("ok");
    expect(result.daysUntilExpiration).toBeNull();
  });

  it("returns 'expired' when expiration date is in the past", () => {
    const result = getExpirationStatus("2025-12-30T12:00:00Z", false);
    expect(result.status).toBe("expired");
    expect(result.daysUntilExpiration).toBe(0);
  });

  it("returns 'critical' when within critical days threshold", () => {
    // 5 days from now
    const result = getExpirationStatus("2026-01-05T12:00:00Z", false, 30, 7);
    expect(result.status).toBe("critical");
    expect(result.daysUntilExpiration).toBe(5);
  });

  it("returns 'warning' when within warning days but outside critical days", () => {
    // March 3, 2026 is ~62 days from Dec 31, 2025
    const result = getExpirationStatus("2026-03-03T21:39:44Z", false, 90, 7);
    expect(result.status).toBe("warning");
    expect(result.daysUntilExpiration).toBe(63); // ceil of ~62.4 days
  });

  it("returns 'ok' when outside warning days threshold", () => {
    // March 3, 2026 is ~62 days from Dec 31, 2025
    const result = getExpirationStatus("2026-03-03T21:39:44Z", false, 30, 7);
    expect(result.status).toBe("ok");
    expect(result.daysUntilExpiration).toBe(63);
  });

  it("uses default thresholds (60 warning, 15 critical) when not specified", () => {
    // Jan 20, 2026 is 20 days from Dec 31, 2025
    // With default warningDays=60 and criticalDays=15, this should be 'warning'
    const result = getExpirationStatus("2026-01-20T12:00:00Z", false);
    expect(result.status).toBe("warning");
    expect(result.daysUntilExpiration).toBe(20);
  });

  it("returns 'critical' for tomorrow", () => {
    const result = getExpirationStatus("2026-01-01T12:00:00Z", false, 30, 7);
    expect(result.status).toBe("critical");
    expect(result.daysUntilExpiration).toBe(1);
  });
});
