// Note: This is a custom hook using useEffect, not React Query
// Kept as-is since it has its own caching mechanism
import { useEffect, useState } from "react";

type BinancePrice = {
  symbol: string;
  price: string;
};

// Cache the price data with timestamp
let priceCache: {
  price: number;
  timestamp: number;
} | null = null;

// Cache validity in milliseconds (5 minutes)
const CACHE_VALIDITY = 5 * 60 * 1000;

// Pending request promise
let pendingRequest: Promise<number> | null = null;

export function useAlgoPrice() {
  const [price, setPrice] = useState<number | null>(priceCache?.price || null);
  const [loading, setLoading] = useState(!priceCache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      // Return cached price if it's still valid
      if (priceCache && Date.now() - priceCache.timestamp < CACHE_VALIDITY) {
        setPrice(priceCache.price);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // If there's already a pending request, reuse it
        if (!pendingRequest) {
          pendingRequest = fetch(
            "https://www.binance.com/api/v3/ticker/price?symbol=ALGOUSDC",
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Binance API responded with status: ${response.status}`,
                );
              }
              return response.json();
            })
            .then((data: BinancePrice) => {
              const numericPrice = parseFloat(data.price);

              // Update cache
              priceCache = {
                price: numericPrice,
                timestamp: Date.now(),
              };

              // Clear the pending request reference
              setTimeout(() => {
                pendingRequest = null;
              }, 0);

              return numericPrice;
            });
        }

        // Use the shared promise
        const numericPrice = await pendingRequest;
        setPrice(numericPrice);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        // Clear pending request on error
        pendingRequest = null;
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
  }, []);

  return { price, loading, error };
}
