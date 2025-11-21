export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "CHF"
  | "CNY";

export const CURRENCIES: Array<{
  value: Currency;
  label: string;
  symbol: string;
}> = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "CHF", label: "Swiss Franc", symbol: "Fr" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
];

const DIRECT_ALGO_PAIRS: Record<string, string> = {
  USD: "ALGOUSDC",
  USDT: "ALGOUSDT",
};

const FIAT_TO_USDT: Record<string, string> = {
  EUR: "EURUSDT",
  GBP: "GBPUSDT",
  AUD: "AUDUSDT",
};

const NEEDS_USD_CONVERSION = ["JPY", "CAD", "CHF", "CNY"];

type BinancePrice = {
  symbol: string;
  price: string;
};

type ExchangeRateResponse = {
  rates: Record<string, number>;
};

async function fetchBinancePrice(symbol: string): Promise<number> {
  const response = await fetch(
    `https://www.binance.com/api/v3/ticker/price?symbol=${symbol}`,
  );
  if (!response.ok) {
    throw new Error(`Binance API responded with status: ${response.status}`);
  }
  const data: BinancePrice = await response.json();
  return parseFloat(data.price);
}

async function fetchExchangeRate(targetCurrency: string): Promise<number> {
  const response = await fetch(
    "https://api.exchangerate-api.com/v4/latest/USD",
  );
  if (!response.ok) {
    throw new Error("Exchange rate API failed");
  }
  const data: ExchangeRateResponse = await response.json();
  const rate = data.rates[targetCurrency];
  if (!rate) {
    throw new Error(`Exchange rate for ${targetCurrency} not found`);
  }
  return rate;
}

async function getAlgoPriceInUSD(): Promise<number> {
  return fetchBinancePrice("ALGOUSDC");
}

async function getAlgoPriceInUSDT(): Promise<number> {
  return fetchBinancePrice("ALGOUSDT");
}

async function convertViaFiatToUSDT(currency: string): Promise<number> {
  const [algoInUsdt, fiatInUsdt] = await Promise.all([
    getAlgoPriceInUSDT(),
    fetchBinancePrice(FIAT_TO_USDT[currency]),
  ]);
  return algoInUsdt / fiatInUsdt;
}

async function convertViaUSDExchangeRate(currency: string): Promise<number> {
  const [algoInUsd, exchangeRate] = await Promise.all([
    getAlgoPriceInUSD(),
    fetchExchangeRate(currency),
  ]);
  return algoInUsd * exchangeRate;
}

export async function fetchAlgoPrice(currency: Currency): Promise<number> {
  if (DIRECT_ALGO_PAIRS[currency]) {
    return fetchBinancePrice(DIRECT_ALGO_PAIRS[currency]);
  }

  if (FIAT_TO_USDT[currency]) {
    return convertViaFiatToUSDT(currency);
  }

  if (NEEDS_USD_CONVERSION.includes(currency)) {
    return convertViaUSDExchangeRate(currency);
  }

  return getAlgoPriceInUSD();
}

export function getUserPreferredCurrency(): Currency {
  try {
    const locale = navigator.language || "en-US";
    const parts = locale.split("-");
    const countryCode = parts[1]?.toUpperCase();

    const currencyMap: Record<string, Currency> = {
      US: "USD",
      GB: "GBP",
      EU: "EUR",
      FR: "EUR",
      DE: "EUR",
      IT: "EUR",
      ES: "EUR",
      JP: "JPY",
      AU: "AUD",
      CA: "CAD",
      CH: "CHF",
      CN: "CNY",
    };

    if (countryCode && currencyMap[countryCode]) {
      return currencyMap[countryCode];
    }

    return "USD";
  } catch {
    return "USD";
  }
}
