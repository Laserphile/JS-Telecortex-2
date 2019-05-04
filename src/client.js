import chalk from 'chalk';
import { opcClientDriver } from './drivers/driverFactory';
import { msNow } from './util';
import _ from 'lodash';
import { colourRateLogger } from './util/graphics';
import { animationOptions, serverOptions, mappingOptions, clientArgParser } from './options';
import { FRESH_CONTEXT, CLIENT_CONF } from '.';
// import { size } from 'mathjs';
import net from 'net';
import async from 'async';
import {
  // identity,
  flow
} from 'lodash';

// TODO: read this from a JSON file

/**
 * Context shared across all clients
 */
const superContext = {
  ...CLIENT_CONF,
  frameNumber: 0,
  driver: opcClientDriver,
  // driver: identity
  pixelLists: {},
  servers: 'one-raspberrypi'
};
Object.assign(superContext, clientArgParser.argv);

/**
 * A mapping of serverID to server metadata
 */
const serverConfigs = serverOptions[superContext['servers']];
Object.assign(superContext, mappingOptions[superContext['mapping']]);
const animationCallbacks = animationOptions[superContext.animation];
const middleware = _.get(animationCallbacks, 'middleware', []);
const superMiddleware = _.get(animationCallbacks, 'superMiddleware', []);
const initware = _.get(animationCallbacks, 'initware', []);
const mapBased = _.get(animationCallbacks, 'mapBased', false);

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

export const pixelListsToChannelColours = (clientContexts, superContext) => {
  Object.entries(clientContexts).map(([serverID, context]) => {
    if (!Object.keys(superContext.panels).includes(serverID)) {
      const err = new Error(`panels not mapped for serverID ${serverID}`);
      console.error(err);
      process.exit();
    }
    Object.entries(superContext.panels[serverID]).map(([channel, mapName]) => {
      if (!Object.keys(superContext.pixelLists).includes(mapName)) {
        const err = new Error(
          `map name ${mapName} not in superContext.pixelLists ${Object.keys(
            superContext.pixelLists
          )}`
        );
        console.error(err);
        // process.exit();
      }
      context.channelColours[channel] = superContext.pixelLists[mapName];
    });
  });
};

/**
 * Given a mapping of serverIDs to serverConfig , create sockets and initiate client
 */
const startClients = async serverConfigs => {
  await Promise.all(
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
      (accumulator[serverID] = {
        ...FRESH_CONTEXT,
        serverID,
        channels,
        client,
        channelColours: {}
      }),
      accumulator
    ),
    {}
  );

  /**
   * async callback which sends the OPC data for a single frame on a single client
   */
  const asyncClientFrameCallback = async.compose(
    ...[...middleware, superContext.driver].reverse().map(async.asyncify)
  );

  flow(...initware)(superContext);

  // Awaits a complete frame to be generated and sent to all servers
  const clientsFrameCallback = async () => {
    if (Object.values(socketErrors).length) process.exit();

    superContext.frameNumber = superContext.frameNumber + 1;

    flow(...superMiddleware)(superContext);

    if (mapBased) {
      pixelListsToChannelColours(clientContexts, superContext);
    }

    await async.each(Object.values(clientContexts), context => {
      asyncClientFrameCallback(context);
    });
    // only call colourRateLogger on the first context
    colourRateLogger(Object.values(clientContexts)[0]);
  };

  setTimeout(scheduleThingRecursive(clientsFrameCallback, superContext.frameRateCap), 1000);
};

startClients(serverConfigs);
