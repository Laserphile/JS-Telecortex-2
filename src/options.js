import { singleRainbow, rainbowFlow, justBlack, coloursToAllChannels } from './drivers/middleware';
import {
  basicRainbows,
  interpolateImg,
  maybeShowPreview,
  readCapture,
  applyDirect
} from './drivers/superMiddleware';
import { directRainbows, directSimplexRainbows } from './util/graphics';
import { canvasInit, previewInit, videoInit } from './drivers/initializers';
import { opc_port } from '.';
import {
  MAPS_DOME_OVERHEAD,
  PANELS_DOME_OVERHEAD,
  MAPS_SQUARE_SERP_9,
  PANELS_SQUARE_SERP_9,
  MAPS_SQUARE_SERP_12,
  PANELS_SQUARE_SERP_12
} from './util/mapping';

export const animationOptions = {
  singleRainbow: {
    middleware: [singleRainbow, coloursToAllChannels]
  },
  rainbowFlow: {
    middleware: [rainbowFlow, coloursToAllChannels]
  },
  justBlack: {
    middleware: [justBlack, coloursToAllChannels]
  },
  directRainbows: {
    superMiddleware: [applyDirect(directRainbows)],
    mapBased: true
  },
  directSimplexRainbows: {
    superMiddleware: [applyDirect(directSimplexRainbows)],
    mapBased: true
  },
  basicRainbows: {
    initware: [canvasInit],
    superMiddleware: [basicRainbows, interpolateImg, maybeShowPreview],
    mapBased: true
  },
  video: {
    initware: [canvasInit, previewInit, videoInit],
    superMiddleware: [readCapture, interpolateImg, maybeShowPreview],
    mapBased: true
  }
};

export const serverOptions = {
  five: {
    0: { host: 'telecortex-00.local', opc_port },
    1: { host: 'telecortex-01.local', opc_port },
    2: { host: 'telecortex-02.local', opc_port },
    3: { host: 'telecortex-03.local', opc_port },
    4: { host: 'telecortex-04.local', opc_port }
  },
  four: {
    0: { host: 'telecortex-00.local', opc_port },
    1: { host: 'telecortex-01.local', opc_port },
    2: { host: 'telecortex-02.local', opc_port },
    4: { host: 'telecortex-04.local', opc_port }
  },
  'one-raspberrypi': {
    4: { host: 'raspberrypi.local', opc_port }
  },
  'one-localhost': {
    4: { host: 'localhost', opc_port }
  }
};

export const mappingOptions = {
  square_serp_12: {
    pixMaps: MAPS_SQUARE_SERP_12,
    panels: PANELS_SQUARE_SERP_12
  },
  square_serp_9: {
    pixMaps: MAPS_SQUARE_SERP_9,
    panels: PANELS_SQUARE_SERP_9
  },
  dome_overhead: {
    pixMaps: MAPS_DOME_OVERHEAD,
    panels: PANELS_DOME_OVERHEAD
  }
};

export const clientArgParser = require('yargs').options({
  animation: {
    alias: 'a',
    describe: 'Pick which animation is displayed',
    choices: Object.keys(animationOptions),
    default: 'directSimplexRainbows'
  },
  servers: {
    alias: 's',
    describe: 'Pick which servers are used',
    choices: Object.keys(serverOptions),
    default: 'five'
  },
  mapping: {
    alias: 'm',
    describe: 'Pick which mapping is used',
    choices: Object.keys(mappingOptions),
    default: 'dome_overhead'
  },
  videoFile: {
    describe: 'Pick the video used in the video animation'
  },
  enablePreview: {
    alias: 'p',
    type: 'boolean'
  },
  frameRateCap: {
    alias: 'f',
    type: 'number',
    default: Infinity
  }
});
