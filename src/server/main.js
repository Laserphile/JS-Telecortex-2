/* eslint-disable global-require,no-param-reassign */
import { opcTCPServer } from './opc/tcp-server';
import { RPI_SPIDEVS, FRESH_CONTEXT, SERVER_CONF } from '../constants';

console.log('test change');
let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('../util/testSpi').default;
}

const server = () => {
  const { spiClockSpeed, spiMode, opcPort } = SERVER_CONF;
  // TODO: flick status led
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
    opcPort
  };
  opcTCPServer(context);
  // opcUDPServer(context);
};

server();
