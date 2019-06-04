import { clamp } from 'lodash';

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
 * Build a gamma table for a particular value
 * Stolen from https://github.com/ajfisher/node-pixel/blob/9f956c26cd5dbe16f6066eb659cf08350c8b3fea/lib/pixel.js#L401
 */
export const createGammaTable = (steps, gamma) =>
  Array.from({ length: steps }).map((_, i) => Math.floor((i / 255.0) ** gamma * 255 + 0.5));
