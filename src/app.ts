import express from 'express';

import { logger } from './logger/logger';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { AddressInfo } from 'net';
import { Config } from './config/types';
import { Context, Price } from './types';

export const reversePrice = (price: Price): Price => {
  return {
    open: 1 / price.open,
    high: 1 / price.high,
    low: 1 / price.low,
    close: 1 / price.close,
    volume: price.volume,
    date: price.date,
  };
};

export const getPrice = (context: Context, pair: string, timeframe: string) => {
  pair = Object.keys(context.replacements).reduce((acc, key) =>{
    acc = acc.replace(key, context.replacements[key]);
    return acc;
  }, pair);

  const prices = Object.keys(context.prices)
    .map(exchange => {
      if (!context.prices[exchange][timeframe] || !context.prices[exchange][timeframe][pair]) {
        return undefined;
      }

      return context.prices[exchange][timeframe][pair];
    })
    .filter(value => value !== undefined)
    .sort((a, b) => (b!.date.getTime() - a!.date.getTime())); // sort in descing order

  return prices;
}

export const startApp = async (config: Config, context: Context) => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json({ type: 'application/json' }));

  const httpServer = http.createServer(app);

  httpServer.listen({
    port: config.port
  });

  const address = httpServer.address();
  let url = 'http://localhost:' + config.port;
  if (typeof address === 'string' && address != '::') {
    url = address;
  } else if (address && (address as AddressInfo).address != '::') {
    url = (address as AddressInfo).address + ':' + (address as AddressInfo).port;
  }

  logger.info(`🚀 Server ready at ${url}`);

  app.get("/prices/:token0/:token1/:timeframe", (req, res) => {
    let pair = `${req.params.token0}/${req.params.token1}`
    let prices = getPrice(context, pair, req.params.timeframe);
    let reversed = false;

    if (prices.length === 0)  {
      pair = `${req.params.token1}/${req.params.token0}`;
      prices = getPrice(context, pair, req.params.timeframe);
      reversed = true;
    }

    if (prices.length === 0) {
      return res.status(404).send();
    }

    return res.status(200).json(reversed ? reversePrice(prices[0]!) : prices[0]);
  });


  return () => {
    logger.warn(`Stopped server at ${url}`);

    return new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve();
      });
    });
  };
};
