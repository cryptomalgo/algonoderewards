import Dexie, { type EntityTable } from "dexie";

interface Reward {
  id: number;
  address: string;
  reward: number;
  timestamp: number;
}

const db = new Dexie("AlgorandDB") as Dexie & {
  rewards: EntityTable<Reward, "id">;
};

db.version(1).stores({
  rewards: "++id, address, reward, timestamp", // primary key and indexes
});

export type { Reward };
export { db };
