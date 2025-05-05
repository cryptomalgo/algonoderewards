import { createFileRoute } from "@tanstack/react-router";
import AddressView from "@/components/address/address-view";
import { ThemeSetting } from "@/components/theme-provider";

type AddressSearch = {
  hideBalance: boolean;
  theme: ThemeSetting;
};

export const Route = createFileRoute("/$addresses")({
  component: Address,
  validateSearch: (search: Record<string, unknown>): AddressSearch => {
    return {
      hideBalance: search.hideBalance === true,
      theme:
        typeof search.theme === "string" &&
        ["dark", "light", "system"].includes(search.theme)
          ? (search.theme as ThemeSetting)
          : "system",
    };
  },
});

function Address() {
  const { addresses } = Route.useParams();
  return <AddressView addresses={addresses} />;
}
