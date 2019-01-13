import { hsvToRgb } from 'colorsys';
import { rgb2sk9822 } from '../util/sk9822';

export const colorRainbows = context => {
  const { h } = context.hsv;
  context.hsv.h = (h + 1) % 360;
  context.frames += 1;
  context.rgb = hsvToRgb(context.hsv);

  context.data = Array.from({ length: context.numLeds }).reduce(
    accumulator => {
      accumulator = accumulator.concat(rgb2sk9822(context.rgb));
      return accumulator;
    },
    [0, 0, 0, 0]
  );
  return context;
};
