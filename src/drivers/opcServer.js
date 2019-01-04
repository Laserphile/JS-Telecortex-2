import { createSocket } from 'dgram';
import { createServer } from 'net';
import { parse } from 'binary';

// TODO: rename this opcUDPServer, since there might be a opcTCPServer

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcTCPServerSetup = context => {
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

/**
 * Open Pixel Control server implementation of the driverFactory.driver interface.
 * Given a context containing a list of spi device specifications,
 * Configure UDP server callbacks to handle OPC commands.
 * @param {object} context The context under which the driver operates
 */
export const opcUDPServerSetup = context => {
  const { spidevs, opc_port, max_panels } = context;
  console.log(`About to create OPC UDP server on port ${opc_port}`);

  context.server = createSocket('udp4', () => {
    console.log('socket create callback');
  });

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

  context.server.bind(opc_port, '127.0.0.1', () => {
    console.log('socket bind callback');
  });

  console.log(`After bind ${context.server}`);

  // context.server.close(() => {
  //   console.log('socket close callback');
  // });

  // console.log(`After close ${context.server}`);
  return context;
};
