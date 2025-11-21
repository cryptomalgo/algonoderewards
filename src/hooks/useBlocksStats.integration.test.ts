import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBlocksStats } from "./useBlocksStats";
import { MinimalBlock } from "@/lib/block-types";

describe("useBlocksStats with MinimalBlock data", () => {
  // Create realistic test data
  const createTestBlocks = (): MinimalBlock[] => {
    const now = Date.now() / 1000;
    const oneDayAgo = now - 86400;
    const twoDaysAgo = now - 86400 * 2;
    const threeDaysAgo = now - 86400 * 3;

    return [
      {
        round: 46512900,
        timestamp: Math.floor(threeDaysAgo),
        proposer: "ADDR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        proposerPayout: 1000000, // 1 ALGO
      },
      {
        round: 46512950,
        timestamp: Math.floor(twoDaysAgo),
        proposer: "ADDR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        proposerPayout: 2000000, // 2 ALGO
      },
      {
        round: 46513000,
        timestamp: Math.floor(oneDayAgo),
        proposer: "ADDR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        proposerPayout: 1500000, // 1.5 ALGO
      },
      {
        round: 46513050,
        timestamp: Math.floor(now - 3600), // 1 hour ago
        proposer: "ADDR1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        proposerPayout: 1800000, // 1.8 ALGO
      },
    ];
  };

  it("should return non-zero stats for valid MinimalBlock data", () => {
    const blocks = createTestBlocks();
    const { result } = renderHook(() => useBlocksStats(blocks));

    // Verify total stats are not zero
    expect(result.current.totalRewards).toBeGreaterThan(0);
    expect(result.current.totalRewards).toBe(6300000); // 6.3 ALGO total
    expect(result.current.totalNbOfBlocksWithRewards).toBe(4);
  });

  it("should calculate correct average rewards", () => {
    const blocks = createTestBlocks();
    const { result } = renderHook(() => useBlocksStats(blocks));

    // Verify that average can be calculated from total/count
    const calculatedAverage =
      result.current.totalRewards / result.current.totalNbOfBlocksWithRewards;
    expect(calculatedAverage).toBe(1575000);
  });

  it("should calculate correct min and max rewards", () => {
    const blocks = createTestBlocks();
    const { result } = renderHook(() => useBlocksStats(blocks));

    expect(result.current.maxReward).toBe(2000000);
    expect(result.current.minReward).toBe(1000000);
  });

  it("should calculate correct all-time stats", () => {
    const blocks = createTestBlocks();
    const { result } = renderHook(() => useBlocksStats(blocks));

    // allTime stats filter blocks up to yesterday (exclude today's blocks)
    // So we expect 4 blocks (includes all blocks from previous days)
    expect(result.current.allTime.totalBlocks).toBe(4);
    expect(result.current.allTime.totalRewards).toBe(6300000); // 1 + 2 + 1.5 + 1.8 ALGO
    expect(result.current.allTime.avgRewardsPerDay).toBeGreaterThan(0);
  });

  it("should handle empty blocks array", () => {
    const { result } = renderHook(() => useBlocksStats([]));

    expect(result.current.totalRewards).toBe(0);
    expect(result.current.totalNbOfBlocksWithRewards).toBe(0);
  });

  it("should calculate last 7 days stats", () => {
    const blocks = createTestBlocks();
    const { result } = renderHook(() => useBlocksStats(blocks));

    // All blocks are within 3 days, so should be included in last 7 days
    expect(result.current.last7Days.totalBlocks).toBeGreaterThan(0);
    expect(result.current.last7Days.totalRewards).toBeGreaterThan(0);
  });

  it("should calculate last 30 days stats", () => {
    const blocks = createTestBlocks();
    const { result } = renderHook(() => useBlocksStats(blocks));

    // All blocks are within 3 days, so should be included in last 30 days
    expect(result.current.last30Days.totalBlocks).toBeGreaterThan(0);
    expect(result.current.last30Days.totalRewards).toBeGreaterThan(0);
  });
});
