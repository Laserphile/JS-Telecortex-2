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
  directRainbows,
  MAX_ANGLE
} from './util/graphics';
import { MAPS_DOME_SIMPLIFIED } from './util/mapping';
import { RPI_SPIDEVS, FRESH_CONTEXT, CLIENT_CONF, opc_port } from '.';
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
    // host: 'localhost',
    host: 'raspberrypi.local',
    opc_port,
    channels: {
      0: 'big',
      1: 'smol',
      2: 'smol',
      3: 'smol'
    }
  }
  // 2: {
  //   host: 'localhost'
  // }
};

/**
 * Context shared across all clients
 */
const superContext = {
  ...CLIENT_CONF,
  frameNumber: 0
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

const socketErrors = {};

const initSocketPromise = (serverConfigs, serverID, host, port) => {
  const client = new net.Socket();

  client.on('data', data => {
    console.error(chalk`{cyan 📡 ${serverID} recieved} ${data.toString('hex')}`);
    client.destroy(); // kill client after server's response
  });

  client.on('close', hadError => {
    console.error(
      chalk`{cyan 📡 ${serverID} closed, hadError: }{white ${JSON.stringify(hadError)}}`
    );
  });

  serverConfigs[serverID].client = client;

  return new Promise((resolve, reject) => {
    client.on('error', err => {
      console.error(
        chalk`{cyan 📡 ${serverID} error} connecting to {white ${host}} on port {white ${port}} : {white ${err}}`
      );
      socketErrors[serverID] = err;
      reject(err);
    });

    client.connect(
      port,
      host,
      () => {
        console.log(
          chalk`{cyan 📡${serverID} connected} to {white ${host}} on port {white ${port}}`
        );
        resolve();
      }
    );
  });
  // .catch(err => {
  //   err;
  // });
};

/**
 * Given a mapping of serverIDs to serverConfig , create sockets and initiate client
 */
const startClients = async serverConfigs => {
  const result = await Promise.all(
    Object.entries(serverConfigs).map(([serverID, { host, opc_port }]) =>
      initSocketPromise(serverConfigs, serverID, host, opc_port)
    )
  ).catch(err => err);

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

  // superContext.img = getSquareCanvas();
  // fillRainbows(superContext.img, superContext.frameNumber);
  // setupMainWindow(superContext.img);
  const pixelLists = {};

  // Awaits a complete frame to be generated and sent to all servers
  const clientsFrameCallback = async () => {
    if (Object.values(socketErrors).length) process.exit();

    superContext.frameNumber = superContext.frameNumber + 1;

    // basic interpolation
    // fillRainbows(superContext.img, superContext.frameNumber);
    // pixelLists.smol = interpolatePixelMap(superContext.img, MAPS_DOME_SIMPLIFIED.smol);

    // Direct Rainbow interpolation;
    pixelLists.smol = directRainbows(MAPS_DOME_SIMPLIFIED.smol, superContext.frameNumber);

    // pixelLists.big = interpolatePixelMap(superContext.img, MAPS_DOME_SIMPLIFIED.big);
    Object.values(clientContexts).map(context => {
      context.colours = pixelLists.smol;
    });

    await async.each(Object.values(clientContexts), context => {
      asyncClientFrameCallback(context);
    });
    // only call colourRateLogger on the first context
    colourRateLogger(Object.values(clientContexts)[0]);

    // showPreview(superContext.img, MAPS_DOME_SIMPLIFIED);
  };

  setTimeout(scheduleThingRecursive(clientsFrameCallback, superContext.frameRateCap), 1000);
};

startClients(serverConfigs);
