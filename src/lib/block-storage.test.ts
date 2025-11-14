import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  initDB,
  getBlocksFromCache,
  saveBlocksToCache,
  getMaxRoundFromCache,
  clearCacheForAddress,
  clearAllCache,
  getCachedAddresses,
  getCacheMetadata,
} from "./block-storage";
import { MinimalBlock } from "./block-types";

describe("Block Storage", () => {
  const testAddress1 = "TEST_ADDRESS_1";
  const testAddress2 = "TEST_ADDRESS_2";

  const mockBlocks1: MinimalBlock[] = [
    {
      round: 1000,
      timestamp: 1640000000,
      proposer: "proposer1_base64",
      proposerPayout: 1000000,
    },
    {
      round: 2000,
      timestamp: 1640001000,
      proposer: "proposer1_base64",
      proposerPayout: 2000000,
    },
    {
      round: 3000,
      timestamp: 1640002000,
      proposer: "proposer1_base64",
      proposerPayout: 1500000,
    },
  ];

  const mockBlocks2: MinimalBlock[] = [
    {
      round: 1500,
      timestamp: 1640000500,
      proposer: "proposer2_base64",
      proposerPayout: 3000000,
    },
    {
      round: 2500,
      timestamp: 1640001500,
      proposer: "proposer2_base64",
      proposerPayout: 2500000,
    },
  ];

  beforeEach(async () => {
    // Clear all data before each test
    await clearAllCache();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearAllCache();
  });

  describe("initDB", () => {
    it("should initialize database successfully", async () => {
      const db = await initDB();
      expect(db).toBeDefined();
      expect(db.name).toBe("AlgoNodeRewardsDB");
      expect(db.version).toBe(1);
      db.close();
    });

    it("should create blocks object store", async () => {
      const db = await initDB();
      expect(db.objectStoreNames.contains("blocks")).toBe(true);
      db.close();
    });
  });

  describe("saveBlocksToCache and getBlocksFromCache", () => {
    it("should save and retrieve blocks for an address", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      const retrieved = await getBlocksFromCache(testAddress1);

      expect(retrieved).toBeDefined();
      expect(retrieved).toHaveLength(3);
      expect(retrieved![0].round).toBe(1000);
      expect(retrieved![1].round).toBe(2000);
      expect(retrieved![2].round).toBe(3000);
    });

    it("should return null for non-existent address", async () => {
      const retrieved = await getBlocksFromCache("NON_EXISTENT");
      expect(retrieved).toBeNull();
    });

    it("should overwrite existing cache when saving again", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);

      const newBlocks: MinimalBlock[] = [
        {
          round: 5000,
          timestamp: 1640005000,
          proposer: "proposer1_base64",
          proposerPayout: 5000000,
        },
      ];

      await saveBlocksToCache(testAddress1, newBlocks);
      const retrieved = await getBlocksFromCache(testAddress1);

      expect(retrieved).toHaveLength(1);
      expect(retrieved![0].round).toBe(5000);
    });

    it("should handle multiple addresses independently", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      await saveBlocksToCache(testAddress2, mockBlocks2);

      const retrieved1 = await getBlocksFromCache(testAddress1);
      const retrieved2 = await getBlocksFromCache(testAddress2);

      expect(retrieved1).toHaveLength(3);
      expect(retrieved2).toHaveLength(2);
      expect(retrieved1![0].round).toBe(1000);
      expect(retrieved2![0].round).toBe(1500);
    });

    it("should correctly serialize and deserialize block data", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      const retrieved = await getBlocksFromCache(testAddress1);

      expect(retrieved![0]).toEqual(mockBlocks1[0]);
      expect(retrieved![0].proposer).toBe("proposer1_base64");
      expect(typeof retrieved![0].proposer).toBe("string");
    });
  });

  describe("getMaxRoundFromCache", () => {
    it("should return max round from cached blocks", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      const maxRound = await getMaxRoundFromCache(testAddress1);

      expect(maxRound).toBe(3000);
    });

    it("should return null for non-existent address", async () => {
      const maxRound = await getMaxRoundFromCache("NON_EXISTENT");
      expect(maxRound).toBeNull();
    });

    it("should return null for empty cache", async () => {
      await saveBlocksToCache(testAddress1, []);
      const maxRound = await getMaxRoundFromCache(testAddress1);
      expect(maxRound).toBeNull();
    });

    it("should return correct max round for single block", async () => {
      const singleBlock: MinimalBlock[] = [
        {
          round: 9999,
          timestamp: 1640009999,
          proposer: "single_proposer",
          proposerPayout: 1000000,
        },
      ];

      await saveBlocksToCache(testAddress1, singleBlock);
      const maxRound = await getMaxRoundFromCache(testAddress1);
      expect(maxRound).toBe(9999);
    });
  });

  describe("clearCacheForAddress", () => {
    it("should clear cache for specific address", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      await saveBlocksToCache(testAddress2, mockBlocks2);

      await clearCacheForAddress(testAddress1);

      const retrieved1 = await getBlocksFromCache(testAddress1);
      const retrieved2 = await getBlocksFromCache(testAddress2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toHaveLength(2);
    });

    it("should not throw error when clearing non-existent address", async () => {
      await expect(clearCacheForAddress("NON_EXISTENT")).resolves.not.toThrow();
    });
  });

  describe("clearAllCache", () => {
    it("should clear all cached data", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      await saveBlocksToCache(testAddress2, mockBlocks2);

      await clearAllCache();

      const retrieved1 = await getBlocksFromCache(testAddress1);
      const retrieved2 = await getBlocksFromCache(testAddress2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });
  });

  describe("getCachedAddresses", () => {
    it("should return empty array when no cache exists", async () => {
      const addresses = await getCachedAddresses();
      expect(addresses).toEqual([]);
    });

    it("should return all cached addresses", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      await saveBlocksToCache(testAddress2, mockBlocks2);

      const addresses = await getCachedAddresses();
      expect(addresses).toHaveLength(2);
      expect(addresses).toContain(testAddress1);
      expect(addresses).toContain(testAddress2);
    });
  });

  describe("getCacheMetadata", () => {
    it("should return metadata for cached address", async () => {
      const beforeSave = Date.now();
      await saveBlocksToCache(testAddress1, mockBlocks1);
      const afterSave = Date.now();

      const metadata = await getCacheMetadata(testAddress1);

      expect(metadata).toBeDefined();
      expect(metadata!.blockCount).toBe(3);
      expect(metadata!.lastUpdated).toBeGreaterThanOrEqual(beforeSave);
      expect(metadata!.lastUpdated).toBeLessThanOrEqual(afterSave);
    });

    it("should return null for non-existent address", async () => {
      const metadata = await getCacheMetadata("NON_EXISTENT");
      expect(metadata).toBeNull();
    });

    it("should update lastUpdated timestamp on re-save", async () => {
      await saveBlocksToCache(testAddress1, mockBlocks1);
      const firstMetadata = await getCacheMetadata(testAddress1);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      await saveBlocksToCache(testAddress1, mockBlocks2);
      const secondMetadata = await getCacheMetadata(testAddress1);

      expect(secondMetadata!.lastUpdated).toBeGreaterThan(
        firstMetadata!.lastUpdated,
      );
      expect(secondMetadata!.blockCount).toBe(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty blocks array", async () => {
      await saveBlocksToCache(testAddress1, []);
      const retrieved = await getBlocksFromCache(testAddress1);

      expect(retrieved).toEqual([]);
    });

    it("should handle very large round numbers", async () => {
      const largeRoundBlocks: MinimalBlock[] = [
        {
          round: Number.MAX_SAFE_INTEGER - 1,
          timestamp: 1640000000,
          proposer: "large_proposer",
          proposerPayout: 1000000,
        },
      ];

      await saveBlocksToCache(testAddress1, largeRoundBlocks);
      const retrieved = await getBlocksFromCache(testAddress1);

      expect(retrieved![0].round).toBe(Number.MAX_SAFE_INTEGER - 1);
    });

    it("should handle blocks with minimum payout", async () => {
      const minPayoutBlocks: MinimalBlock[] = [
        {
          round: 1000,
          timestamp: 1640000000,
          proposer: "min_proposer",
          proposerPayout: 1,
        },
      ];

      await saveBlocksToCache(testAddress1, minPayoutBlocks);
      const retrieved = await getBlocksFromCache(testAddress1);

      expect(retrieved![0].proposerPayout).toBe(1);
    });
  });
});
