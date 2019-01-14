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
  const spidevs = RPI_SPIDEVS.map(spec => {
    spec.spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
    spec.spi.clockSpeed(5e5);
    return spec;
  });

  const driverConfig = {
    ...DRV_CONF_DEFAULTS,
    spidevs
  };
  opcTCPServer(driverConfig);
  // opcUDPServer(driverConfig);
};

server();
