import * as dotenv from 'dotenv';
dotenv.config();

import { enableLogging } from './logger/logger';
import { handleErrors } from './errors';
import { getConfig } from './config/configUtils';
import { generateGetPriceEveryXMs } from './price-api';
import { Context, Timeframe } from './types';
import { startApp } from './app';
import logger from '@mangrovedao/mangrove.js/dist/nodejs/util/logger';

async function main() {
  enableLogging();

  handleErrors();
 
  const config = getConfig();

  const context: Context = {
    prices: {},
    replacements: config.replacements,
  };

  logger.info("Start app with params", {
    data: config,
  });

  const timersFns = Object.keys(config.exchangeAssets).map(exchange => generateGetPriceEveryXMs(context, exchange, config.exchangeAssets[exchange].pairs));

  const stops = await Promise.all(Object.keys(config.exchangeAssets).map(async(exchange, index) => {
    const stops = await Promise.all(config.exchangeAssets[exchange].timeframes
      .map(timeframe => timersFns[index](timeframe as Timeframe)));

    return () => {
      stops.forEach(stop => stop());
    };
  }));

  startApp(config, context);
};

main();
