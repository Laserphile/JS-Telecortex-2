import { now } from './util';
import { opcTCPServer } from './opc/tcp-server';
// Imports for rainbow animations
// import { driverFactory } from './drivers/driverFactory';
// import { colorRainbows } from './drivers/colorRainbows';
// import { logger } from './util';

let SPI;
// noinspection ES6ModulesDependencies
if (process.platform === 'linux') {
  SPI = require('pi-spi');
} else {
  SPI = require('./util/testSpi').default;
}

const RPI_SPIDEVS = [
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
];

const DRV_CONF_DEFAULTS = {
  // port used to listen for OPC commands
  opc_port: 42069,
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

  // const staticRainbowLoop = driverFactory(driverConfig, [logger, colorRainbows]);
  // // eslint-disable-next-line no-constant-condition
  // while (true) {
  //   staticRainbowLoop();
  // }
};

server();
