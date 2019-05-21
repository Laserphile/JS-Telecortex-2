import { clamp } from 'lodash';
import { cvPixelToRgb } from './graphics';

const validInterpolationTypes = [
  'nearest'
  // 'bilinear'
];
/**
 * Get the colour of a pixel from its coordinates within an image.
 * @param {Matrix} image
 * @param {Array} coordinates the coordinates of the pixel as [x, y]
 * @param {String} interpType on of 'nearest', 'biliniear'
 */
export const interpolatePixel = (image, coordinates, interpType = 'nearest') => {
  // TODO: support bilinear later
  if (!validInterpolationTypes.includes(interpType)) {
    throw new Error(`unsupported interpolation type: ${interpType}`);
  }
  if (interpType !== 'nearest') throw Error('Other interpolations not yet supported');
  return cvPixelToRgb(image.atRaw(Math.round(coordinates[0]), Math.round(coordinates[1])));
};

/**
 * Calculate the position of a normalized coordinate from a given image shape
 * @param {Array} shape The shape of the image which this coordinate is being mapped on to
 * @param {Array} coordinate The coordinate, [x, y] where x, y in [0, 1]
 */
export const denormalizeCoordinate = (shape, coordinate) => {
  const minDimension = Math.min(shape[0], shape[1]);
  const maxDimension = Math.max(shape[0], shape[1]);
  const deltaDimension = maxDimension - minDimension;
  if (shape[1] > shape[0]) {
    return [
      clamp(minDimension * coordinate[0], 0, shape[0] - 1),
      clamp(minDimension * coordinate[1] + deltaDimension / 2, 0, shape[1] - 1)
    ];
  }
  return [
    clamp(minDimension * coordinate[0] + deltaDimension / 2, 0, shape[0] - 1),
    clamp(minDimension * coordinate[1], 0, shape[1] - 1)
  ];
};

/**
 * Generate a pixel list from an image and a pixel map.
 * Given a cv.Matrix image and a pixel map showing the normalized position of each pixel,
 * return a colorsys RGB colour for each pixel in the map.
 * Normalized means instead of coordinates being on the frame like (420, 69),
 * they are values from 0.0 to 1.0.
 * @param {cv.Matrix} image
 * @param {Array} pixMapNormalized An array of normalized pixel coordinates,
 * @param {String} interpType The interpolation type used, in ['nearest']
 * @return {Array} a list of colorsys colours
 */
export const interpolatePixelMap = (image, pixMapNormalized, interpType = 'nearest') =>
  pixMapNormalized.map(coordinate =>
    interpolatePixel(image, denormalizeCoordinate(image.sizes, coordinate), interpType)
  );
