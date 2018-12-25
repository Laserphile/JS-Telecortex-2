import { now } from '../util';
import { flow } from 'lodash/util';
import { createSocket } from 'dgram';

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
const opcServerSetup = context => {
  const { spidevs, opc_port } = context;
  context.server = createSocket('udp4');

  context.server.on('error', err => {
    console.log(`server error:\n${err.stack}`);
    context.server.close();
  });

  context.server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // TODO: parse OPC message and send data to spidevs
    if (spidevs) {
      console.log('spidevs');
    }
  });

  context.server.on('listening', () => {
    const address = context.server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  context.server.bind(opc_port);
  return context;
};

/**
 * Open Pixel Control server implementation of the driverFactory interface.
 * @param { object } driverConfig is used to create a context for the
 *    middleware and driver functions.
 * @param { array } middleware is a list of functions to call before the driver
 *    function is called
 * @returns { function } callback, called repeatedly to drive the SPI.
 */

export const opcDriverFactory = (driverConfig, middleware = []) => {
  const context = {
    ...driverConfig,
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
  // Setup only needs to be called once.
  opcServerSetup(context);
  return () => {
    return flow(...middleware)(context);
  };
};

export default opcDriverFactory;
