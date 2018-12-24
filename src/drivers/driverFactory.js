import { now } from '../util';
import { flow } from 'lodash/util';

const driver = context => {
  const { spidevs, data } = context;
  if(data === undefined) throw Error('No data was supplied');
  const dataBuff = Buffer.from(data);
  spidevs.forEach(device => {
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
 * Given a spi object and the number of leds, return a callback which drives the SPI
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
