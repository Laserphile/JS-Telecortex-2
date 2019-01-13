import { createServer } from 'net';
import chalk from 'chalk';
import { handleAllOPCMessages } from '.';

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcTCPServer = context => {
  const { opc_port } = context;

  context.server = createServer(socket => {
    // Handle incoming messages from clients.
    let partialOPCMsg = undefined;
    socket.on('data', data => {
      console.log(
        chalk`{cyan 🛰  got: ${data.toString('hex')} from ${socket.remoteAddress}:${
          socket.remotePort
        }}`
      );
      if (partialOPCMsg) {
        // console.log(
        //   chalk`{cyan 🛰  continuing to parse partial first: ${partialOPCMsg.toString('hex')}}`
        // );
        data = Buffer.concat([partialOPCMsg, data]);
        // console.log(chalk`{cyan 🛰  data is now: ${data.toString('hex')}}`);
      }
      partialOPCMsg = handleAllOPCMessages(context, data);
    });

    socket.on('error', err => {
      // handle errors here
      console.error(err);
    });
  });

  context.server.listen(opc_port, () => {
    console.log(chalk`{cyan 🛰  Server listening on port: {white ${opc_port}}}`);
  });
};
