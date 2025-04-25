import { executePaginatedRequest } from "@algorandfoundation/algokit-utils";
import { Block, BlockHeadersResponse } from "algosdk/client/indexer";
import { ResolvedAddress } from "@/components/heatmap/types.ts";
import { indexerClient } from "@/lib/indexer-client";

export async function getAccountsBlockHeaders(
  addresses: ResolvedAddress[],
): Promise<Block[]> {
  const blocks = await executePaginatedRequest(
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
  return blocks.filter(
    (block) => block.proposerPayout && block.proposerPayout > 0,
  );
}
