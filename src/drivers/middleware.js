import { hsvToRgb } from 'colorsys';
import { defaultHSV } from '../util/graphics';

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

/**
 * Send a flowing rainbow
 * @param {object} context
 */
export const rainbowFlow = context => {
  const { hsv = defaultHSV, numLeds = 360 } = context;
  const { h } = hsv;
  hsv.h = (h + 3) % 360;
  context.hsv = hsv;
  context.colours = Array.from({ length: numLeds }, (_, pixel) => {
    return hsvToRgb({ ...hsv, h: (hsv.h + pixel * 3) % 360 });
  });
  return context;
};

/**
 * Middleware callback which sends context.colours to all channels determined by channels
 * @param {object} context
 */
export const coloursToAllChannels = context => {
  const { channels, colours } = context;
  context.channelColours = Object.keys(channels).reduce(
    (channelColours, channel) => ((channelColours[channel] = colours), channelColours),
    {}
  );
  return context;
};

/**
 * Generate a middleware callback which populates context.colourChannels with context.colours
 * copied to all `channels`
 * @param {Array} channels
 */
export const coloursToChannels = channels => {
  return context => {
    const { colours } = context;
    context.channelColours = Object.keys(channels).reduce(
      (channelColours, channel) => ((channelColours[channel] = colours), channelColours),
      {}
    );
    return context;
  };
};
