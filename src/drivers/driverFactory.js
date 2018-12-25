import { now } from '../util';
import { flow } from 'lodash/util';

/**
 * Given a context containing a list of spi device specifications and raw LED data,
 * Send data to all LEDs
 * @param {object} context The context under which the driver operates
 */
const driver = context => {
  const { spidevs, data } = context;
  if (data === undefined) throw Error('No data was supplied');
  const dataBuff = Buffer.from(data);
  spidevs.forEach(device => {
    // TODO: figure out what the spi.trasfer callback should be used for
    device.spi.transfer(dataBuff, dataBuff.length, (e, d) => {
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
  });
  return context;
};

/**
 * Driver callback factory
 * @param { object } driverConfig is used to create a context for the
 *    middleware and driver functions.
 * @param { array } middleware is a list of functions to call before the driver
 *    function is called
 * @returns { function } callback, called repeatedly to drive the SPI.
 */
export const driverFactory = (driverConfig, middleware = []) => {
  const { numLeds } = driverConfig;
  const context = {
    ...driverConfig,
    numLeds: numLeds || 360,
    /**
     * Things which determine LED colours
     */
    hsv: {
      h: 360,
      s: 100,
      v: 10
    },
    // Frame counter for FPS calculation
    frames: 0,
    // FPS rate calculated
    rate: 0.0,
    // time when script started for FPS calculation
    start: now(),
    // Last time something was printed
    lastPrint: now(),
    // eslint-disable-next-line no-unused-vars
    brightness: 1
  };

  return () => {
    return flow(
      ...middleware,
      driver
    )(context);
  };
};

export default driverFactory;
