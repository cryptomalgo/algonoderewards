import { useEffect, useState } from "react";
import AlgorandLogo from "@/components/algorand-logo";
import { useAlgoPrice } from "@/hooks/queries/useAlgoPrice";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/mobile-tooltip";
import { useSearch } from "@tanstack/react-router";

type KlineData = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string, // Unused field
];

// Sparkline chart dimensions
const SPARKLINE_WIDTH = 60;
const SPARKLINE_HEIGHT = 20;

// Direct ALGO trading pairs available on Binance
const DIRECT_ALGO_PAIRS: Record<string, string> = {
  USD: "ALGOUSDC",
  USDT: "ALGOUSDT",
};

// Fiat to USDT pairs for conversion (only currencies available on Binance)
const FIAT_TO_USDT: Record<string, string> = {
  EUR: "EURUSDT",
  GBP: "GBPUSDT",
  AUD: "AUDUSDT",
};

// Currencies that need USD conversion via exchange rate API
const NEEDS_USD_CONVERSION = ["JPY", "CAD", "CHF", "CNY"];

export function AlgoPriceTicker() {
  const search = useSearch({ from: "/$addresses" });
  const currency = search.currency || "USD";
  const { data: currentPrice, isLoading: priceLoading } =
    useAlgoPrice(currency);
  const [priceChange, setPriceChange] = useState<{
    percent: number;
    isPositive: boolean;
  } | null>(null);
  const [sparklineData, setSparklineData] = useState<number[]>([]);

  useEffect(() => {
    async function fetch24hData() {
      try {
        let algoData: KlineData[];
        let conversionRate = 1;

        // Get ALGO historical data
        if (DIRECT_ALGO_PAIRS[currency]) {
          // Direct pair available
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${DIRECT_ALGO_PAIRS[currency]}&interval=1h&limit=24`,
          );
          if (!response.ok) return;
          algoData = await response.json();
        } else if (FIAT_TO_USDT[currency]) {
          // Two-step conversion needed
          // Get ALGO/USDT historical data
          const algoResponse = await fetch(
            "https://api.binance.com/api/v3/klines?symbol=ALGOUSDT&interval=1h&limit=24",
          );
          if (!algoResponse.ok) return;
          algoData = await algoResponse.json();

          // Get current fiat/USDT rate for conversion
          const fiatResponse = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${FIAT_TO_USDT[currency]}`,
          );
          if (!fiatResponse.ok) return;
          const fiatData = await fiatResponse.json();
          conversionRate = 1 / parseFloat(fiatData.price);
        } else if (NEEDS_USD_CONVERSION.includes(currency)) {
          // Conversion via USD for currencies not on Binance
          const algoResponse = await fetch(
            "https://api.binance.com/api/v3/klines?symbol=ALGOUSDC&interval=1h&limit=24",
          );
          if (!algoResponse.ok) return;
          algoData = await algoResponse.json();

          // Get exchange rate
          const rateResponse = await fetch(
            "https://api.exchangerate-api.com/v4/latest/USD",
          );
          if (!rateResponse.ok) return;
          const rateData = await rateResponse.json();
          conversionRate = rateData.rates[currency] || 1;
        } else {
          // Fallback to USD
          const response = await fetch(
            "https://api.binance.com/api/v3/klines?symbol=ALGOUSDC&interval=1h&limit=24",
          );
          if (!response.ok) return;
          algoData = await response.json();
        }

        // Extract closing prices and apply conversion if needed
        const closes = algoData.map((k) => parseFloat(k[4]) * conversionRate);
        setSparklineData(closes);

        // Calculate 24h change
        const firstPrice = parseFloat(algoData[0][1]) * conversionRate;
        const lastPrice =
          parseFloat(algoData[algoData.length - 1][4]) * conversionRate;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;

        setPriceChange({
          percent: change,
          isPositive: change >= 0,
        });
      } catch (err) {
        console.error("Failed to fetch 24h price data:", err);
      }
    }

    fetch24hData();
    // Refresh every 5 minutes
    const interval = setInterval(fetch24hData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currency]);

  if (priceLoading || !currentPrice) {
    return null;
  }

  // Normalize sparkline data for SVG (0-1 range)
  const normalizeData = (data: number[]) => {
    if (data.length === 0) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    if (range === 0) return data.map(() => 0.5);
    return data.map((val) => 1 - (val - min) / range); // Invert for SVG coordinates
  };

  const normalized = normalizeData(sparklineData);
  const points = normalized
    .map(
      (y, i) =>
        `${(i / (normalized.length - 1)) * SPARKLINE_WIDTH},${y * SPARKLINE_HEIGHT}`,
    )
    .join(" ");

  // Format price with currency symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href="https://coinmarketcap.com/currencies/algorand/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          {/* Price */}
          <div className="flex items-center gap-1">
            <AlgorandLogo className="h-4 w-4" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentPrice && formatPrice(currentPrice)}
            </span>
          </div>

          {/* Change percentage */}
          {priceChange && (
            <div
              className={`flex items-center gap-0.5 text-xs font-medium ${
                priceChange.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {priceChange.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {priceChange.isPositive ? "+" : ""}
                {priceChange.percent.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Mini sparkline chart */}
          {sparklineData.length > 0 && (
            <svg
              width={SPARKLINE_WIDTH}
              height={SPARKLINE_HEIGHT}
              className="opacity-60"
              viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
            >
              <polyline
                points={points}
                fill="none"
                stroke={priceChange?.isPositive ? "#10b981" : "#ef4444"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div className="font-semibold">ALGO/{currency}</div>
          <div className="text-gray-400">
            24h change: {priceChange?.isPositive ? "+" : ""}
            {priceChange?.percent.toFixed(2)}%
          </div>
          <div className="text-gray-400">Click to view on CoinMarketCap</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
