import { colorRainbows } from './drivers/colorRainbows';
import { opcTCPServerSetup, opcUDPServerSetup } from './drivers/opcServer';
import { now, logger } from './util';

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

  // TODO: number of LEDS on each device?
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
    spidevs,
    // port used to listen for OPC commands
    opc_port: 42069,
    // Largest number of panels that this controller can address
    max_panels: 4,
    // Frame counter for FPS calculation
    frames: 0,
    // FPS rate calculated
    rate: 0.0,
    // time when script started for FPS calculation
    start: now(),
    // Last time something was printed
    lastPrint: now(),
    // eslint-disable-next-line no-unused-vars
    brightness: 1
  };
  opcTCPServerSetup(driverConfig);
  // opcUDPServerSetup(driverConfig);
};

server();
