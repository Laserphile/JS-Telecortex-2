import { flow } from 'lodash';
import {
  consoleErrorHandler,
  colours2sk9822,
  composeOPCMessage
} from '@js-telecortex-2/js-telecortex-2-util';

// const transferDataAsync = async (spi, dataBuff) => {
//   return await Promise((resolve, reject) => {
//     spi.transfer(dataBuff, dataBuff.length, (err, data) => {
//       if (err) reject(err);
//       resolve(data);
//     });
//   });
// };

/**
 * Given a context containing a list of spi device specifications and LED data,
 * Send data to all LEDs
 * @param {object} context The context under which the ledDriver operates
 */
export const ledDriver = context => {
  const { channels, channelColours, brightness } = context;
  Object.keys(channelColours).forEach(channel => {
    const dataBuff = Buffer.from(colours2sk9822(channelColours[channel], brightness));
    // TODO: make async version with spi.transfer wrapped in Promise (and pass the resolve cb into the transfer cb)
    channels[channel].spi.transfer(dataBuff, dataBuff.length, consoleErrorHandler);
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
    // TODO: make async version with socket.write wrapped in Promise (and pass the resolve cb into the write cb)
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
 * @param driver the driver to create
 * @returns { function } callback, called repeatedly to drive the SPI.
 */
export const driverFactory = (driverConfig, middleware = [], driver = ledDriver) => {
  const context = { ...driverConfig };

  return () =>
    flow(
      ...middleware,
      driver
    )(context);
};

export default driverFactory;
