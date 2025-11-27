import {
  MinimalBlock,
  fromSerializableBlock,
  toSerializableBlock,
  SerializableBlock,
} from "./block-types";

const DB_NAME = "AlgoNodeRewardsDB";
const DB_VERSION = 1;
const BLOCKS_STORE = "blocks";

interface BlockCache {
  address: string;
  blocks: SerializableBlock[];
  lastUpdated: number;
}

let isIndexedDBAvailable: boolean | null = null;

function checkIndexedDBAvailability(): boolean {
  if (isIndexedDBAvailable !== null) {
    return isIndexedDBAvailable;
  }

  try {
    // Check if indexedDB exists and is accessible
    if (typeof indexedDB === "undefined" || indexedDB === null) {
      isIndexedDBAvailable = false;
      return false;
    }

    // Try to access a property to ensure it's not a restricted context
    // Some contexts throw on property access
    const testAccess = indexedDB.open;
    if (!testAccess) {
      isIndexedDBAvailable = false;
      return false;
    }

    isIndexedDBAvailable = true;
    return true;
  } catch (error) {
    console.warn("IndexedDB is not available in this context:", error);
    isIndexedDBAvailable = false;
    return false;
  }
}

export async function initDB(): Promise<IDBDatabase> {
  // Check availability first without throwing
  if (!checkIndexedDBAvailability()) {
    return Promise.reject(
      new Error("IndexedDB is not available in this context"),
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(
          new Error(
            `Failed to open database: ${request.error}. Operation: initDB`,
          ),
        );
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create the store if it doesn't exist
        if (!db.objectStoreNames.contains(BLOCKS_STORE)) {
          const store = db.createObjectStore(BLOCKS_STORE, {
            keyPath: "address",
          });
          store.createIndex("address", "address", { unique: true });
        }
      };
    } catch (error) {
      reject(new Error(`IndexedDB access denied: ${error}`));
    }
  });
}

export async function getBlocksFromCache(
  address: string,
): Promise<MinimalBlock[] | null> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readonly");
      const store = transaction.objectStore(BLOCKS_STORE);
      const request = store.get(address);

      request.onerror = () => {
        reject(
          new Error(
            `Failed to get blocks for ${address}: ${request.error}. Operation: getBlocksFromCache`,
          ),
        );
      };

      request.onsuccess = () => {
        const result = request.result as BlockCache | undefined;

        if (!result || !result.blocks) {
          resolve(null);
          return;
        }

        const blocks = result.blocks.map(fromSerializableBlock);
        resolve(blocks);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, returning null:", error);
    return null;
  }
}

export async function saveBlocksToCache(
  address: string,
  blocks: MinimalBlock[],
): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readwrite");
      const store = transaction.objectStore(BLOCKS_STORE);
      const serializableBlocks = blocks.map(toSerializableBlock);

      const cache: BlockCache = {
        address,
        blocks: serializableBlocks,
        lastUpdated: Date.now(),
      };

      const request = store.put(cache);

      request.onerror = () => {
        reject(
          new Error(
            `Failed to save blocks for ${address}: ${request.error}. Operation: saveBlocksToCache`,
          ),
        );
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, skipping save:", error);
    // Gracefully continue without caching
    return Promise.resolve();
  }
}

export async function getMaxRoundFromCache(
  address: string,
): Promise<number | null> {
  const blocks = await getBlocksFromCache(address);

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return Math.max(...blocks.map((block) => block.round));
}

export async function clearCacheForAddress(address: string): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readwrite");
      const store = transaction.objectStore(BLOCKS_STORE);
      const request = store.delete(address);

      request.onerror = () => {
        reject(
          new Error(
            `Failed to clear cache for ${address}: ${request.error}. Operation: clearCacheForAddress`,
          ),
        );
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, skipping clear:", error);
    return Promise.resolve();
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readwrite");
      const store = transaction.objectStore(BLOCKS_STORE);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error(`Failed to clear all cache: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve();
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, skipping clear:", error);
    return Promise.resolve();
  }
}

export async function getAllCachedAddresses(): Promise<
  Array<{
    address: string;
    blockCount: number;
    lastUpdated: number;
    sizeInBytes: number;
  }>
> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readonly");
      const store = transaction.objectStore(BLOCKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const allCaches: BlockCache[] = request.result;
        const results = allCaches.map((cache) => {
          const sizeInBytes = new Blob([JSON.stringify(cache)]).size;

          return {
            address: cache.address,
            blockCount: cache.blocks.length,
            lastUpdated: cache.lastUpdated,
            sizeInBytes,
          };
        });
        resolve(results);
      };

      request.onerror = () => {
        reject(
          new Error(`Failed to get all cached addresses: ${request.error}`),
        );
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, returning empty array:", error);
    return [];
  }
}

export async function getCachedAddresses(): Promise<string[]> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readonly");
      const store = transaction.objectStore(BLOCKS_STORE);
      const request = store.getAllKeys();

      request.onerror = () => {
        reject(new Error(`Failed to get cached addresses: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, returning empty array:", error);
    return [];
  }
}

export async function getCacheMetadata(
  address: string,
): Promise<{ lastUpdated: number; blockCount: number } | null> {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOCKS_STORE], "readonly");
      const store = transaction.objectStore(BLOCKS_STORE);
      const request = store.get(address);

      request.onerror = () => {
        reject(
          new Error(
            `Failed to get cache metadata for ${address}: ${request.error}`,
          ),
        );
      };

      request.onsuccess = () => {
        const result = request.result as BlockCache | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        resolve({
          lastUpdated: result.lastUpdated,
          blockCount: result.blocks.length,
        });
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.warn("Cache unavailable, returning null:", error);
    return null;
  }
}
