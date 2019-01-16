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
    host: 'raspberrypi.local',
    opc_port: 42069,
    channels: RPI_SPIDEVS
  }
};

async function startClient(serverConfigs) {
  const clients = await Promise.all(
    Object.entries(serverConfigs).map(([serverID, serverConfig]) => {
      return new Promise((resolve, reject) => {
        const { host, opc_port } = serverConfig;

        const client = new net.Socket();

        serverConfig.client = client;

        client.on('data', data => {
          console.error(chalk`{cyan 📡 ${serverID} recieved} ${data.toString('hex')}`);
          client.destroy(); // kill client after server's response
        });

        client.on('close', () => {
          console.error(chalk`{cyan 📡 ${serverID} closed}`);
        });

        client.on('error', err => {
          console.error(chalk`{cyan 📡 ${serverID} error} {white ${err}}`);
          reject(err);
        });

        client.connect(
          opc_port,
          host,
          () => {
            console.log(chalk`{cyan 📡${serverID} connected} on port: {white ${opc_port}}`);
            resolve(serverConfig);
          }
        );
      });
    })
  );
  clients.forEach(serverConfig => {
    const { client, channels } = serverConfig;
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

    setTimeout(scheduleFrameRecursive, 1000);
  });
}

startClient(serverConfigs);
