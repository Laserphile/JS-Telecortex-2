export const now = () => {
  return Math.round(new Date().getTime() / 1000);
};

/**
 * Given an object of ints from 0 to 255, and a float brightness value from 0 to 1,
 * return the sk9822 data for this pixel
 */
export const rgb2sk9822 = ({ r, g, b }, brightness = 0.5) => {
  // first byte is a constant 0xE0 + 5 bit brightness value
  const first = 0xe0 + Math.round(brightness * 0x1f);
  return [first, b % 0xff, g % 0xff, r % 0xff];
};