import { createGammaTable } from './graphics'

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

/**
 * Given a colorsys RGB objects and a float brightness value from 0 to 1,
 * @return the sk9822 frame for this pixel
 */
export const rgb2sk9822 = (colour, brightness = 0.5) => {
  // first byte is a constant 0xE0 + 5 bit brightness value
  colour = sk9822GammaCorrect(colour)
  return colourOrder.reduce(
    (accumulator, key) => (accumulator.push(colour[key] % uint8Max), accumulator),
    [prefix + Math.round(brightness * brightnessMask)]
  );
};

/**
 * Given a list of colosys RGB objects, and a float brightness value from 0 to 1,
 * @return a complete sk9822 message for the strip
 */
export const colours2sk9822 = (colours, brightness) => {
  return colours.reduce(
    (accumulator, colour) => (accumulator.push(...rgb2sk9822(colour, brightness)), accumulator),
    Array.from(resetFrame)
  );
};

export const SK9822_GAMMA = createGammaTable(uint8Max, 2.8)

export const sk9822GammaCorrect = (colour) => {
  colourOrder.forEach(key => {
    colour[key] = SK9822_GAMMA[Math.round(colour[key])];
  })
  return colour
}