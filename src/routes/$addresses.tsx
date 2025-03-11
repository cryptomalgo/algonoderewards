import { createFileRoute } from "@tanstack/react-router";
import AddressView from "@/components/address/address-view";

export const Route = createFileRoute("/$addresses")({
  component: Address,
});

function Address() {
  const { addresses } = Route.useParams();
  return <AddressView addresses={addresses} />;
}
