import chalk from 'chalk';
import { driverFactory, opcClientDriver } from './drivers/driverFactory';
import {
  // singleRainbow,
  rainbowFlow,
  // coloursToChannels,
  coloursToAllChannels
} from './drivers/middleware';
import { msNow } from './util';
import { colourRateLogger } from './util/graphics';
import { RPI_SPIDEVS, DRV_CONF_DEFAULTS } from '.';
import net from 'net';

// TODO: read this from a JSON file

/**
 * A mapping of serverID to server metadata
 */
const serverConfigs = {
  1: {
    ip: 'localhost',
    opc_port: 42069,
    channels: RPI_SPIDEVS
  }
};

Object.entries(serverConfigs).forEach(([serverID, serverConfig]) => {
  console.log(`server ${serverID} config ${serverConfig}`);

  const { ip, opc_port, channels } = serverConfig;
  const client = new net.Socket();

  const context = {
    ...DRV_CONF_DEFAULTS,
    channels,
    frameRateCap: 30,
    client
  };

  const staticRainbowLoop = driverFactory(
    context,
    [
      // singleRainbow,
      rainbowFlow,
      coloursToAllChannels,
      colourRateLogger
    ],
    opcClientDriver
  );

  /**
   * Recursively schedules the frame function so that it is
   * called at most frameRateCap times per second
   */
  const scheduleFrameRecursive = () => {
    const startTimeMs = msNow();
    staticRainbowLoop();
    const delay = Math.max(0, 1000.0 / context.frameRateCap - (msNow() - startTimeMs));
    // console.log(`scheduling for ${delay * 1000} ms`);
    setTimeout(scheduleFrameRecursive, delay);
  };

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

  client.connect(
    opc_port,
    ip,
    function() {
      console.log(chalk`{cyan 📡 Client connected} on port: {white ${opc_port}}`);
      setTimeout(scheduleFrameRecursive, 1000);
    }
  );
});
