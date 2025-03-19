export type CsvColumnId =
  | "timestamp"
  | "utc_date"
  | "utc_time"
  | "address"
  | "round"
  | "payout_micro_algo"
  | "payout_algo"
  | "vestige_vwap"
  | "binance_open_time"
  | "binance_close_time"
  | "binance_open_price"
  | "binance_close_price"
  | "binance_high_price"
  | "binance_low_price";

export type CsvColumn = {
  id: CsvColumnId;
  label: string;
  isPriceColumn: boolean;
  example?: string;
  help?: string;
};

export const CSV_COLUMNS: CsvColumn[] = [
  {
    id: "timestamp",
    label: "Timestamp",
    isPriceColumn: false,
    example: "1651234567",
    help: "Unix timestamp (seconds since epoch) of the block proposal",
  },
  {
    id: "utc_date",
    label: "UTC Date",
    isPriceColumn: false,
    example: "2023-05-01",
    help: "Calendar date in YYYY-MM-DD format (UTC Timezone)",
  },
  {
    id: "utc_time",
    label: "UTC Time",
    isPriceColumn: false,
    example: "12:34:56Z",
    help: "Time of day in HH:MM:SSZ format (UTC Timezone)",
  },
  {
    id: "address",
    label: "Address",
    isPriceColumn: false,
    example: "ABC...XYZ",
    help: "Algorand wallet address of the block proposer",
  },
  {
    id: "round",
    label: "Round",
    isPriceColumn: false,
    example: "25123456",
    help: "Algorand block round number",
  },
  {
    id: "payout_micro_algo",
    label: "Payout (microAlgo)",
    isPriceColumn: false,
    example: "1234567",
    help: "Block proposer reward in microAlgos (1 Algo = 1,000,000 microAlgos)",
  },
  {
    id: "payout_algo",
    label: "Payout (Algo)",
    isPriceColumn: false,
    example: "1.234567",
    help: "Block proposer reward converted to Algo units",
  },
  {
    id: "vestige_vwap",
    label: "Vestige VWAP (USDC)",
    isPriceColumn: true,
    example: "0.123456",
    help: "Vestige's volume-weighted average price (in USDC) for Algorand for a given day (UTC)",
  },
  {
    id: "binance_open_time",
    label: "Binance Open Time",
    isPriceColumn: true,
    example: "1651219200000",
    help: "Timestamp for the start of the day's trading period on Binance",
  },
  {
    id: "binance_close_time",
    label: "Binance Close Time",
    isPriceColumn: true,
    example: "1651305599999",
    help: "Timestamp for the end of the day's trading period on Binance",
  },
  {
    id: "binance_open_price",
    label: "Binance Open Price (USDC)",
    isPriceColumn: true,
    example: "0.29450000",
    help: "Opening price of Algorand in USDC for the day",
  },
  {
    id: "binance_close_price",
    label: "Binance Close Price (USDC)",
    isPriceColumn: true,
    example: "0.29750000",
    help: "Closing price of Algorand in USDC for the day",
  },
  {
    id: "binance_high_price",
    label: "Binance High Price (USDC)",
    isPriceColumn: true,
    example: "0.30100000",
    help: "Highest price of Algorand in USDC during the day",
  },
  {
    id: "binance_low_price",
    label: "Binance Low Price (USDC)",
    isPriceColumn: true,
    example: "0.28950000",
    help: "Lowest price of Algorand in USDC during the day",
  },
];
