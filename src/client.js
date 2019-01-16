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

const clientsConfig = {
  frameRateCap: 40
};

const middleware = [
  // singleRainbow,
  rainbowFlow,
  coloursToAllChannels,
  colourRateLogger
];

/**
 * Recursively schedules a function so that it is called at most rateCap times per second
 * @param {function} thing
 * @param {number} rateCap
 */
const scheduleThingRecursive = (thing, rateCap) => {
  const maxTimeMs = 1000.0 / rateCap;
  return () => {
    const startTimeMs = msNow();
    thing();
    const deltaTimeMs = msNow() - startTimeMs;
    setTimeout(scheduleThingRecursive(thing, rateCap), Math.max(0, maxTimeMs - deltaTimeMs));
  };
};

async function startClients(serverConfigs) {
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

  // const promisers =

  clients.forEach(serverConfig => {
    const { client, channels } = serverConfig;
    const context = { ...DRV_CONF_DEFAULTS, channels, client };
    const staticRainbowLoop = driverFactory(context, middleware, opcClientDriver);
    setTimeout(scheduleThingRecursive(staticRainbowLoop, clientsConfig.frameRateCap), 1000);
  });
}

startClients(serverConfigs);
