// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import { flatten, mapValues } from 'lodash';
import { rgbToHex, rgbToHsv } from 'colorsys';
import chalk from 'chalk';
import { createGammaTable, now } from './index';

// 8bit unsigned integer must be less than this value
const uint8Max = 0x100;
// Constant prefix in first byte of sk9822 frame
const prefix = 0xe0;
// Mask for brightness bitfield in first byte of sk9822 frame
const brightnessMask = 0x1f;
// header bytes in sk9822 protocol
const resetFrame = [0x00, 0x00, 0x00, 0x00];
// order of colours in sk9822 frame
const colourOrder = ['b', 'g', 'r'];

export const SK9822_GAMMA = createGammaTable(uint8Max, 2.8);

export const sk9822GammaCorrect = colour =>
  mapValues(colour, colorVal => SK9822_GAMMA[Math.round(colorVal)]);

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return {number[]} the sk9822 frame for this pixel
 */
export const rgb2sk9822 = (colour, brightness = 0.5) => {
  // first byte is a constant 0xE0 + 5 bit brightness value
  const correctedColour = sk9822GammaCorrect(colour);
  return [prefix + Math.round(brightness * brightnessMask)].concat(
    colourOrder.map(key => correctedColour[key] % uint8Max)
  );
};

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return {number[]} a complete sk9822 message for the strip
 */
export const colours2sk9822 = (colours, brightness) =>
  Array.from(resetFrame).concat(flatten(colours.map(colour => rgb2sk9822(colour, brightness))));
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
