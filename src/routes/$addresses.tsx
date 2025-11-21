import { createFileRoute } from "@tanstack/react-router";
import AddressView from "@/components/address/address-view";
import { ThemeSetting } from "@/components/theme-provider";
import { type Currency, getUserPreferredCurrency } from "@/lib/currencies";

type AddressSearch = {
  hideBalance: boolean;
  theme: ThemeSetting;
  statsPanelTheme: "light" | "indigo";
  enableCache: boolean;
  currency: Currency;
};

export const Route = createFileRoute("/$addresses")({
  component: Address,
  validateSearch: (search: Record<string, unknown>): AddressSearch => {
    return {
      hideBalance: search.hideBalance === true,
      enableCache: search.enableCache === true,
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

      currency:
        typeof search.currency === "string" &&
        ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"].includes(
          search.currency,
        )
          ? (search.currency as Currency)
          : getUserPreferredCurrency(),
    };
  },
});

function Address() {
  const { addresses } = Route.useParams();
  return <AddressView addresses={addresses} />;
}
