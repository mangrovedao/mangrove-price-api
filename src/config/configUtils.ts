import { config } from './config';
import { Config } from "./types";

export const getConfig = (): Config => {
  return {
    port: config.get<number>("port"),
  };
};
