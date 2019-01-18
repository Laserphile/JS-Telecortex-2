import chalk from 'chalk';
import { opcClientDriver } from './drivers/driverFactory';
import {
  // singleRainbow,
  rainbowFlow,
  // coloursToChannels,
  coloursToAllChannels
} from './drivers/middleware';
import { msNow } from './util';
import {
  colourRateLogger,
  getSquareCanvas,
  setupMainWindow,
  showPreview,
  fillRainbows,
  MAX_ANGLE
} from './util/graphics';
import { MAPS_DOME_SIMPLIFIED } from './util/mapping';
import { RPI_SPIDEVS, FRESH_CONTEXT, SERVER_CONF } from '.';
import net from 'net';
import async from 'async';
import { interpolatePixelMap } from './util/interpolation';
// const cv = require('opencv4nodejs');

// TODO: read this from a JSON file

/**
 * A mapping of serverID to server metadata
 */
const serverConfigs = {
  1: {
    host: 'raspberrypi.local',
    opc_port: SERVER_CONF.opc_port,
    channels: RPI_SPIDEVS
  }
  // 2: {
  //   host: 'localhost'
  // }
};

const clientsConfig = {
  frameRateCap: 40
};

const middleware = [
  // singleRainbow,
  // rainbowFlow,
  coloursToAllChannels
];

// TODO: refactor using limiter https://www.npmjs.com/package/limiter
// Alternatively, accept an idle() function which can ask the controller what its' queue status is like

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

/**
 * Given a mapping of serverIDs to serverConfig , create sockets and initiate client
 */
const startClients = async serverConfigs => {
  await async.map(Object.entries(serverConfigs), ([serverID, { host, opc_port }]) => {
    const client = new net.Socket();

    client.on('data', data => {
      console.error(chalk`{cyan 📡 ${serverID} recieved} ${data.toString('hex')}`);
      client.destroy(); // kill client after server's response
    });

    client.on('close', () => {
      console.error(chalk`{cyan 📡 ${serverID} closed}`);
    });

    serverConfigs[serverID].client = client;

    return new Promise((resolve, reject) => {
      client.on('error', err => {
        console.error(chalk`{cyan 📡 ${serverID} error} {white ${err}}`);
        reject(err);
      });

      client.connect(
        opc_port,
        host,
        () => {
          console.log(
            chalk`{cyan 📡${serverID} connected} to {white ${host}} on port: {white ${opc_port}}`
          );
          resolve();
        }
      );
    });
  });

  /**
   * The operating context for each client frame callback.
   * Modified by client frame callbacks
   */
  const clientContexts = Object.entries(serverConfigs).reduce(
    (accumulator, [serverID, { client, channels }]) => (
      (accumulator[serverID] = { ...FRESH_CONTEXT, serverID, channels, client }), accumulator
    ),
    {}
  );

  /**
   * async callback which sends the OPC data for a single frame on a single client
   */
  const asyncClientFrameCallback = async.compose(
    ...[...middleware, opcClientDriver].reverse().map(async.asyncify)
  );

  let frameNumber = 0;
  const img = getSquareCanvas();
  fillRainbows(img, frameNumber);
  setupMainWindow(img);
  const pixelLists = {};

  // Awaits a complete frame to be generated and sent to all servers
  const clientsFrameCallback = async () => {
    // TODO: fill canvas, interpolate pixels off canvas and pass into context
    frameNumber = frameNumber + 1;
    fillRainbows(img, frameNumber);
    pixelLists.smol = interpolatePixelMap(img, MAPS_DOME_SIMPLIFIED.smol.slice(100));
    // pixelLists.big = interpolatePixelMap(img, MAPS_DOME_SIMPLIFIED.big);
    Object.values(clientContexts).map(context => {
      context.colours = pixelLists.smol;
    });

    await async.each(Object.values(clientContexts), context => {
      asyncClientFrameCallback(context);
    });
    // only call colourRateLogger on the first context
    colourRateLogger(Object.values(clientContexts)[0]);

    showPreview(img, MAPS_DOME_SIMPLIFIED);
  };

  setTimeout(scheduleThingRecursive(clientsFrameCallback, clientsConfig.frameRateCap), 1000);
};

startClients(serverConfigs);
