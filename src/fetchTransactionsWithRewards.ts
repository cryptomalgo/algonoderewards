import algosdk from "algosdk";
import { executePaginatedRequest } from "@algorandfoundation/algokit-utils";
import { Transaction, TransactionsResponse } from "algosdk/client/indexer";

const FEE_SINK = "Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA";

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
    return data.owner;
  } catch (error) {
    console.error("Error resolving NFD:", error);
    return "";
  }
}

export async function fetchTransactionsWithRewards(
  address: string,
): Promise<Transaction[]> {
  const transactions = await executePaginatedRequest(
    (response: TransactionsResponse) => {
      return response.transactions;
    },
    (nextToken) => {
      let s = indexerClient
        .lookupAccountTransactions(address)
        .notePrefix(btoa("ProposerPayout"))
        .txType("pay")
        .limit(1000);
      if (nextToken) {
        s = s.nextToken(nextToken);
      }
      return s;
    },
  );

  return transactions.filter((transaction) => transaction.sender === FEE_SINK);
}
