import * as dotenv from 'dotenv';
dotenv.config();

import { startApp } from './app';
import { enableLogging } from './logger/logger';
import { handleErrors } from './errors';
import { getConfig } from './config/configUtils';

async function main() {
  enableLogging();

  handleErrors();
 
  const config = getConfig();

  startApp(config);
}

main();
