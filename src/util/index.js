import { promisify } from 'util';

export const msNow = () => {
  return Math.round(new Date().getTime());
};

export const now = () => {
  return Math.round(msNow() / 1000);
};

/**
 * Callback given to spi transfer which logs errors and ignores data returned
 * @param {Error} e optional error if SPI transfer fails
 */
export const consoleErrorHandler = e => {
  if (e) console.error(e);
  // if (d) console.log(`spi data received: ${d}`);
};

export const asyncSleep = promisify(setTimeout);
