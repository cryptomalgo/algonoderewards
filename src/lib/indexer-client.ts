import algosdk from "algosdk";

export const indexerClient = new algosdk.Indexer(
  "",
  "https://mainnet-idx.4160.nodely.dev",
  443,
);
