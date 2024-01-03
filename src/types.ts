export type Timeframe = "1m" | "5m" | "1h" | "4h" | "6h" | "12h" | "1d" | "1w";

export type FetchPriceOptions = {
  pair: string;
  timeframe: Timeframe; 
  since: Date,
  limit: number,
};

export type Price = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: Date;
};

export type Context = {
  replacements: Record<string, string>;
  prices: Record<string, Record<string, Record<string, Price>>>;
};;
