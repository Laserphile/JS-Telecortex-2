// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import { promisify } from 'util';
import { clamp } from 'lodash';
import { rgbToHex, rgbToHsv } from 'colorsys';
import chalk from 'chalk';

export const msNowFloat = () => new Date().getTime();

export const msNow = () => Math.round(msNowFloat());

export const nowFloat = () => msNowFloat() / 1000.0;

export const now = () => Math.round(nowFloat());

/**
 * Callback given to spi transfer which logs errors and ignores data returned
 * @param {Error} e optional error if SPI transfer fails
 */
export const consoleErrorHandler = e => {
  if (e) console.error(e);
  // if (d) console.log(`spi data received: ${d}`);
};

export const asyncSleep = promisify(setTimeout);
/**
 * Calculate the position of a normalized coordnate from a given image shape
 * @param {Array} shape The shape of the image which this coordinate is being mapped on to
 * @param {Array} coordinate The coordinate, [x, y] where x, y in [0, 1]
 */
export const denormalizeCoordinate = (shape, coordinate) => {
  const minDimension = Math.min(shape[0], shape[1]);
  const maxDimension = Math.max(shape[0], shape[1]);
  const deltaDimension = maxDimension - minDimension;
  if (shape[1] > shape[0]) {
    return [
      clamp(minDimension * coordinate[0], 0, shape[0] - 1),
      clamp(minDimension * coordinate[1] + deltaDimension / 2, 0, shape[1] - 1)
    ];
  }
  return [
    clamp(minDimension * coordinate[0] + deltaDimension / 2, 0, shape[0] - 1),
    clamp(minDimension * coordinate[1], 0, shape[1] - 1)
  ];
};

/**
 * Convert a single colorsys object to string
 * @param {colorsys RGB object} colour
 */
export const colourToString = colour => rgbToHex(colour);

export const colourMessage = (hue, msg) => chalk.hsv(hue, 50, 100)(msg);
/**
 * Convert a colours specification to string
 * @param {Array of colorsys RGB objects} colours
 */
export const coloursToString = colours =>
  colours.reduce(
    (accumulator, colour) =>
      accumulator.concat(colourMessage(rgbToHsv(colour).h, colourToString(colour))),
    ''
  );
/**
 * Middleware used to log a colour being processed, and the framerate.
 * @param {object} context
 */
export const colourRateLogger = context => {
  const { start = 0, lastPrint = now(), frames = 0, channelColours } = context;
  context.frames += 1;
  if (now() - lastPrint > 1) {
    context.rate = frames / (now() - start + 1);
    console.log(
      `${coloursToString(Object.values(channelColours)[0].slice(0, 10))} : ${context.rate.toFixed(
        2
      )}`
    );
    context.lastPrint = now();
  }
  return context;
};
