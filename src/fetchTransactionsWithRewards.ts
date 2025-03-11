import algosdk from "algosdk";
import { executePaginatedRequest } from "@algorandfoundation/algokit-utils";
import { Block, BlockHeadersResponse } from "algosdk/client/indexer";
import { ResolvedAddress } from "@/components/heatmap/types.ts";

const indexerClient = new algosdk.Indexer(
  "",
  "https://mainnet-idx.4160.nodely.dev",
  443,
);

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

export async function fetchTransactionsWithRewards(
  addresses: ResolvedAddress[],
): Promise<Block[]> {
  return executePaginatedRequest(
    (response: BlockHeadersResponse) => {
      return response.blocks;
    },
    (nextToken) => {
      let s = indexerClient
        .searchForBlockHeaders()
        .minRound(46512890)
        .limit(1000)
        .proposers(addresses.map((a: ResolvedAddress) => a.address));
      if (nextToken) {
        s = s.nextToken(nextToken);
      }
      return s;
    },
  );
}
