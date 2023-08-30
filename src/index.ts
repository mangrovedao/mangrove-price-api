import * as dotenv from 'dotenv';
dotenv.config();

import { enableLogging } from './logger/logger';
import { handleErrors } from './errors';
import { getConfig } from './config/configUtils';
import { generateGetPriceEveryXMs } from './price-api';
import { Context, Timeframe } from './types';

async function main() {
  enableLogging();

  handleErrors();
 
  const config = getConfig();

  const context: Context = {
    prices: {},
  };

  const timersFns = Object.keys(config.exchangeAssets).map(exchange => generateGetPriceEveryXMs(context, exchange, config.exchangeAssets[exchange].pairs));

  const stops = Object.keys(config.exchangeAssets).map((exchange, index) => {
    const stops = config.exchangeAssets[exchange].timeframes
      .map(timeframe => timersFns[index](timeframe as Timeframe));

    return () => {
      stops.forEach(stop => stop());
    };
  });

}

main();
