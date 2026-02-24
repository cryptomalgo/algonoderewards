import algoPriceHistory from "../data/algo-price-history.json";

const priceMap = algoPriceHistory as Record<string, number>;

/**
 * Returns the ALGO/USDT closing price for a given date.
 * @param date YYYY-MM-DD format
 * @returns number | null
 */
export function getAlgoUsdPrice(date: string): number | null {
  return priceMap[date] || null;
}

/**
 * Returns the ALGO price in a target fiat currency using a provided USD exchange rate.
 * @param date YYYY-MM-DD format
 * @param usdToFiat The exchange rate from USD to the target fiat (e.g., USD/AUD rate)
 * @returns number | null
 */
export function getAlgoFiatPrice(
  date: string,
  usdToFiat: number,
): number | null {
  const usdPrice = getAlgoUsdPrice(date);
  return usdPrice ? usdPrice * usdToFiat : null;
}
