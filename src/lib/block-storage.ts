import {
  MinimalBlock,
  fromSerializableBlock,
  toSerializableBlock,
  SerializableBlock,
} from "./block-types";

const DB_NAME = "AlgoNodeRewardsDB";
const DB_VERSION = 2; // Incremented to migrate from base64 to address format
const BLOCKS_STORE = "blocks";

interface BlockCache {
  address: string;
  blocks: SerializableBlock[];
  lastUpdated: number;
}

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      // Version 1 -> 2: Clear old cache with base64 proposer format
      if (oldVersion < 2) {
        // Clear all existing data since proposer format changed from base64 to address
        if (db.objectStoreNames.contains(BLOCKS_STORE)) {
          db.deleteObjectStore(BLOCKS_STORE);
        }
      }

      // Create or recreate the store
      if (!db.objectStoreNames.contains(BLOCKS_STORE)) {
        const store = db.createObjectStore(BLOCKS_STORE, {
          keyPath: "address",
        });
        store.createIndex("address", "address", { unique: true });
      }
    };
  });
}

export async function getBlocksFromCache(
  address: string,
): Promise<MinimalBlock[] | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BLOCKS_STORE], "readonly");
    const store = transaction.objectStore(BLOCKS_STORE);
    const request = store.get(address);

    request.onerror = () => {
      reject(
        new Error(`Failed to get blocks for ${address}: ${request.error}`),
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
}

export async function saveBlocksToCache(
  address: string,
  blocks: MinimalBlock[],
): Promise<void> {
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
        new Error(`Failed to save blocks for ${address}: ${request.error}`),
      );
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
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
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BLOCKS_STORE], "readwrite");
    const store = transaction.objectStore(BLOCKS_STORE);
    const request = store.delete(address);

    request.onerror = () => {
      reject(
        new Error(`Failed to clear cache for ${address}: ${request.error}`),
      );
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function clearAllCache(): Promise<void> {
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
}

export async function getAllCachedAddresses(): Promise<
  Array<{
    address: string;
    blockCount: number;
    lastUpdated: number;
    sizeInBytes: number;
  }>
> {
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
      reject(new Error(`Failed to get all cached addresses: ${request.error}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export async function getCachedAddresses(): Promise<string[]> {
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
}

export async function getCacheMetadata(
  address: string,
): Promise<{ lastUpdated: number; blockCount: number } | null> {
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
}
