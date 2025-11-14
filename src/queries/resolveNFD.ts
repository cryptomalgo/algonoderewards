interface NFDRecord {
  depositAccount: string;
  name: string;
  owner: string;
}

/**
 * Resolves an NFD name to its Algorand address
 * @param nfd - The NFD name (e.g., "silvio.algo")
 * @returns The Algorand address associated with the NFD
 */
export async function resolveNFD(nfd: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.nf.domains/nfd/${nfd.toLowerCase()}`,
    );

    if (!response.ok) {
      throw new Error(`NFD not found: ${nfd}`);
    }

    const data: NFDRecord = await response.json();
    return data.depositAccount;
  } catch (error) {
    console.error("Error resolving NFD:", error);
    return "";
  }
}
