import { promisify } from 'util';

export const msNow = () => {
  return Math.round(new Date().getTime());
};

export const now = () => {
  return Math.round(msNow() / 1000);
};

export const consoleErrorHandler = e => {
  if (e) console.error(e);
};

export const asyncSleep = promisify(setTimeout);
