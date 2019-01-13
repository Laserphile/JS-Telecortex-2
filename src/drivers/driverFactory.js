import { flow } from 'lodash/util';
import { consoleErrorHandler } from '../util';
import { colours2sk9822 } from '../util/sk9822';
import { composeOPCMessage } from '../opc/compose';

/**
 * Given a context containing a list of spi device specifications and LED data,
 * Send data to all LEDs
 * @param {object} context The context under which the ledDriver operates
 */
const ledDriver = context => {
  const { spidevs, channelColours, brightness } = context;
  Object.keys(channelColours).forEach(channel => {
    const dataBuff = Buffer.from(colours2sk9822(channelColours[channel], brightness));
    spidevs[channel].spi.transfer(dataBuff, dataBuff.length, consoleErrorHandler);
  });
  return context;
};

/**
 * Given a context containing a mapping of channel numbers to colours, send data over OPC
 * @param {object} context
 */
export const opcClientDriver = context => {
  const { channelColours } = context;
  Object.keys(channelColours).forEach(channel => {
    const dataBuff = Buffer.from(composeOPCMessage(channel, channelColours[channel]));
    context.client.write(dataBuff);
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
export const driverFactory = (driverConfig, middleware = [], driver = ledDriver) => {
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
    }
  };

  return () => {
    return flow(
      ...middleware,
      driver
    )(context);
  };
};

export default driverFactory;
