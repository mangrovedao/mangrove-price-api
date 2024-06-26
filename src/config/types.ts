export type Config = {
  port: number;
  exchangeAssets: Record<
    string,
    {
      pairs: string[];
      timeframes: string[];
    }
  >;
  replacements: Record<string, string>;
  defaultExchange: string;
};
