import { createServer } from 'net';

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcTCPServer = context => {
  const { spidevs, opc_port, max_panels } = context;
  console.log(`About to create OPC TCP server on port ${opc_port}`);

  context.server = createServer(socket => {
    console.log('server create callback');
    // Handle incoming messages from clients.
    socket.on('data', data => {
      console.log(`server got: ${data} from ${socket.remoteAddress}:${socket.remotePort}`);
    });
  });
  context.server.listen(opc_port, () => {
    console.log('server listen callback');
  });

  console.log(`After create server on ${opc_port}`);
};
