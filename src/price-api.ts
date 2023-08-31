import { Exchange, binance, coinbase } from "ccxt";
import { Context, FetchPriceOptions, Price, Timeframe } from "./types";
import logger from "@mangrovedao/mangrove.js/dist/nodejs/util/logger";

export const getPriceFromExchange = async(exchange: Exchange, options: FetchPriceOptions): Promise<Price> => {
  const result = await exchange.fetchOHLCV(options.pair, options.timeframe, options.since.getTime(), options.limit);

  if (!result || result.length == 0) {
    throw new Error(`Didn't receive price for exchange ${exchange.name}`);
  }

  logger.info(`Successfully get price for ${exchange.name}, ${options.pair}, ${options.timeframe}`);

  return {
    open: result[0][1],
    high: result[0][2],
    low: result[0][3],
    close: result[0][4],
    volume: result[0][5],
    date: new Date(result[0][0]),
  };
};

export const getExchange = (name: string) => {
  if (name == "binance") {
    return new binance();
  }
  if (name == "coinbase") {
    return new coinbase();
  }
  throw new Error(`Exchange unknown ${name}`);
};

export const timeframeToIntervalMs = (timeframe: Timeframe) => {
  if (timeframe === "1m") {
    return 60 * 1000;
  }
  if (timeframe === "5m") {
    return 5 * 60 * 1000;
  }
  if (timeframe === "1h") {
    return 60 * 60 * 1000;
  }
  if (timeframe === "4h") {
    return 4 * 60 * 60 * 1000;
  }
  if (timeframe === "6h") {
    return 6 * 60 * 60 * 1000;
  }
  if (timeframe === "12h") {
    return 12 * 60 * 60 * 1000;
  }
  if (timeframe === "1d") {
    return 24 * 60 * 60 * 1000;
  }
  if (timeframe === "1w") {
    return 7 * 24 * 60 * 60 * 1000;
  }

  throw new Error(`Missing timeframe support for ${timeframe}`)
}

export const generateGetPriceEveryXMs = (context: Context, exchange: string, pairs: string[]) => {
  const _exchange = getExchange(exchange);

  return async(timeframe: Timeframe) => {
    const ms = timeframeToIntervalMs(timeframe);
    const fn = async() => {
      const result =
        await Promise.all(pairs
        .map(async pair => await getPriceFromExchange(_exchange, {
          pair,
          timeframe: timeframe,
          since: new Date(Date.now() - ms),
          limit: 1,
        })));
      
      let exchangeValue = context.prices[exchange];
      if (!exchangeValue) {
        context.prices[exchange] = {}
        exchangeValue = context.prices[exchange];
      }

      let timeframeValue = context.prices[exchange][timeframe];
      if (!timeframeValue) {
        context.prices[exchange][timeframe] = {};
        timeframeValue = context.prices[exchange][timeframe];
      }

      result.forEach((price, index) => {
        const pair = pairs[index];
        context.prices[exchange][timeframe][pair] = price;
      });

    };
    await fn();

    const id = setInterval(fn, ms); 

    return () => {
      clearInterval(id);
    }
  }
}; 
