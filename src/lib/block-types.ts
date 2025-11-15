import { encodeAddress } from "algosdk";

export interface MinimalBlock {
  round: number;
  timestamp: number;
  proposer: string; // Algorand address string
  proposerPayout: number;
}

export interface SerializableBlock {
  round: number;
  timestamp: number;
  proposer: string; // Algorand address string
  proposerPayout: number;
}

function extractProposerBytes(
  proposer: Uint8Array | { publicKey: Uint8Array } | unknown,
): Uint8Array | null {
  if (proposer instanceof Uint8Array) {
    return proposer;
  }
  if (
    typeof proposer === "object" &&
    proposer !== null &&
    "publicKey" in proposer
  ) {
    return (proposer as { publicKey: Uint8Array }).publicKey;
  }
  return null;
}

export function toMinimalBlock(block: {
  round?: number | bigint;
  timestamp?: number | bigint;
  proposer?: Uint8Array | { publicKey: Uint8Array } | unknown;
  proposerPayout?: number | bigint;
}): MinimalBlock | null {
  if (
    block.round === undefined ||
    block.timestamp === undefined ||
    !block.proposer ||
    block.proposerPayout === undefined ||
    Number(block.proposerPayout) <= 0
  ) {
    return null;
  }

  const proposerBytes = extractProposerBytes(block.proposer);
  if (!proposerBytes) {
    return null;
  }

  // Store proposer as Algorand address string instead of base64
  // This makes filtering more efficient and the data more readable
  return {
    round: Number(block.round),
    timestamp: Number(block.timestamp),
    proposer: encodeAddress(proposerBytes),
    proposerPayout: Number(block.proposerPayout),
  };
}

export function toSerializableBlock(block: MinimalBlock): SerializableBlock {
  return {
    round: block.round,
    timestamp: block.timestamp,
    proposer: block.proposer,
    proposerPayout: block.proposerPayout,
  };
}

export function fromSerializableBlock(block: SerializableBlock): MinimalBlock {
  return {
    round: block.round,
    timestamp: block.timestamp,
    proposer: block.proposer,
    proposerPayout: block.proposerPayout,
  };
}
