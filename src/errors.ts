import { logger } from './logger/logger';

export const handleErrors = () => {
  // Print unhandled exception before forced exit
  process.on('uncaughtException', async (err: Error) => {
    logger.error(`uncaughtException (pid=${process.pid})`, {
      data: {
        err
      }
    });
    process.exitCode = 1;
    try {
      // await stopApp();
    } catch (e) {
      logger.warn('Failed stopping app during uncaughtException', e);
      // nothing to do
    }

    process.exit();
  });

  // Print unhandled rejection and avoid abrupt exit
  process.on('unhandledRejection', (reason: string, promise: Promise<any>) => {
    logger.error(`unhandledRejection (pid=${process.pid})`, {
      data: {
        reason,
        promise
      }
    });
  });
};
