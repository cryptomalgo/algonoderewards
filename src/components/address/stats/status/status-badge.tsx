import { DotBadge } from "@/components/dot-badge";
import { Account } from "algosdk/client/indexer";

export function StatusBadge({ account }: { account: Account }) {
  if (account.status === "Offline") {
    return <DotBadge className="text-md" color="red" label="Node offline" />;
  }
  if (account.status === "Online") {
    return <DotBadge className="text-md" color="green" label="Node online" />;
  }
  return null;
}
