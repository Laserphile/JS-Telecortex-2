import { colorRainbows } from './drivers/colorRainbows';
import { logger } from './util';

let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('./util/testSpi').default;
}

import { driverFactory } from './drivers/driverFactory';

const server = () => {
  // const spi = SPI.initialize('./mntpoint/spidev0.0');
  // const spi = SPI.initialize('/dev/spidev0.0');
  const spidevs = [
    {
      bus: 0,
      device: 0
    },
    {
      bus: 0,
      device: 1
    },
    {
      bus: 1,
      device: 0
    },
    {
      bus: 1,
      device: 1
    }
  ].map(spec => {
    spec.spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
    spec.spi.clockSpeed(5e5);
    return spec;
  });

  const driverConfig = {
    spidevs
  };
  const staticeRainbow = driverFactory(driverConfig, [logger, colorRainbows]);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    staticeRainbow();
  }
};

server();
