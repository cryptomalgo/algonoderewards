import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  saveBlocksToCache,
  getBlocksFromCache,
  clearAllCache,
} from "@/lib/block-storage";
import { useBlocksStats } from "@/hooks/useBlocksStats";
import { MinimalBlock } from "@/lib/block-types";

describe("Cache integration with stats", () => {
  const testAddress =
    "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU";

  beforeEach(async () => {
    await clearAllCache();
  });

  const createTestBlocks = (): MinimalBlock[] => {
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        round: 46512900,
        timestamp: now - 86400 * 3,
        proposer: testAddress,
        proposerPayout: 1000000,
      },
      {
        round: 46512950,
        timestamp: now - 86400 * 2,
        proposer: testAddress,
        proposerPayout: 2000000,
      },
      {
        round: 46513000,
        timestamp: now - 86400,
        proposer: testAddress,
        proposerPayout: 1500000,
      },
    ];
  };

  it("should save blocks to cache and load them correctly", async () => {
    const blocks = createTestBlocks();

    // Save to cache
    await saveBlocksToCache(testAddress, blocks);

    // Load from cache
    const cachedBlocks = await getBlocksFromCache(testAddress);

    expect(cachedBlocks).not.toBeNull();
    expect(cachedBlocks).toHaveLength(3);
    expect(cachedBlocks![0].proposer).toBe(testAddress);
    expect(cachedBlocks![0].proposerPayout).toBe(1000000);
  });

  it("should produce non-zero stats from cached blocks", async () => {
    const blocks = createTestBlocks();

    // Save to cache
    await saveBlocksToCache(testAddress, blocks);

    // Load from cache
    const cachedBlocks = await getBlocksFromCache(testAddress);

    expect(cachedBlocks).not.toBeNull();

    // Test that stats work with cached blocks
    const { result } = renderHook(() => useBlocksStats(cachedBlocks!));

    expect(result.current.totalRewards).toBeGreaterThan(0);
    expect(result.current.totalRewards).toBe(4500000);
    expect(result.current.totalNbOfBlocksWithRewards).toBe(3);
    expect(result.current.maxReward).toBe(2000000);
    expect(result.current.minReward).toBe(1000000);
  });

  it("should handle proposer field correctly after cache round-trip", async () => {
    const blocks = createTestBlocks();

    // Save to cache
    await saveBlocksToCache(testAddress, blocks);

    // Load from cache
    const cachedBlocks = await getBlocksFromCache(testAddress);

    expect(cachedBlocks).not.toBeNull();

    // Verify proposer is still an address string, not base64
    cachedBlocks!.forEach((block) => {
      expect(block.proposer).toBe(testAddress);
      expect(block.proposer).toMatch(/^[A-Z2-7]{58}$/); // Algorand address format
    });
  });

  it("should maintain data integrity through multiple cache cycles", async () => {
    const blocks = createTestBlocks();

    // First cycle
    await saveBlocksToCache(testAddress, blocks);
    const cached1 = await getBlocksFromCache(testAddress);
    expect(cached1).not.toBeNull();

    // Second cycle (save what we loaded)
    await saveBlocksToCache(testAddress, cached1!);
    const cached2 = await getBlocksFromCache(testAddress);
    expect(cached2).not.toBeNull();

    // Verify stats still work
    const { result } = renderHook(() => useBlocksStats(cached2!));
    expect(result.current.totalRewards).toBe(4500000);
    expect(result.current.totalNbOfBlocksWithRewards).toBe(3);
  });
});
