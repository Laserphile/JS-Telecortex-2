import { hsvToRgb } from 'colorsys';
import { colourToString } from '../util'

/**
 * Send a single colour to all pixels which changes over time
 * @param {object} context
 */
export const singleRainbow = context => {
  const { hsv = { h: 360, s: 100, v: 10 }, numLeds = 360 } = context;
  const { h } = hsv;
  hsv.h = (h + 1) % 360;
  context.hsv = hsv;
  const rgb = hsvToRgb(hsv);
  context.colours = Array.from({ length: numLeds }, () => rgb);
  return context;
};

/**
 * Send a flowing rainbow
 * @param {object} context
 */
export const rainbowFlow = context => {
  const { hsv = { h: 360, s: 100, v: 10 }, numLeds = 360 } = context;
  const { h } = hsv;
  hsv.h = (h + 3) % 360;
  context.hsv = hsv;
  context.colours = Array.from({ length: numLeds }, (_, pixel) => {
    return hsvToRgb({ ...hsv, h: (hsv.h + pixel * 3) % 360 });
  });
  return context;
};

/**
 * Middleware callback which sends context.colours to all channels determined by spidevs
 * @param {object} context
 */
export const coloursToAllChannels = context => {
  const { spidevs, colours } = context;
  context.channelColours = spidevs.reduce(
    (channelColours, _, channel) => ((channelColours[channel] = colours), channelColours),
    {}
  );
  return context;
};

/**
 * Generate a middleware callback which sends context.colours channels
 * @param {Array} channels
 */
export const coloursToChannels = channels => {
  return context => {
    const { colours } = context;
    context.channelColours = channels.reduce(
      (channelColours, channel) => ((channelColours[channel] = colours), channelColours),
      {}
    );
    return context;
  };
};
