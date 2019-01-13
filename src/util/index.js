import chalk from 'chalk';
import sprintf from 'sprintf-js';
import { rgbToHsv } from 'colorsys';

export const now = () => {
  return Math.round(new Date().getTime() / 1000);
};

// maximum 8bit unsigned integer
const uint8Max = 0xff;
// Constant prefix in first byte of sk9822 frame
const sk9822prefix = 0xe0;
// Mask for brightness bitfield in first byte of sk9822 frame
const sk9822BrightnessMask = 0x1f;

/**
 * Given an object of ints from 0 to 255, and a float brightness value from 0 to 1,
 * return the sk9822 data for this pixel
 */
export const rgb2sk9822 = ({ r, g, b }, brightness = 0.5) => {
  // first byte is a constant 0xE0 + 5 bit brightness value
  const first = sk9822prefix + Math.round(brightness * sk9822BrightnessMask);
  return [first, b % uint8Max, g % uint8Max, r % uint8Max];
};

export const formatMsg = ({ h, s, v }, { r, g, b }, rate, data) =>
  `h ${h.toFixed(2)} s ${s} v ${v} | r ${r} g ${g} b ${b} :  ${rate.toFixed(
    2
  )} : ${data.toString().slice(0, 32)}`;

export const colourMessage = (hue, msg) => chalk.hsv(hue, 50, 100)(msg);

/**
 * Convert a colours specification to string
 * // TODO: move to ../util/index.js
 * @param {Array of colorsys RGB objects} colours
 */
export const coloursToString = colours => {
  const colourFormat = `%0${Math.log10(colours.length)}d | {R:%03d G:%03d B:%03d}\n`;
  return colours.reduce((accumulator, colour, count) => {
    return accumulator.concat(
      colourMessage(
        rgbToHsv(colour).h,
        sprintf.sprintf(colourFormat, count, colour.r, colour.g, colour.b)
      )
    );
  }, '');
};

// TODO: I think this should be renamed colourLogger since it only does colours
export const logger = context => {
  const {
    start,
    lastPrint,
    frames,
    hsv = { h: 0, s: 0, v: 0 },
    rgb = { r: 0, g: 0, b: 0 },
    data = []
  } = context;
  const theLastPrint = lastPrint || now();
  if (now() - theLastPrint > 1) {
    context.rate = frames / (now() - start + 1);
    const msg = formatMsg(hsv, rgb, context.rate, data);
    console.log(colourMessage(hsv.h, msg));
    context.lastPrint = now();
  }
  return context;
};
