// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import { hsvToRgb } from 'colorsys';
import { defaultHSV } from '../graphics';

/**
 * Send a single colour to all pixels which changes over time
 * @param {object} context
 */
export const singleRainbow = context => {
  const { hsv = defaultHSV, numLeds = 360 } = context;
  const { h } = hsv;
  hsv.h = (h + 1) % 360;
  context.hsv = hsv;
  const rgb = hsvToRgb(hsv);
  context.colours = Array.from({ length: numLeds }, () => rgb);
  return context;
};

export const justBlack = context => {
  const { numLeds = 360 } = context;
  const rgb = hsvToRgb({ h: 0, s: 0, v: 0 });
  context.colours = Array.from({ length: numLeds }, () => rgb);
  return context;
};

/**
 * Send a flowing rainbow
 * @param {object} context
 */
export const rainbowFlow = context => {
  const { hsv = defaultHSV, numLeds = 360 } = context;
  const { h } = hsv;
  hsv.h = (h + 3) % 360;
  context.hsv = hsv;
  context.colours = Array.from({ length: numLeds }, (_, pixel) =>
    hsvToRgb({ ...hsv, h: (hsv.h + pixel * 3) % 360 })
  );
  return context;
};

const createChannelColours = (channels, colours) =>
  Object.keys(channels).reduce(
    (channelColours, channel) => Object.assign(channelColours, { [channel]: colours }),
    {}
  );

/**
 * Middleware callback which sends context.colours to all channels determined by channels
 * @param {object} context
 */
export const coloursToAllChannels = context => {
  const {
    channels = {
      0: 'big',
      1: 'smol',
      2: 'smol',
      3: 'smol'
    },
    colours
  } = context;
  context.channelColours = createChannelColours(channels, colours);
  return context;
};

/**
 * Generate a middleware callback which populates context.colourChannels with context.colours
 * copied to all `channels`
 * @param {Array} channels
 */
export const coloursToChannels = channels => context => {
  const { colours } = context;
  context.channelColours = createChannelColours(channels, colours);
  return context;
};
