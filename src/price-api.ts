import { Exchange, binance, coinbase } from "ccxt";
import { Context, FetchPriceOptions, Price } from "./types";

export const getPriceFromExchange = async(exchange: Exchange, options: FetchPriceOptions): Promise<Price> => {
  const result = await exchange.fetchOHLCV(options.pair, options.timeframe, options.since.getTime(), options.limit);

  if (!result || result.length == 0) {
    throw new Error(`Didn't receive price for exchange ${exchange.name}`);
  }

  return {
    open: result[0][1],
    high: result[0][2],
    low: result[0][3],
    close: result[0][4],
    volume: result[0][5],
    date: new Date(result[0][0]),
  };
};

export const getPriceEveryXMinutes = (context: Context, exchangeAssets: Record<string, string[]>, minutes: number) => {
  const exchanges = Object.keys(exchangeAssets).map(key => {
    if (key == "binance") {
      return {
        exchange: new binance(),
        pairs: exchangeAssets[key],
      }
    }
    if (key == "coinbase") {
      return {
        exchange: new coinbase(),
        pairs: exchangeAssets[key],
      }
    }

    return undefined;
  }).filter(value => value !== undefined);

  return () => {
    const fn = async() => {
      const result = await Promise.all(exchanges.map(exchangeAndPairs => Promise.all(exchangeAndPairs!
        .pairs
        .map(async pair => await getPriceFromExchange(exchangeAndPairs!.exchange, {
          pair,
          timeframe: "1m",
          since: new Date(Date.now() - 60 * 1000),
          limit: 1,
        }))),
      ));

      console.log(result);
    };
    fn();

    const id = setInterval(fn, minutes * 60 * 1000); 

    return () => {
      clearInterval(id);
    }
  }
}; 
