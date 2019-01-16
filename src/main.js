import { opcTCPServer } from './opc/tcp-server';
import { RPI_SPIDEVS, DRV_CONF_DEFAULTS } from '.';

let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('./util/testSpi').default;
}

const server = () => {
  // TODO: number of LEDS on each device?
  const channels = Object.entries(RPI_SPIDEVS).reduce((accumulator, [channel, spec]) => {
    spec.spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
    spec.spi.clockSpeed(10e6);
    accumulator[channel] = spec;
    return accumulator;
  }, {});

  const driverConfig = {
    ...DRV_CONF_DEFAULTS,
    channels
  };
  opcTCPServer(driverConfig);
  // opcUDPServer(driverConfig);
};

server();
