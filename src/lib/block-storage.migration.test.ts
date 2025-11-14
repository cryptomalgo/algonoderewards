import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { initDB, clearAllCache } from "@/lib/block-storage";
import { useBlocksStats } from "@/hooks/useBlocksStats";
import { MinimalBlock, fromSerializableBlock } from "@/lib/block-types";

describe("Legacy cache format compatibility", () => {
  const testAddress =
    "CEX4PWPMPIR32NUAJHRA6T2YSRW3JZYL23VL4UTEZMWUHHTBO22C3HC4SU";

  beforeEach(async () => {
    await clearAllCache();
  });

  it("should handle old cache data with base64 proposer format", async () => {
    const db = await initDB();

    // Simulate old cache format with base64 proposer (the old format we just changed from)
    const oldCacheData = {
      address: testAddress,
      blocks: [
        {
          round: 46512900,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
          proposer: "AQIDBA==", // Base64 encoded bytes (old format)
          proposerPayout: 1000000,
        },
        {
          round: 46512950,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
          proposer: "AQIDBA==", // Base64 encoded bytes (old format)
          proposerPayout: 2000000,
        },
      ],
      lastUpdated: Date.now(),
    };

    // Manually insert old format data into cache
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(["blocks"], "readwrite");
      const store = transaction.objectStore("blocks");
      const request = store.put(oldCacheData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    db.close();

    // Now try to load this old data
    const dbRead = await initDB();
    const loadedBlocks = await new Promise<MinimalBlock[] | null>(
      (resolve, reject) => {
        const transaction = dbRead.transaction(["blocks"], "readonly");
        const store = transaction.objectStore("blocks");
        const request = store.get(testAddress);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (!result || !result.blocks) {
            resolve(null);
            return;
          }
          resolve(result.blocks.map(fromSerializableBlock));
        };
      },
    );

    dbRead.close();

    expect(loadedBlocks).not.toBeNull();
    expect(loadedBlocks).toHaveLength(2);

    // The old base64 format won't match the address string
    expect(loadedBlocks![0].proposer).toBe("AQIDBA==");
    expect(loadedBlocks![0].proposer).not.toBe(testAddress);

    // Stats will be zero because proposer doesn't match when filtering
    const { result } = renderHook(() => useBlocksStats(loadedBlocks!));

    // Stats should still work if we're not filtering by address
    expect(result.current.totalRewards).toBe(3000000);
    expect(result.current.totalNbOfBlocksWithRewards).toBe(2);
  });

  it("should identify cache format mismatch", async () => {
    const db = await initDB();

    // Old format with base64
    const oldCacheData = {
      address: testAddress,
      blocks: [
        {
          round: 46512900,
          timestamp: Math.floor(Date.now() / 1000),
          proposer: "AQIDBA==",
          proposerPayout: 1000000,
        },
      ],
      lastUpdated: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(["blocks"], "readwrite");
      const store = transaction.objectStore("blocks");
      const request = store.put(oldCacheData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    db.close();

    // Load and check format
    const dbRead = await initDB();
    const result = await new Promise<{
      blocks: { proposer: string }[];
    } | null>((resolve, reject) => {
      const transaction = dbRead.transaction(["blocks"], "readonly");
      const store = transaction.objectStore("blocks");
      const request = store.get(testAddress);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    dbRead.close();

    expect(result).not.toBeNull();
    const proposer = result!.blocks[0].proposer;

    // Check if it's base64 (old format) vs address (new format)
    const isBase64 =
      /^[A-Za-z0-9+/]+=*$/.test(proposer) && proposer.length < 58;
    const isAddress = /^[A-Z2-7]{58}$/.test(proposer);

    expect(isBase64).toBe(true);
    expect(isAddress).toBe(false);

    // This indicates the cache needs to be cleared/migrated
  });
});
