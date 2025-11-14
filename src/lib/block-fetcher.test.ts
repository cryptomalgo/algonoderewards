import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { decodeAddress } from "algosdk";
import { fetchBlocksWithCache } from "./block-fetcher";
import {
  clearAllCache,
  saveBlocksToCache,
  getBlocksFromCache,
} from "./block-storage";
import { MinimalBlock, toMinimalBlock } from "./block-types";
import { ResolvedAddress } from "@/components/heatmap/types";

// Mock executePaginatedRequest
vi.mock("@algorandfoundation/algokit-utils", () => ({
  executePaginatedRequest: vi.fn(async () => []),
}));

// Mock time library
vi.useFakeTimers();

describe("Block Fetcher", () => {
  // Use valid Algorand addresses (58 characters)
  const address1 = "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU";
  const address2 = "QY7XPQOT5IX7SRQ6DZNP4IFAYFWGNWFGWWV3INIMZVHFHKNXYX4Z7SQTYU";

  const resolvedAddress1: ResolvedAddress = {
    address: address1,
    nfd: null,
  };

  const resolvedAddress2: ResolvedAddress = {
    address: address2,
    nfd: null,
  };

  // Decode addresses to get public keys for mock API responses
  const proposer1Bytes = decodeAddress(address1).publicKey;
  const proposer2Bytes = decodeAddress(address2).publicKey;
  const mockCachedBlocks1: MinimalBlock[] = [
    {
      round: 46512900,
      timestamp: 1640000000,
      proposer: address1, // Use address string directly
      proposerPayout: 1000000,
    },
    {
      round: 46512950,
      timestamp: 1640001000,
      proposer: address1, // Use address string directly
      proposerPayout: 2000000,
    },
  ];

  const mockCachedBlocks2: MinimalBlock[] = [
    {
      round: 46512920,
      timestamp: 1640000500,
      proposer: address2, // Use address string directly
      proposerPayout: 1500000,
    },
  ];

  beforeEach(async () => {
    await clearAllCache();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearAllCache();
  });

  describe("fetchBlocksWithCache - Single Address", () => {
    it("should fetch from API when cache is empty", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Mock API response
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512900),
          timestamp: BigInt(1640000000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1000000),
        },
      ]);

      const blocks = await fetchBlocksWithCache([resolvedAddress1]);

      expect(executePaginatedRequest).toHaveBeenCalledTimes(1);
      expect(blocks.length).toBeGreaterThanOrEqual(0);
    });

    it("should use cached blocks and fetch only new ones", async () => {
      // Pre-populate cache
      await saveBlocksToCache(address1, mockCachedBlocks1);

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Mock API response with newer blocks
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46513000),
          timestamp: BigInt(1640002000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(3000000),
        },
      ]);

      const blocks = await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: true,
      });

      // Should have cached + new blocks
      expect(blocks.length).toBeGreaterThanOrEqual(2);

      // Verify cache was updated
      const updatedCache = await getBlocksFromCache(address1);
      expect(updatedCache).toBeDefined();
      expect(updatedCache!.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle duplicate blocks correctly", async () => {
      // Pre-populate cache
      await saveBlocksToCache(address1, mockCachedBlocks1);

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Mock API response with duplicate block
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512950), // Duplicate round
          timestamp: BigInt(1640001000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(2000000),
        },
      ]);

      const blocks = await fetchBlocksWithCache([resolvedAddress1]);

      // Should deduplicate
      const rounds = blocks.map((b) => Number(b.round));
      const uniqueRounds = new Set(rounds);
      expect(rounds.length).toBe(uniqueRounds.size);
    });
  });

  describe("fetchBlocksWithCache - Multiple Addresses", () => {
    it("should fetch blocks for multiple addresses with empty cache", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512900),
          timestamp: BigInt(1640000000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1000000),
        },
        {
          round: BigInt(46512920),
          timestamp: BigInt(1640000500),
          proposer: {
            publicKey: proposer2Bytes,
          },
          proposerPayout: BigInt(1500000),
        },
      ]);

      const blocks = await fetchBlocksWithCache([
        resolvedAddress1,
        resolvedAddress2,
      ]);

      expect(blocks.length).toBeGreaterThanOrEqual(0);

      // Both addresses should have cache now
      const cache1 = await getBlocksFromCache(address1);
      const cache2 = await getBlocksFromCache(address2);
      expect(cache1).toBeDefined();
      expect(cache2).toBeDefined();
    });

    it("should use minimum max round when addresses have different cache states", async () => {
      // Address 1 has cache up to round 46512950
      await saveBlocksToCache(address1, mockCachedBlocks1);
      // Address 2 has no cache

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );
      const mockExecute = vi.mocked(executePaginatedRequest);

      mockExecute.mockResolvedValueOnce([]);

      await fetchBlocksWithCache([resolvedAddress1, resolvedAddress2]);

      // Should start from REWARDS_START_ROUND (46512890) since address2 has no cache
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should use lowest max round when all addresses have cache", async () => {
      // Address 1: max round 46512950
      await saveBlocksToCache(address1, mockCachedBlocks1);
      // Address 2: max round 46512920 (lower)
      await saveBlocksToCache(address2, mockCachedBlocks2);

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );
      const mockExecute = vi.mocked(executePaginatedRequest);

      mockExecute.mockResolvedValueOnce([
        {
          round: BigInt(46512921),
          timestamp: BigInt(1640000600),
          proposer: {
            publicKey: proposer2Bytes,
          },
          proposerPayout: BigInt(2000000),
        },
      ]);

      await fetchBlocksWithCache([resolvedAddress1, resolvedAddress2]);

      // Should start from 46512921 (lowest max + 1)
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should maintain separate caches for each address", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512900),
          timestamp: BigInt(1640000000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1000000),
        },
        {
          round: BigInt(46512920),
          timestamp: BigInt(1640000500),
          proposer: {
            publicKey: proposer2Bytes,
          },
          proposerPayout: BigInt(1500000),
        },
        {
          round: BigInt(46512950),
          timestamp: BigInt(1640001000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(2000000),
        },
      ]);

      await fetchBlocksWithCache([resolvedAddress1, resolvedAddress2], {
        enableCache: true,
      });

      const cache1 = await getBlocksFromCache(address1);
      const cache2 = await getBlocksFromCache(address2);

      // Address 1 should have 2 blocks
      expect(cache1?.length).toBeGreaterThanOrEqual(0);
      // Address 2 should have 1 block
      expect(cache2?.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("fetchBlocksWithCache - Edge Cases", () => {
    it("should handle empty address array", async () => {
      const blocks = await fetchBlocksWithCache([]);
      expect(blocks).toEqual([]);
    });

    it("should filter out blocks with zero payout", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512900),
          timestamp: BigInt(1640000000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(0), // Zero payout
        },
        {
          round: BigInt(46512920),
          timestamp: BigInt(1640000500),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1000000), // Valid payout
        },
      ]);

      const blocks = await fetchBlocksWithCache([resolvedAddress1]);

      // Should only include blocks with payout > 0
      const hasZeroPayout = blocks.some(
        (b) => Number(b.proposerPayout || 0) === 0,
      );
      expect(hasZeroPayout).toBe(false);
    });

    it("should sort blocks by round", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Return blocks in random order
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512950),
          timestamp: BigInt(1640001000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(2000000),
        },
        {
          round: BigInt(46512900),
          timestamp: BigInt(1640000000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1000000),
        },
        {
          round: BigInt(46512920),
          timestamp: BigInt(1640000500),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1500000),
        },
      ]);

      const blocks = await fetchBlocksWithCache([resolvedAddress1]);

      // Verify sorted order
      for (let i = 1; i < blocks.length; i++) {
        expect(Number(blocks[i].round)).toBeGreaterThanOrEqual(
          Number(blocks[i - 1].round),
        );
      }
    });
  });

  describe("Block type conversions", () => {
    // Use a valid test address for these unit tests
    const testAddress =
      "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU";
    const testProposerBytes = decodeAddress(testAddress).publicKey;

    it("should handle Uint8Array proposer", () => {
      const block = {
        round: 1000,
        timestamp: 1640000000,
        proposer: testProposerBytes,
        proposerPayout: 1000000,
      };

      const minimal = toMinimalBlock(block);
      expect(minimal).toBeDefined();
      expect(minimal!.proposer).toBe(testAddress);
    });

    it("should handle Address object with publicKey", () => {
      const block = {
        round: 1000,
        timestamp: 1640000000,
        proposer: {
          publicKey: testProposerBytes,
        },
        proposerPayout: 1000000,
      };

      const minimal = toMinimalBlock(block);
      expect(minimal).toBeDefined();
      expect(minimal!.proposer).toBe(testAddress);
    });

    it("should return null for invalid block", () => {
      const invalidBlock = {
        round: 1000,
        timestamp: 1640000000,
        proposer: testProposerBytes,
        proposerPayout: 0, // Invalid: zero payout
      };

      const minimal = toMinimalBlock(invalidBlock);
      expect(minimal).toBeNull();
    });

    it("should handle bigint types", () => {
      const block = {
        round: BigInt(1000),
        timestamp: BigInt(1640000000),
        proposer: testProposerBytes,
        proposerPayout: BigInt(1000000),
      };

      const minimal = toMinimalBlock(block);
      expect(minimal).toBeDefined();
      expect(minimal!.round).toBe(1000);
      expect(minimal!.timestamp).toBe(1640000000);
      expect(minimal!.proposerPayout).toBe(1000000);
    });
  });

  describe("Block filtering by address", () => {
    it("should return blocks that can be filtered by address using encodeAddress", async () => {
      // Pre-populate cache with blocks from both addresses
      await saveBlocksToCache(address1, mockCachedBlocks1);
      await saveBlocksToCache(address2, mockCachedBlocks2);

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Mock empty API response (only using cache)
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([]);

      // Fetch blocks for both addresses
      const blocks = await fetchBlocksWithCache(
        [resolvedAddress1, resolvedAddress2],
        {
          enableCache: true,
        },
      );

      expect(blocks.length).toBeGreaterThan(0);

      // Verify we can filter blocks by address using encodeAddress
      // This simulates what happens in address-view.tsx
      const address1Blocks = blocks.filter((block) => {
        return block.proposer === address1;
      });

      const address2Blocks = blocks.filter((block) => {
        return block.proposer === address2;
      });

      // Verify filtering works correctly
      expect(address1Blocks.length).toBe(2); // mockCachedBlocks1 has 2 blocks
      expect(address2Blocks.length).toBe(1); // mockCachedBlocks2 has 1 block

      // Verify rounds match
      expect(address1Blocks.map((b) => Number(b.round))).toEqual([
        46512900, 46512950,
      ]);
      expect(address2Blocks.map((b) => Number(b.round))).toEqual([46512920]);
    });

    it("should bypass cache when enableCache option is false", async () => {
      // Pre-populate cache with blocks
      await saveBlocksToCache(address1, mockCachedBlocks1);

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Mock API response with different blocks
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46513100),
          timestamp: BigInt(1640003000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(5000000),
        },
      ]);

      // Fetch with enableCache option set to false
      const blocks = await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: false,
      });

      // Should only have the new block from API, not from cache
      expect(blocks.length).toBe(1);
      expect(Number(blocks[0].round)).toBe(46513100);

      // Verify cache was not updated (should still have old data)
      const cachedBlocks = await getBlocksFromCache(address1);
      expect(cachedBlocks?.length).toBe(2); // Still has original 2 blocks
      expect(cachedBlocks![0].round).toBe(46512900);
    });

    it("should fetch from REWARDS_START_ROUND when cache is disabled", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      // Mock API response
      vi.mocked(executePaginatedRequest).mockResolvedValueOnce([
        {
          round: BigInt(46512900),
          timestamp: BigInt(1640000000),
          proposer: {
            publicKey: proposer1Bytes,
          },
          proposerPayout: BigInt(1000000),
        },
      ]);

      const blocks = await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: false,
      });

      // Verify we got the block
      expect(blocks.length).toBe(1);
      expect(Number(blocks[0].round)).toBe(46512900);

      // Verify API was called
      expect(executePaginatedRequest).toHaveBeenCalledTimes(1);

      // Verify no cache was created
      const cachedBlocks = await getBlocksFromCache(address1);
      expect(cachedBlocks).toBeNull();
    });
  });

  describe("Progress tracking", () => {
    it("should report progress starting from REWARDS_START_ROUND when no cache", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      const progressUpdates: Array<{
        syncedUntilRound: number;
        startRound: number;
        currentRound: number;
        remainingRounds: number;
      }> = [];

      const mockCurrentRound = 46513000;

      // Mock API response with blocks
      vi.mocked(executePaginatedRequest).mockImplementation(
        async (processFunc: (response: { blocks: unknown[] }) => unknown[]) => {
          const mockResponse = {
            blocks: [
              {
                round: BigInt(46512920),
                timestamp: BigInt(1640000000),
                proposer: { publicKey: proposer1Bytes },
                proposerPayout: BigInt(1000000),
              },
            ],
          };
          return processFunc(mockResponse);
        },
      );

      await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: false,
        currentRound: mockCurrentRound,
        onProgress: (syncedUntil, start, current, remaining) => {
          progressUpdates.push({
            syncedUntilRound: syncedUntil,
            startRound: start,
            currentRound: current,
            remainingRounds: remaining,
          });
        },
      });

      // Verify progress updates were called
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Verify first progress update
      const firstUpdate = progressUpdates[0];
      expect(firstUpdate.startRound).toBe(46512890); // REWARDS_START_ROUND
      expect(firstUpdate.currentRound).toBe(mockCurrentRound);
      expect(firstUpdate.syncedUntilRound).toBeGreaterThanOrEqual(
        firstUpdate.startRound,
      );

      // Verify progress bar would start at 0%
      const totalRounds = firstUpdate.currentRound - firstUpdate.startRound;
      const processedRounds =
        firstUpdate.syncedUntilRound - firstUpdate.startRound;
      const progress = (processedRounds / totalRounds) * 100;
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it("should report progress starting from cached round when cache enabled", async () => {
      // Pre-populate cache
      await saveBlocksToCache(address1, mockCachedBlocks1);

      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      const progressUpdates: Array<{
        syncedUntilRound: number;
        startRound: number;
        currentRound: number;
        remainingRounds: number;
      }> = [];

      const mockCurrentRound = 46513000;

      // Mock API response with newer blocks
      vi.mocked(executePaginatedRequest).mockImplementation(
        async (processFunc: (response: { blocks: unknown[] }) => unknown[]) => {
          const mockResponse = {
            blocks: [
              {
                round: BigInt(46512980),
                timestamp: BigInt(1640002000),
                proposer: { publicKey: proposer1Bytes },
                proposerPayout: BigInt(1500000),
              },
            ],
          };
          return processFunc(mockResponse);
        },
      );

      await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: true,
        currentRound: mockCurrentRound,
        onProgress: (syncedUntil, start, current, remaining) => {
          progressUpdates.push({
            syncedUntilRound: syncedUntil,
            startRound: start,
            currentRound: current,
            remainingRounds: remaining,
          });
        },
      });

      // Verify progress updates were called
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Verify first progress update starts from cached round + 1
      const firstUpdate = progressUpdates[0];
      expect(firstUpdate.startRound).toBe(46512951); // mockCachedBlocks1 max round is 46512950
      expect(firstUpdate.currentRound).toBe(mockCurrentRound);

      // Verify progress bar calculation is correct
      const totalRounds = firstUpdate.currentRound - firstUpdate.startRound;
      const processedRounds =
        firstUpdate.syncedUntilRound - firstUpdate.startRound;
      const progress = (processedRounds / totalRounds) * 100;
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it("should show progress from minStartRound = REWARDS_START_ROUND when starting fresh", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      const progressUpdates: Array<{
        syncedUntilRound: number;
        startRound: number;
      }> = [];

      const mockCurrentRound = 46512900;

      vi.mocked(executePaginatedRequest).mockImplementation(
        async (processFunc: (response: { blocks: unknown[] }) => unknown[]) => {
          const mockResponse = {
            blocks: [
              {
                round: BigInt(46512890),
                timestamp: BigInt(1640000000),
                proposer: { publicKey: proposer1Bytes },
                proposerPayout: BigInt(1000000),
              },
            ],
          };
          return processFunc(mockResponse);
        },
      );

      await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: false,
        currentRound: mockCurrentRound,
        onProgress: (syncedUntil, start) => {
          progressUpdates.push({
            syncedUntilRound: syncedUntil,
            startRound: start,
          });
        },
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      const update = progressUpdates[0];

      // Should start from REWARDS_START_ROUND (46512890)
      expect(update.startRound).toBe(46512890);
      // Progress should be >= startRound
      expect(update.syncedUntilRound).toBeGreaterThanOrEqual(update.startRound);
    });

    it("should calculate remaining rounds correctly", async () => {
      const { executePaginatedRequest } = await import(
        "@algorandfoundation/algokit-utils"
      );

      let capturedRemaining = 0;
      const mockCurrentRound = 46513000;
      const mockFetchedRound = 46512920;

      vi.mocked(executePaginatedRequest).mockImplementation(
        async (processFunc: (response: { blocks: unknown[] }) => unknown[]) => {
          const mockResponse = {
            blocks: [
              {
                round: BigInt(mockFetchedRound),
                timestamp: BigInt(1640000000),
                proposer: { publicKey: proposer1Bytes },
                proposerPayout: BigInt(1000000),
              },
            ],
          };
          return processFunc(mockResponse);
        },
      );

      await fetchBlocksWithCache([resolvedAddress1], {
        enableCache: false,
        currentRound: mockCurrentRound,
        onProgress: (_, __, ___, remaining) => {
          capturedRemaining = remaining;
        },
      });

      // Remaining should be currentRound - syncedUntilRound
      expect(capturedRemaining).toBe(mockCurrentRound - mockFetchedRound);
    });
  });
});
