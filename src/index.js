import { now } from './util';

export const RPI_SPIDEVS = {
  0: {
    bus: 0,
    device: 0
  },
  1: {
    bus: 0,
    device: 1
  },
  2: {
    bus: 1,
    device: 0
  },
  3: {
    bus: 1,
    device: 1
  }
};

export const DRV_CONF_DEFAULTS = {
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
  brightness: 0.5
};
