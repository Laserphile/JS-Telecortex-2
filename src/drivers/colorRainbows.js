import { hsvToRgb } from 'colorsys';

export const colorRainbows = context => {
  const { hsv = { h: 360, s: 100, v: 10 }, spidevs, numLeds = 360 } = context;
  const { h } = hsv;
  hsv.h = (h + 1) % 360;
  context.hsv = hsv;
  const rgb = hsvToRgb(hsv);
  context.channelColours = spidevs.reduce(
    (channelColours, _, channel) => (
      (channelColours[channel] = Array.from({ length: numLeds }, () => rgb)), channelColours
    ),
    {}
  );
  return context;
};
