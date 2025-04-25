export async function resolveNFD(nfd: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.nf.domains/nfd/${nfd.toLowerCase()}`,
    );
    const data = await response.json();
    return data.depositAccount;
  } catch (error) {
    console.error("Error resolving NFD:", error);
    return "";
  }
}
