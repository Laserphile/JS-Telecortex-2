import chalk from 'chalk';

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

export const formatMsg = ({ h, s, v }, { r, g, b }, rate, data) =>
  `h ${h.toFixed(2)} s ${s} v ${v} | r ${r} g ${g} b ${b} :  ${rate.toFixed(
    2
  )} : ${data.toString().slice(0, 32)}`;

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
    console.log(chalk.hsv(hsv.h, 50, 100)(msg));
    context.lastPrint = now();
  }
  return context;
};
