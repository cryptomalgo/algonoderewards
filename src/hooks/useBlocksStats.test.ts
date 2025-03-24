// src/hooks/useBlocksStats.test.ts
import { useBlocksStats } from "./useBlocksStats";
import { expect, test, describe, beforeEach, afterEach } from "vitest";
import MockDate from "mockdate";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { setGMTTimezone, setUTCTimezone } from "../lib/mockTimezone.ts";

// Utility function to create mock blocks
const createMockBlock = (timestamp: number, proposerPayout: number) => ({
  timestamp,
  proposerPayout,
});

describe("useBlocksStats", () => {
  // Mock the current date to ensure consistent test results
  const FIXED_DATE = "2025-03-01T12:00:00Z";

  beforeEach(() => {
    MockDate.set(FIXED_DATE);
    setUTCTimezone();
  });

  afterEach(() => {
    MockDate.reset();
    setUTCTimezone();
    vi.clearAllMocks();
  });

  describe("Timezone test", () => {
    test("should set timezone to UTC", () => {
      setGMTTimezone("GMT+2");
      expect(new Date().getTimezoneOffset()).toBe(-120);

      setGMTTimezone("GMT-2");
      expect(new Date().getTimezoneOffset()).toBe(120);

      setGMTTimezone("GMT-0");
      expect(new Date().getTimezoneOffset()).toBe(-0);
    });
  });

  describe("Basic statistics", () => {
    test("should calculate total rewards correctly", () => {
      const mockBlocks = [
        createMockBlock(new Date("2025-02-01").getTime() / 1000, 1000),
        createMockBlock(new Date("2025-02-02").getTime() / 1000, 2000),
        createMockBlock(new Date("2025-02-03").getTime() / 1000, 3000),
      ];

      const { result } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result.current.totalRewards).toBe(6000);
    });

    test("should count total blocks correctly", () => {
      const mockBlocks = [
        createMockBlock(new Date("2025-02-01").getTime() / 1000, 1000),
        createMockBlock(new Date("2025-02-02").getTime() / 1000, 2000),
        createMockBlock(new Date("2025-02-03").getTime() / 1000, 3000),
      ];

      const { result } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result.current.totalNbOfBlocksWithRewards).toBe(3);
    });

    test("should handle empty blocks array", () => {
      const { result } = renderHook(() => useBlocksStats([]));

      expect(result.current.totalRewards).toBe(0);
      expect(result.current.totalNbOfBlocksWithRewards).toBe(0);
      expect(result.current.maxBlocksInDay).toBe(0);
      expect(result.current.maxBlocksDay).toBe("N/A");
      expect(result.current.maxBlocksRewards).toBe(0);
      expect(result.current.allTimeAvgRewardsPerDay).toBe(0);
      expect(result.current.allTimeAvgBlocksPerDay).toBe(0);
    });
  });

  describe("Min/Max rewards", () => {
    test("should find maximum reward transaction", () => {
      const mockBlocks = [
        createMockBlock(new Date("2025-02-01T00:00:00").getTime() / 1000, 1000),
        createMockBlock(new Date("2025-02-02T00:00:00").getTime() / 1000, 5000),
        createMockBlock(new Date("2025-02-03T00:00:00").getTime() / 1000, 3000),
      ];

      setGMTTimezone("GMT-0");
      const { result } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result.current.maxReward).toBe(5000);
      expect(result.current.maxRewardDate).toBe("2/2/2025, 12:00:00 AM");

      setGMTTimezone("GMT-5");
      const { result: result2 } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result2.current.maxReward).toBe(5000);
      expect(result2.current.maxRewardDate).toBe("2/1/2025, 7:00:00 PM");

      setGMTTimezone("GMT+5");
      const { result: result3 } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result3.current.maxReward).toBe(5000);
      expect(result3.current.maxRewardDate).toBe("2/2/2025, 5:00:00 AM");
    });

    test("should find minimum reward transaction", () => {
      const mockBlocks = [
        createMockBlock(new Date("2025-02-01T00:00:00").getTime() / 1000, 1000),
        createMockBlock(new Date("2025-02-02T00:00:00").getTime() / 1000, 5000),
        createMockBlock(new Date("2025-02-03T00:00:00").getTime() / 1000, 3000),
      ];

      setGMTTimezone("GMT-0");
      const { result } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result.current.minReward).toBe(1000);
      expect(result.current.minRewardDate).toBe("2/1/2025, 12:00:00 AM");

      setGMTTimezone("GMT-5");
      const { result: result2 } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result2.current.minReward).toBe(1000);
      expect(result2.current.minRewardDate).toBe("1/31/2025, 7:00:00 PM");

      setGMTTimezone("GMT+5");
      const { result: result3 } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result3.current.minReward).toBe(1000);
      expect(result3.current.minRewardDate).toBe("2/1/2025, 5:00:00 AM");
    });
  });

  describe("Daily blocks statistics", () => {
    test("should identify day with maximum blocks across different timezones", () => {
      // Create timestamps that will give different maximum days in different timezones
      const blocks = [
        // ----- Day 1 -----
        // January 10, 2025 12:00:00 UTC
        createMockBlock(
          new Date("2025-01-10T12:00:00Z").getTime() / 1000,
          1000,
        ),
        // January 10, 2025 13:00:00 UTC
        createMockBlock(
          new Date("2025-01-10T13:00:00Z").getTime() / 1000,
          1000,
        ),

        // ----- Day 2 -----
        // January 11, 2025 02:00:00 UTC
        createMockBlock(
          new Date("2025-01-11T02:00:00Z").getTime() / 1000,
          1000,
        ),
        // January 11, 2025 12:00:00 UTC
        createMockBlock(
          new Date("2025-01-11T12:00:00Z").getTime() / 1000,
          1000,
        ),
        // January 11, 2025 22:00:00 UTC
        createMockBlock(
          new Date("2025-01-11T22:00:00Z").getTime() / 1000,
          1000,
        ),

        // ----- Day 3 -----
        // January 12, 2025 06:00:00 UTC
        createMockBlock(
          new Date("2025-01-12T06:00:00Z").getTime() / 1000,
          1000,
        ),
        // January 12, 2025 17:00:00 UTC
        createMockBlock(
          new Date("2025-01-12T17:00:00Z").getTime() / 1000,
          1000,
        ),
      ];

      // Test UTC/GMT (baseline)
      setUTCTimezone();
      const { result: resultGMT } = renderHook(() => useBlocksStats(blocks));

      // In UTC: 2 on Jan 10, 3 on Jan 11, 2 on Jan 12 (2-3-2)
      expect(resultGMT.current.maxBlocksInDay).toBe(3);
      expect(resultGMT.current.maxBlocksDay).toMatch(/2025-01-11/);
      expect(resultGMT.current.maxBlocksRewards).toBe(3000); // 1000 * 3

      // Test GMT-6 (US Central)
      // In GMT-6, blocks shift earlier:
      // - Jan 10 22:00 UTC is Jan 10 16:00 GMT-6
      // - Jan 10 23:00 UTC is Jan 10 17:00 GMT-6
      // - Jan 11 02:00 UTC is Jan 10 20:00 GMT-6
      // - Jan 11 12:00 UTC is Jan 11 06:00 GMT-6
      // - Jan 11 22:00 UTC is Jan 11 16:00 GMT-6
      // - Jan 12 06:00 UTC is Jan 12 00:00 GMT-6
      // - Jan 12 18:00 UTC is Jan 12 12:00 GMT-6
      setGMTTimezone("GMT-6");
      const { result: resultGMTMinus6 } = renderHook(() =>
        useBlocksStats(blocks),
      );

      // In GMT-6: 3 on Jan 10, 2 on Jan 11, 2 on Jan 12 (3-2-2)
      expect(resultGMTMinus6.current.maxBlocksInDay).toBe(3);
      expect(resultGMTMinus6.current.maxBlocksDay).toMatch(/2025-01-10/);
      expect(resultGMTMinus6.current.maxBlocksRewards).toBe(3000); // 1000 * 3

      // Test GMT+6 (e.g., Bangladesh)
      // In GMT+6, blocks shift later:
      // - Jan 10 22:00 UTC is Jan 11 04:00 GMT+6
      // - Jan 10 23:00 UTC is Jan 11 05:00 GMT+6
      // - Jan 11 02:00 UTC is Jan 11 08:00 GMT+6
      // - Jan 11 12:00 UTC is Jan 11 18:00 GMT+6
      // - Jan 11 22:00 UTC is Jan 12 04:00 GMT+6
      // - Jan 12 06:00 UTC is Jan 12 12:00 GMT+6
      // - Jan 12 17:00 UTC is Jan 12 23:00 GMT+6
      setGMTTimezone("GMT+6");
      const { result: resultGMTPlus6 } = renderHook(() =>
        useBlocksStats(blocks),
      );

      // In GMT+6: 0 on Jan 10, 2 on Jan 11, 2 on Jan 12, 3 on Jan 13 (0-2-2-3)
      // But considering only our 3-day window: 2 on Jan 11, 2 on Jan 12, 3 on Jan 13 (2-2-3)
      expect(resultGMTPlus6.current.maxBlocksInDay).toBe(3);
      expect(resultGMTPlus6.current.maxBlocksDay).toMatch(/2025-01-12/);
      expect(resultGMTPlus6.current.maxBlocksRewards).toBe(3000); // 1000 * 3
    });
  });

  describe("Period averages", () => {
    test("should calculate all-time averages correctly", () => {
      // Create blocks across 3 days
      const mockBlocks = [
        // Day 1: July 10, 2023 - 2 blocks (3000 rewards)
        createMockBlock(
          new Date("2025-07-10T12:00:00Z").getTime() / 1000,
          1000,
        ),
        createMockBlock(
          new Date("2025-07-10T13:00:00Z").getTime() / 1000,
          1000,
        ),

        createMockBlock(
          new Date("2025-07-11T12:00:00Z").getTime() / 1000,
          1000,
        ),
        createMockBlock(
          new Date("2025-07-11T12:00:00Z").getTime() / 1000,
          1000,
        ),
        createMockBlock(
          new Date("2025-07-11T12:00:00Z").getTime() / 1000,
          1000,
        ),

        createMockBlock(
          new Date("2025-07-13T12:00:00Z").getTime() / 1000,
          1000,
        ),
      ];

      MockDate.set("2025-07-13T12:00:00Z");
      setUTCTimezone();
      const { result } = renderHook(() => useBlocksStats(mockBlocks));
      expect(result.current.totalRewards).toBe(6000);
      expect(result.current.allTimeAvgRewardsPerDay).toBe(1667); //5000/3
      expect(result.current.allTimeAvgBlocksPerDay).toBe(5 / 3);

      MockDate.set("2025-07-14T12:00:00Z");
      setUTCTimezone();
      const { result: result2 } = renderHook(() => useBlocksStats(mockBlocks));

      expect(result2.current.totalRewards).toBe(6000);
      expect(result2.current.allTimeAvgRewardsPerDay).toBe(6000 / 4);
      expect(result2.current.allTimeAvgBlocksPerDay).toBe(6 / 4);
    });
  });

  describe("7-day statistics", () => {
    test("should calculate 7-day averages with timezone considerations", () => {
      const blocks = [
        // Day 1 (9 days ago) - Jan 6
        createMockBlock(
          new Date("2025-01-06T06:00:00Z").getTime() / 1000,
          1000,
        ),
        createMockBlock(
          new Date("2025-01-07T22:00:00Z").getTime() / 1000,
          2000,
        ), //Here in GMT+6

        // Day 2 (8 days ago) - Jan 7 - empty

        // Day 3 (7 days ago) - Jan 8 - in previous period
        createMockBlock(
          new Date("2025-01-08T05:00:00Z").getTime() / 1000, //Not here in GMT-6
          1500,
        ),

        // Day 4 (6 days ago) - Jan 9 - in current period
        createMockBlock(
          new Date("2025-01-09T02:00:00Z").getTime() / 1000,
          2500,
        ),
        createMockBlock(
          new Date("2025-01-09T18:00:00Z").getTime() / 1000,
          1800,
        ),

        // Day 5 (5 days ago) - Jan 10 - empty

        // Day 6 (4 days ago) - Jan 11
        createMockBlock(
          new Date("2025-01-11T14:00:00Z").getTime() / 1000,
          3000,
        ),

        // Day 7 (3 days ago) - Jan 12
        createMockBlock(
          new Date("2025-01-12T23:00:00Z").getTime() / 1000,
          2200,
        ),

        // Day 8 (2 days ago) - Jan 13
        createMockBlock(
          new Date("2025-01-13T05:00:00Z").getTime() / 1000,
          1700,
        ),
        createMockBlock(
          new Date("2025-01-13T19:30:00Z").getTime() / 1000,
          2100,
        ),

        // Today, not included in the 7-day stats
        createMockBlock(
          new Date("2025-01-15T11:00:00Z").getTime() / 1000,
          9999999999,
        ),
      ];

      // Test UTC timezone
      MockDate.set(new Date("2025-01-15T12:00:00Z"));
      setUTCTimezone();
      const { result: resultUTC } = renderHook(() => useBlocksStats(blocks));

      expect(resultUTC.current.last7Days.totalBlocks).toBe(7);
      expect(resultUTC.current.last7Days.avgBlocksPerDay).toBe(1); // 7 blocks over 7 days
      expect(resultUTC.current.last7Days.avgRewardsPerDay).toBe(
        Math.round((1500 + 2500 + 1800 + 3000 + 2200 + 1700 + 2100) / 7),
      );

      // Previous period
      expect(resultUTC.current.previous7Days.avgBlocksPerDay).toBe(0.29);
      expect(resultUTC.current.previous7Days.avgRewardsPerDay).toBe(429);

      expect(resultUTC.current.last7Days.change.blocks.direction).toBe("up");
      expect(resultUTC.current.last7Days.change.rewards.direction).toBe("up");

      // Test GMT-6 timezone
      setGMTTimezone("GMT-6");
      const { result: resultGMTMinus6 } = renderHook(() =>
        useBlocksStats(blocks),
      );

      // In GMT-6:
      expect(resultGMTMinus6.current.last7Days.totalBlocks).toBe(6);
      expect(resultGMTMinus6.current.last7Days.avgBlocksPerDay).toBe(0.86);

      //Previous period
      expect(resultGMTMinus6.current.previous7Days.avgBlocksPerDay).toBe(0.43);
      expect(resultGMTMinus6.current.previous7Days.avgRewardsPerDay).toBe(
        Math.round((1000 + 2000 + 1500) / 7),
      );
      expect(resultGMTMinus6.current.last7Days.change.blocks.direction).toBe(
        "up",
      );
      expect(resultGMTMinus6.current.last7Days.change.rewards.direction).toBe(
        "up",
      );

      // Test GMT+6 timezone
      setGMTTimezone("GMT+6");
      const { result: resultGMTPlus6 } = renderHook(() =>
        useBlocksStats(blocks),
      );

      expect(resultGMTPlus6.current.last7Days.totalBlocks).toBe(8);
      expect(resultGMTPlus6.current.last7Days.avgBlocksPerDay).toBe(1.14);
      expect(resultGMTPlus6.current.last7Days.avgRewardsPerDay).toBe(
        (2000 + 1500 + 2500 + 1800 + 3000 + 2200 + 1700 + 2100) / 7,
      );

      expect(resultGMTPlus6.current.previous7Days.avgBlocksPerDay).toBe(0.14);
      expect(resultGMTPlus6.current.previous7Days.avgRewardsPerDay).toBe(
        Math.round(1000 / 7),
      );

      expect(resultGMTPlus6.current.last7Days.change.blocks.direction).toBe(
        "up",
      );
      expect(resultGMTPlus6.current.last7Days.change.rewards.direction).toBe(
        "up",
      );
      // Reset mock date
      MockDate.reset();
      setUTCTimezone();
    });
  });

  describe("30-day statistics", () => {
    test("should calculate 30-day averages with timezone considerations", () => {
      // Create blocks spanning more than 60 days to test both current and previous 30-day periods
      const blocks = [
        createMockBlock(
          new Date("2024-12-16T06:00:00Z").getTime() / 1000,
          1000,
        ),

        createMockBlock(
          new Date("2024-12-16T23:00:00Z").getTime() / 1000,
          1000,
        ), // Here in GMT+6

        // Previous period blocks (60-31 days ago)
        createMockBlock(
          new Date("2024-12-17T02:00:00Z").getTime() / 1000,
          2000,
        ), //Not here in -6
        createMockBlock(
          new Date("2024-12-30T05:00:00Z").getTime() / 1000,
          1500,
        ),

        createMockBlock(
          new Date("2025-01-02T02:00:00Z").getTime() / 1000,
          2500,
        ),
        createMockBlock(
          new Date("2025-01-05T18:00:00Z").getTime() / 1000,
          1800,
        ),
        createMockBlock(
          new Date("2025-01-12T14:00:00Z").getTime() / 1000,
          3000,
        ),
        createMockBlock(
          new Date("2025-01-13T23:00:00Z").getTime() / 1000,
          2200,
        ),

        // Current period blocks (30-1 days ago)
        createMockBlock(
          new Date("2025-01-24T05:00:00Z").getTime() / 1000,
          1700,
        ),
        createMockBlock(
          new Date("2025-01-30T19:30:00Z").getTime() / 1000,
          2100,
        ),

        // Today, not included in the 30-day stats
        createMockBlock(
          new Date("2025-02-15T11:00:00Z").getTime() / 1000,
          9999999999,
        ),
      ];

      // Test UTC timezone
      MockDate.set(new Date("2025-02-15T12:00:00Z"));
      setUTCTimezone();
      const { result: resultUTC } = renderHook(() => useBlocksStats(blocks));

      // Current 30-day period (Jan 16 - Feb 14)
      expect(resultUTC.current.last30Days.totalBlocks).toBe(2);
      expect(resultUTC.current.last30Days.avgBlocksPerDay).toBe(0.07);
      expect(resultUTC.current.last30Days.avgRewardsPerDay).toBe(
        Math.round((1700 + 2100) / 30),
      );

      // Previous period (Dec 17 - Jan 15)
      expect(resultUTC.current.previous30Days.avgBlocksPerDay).toBe(6 / 30);
      expect(resultUTC.current.previous30Days.avgRewardsPerDay).toBe(
        Math.round((2000 + 1500 + 2500 + 1800 + 3000 + 2200) / 30),
      );
      expect(resultUTC.current.last30Days.change.blocks.direction).toBe("down");
      expect(resultUTC.current.last30Days.change.rewards.direction).toBe(
        "down",
      );

      setGMTTimezone("GMT-6");
      const { result: resultGMTMinus6 } = renderHook(() =>
        useBlocksStats(blocks),
      );

      expect(resultGMTMinus6.current.previous30Days.avgBlocksPerDay).toBe(0.17);

      setGMTTimezone("GMT+6");
      const { result: resultGMTPlus6 } = renderHook(() =>
        useBlocksStats(blocks),
      );

      expect(resultGMTPlus6.current.previous30Days.avgBlocksPerDay).toBe(0.23);
    });
  });
});
