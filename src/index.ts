import * as dotenv from 'dotenv';
dotenv.config();

import { startApp } from './app';
import { enableLogging } from './logger/logger';
import { handleErrors } from './errors';
import { getConfig } from './config/configUtils';
import { binance } from 'ccxt';
import { getPriceEveryXMinutes, getPriceFromExchange } from './price-api';
import { Price } from './types';

async function main() {
  enableLogging();

  handleErrors();
 
  const config = getConfig();

  console.log(config);

  const start = getPriceEveryXMinutes({
    prices: {},
  }, config.exchangeAssets, 1);

  start();
}

main();
