import { createServer } from 'net';
import chalk from 'chalk';
import { handleOPCMessage, PartialOPCMsgError } from '.';

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
    socket.on('data', data => {
      console.log(
        chalk`{cyan 🛰  got: ${data.toString('hex')} from ${socket.remoteAddress}:${
          socket.remotePort
        }}`
      );
      if (context.partialOPCMsg) {
        console.log(
          chalk`{cyan 🛰  continuing to parse partial first: ${context.partialOPCMsg.toString('hex')}}`
        );
        data = Buffer.concat([context.partialOPCMsg, data]);
        console.log(chalk`{cyan 🛰  data is now: ${data.toString('hex')}}`);
      }
      while (data.length > 0) {
        let bytesRead = 0;
        try {
          bytesRead = handleOPCMessage(context, data);
        } catch (err) {
          if (err instanceof PartialOPCMsgError) {
            context.partialOPCMsg = data;
          } else {
            console.error(err);
          }
          return;
        }
        data = data.slice(bytesRead);
        console.log(chalk`{cyan 🛰  read: ${bytesRead}, remaining: ${data.length} bytes}`);
      }
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
