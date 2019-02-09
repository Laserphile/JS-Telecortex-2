import { promisify } from 'util';

export const msNowFloat = () => {
  return new Date().getTime();
};

export const msNow = () => {
  return Math.round(msNowFloat());
};

export const nowFloat = () => {
  return msNowFloat() / 1000.0;
};

export const now = () => {
  return Math.round(nowFloat());
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
