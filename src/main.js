import { opcTCPServer } from './opc/tcp-server';
import { RPI_SPIDEVS, FRESH_CONTEXT, SERVER_CONF } from '.';

let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('./util/testSpi').default;
}

const server = () => {
  const { spiClockSpeed, spiMode, opc_port } = SERVER_CONF;
  // TODO: number of LEDS on each device?
  const channels = Object.entries(RPI_SPIDEVS).reduce((accumulator, [channel, spec]) => {
    spec.spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
    spec.spi.clockSpeed(spiClockSpeed);
    spec.spi.dataMode(spiMode);
    accumulator[channel] = spec;
    return accumulator;
  }, {});

  const context = {
    ...FRESH_CONTEXT,
    channels,
    opc_port
  };
  opcTCPServer(context);
  // opcUDPServer(context);
};

server();
