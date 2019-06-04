// TODO remove this eslint disable
/* eslint-disable no-param-reassign */
import { hslToRgb } from 'colorsys';
import { times } from 'lodash';
import cv from 'opencv4nodejs';
import { norm } from 'mathjs';
import SimplexNoise from 'simplex-noise';
import { denormalizeCoordinate, msNow, nowFloat } from '@js-telecortex-2/js-telecortex-2-util';

const opencvChannelFields = ['b', 'g', 'r'];
export const IMG_SIZE = 512;
export const MAX_HUE = 360.0;
export const MAX_ANGLE = 360.0;
export const MAIN_WINDOW = 'Telecortex';
const DOT_RADIUS = 2;
const PREVIEW_FRAMERATE = 1;
export const defaultHSV = { h: 360, s: 100, v: 50 };

export const rgbTocvPixelRaw = rgb => opencvChannelFields.map(key => rgb[key]);

export const rgbTocvPixel = rgb => new cv.Vec(...rgbTocvPixelRaw(rgb));

export const cvPixelToRgb = cvPixel =>
  cvPixel.reduce(
    (accumulator, channelValue, channelIndex) =>
      Object.assign(accumulator, { [opencvChannelFields[channelIndex]]: channelValue }),
    {}
  );

export const cvBlackPixel = rgbTocvPixel({ r: 0, g: 0, b: 0 });
export const cvGreyPixel = rgbTocvPixel({ r: 128, g: 128, b: 128 });
export const cvWhitePixel = rgbTocvPixel({ r: 255, g: 255, b: 255 });

const PANEL_SCALE = 0.5;
const ANIM_SPEED = 1;

/**
 * Given an OpenCV Matrix of any dimensions, fill with ranbows.
 * @param {cv.Matrix} image A canvas on which to draw rainbows
 * @param {Number} angle the hue offset (from 0 to 1)
 * @param {Number} panelScale
 */
export const fillRainbows = (image, angle = 0.0, panelScale = PANEL_SCALE) => {
  const size = image.sizes[0];
  times(size, col => {
    const hue =
      ((col * MAX_HUE * panelScale) / size +
        (angle * ANIM_SPEED * MAX_HUE * panelScale) / MAX_ANGLE) %
      MAX_HUE;
    const rgb = hslToRgb({ h: hue, l: 50, s: 100 });
    const pixel = rgbTocvPixel(rgb);
    image.drawLine(new cv.Point(col, 0), new cv.Point(col, size), pixel, 2);
  });
  return image;
};

export const fillColour = (image, colour = cvBlackPixel) => {
  const size = image.sizes[0];
  times(size, col => {
    image.drawLine(new cv.Point(col, 0), new cv.Point(col, size), colour, 2);
  });
  return image;
};

export const addText = (image, text, origin = [1, 10], colour = { r: 128, g: 128, b: 128 }) => {
  image.putText(text, new cv.Point(...origin), 2, 0.4, rgbTocvPixel(colour), 0, 1, 1);
  return image;
};

const S = Math.sin;
const C = Math.cos;
const start = nowFloat();

export const directRainbows = (pixMap, angle = 0.0) => {
  const t = nowFloat() - start;
  // const center = [
  //   0.5 + 0.5 * S(t),
  //   0.5 + 0.5 * C(t)
  // ]
  const center = [0.5, 0.5];
  return pixMap.reduce((pixelList, vector) => {
    const position = [vector[0] - center[0], vector[1] - center[1]];
    const hue = (norm(position) * MAX_HUE + (angle * ANIM_SPEED * MAX_HUE) / MAX_ANGLE) % MAX_HUE;
    pixelList.push(hslToRgb({ h: hue, l: 50, s: 100 }));
    return pixelList;
  }, []);
};

/**
 * Replicate https://www.dwitter.net/d/12206
 */
export const directBlobbyRainbows = (pixMap, angle = 0.0) => {
  const t = nowFloat() - start;

  return pixMap.reduce((pixelList, vector) => {
    const i = Math.round(50 + 40 * vector[0]) + Math.round(20 + 21 * vector[1]);
    const hue = (i * S(S(t) * S(t * 2 + i * 0.157)) * C(i / 520) + i * 9) / (0.05 * C(t) + 1);
    pixelList.push(hslToRgb({ h: hue, l: 50, s: 100 }));
    return pixelList;
  }, []);
};

export const directSimplexRainbows = (pixMap, angle = 0.0) => {
  const d = nowFloat() - start;
  const t = 1 * Math.sin(d / 100) + 0.5 * d;
  const simplex = new SimplexNoise('seed');
  return pixMap.reduce((pixelList, vector) => {
    const hue = MAX_HUE * simplex.noise3D(vector[0] + d / 5, vector[1], t);
    pixelList.push(hslToRgb({ h: hue, l: 50, s: 100 }));
    return pixelList;
  }, []);
};

export const getSquareCanvas = (size = IMG_SIZE) => new cv.Mat(size, size, cv.CV_8UC3);

/**
 * Given an image and a normalized pixel map, draw the map on the image.
 * @param {cv.Mat} img The openCV canvas to draw on
 * @param {Array} pixMapNormalized Normalized pixel map coordinates
 * @param {Number} radius size of circle
 * @param {cv.Vec} outline colour of circle
 */
const drawMap = (img, pixMapNormalized, radius = DOT_RADIUS, outline = cvBlackPixel) => {
  pixMapNormalized.forEach(coordinate => {
    img.drawCircle(
      new cv.Point(...denormalizeCoordinate(img.sizes, coordinate).reverse()),
      radius,
      outline,
      1
    );
  });
};

/**
 * Create the main window using the background image provided.
 * @param {cv.Mat} img background image
 */
export const setupMainWindow = img => {
  // const window_flags = 0;
  // window_flags |= cv.WINDOW_NORMAL
  // # window_flags |= cv.WINDOW_AUTOSIZE
  // # window_flags |= cv.WINDOW_FREERATIO
  // window_flags |= cv.WINDOW_KEEPRATIO

  // cv.namedWindow(MAIN_WINDOW, window_flags);
  // cv.moveWindow(MAIN_WINDOW, 900, 900);
  // cv.resizeWindow(MAIN_WINDOW, 700, 700);
  cv.imshow(MAIN_WINDOW, img);
};

let lastWaitKey = 0;

/**
 * Draw the maps on img, wait to detect keypresses.
 * @param {cv.Mat} img background image
 * @param {Object} maps a collection of named pixel mappings
 * @param {Number} dotRadius
 * @param {Boolean} rescale
 * @return {Boolean} if a key was pressed
 */
export const showPreview = (img, maps = {}, dotRadius = DOT_RADIUS, rescale = true) => {
  if (rescale) {
    const maxSize = Math.max(...img.sizes);
    if (IMG_SIZE !== maxSize) {
      img = img.rescale(IMG_SIZE / maxSize);
    }
  }
  Object.values(maps).forEach(panelMap => {
    drawMap(img, panelMap, dotRadius + 1, cvWhitePixel);
    drawMap(img, panelMap, dotRadius);
  });
  cv.imshow(MAIN_WINDOW, img);
  if (msNow() - lastWaitKey > 1000 / PREVIEW_FRAMERATE) {
    lastWaitKey = msNow();
    const key = cv.waitKey(2) && 0xff;
    if (key === 27) {
      cv.destroyAllWindows();
      return true;
    }
    // else if (key == ord('d')) {
    // TODO: debug set trace here
    // }
  }
  return false;
};

