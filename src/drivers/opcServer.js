import { now } from '../util';
import { flow } from 'lodash/util';
import { createSocket } from 'dgram';
import { parse } from 'binary';

// TODO: rename this opcUDPServer, since there might be a opcTCPServer

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
const opcUDPServerSetup = context => {
  const { spidevs, opc_port, max_panels } = context;
  console.log(`About to create server on port ${opc_port}`);

  context.server = createSocket('udp4');

  context.server.on('error', err => {
    console.log(`server error:\n${err.stack}`);
    context.server.close();
  });

  context.server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // TODO: parse OPC message and send data to spidevs
    const header = parse(msg)
      .word8u('channel')
      .word8u('command')
      .word16bu('length')
      .vars();
    console.log(`header: ${header}`);
    if (header.channel > max_panels) {
      console.log(`invalid channel ${header.channel} > ${max_panels}`);
    }
    // TODO: perhaps put message on a queue
    if (spidevs) {
      console.log('spidevs');
    }
  });

  context.server.on('listening', () => {
    const address = context.server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  context.server.bind({ port: opc_port }, () => {
    console.log('server bind callback');
  });

  console.log(`After bind ${context.server}`);
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
  const { opc_port, max_panels } = driverConfig;
  const context = {
    ...driverConfig,
    // port used to listen for OPC commands
    opc_port: opc_port || 42069,
    // Largest number of panels that this controller can address
    max_panels: max_panels || 4,
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
  opcUDPServerSetup(context);
  return () => {
    return flow(...middleware)(context);
  };
};

export default opcDriverFactory;
