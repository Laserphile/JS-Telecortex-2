import { createServer } from 'net';
import chalk from 'chalk';
import { handleOPCMessage } from './parser';

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcTCPServer = context => {
  const { spidevs, opc_port, max_panels } = context;

  context.server = createServer(socket => {
    // Handle incoming messages from clients.
    socket.on('data', data => {
      console.log(
        chalk`{cyan 🛰  got: ${data.toString('hex')} from ${socket.remoteAddress}:${
          socket.remotePort
        }}`
      );
      handleOPCMessage(context, data);
    });

    socket.on('error', err => {
      // handle errors here
      console.error(err);
      parseOPCMessage(context, data);
    });
  });

  context.server.listen(opc_port, () => {
    console.log(chalk`{cyan 🛰  Server listening on port: {white ${opc_port}}}`);
  });
};
