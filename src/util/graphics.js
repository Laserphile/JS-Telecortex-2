import chalk from 'chalk';
import { sprintf } from 'sprintf-js';
import { rgbToHsv, hslToRgb, rgbToHex } from 'colorsys';
import { now } from './index';
import { times } from 'lodash';
import { denormalizeCoordinate } from './interpolation';
const cv = require('opencv4nodejs');

export const colourMessage = (hue, msg) => chalk.hsv(hue, 50, 100)(msg);
const opencvChannelFields = ['b', 'g', 'r'];
export const IMG_SIZE = 128;
export const MAX_HUE = 360.0;
export const MAX_ANGLE = 360.0;
export const MAIN_WINDOW = 'Telecortex';
const DOT_RADIUS = 3;
const TARGET_FRAMERATE = 20;
export const defaultHSV = { h: 360, s: 100, v: 10 };

/**
 * Convert a single colorsys object to string
 * @param {colorsys RGB object} colour
 */
export const colourToString = colour => {
  return rgbToHex(colour);
};

/**
 * Convert a colours specification to string
 * @param {Array of colorsys RGB objects} colours
 */
export const coloursToString = colours => {
  return colours.reduce((accumulator, colour) => {
    return accumulator.concat(colourMessage(rgbToHsv(colour).h, colourToString(colour)));
  }, '');
};

/**
 * Middleware used to log a colour being processed, and the framerate.
 * @param {object} context
 */
export const colourRateLogger = context => {
  const { start = 0, lastPrint = now(), frames = 0, channelColours } = context;
  context.frames += 1;
  if (now() - lastPrint > 1) {
    context.rate = frames / (now() - start + 1);
    console.log(
      coloursToString(Object.values(channelColours)[0].slice(0, 10)) +
        ` : ${context.rate.toFixed(2)}`
    );
    context.lastPrint = now();
  }
  return context;
};

export const rgbTocvPixelRaw = rgb => {
  return opencvChannelFields.map(key => rgb[key]);
};

export const rgbTocvPixel = rgb => {
  return new cv.Vec(...rgbTocvPixelRaw(rgb));
};

export const cvPixelToRgb = cvPixel => {
  return cvPixel.reduce(
    (accumulator, channelValue, channelIndex) => (
      (accumulator[opencvChannelFields[channelIndex]] = channelValue), accumulator
    ),
    {}
  );
};

export const cvBlackPixel = rgbTocvPixel({ r: 0, g: 0, b: 0 });
export const cvGreyPixel = rgbTocvPixel({ r: 128, g: 128, b: 128 });
export const cvWhitePixel = rgbTocvPixel({ r: 255, g: 255, b: 255 });

/**
 * Given an OpenCV Matrix of any dimensions, fill with ranbows.
 * @param {cv.Matrix} image A canvas on which to draw rainbows
 * @param {Number} angle the hue offset (from 0 to 1)
 */
export const fillRainbows = (image, angle = 0.0) => {
  const size = image.sizes[0];
  times(size, col => {
    const hue = ((col * MAX_HUE) / size + (angle * MAX_HUE) / MAX_ANGLE) % MAX_HUE;
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

export const directRainbows = (pixMap, angle = 0.0) => {
  return pixMap.reduce((pixelList, [x, y]) => {
    const magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const hue = (magnitude * MAX_HUE + (angle * MAX_HUE) / MAX_ANGLE) % MAX_HUE;
    pixelList.push(hslToRgb({ h: hue, l: 50, s: 100 }));
    return pixelList;
  }, []);
};

export const getSquareCanvas = (size = IMG_SIZE) => {
  return new cv.Mat(size, size, cv.CV_8UC3);
};

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
  // cv.moveWindow(MAIN_WINDOW, 900, 0);
  // cv.resizeWindow(MAIN_WINDOW, 700, 700);
  cv.imshow(MAIN_WINDOW, img);
};

/**
 * Draw the maps on img, wait to detect keypresses.
 * @param {cv.Mat} img background image
 * @param {Object} maps a collection of named pixel mappings
 * @return {Boolean} if a key was pressed
 */
export const showPreview = (img, maps = {}) => {
  Object.values(maps).forEach(panelMap => {
    drawMap(img, panelMap, DOT_RADIUS + 1, cvWhitePixel);
    drawMap(img, panelMap, DOT_RADIUS);
  });
  cv.imshow(MAIN_WINDOW, img);
  if (Math.round((now() * TARGET_FRAMERATE) / 2) % 2 === 0) {
    const key = cv.waitKey(2) & 0xff;
    if (key == 27) {
      cv.destroyAllWindows();
      return true;
    }
    // else if (key == ord('d')) {
    // TODO: debug set trace here
    //}
  }
  return false;
};
