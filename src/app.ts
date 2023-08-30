import express from 'express';

import { logger } from './logger/logger';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { AddressInfo } from 'net';
import { Config } from './config/types';

export const startApp = async (config: Config) => {
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

  return () => {
    logger.warn(`Stopped server at ${url}`);

    return new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve();
      });
    });
  };
};
