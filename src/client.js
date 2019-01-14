import chalk from 'chalk';
import { driverFactory, opcClientDriver } from './drivers/driverFactory';
import { colorRainbows } from './drivers/colorRainbows';
import { colourRateLogger, msNow } from './util';
import { RPI_SPIDEVS, DRV_CONF_DEFAULTS } from './main';
import net from 'net';

const { opc_port } = DRV_CONF_DEFAULTS;
const client = new net.Socket();

client.on('data', function(data) {
  console.error(chalk`{cyan 📡 Client recieved} ${data.toString('hex')}`);
  client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.error(chalk`{cyan 📡 Client closed}`);
});

client.on('error', function(err) {
  console.error(chalk`{cyan 📡 Client error} {white ${err}}`);
});

/**
 * Maximum number of frames per second
 */
const frameRateCap = 10;

const driverConfig = {
  ...DRV_CONF_DEFAULTS,
  spidevs: RPI_SPIDEVS,
  client
};

const staticRainbowLoop = driverFactory(
  driverConfig,
  [colourRateLogger, colorRainbows],
  opcClientDriver
);

/**
 * Recursively schedules the frame function so that it is
 * called at most frameRateCap times per second
 */
const scheduleFrameRecursive = () => {
  const startTimeMs = msNow();
  staticRainbowLoop();
  const delay = Math.max(0, 1.0 / frameRateCap - (msNow() - startTimeMs) / 1000.0);
  // console.log(`scheduling for ${delay * 1000} ms`);
  setTimeout(scheduleFrameRecursive, delay * 1000);
};

client.connect(
  opc_port,
  'raspberrypi.local',
  // 'localhost',
  function() {
    console.log(chalk`{cyan 📡 Client connected} on port: {white ${opc_port}}`);
    scheduleFrameRecursive();
  }
);
