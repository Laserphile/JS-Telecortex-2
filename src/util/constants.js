import { now } from './index';

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

export const opcPort = 42069;

export const SERVER_CONF = {
  // port used to listen for OPC commands
  opcPort,
  // SPI Clock Speed
  spiClockSpeed: 10e6,
  // SPI Data Mode
  spiMode: 0
};

export const CLIENT_CONF = {};

export const FRESH_CONTEXT = {
  // Frame counter for FPS calculation
  frames: 0,
  // FPS rate calculated
  rate: 0.0,
  // time when script started for FPS calculation
  start: now(),
  // Last time something was printed
  lastPrint: now(),
  // Brightness of all strips on the server
  brightness: 0.1,
  // Size of canvas (if used)
  canvasSize: 512
};

export const OPC_BODY_FIELDS = ['r', 'g', 'b'];
