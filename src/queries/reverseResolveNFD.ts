interface NFDRecord {
  depositAccount: string;
  name: string;
  owner: string;
}

/**
 * Reverse lookup: resolves an Algorand address to its primary NFD name
 * @param address - The Algorand address to lookup
 * @returns The primary NFD name (without .algo suffix) or empty string if none found
 */
export async function reverseResolveNFD(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.nf.domains/nfd/lookup?address=${address}&view=tiny&allowUnverified=true`,
    );

    if (!response.ok) {
      throw new Error(`No NFD found for address: ${address}`);
    }

    const data: Record<string, NFDRecord> = await response.json();

    // The API returns an object with the address as key
    const nfdRecord = data[address];

    if (!nfdRecord?.name) {
      return "";
    }

    // Remove .algo suffix if present
    return nfdRecord.name.replace(/\.algo$/, "");
  } catch (error) {
    console.error("Error reverse resolving NFD:", error);
    return "";
  }
}
