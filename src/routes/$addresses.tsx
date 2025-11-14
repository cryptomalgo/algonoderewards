import { createFileRoute } from "@tanstack/react-router";
import AddressView from "@/components/address/address-view";
import { ThemeSetting } from "@/components/theme-provider";

type AddressSearch = {
  hideBalance: boolean;
  theme: ThemeSetting;
  statsPanelTheme: "light" | "indigo";
  disableCache: boolean;
};

export const Route = createFileRoute("/$addresses")({
  component: Address,
  validateSearch: (search: Record<string, unknown>): AddressSearch => {
    return {
      hideBalance: search.hideBalance === true,
      disableCache: search.disableCache !== false,
      statsPanelTheme:
        typeof search.statsPanelTheme === "string" &&
        ["light", "indigo"].includes(search.statsPanelTheme)
          ? (search.statsPanelTheme as "light" | "indigo")
          : "indigo",

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
