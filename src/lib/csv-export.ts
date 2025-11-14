import { MinimalBlock } from "@/lib/block-types";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { CSV_COLUMNS, CsvColumnId } from "@/lib/csv-columns.ts";
import { toast } from "sonner";

type BinanceAlgorandUsdcPrice = {
  openTime: number;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  closePrice: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
};

type VestigeAlgorandUsdcPrice = {
  network_id: number;
  asset_id: number;
  interval: number;
  denominating_asset_id: number;
  timestamp: number;
  volume: number;
  tvl: number;
  swaps: number;
  vwap: number;
  confidence: number;
};

// Cache to store prices by date (string in YYYY-MM-DD format)
const binancePriceCache = new Map<string, BinanceAlgorandUsdcPrice>();
const vestigePriceCache = new Map<string, VestigeAlgorandUsdcPrice>();

/**
 * Gets the UTC date string (YYYY-MM-DD) from a timestamp
 */
function getUTCDateString(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split("T")[0];
}

/**
 * Gets the start of day timestamp (in ms) from a date string
 */
function getStartOfDayTimestamp(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getTime();
}

/**
 * Checks if a response is a Binance rate limit error
 */
function isRateLimitError(response: Response): boolean {
  return response.status === 429 || response.status === 418;
}

export async function getAlgorandVestigeUsdcPriceForTimestamp(
  timestamp: number,
) {
  const dateString = getUTCDateString(timestamp);
  // Return cached price if available
  if (vestigePriceCache.has(dateString)) {
    return vestigePriceCache.get(dateString)!;
  }

  const host = "https://api.vestigelabs.org";
  const endpoint = "/assets/0/history"; // 0 Is Algorand
  const USDC_ID = "31566704";

  const searchParams = new URLSearchParams({
    interval: "86400", // Daily
    network_id: "0", // Mainet
    start: String(timestamp),
    end: String(timestamp + 86400), // Next day
    denominating_asset_id: USDC_ID,
  });

  try {
    const response = await fetch(
      `${host}${endpoint}?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Vestige API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No price data available for date: ${dateString}`);
    }

    const price = data[0];

    // Cache the result
    vestigePriceCache.set(dateString, price);

    return price;
  } catch (error) {
    console.error(`Error fetching price for ${dateString}:`, error);
    return null;
  }
}

export async function getAlgorandBinanceUsdcPriceForTimestamp(
  timestamp: number,
): Promise<BinanceAlgorandUsdcPrice | null> {
  const dateString = getUTCDateString(timestamp);

  // Return cached price if available
  if (binancePriceCache.has(dateString)) {
    return binancePriceCache.get(dateString)!;
  }

  // Otherwise fetch from API
  const startOfDayMs = getStartOfDayTimestamp(dateString);

  const host = "https://data-api.binance.vision";
  const symbol = "ALGOUSDC";
  const interval = "1d";
  const endpoint = "api/v3/klines";

  const searchParams = new URLSearchParams({
    symbol,
    interval,
    startTime: String(startOfDayMs),
    limit: "1",
  });

  try {
    const response = await fetch(
      `${host}/${endpoint}?${searchParams.toString()}`,
    );

    // Handle rate limiting
    if (isRateLimitError(response)) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      throw new Error(
        `Rate limited by Binance API. Retry after ${retryAfter} seconds.`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `Binance API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No price data available for date: ${dateString}`);
    }

    const price = {
      openTime: data[0][0],
      openPrice: data[0][1],
      highPrice: data[0][2],
      lowPrice: data[0][3],
      closePrice: data[0][4],
      volume: data[0][5],
      closeTime: data[0][6],
      quoteAssetVolume: data[0][7],
      numberOfTrades: data[0][8],
      takerBuyBaseAssetVolume: data[0][9],
      takerBuyQuoteAssetVolume: data[0][10],
    };

    // Cache the result
    binancePriceCache.set(dateString, price);

    return price;
  } catch (error) {
    console.error(`Error fetching price for ${dateString}:`, error);
    return null;
  }
}

/**
 * Pre-loads price data for all days between first and last block timestamps
 */
async function preloadBinancePriceData(
  blocks: MinimalBlock[],
): Promise<boolean> {
  if (!blocks || blocks.length === 0) return true;

  // Find min and max timestamps
  const timestamps = blocks.map((block) => block.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  const minDate = getUTCDateString(minTimestamp);
  const maxDate = getUTCDateString(maxTimestamp);

  const startDate = new Date(`${minDate}T00:00:00Z`);
  const endDate = new Date(`${maxDate}T00:00:00Z`);

  // Generate array of all dates between min and max
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  let hasRateLimitError = false;

  // Pre-fetch all prices in batches
  const batchSize = 15;
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (dateStr) => {
        if (!binancePriceCache.has(dateStr)) {
          const timestamp = getStartOfDayTimestamp(dateStr) / 1000; // Convert to seconds
          try {
            const result =
              await getAlgorandBinanceUsdcPriceForTimestamp(timestamp);
            return { dateStr, success: !!result, rateLimited: false };
          } catch (error) {
            const isRateLimit =
              error instanceof Error && error.message.includes("Rate limited");
            if (isRateLimit) {
              hasRateLimitError = true;
              return { dateStr, success: false, rateLimited: true };
            }
            return { dateStr, success: false, rateLimited: false };
          }
        }
        return { dateStr, success: true, rateLimited: false };
      }),
    );

    // If we hit a rate limit, stop fetching more data
    if (results.some((r) => r.rateLimited)) {
      hasRateLimitError = true;
      break;
    }

    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < dates.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return !hasRateLimitError;
}

async function preloadVestigePriceData(
  blocks: MinimalBlock[],
): Promise<boolean> {
  if (!blocks || blocks.length === 0) return true;

  // Find min and max timestamps
  const timestamps = blocks.map((block) => block.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  const minDate = getUTCDateString(minTimestamp);
  const maxDate = getUTCDateString(maxTimestamp);

  const startDate = new Date(`${minDate}T00:00:00Z`);
  const endDate = new Date(`${maxDate}T00:00:00Z`);

  // Generate array of all dates between min and max
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  let hasRateLimitError = false;

  // Pre-fetch all prices in batches
  const batchSize = 15;
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (dateStr) => {
        if (!vestigePriceCache.has(dateStr)) {
          try {
            await getAlgorandVestigeUsdcPriceForTimestamp(
              getStartOfDayTimestamp(dateStr) / 1000,
            );
          } catch (error) {
            hasRateLimitError =
              error instanceof Error && error.message.includes("Rate limited");
          }
        }
      }),
    );

    // If we hit a rate limit, stop fetching more data
    if (hasRateLimitError) break;

    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < dates.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return !hasRateLimitError;
}

// Column resolver type definition
type ColumnResolver = (
  block: MinimalBlock,
  binancePrice?: BinanceAlgorandUsdcPrice | null,
  vestigePrice?: VestigeAlgorandUsdcPrice | null,
) => string;

// Map of column resolvers
const columnResolvers: Record<CsvColumnId, ColumnResolver> = {
  timestamp: (block) => String(block.timestamp),
  utc_date: (block) =>
    new Date(block.timestamp * 1000).toISOString().split("T")[0],
  utc_time: (block) =>
    new Date(block.timestamp * 1000).toISOString().split("T")[1],
  address: (block) => block.proposer?.toString() || "",
  round: (block) => String(block.round),
  payout_micro_algo: (block) => String(block.proposerPayout || 0),
  payout_algo: (block) =>
    new AlgoAmount({ microAlgos: block.proposerPayout ?? 0 }).algos.toString(),
  vestige_vwap: (_block, _binancePrice, vestigePrice) =>
    vestigePrice?.vwap.toString() || "",
  binance_open_time: (_, price) => (price ? String(price.openTime) : ""),
  binance_close_time: (_, price) => (price ? String(price.closeTime) : ""),
  binance_open_price: (_, price) => (price ? price.openPrice : ""),
  binance_close_price: (_, price) => (price ? price.closePrice : ""),
  binance_high_price: (_, price) => (price ? price.highPrice : ""),
  binance_low_price: (_, price) => (price ? price.lowPrice : ""),
};

// Generate CSV header based on selected columns
function generateCsvHeader(selectedColumns: CsvColumnId[]): string {
  return selectedColumns
    .map((colId) => {
      const column = CSV_COLUMNS.find((col) => col.id === colId);
      return column ? column.label : colId;
    })
    .join(",");
}

// Generate a CSV row for a single block
async function generateCsvRow(
  block: MinimalBlock,
  selectedColumns: CsvColumnId[],
): Promise<string> {
  // Get price data for this block's date
  let binancePrice: BinanceAlgorandUsdcPrice | null = null;
  let vestigePrice: VestigeAlgorandUsdcPrice | null = null;

  const needsBinancePriceData = selectedColumns.some((col) =>
    col.startsWith("binance_"),
  );

  const needsVestigePriceData = selectedColumns.some((col) =>
    col.startsWith("vestige_"),
  );

  if (needsBinancePriceData) {
    const dateString = getUTCDateString(block.timestamp);
    if (binancePriceCache.has(dateString)) {
      binancePrice = binancePriceCache.get(dateString)!;
    }
  }

  if (needsVestigePriceData) {
    const dateString = getUTCDateString(block.timestamp);
    if (vestigePriceCache.has(dateString)) {
      vestigePrice = vestigePriceCache.get(dateString)!;
    }
  }

  // Generate CSV cells for selected columns
  const values = selectedColumns.map((colId) => {
    const resolver = columnResolvers[colId];
    return resolver(block, binancePrice, vestigePrice);
  });

  return values.join(",");
}

export async function exportBlocksToCsv(
  blocks: MinimalBlock[],
  columns: CsvColumnId[],
  includeHeader: boolean,
): Promise<void> {
  if (!blocks || blocks.length === 0) {
    console.error("No blocks available to export.");
    return;
  }

  // Pre-load all price data if we need Binance columns
  const needsBinancePriceData = columns.some((col) =>
    col.startsWith("binance_"),
  );
  let binancePreloadSuccess = true;

  if (needsBinancePriceData) {
    binancePreloadSuccess = await preloadBinancePriceData(blocks);

    if (!binancePreloadSuccess) {
      toast.error("Binance API Rate Limit", {
        description:
          "Some price data could not be retrieved due to rate limiting. Missing prices will be blank in the CSV. You can try again later for complete data.",
        duration: 5000,
      });
    }
  }

  // Pre-load Vestige price data if needed
  const needsVestigePriceData = columns.some((col) =>
    col.startsWith("vestige_"),
  );
  let vestigePreloadSuccess = true;
  if (needsVestigePriceData) {
    vestigePreloadSuccess = await preloadVestigePriceData(blocks);
    if (!vestigePreloadSuccess) {
      toast.error("Vestige API Rate Limit", {
        description:
          "Some price data could not be retrieved due to rate limiting. Missing prices will be blank in the CSV. You can try again later for complete data.",
        duration: 5000,
      });
    }
  }

  // Generate the CSV header if needed
  const csvHeader = includeHeader ? generateCsvHeader(columns) : "";

  // Generate CSV rows
  const csvRows = await Promise.all(
    blocks.map((block) => generateCsvRow(block, columns)),
  );

  // Combine header and rows
  const csvContent = csvRows.join("\n");

  // Download the CSV file
  downloadCsv(includeHeader ? csvHeader + "\n" : "", csvContent);
}

function downloadCsv(csvHeader: string, csvContent: string): void {
  const csvData = `${csvHeader}${csvContent}`;
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `algonoderewards_${new Date().toISOString()}.csv`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("CSV file downloaded successfully", {
    description: `Your CSV file ${filename} is downloaded.`,
  });
}
