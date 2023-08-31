import express from 'express';

import { logger } from './logger/logger';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { AddressInfo } from 'net';
import { Config } from './config/types';
import { Context } from './types';

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
    const pair = `${req.params.token0}/${req.params.token1}`
    const prices = Object.keys(context.prices)
      .map(exchange => {
        if (!context.prices[exchange][req.params.timeframe] || !context.prices[exchange][req.params.timeframe][pair]) {
          return undefined;
        }

        return context.prices[exchange][req.params.timeframe][pair];
      })
      .filter(value => value !== undefined)
      .sort((a, b) => (b!.date.getTime() - a!.date.getTime())); // sort in descing order

    if (prices.length === 0) {
      return res.status(404).send();
    }

    return res.status(200).json(prices[0]);
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
