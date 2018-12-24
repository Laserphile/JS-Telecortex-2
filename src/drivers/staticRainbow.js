import { now, rgb2sk9822 } from '../util';
import { hsvToRgb } from 'colorsys';
import chalk from 'chalk';

const formatMsg = ({ h, s, v }, { r, g, b }, rate, data) =>
  `h ${h.toFixed(2)} s ${s} v ${v} | r ${r} g ${g} b ${b} :  ${rate.toFixed(
    2
  )} : ${data.toString().slice(0, 32)}`;
/**
 * Given a spi object and the number of leds, return a callback which drives the SPI
 */
export const staticRainbowFactory = (spi, numLeds = 360) => {
  /**
   * Things which determine LED colours
   */
  const hsv = {
    h: 360,
    s: 100,
    v: 10
  };
  let rgb;
  // Frame counter for FPS calculation
  let frames = 0;
  // FPS rate calculated
  let rate = 0.0;
  // time when script started for FPS calculation
  const start = now();
  // Last time something was printed
  let last_print = now();
  // eslint-disable-next-line no-unused-vars
  const brightness = 1;

  return () => {
    const { h } = hsv;
    hsv.h = (h + 1) % 360;
    frames += 1;
    rgb = hsvToRgb(hsv);

    const data = Array.from({ length: numLeds }).reduce(
      accumulator => {
        accumulator = accumulator.concat(rgb2sk9822(rgb));
        return accumulator;
      },
      [0, 0, 0, 0]
    );

    const dataBuff = Buffer.from(data);

    spi.transfer(dataBuff, dataBuff.length, (e, d) => {
      if (e) console.error(e);
      else console.log('Got "' + d.toString() + '" back.');

      if (dataBuff.toString() === d.toString()) {
        console.log('woo message sent');
      } else {
        // NOTE: this will likely happen unless MISO is jumpered to MOSI
        console.warn('aaaaaah death');
        process.exit(-2);
      }
    });
    if (now() - last_print > 1) {
      rate = frames / (now() - start + 1);
      const msg = formatMsg(hsv, rgb, rate, data);
      console.log(chalk.hsl(hsv.h * 360, hsv.s * 100, hsv.v * 100)(msg));
      last_print = now();
    }
  };
};