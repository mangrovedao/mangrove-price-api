import { config } from './config';
import { Config } from "./types";

export const getConfig = (): Config => {
  let value = config.get<any>("exchangeAssets");;
  if ((value as any).__name) {
    value = value.__name; 
  }

  let replacements = config.get<any>("replacements");;
  if ((replacements as any).__name) {
    replacements = JSON.parse(replacements.__name);
  }
  const exchangeAssets = JSON.parse(value);
  return {
    port: config.get<number>("port"),
    exchangeAssets,
    replacements,
  };
};
