export type FetchPriceOptions = {
  pair: string;
  timeframe: "1m" | "5m" | "1h" | "4h" | "6h" | "12h" | "1d" | "1w";
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
  prices: Record<string, Record<string, Price>>;
};;
