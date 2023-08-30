import { config } from './config';
import { Config } from "./types";

export const getConfig = (): Config => {
  const exchangeAssets = JSON.parse(config.get<string>("exchangeAssets"));
  return {
    port: config.get<number>("port"),
    exchangeAssets,
  };
};
