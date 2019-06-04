import { denormalizeCoordinate } from '@js-telecortex-2/js-telecortex-2-util';
import { cvPixelToRgb } from './graphics';

/**
 * Get the colour of a pixel from its coordinates within an image.
 * @param {Matrix} image
 * @param {Array} coordinates the coordinates of the pixel as [x, y]
 * @param {String} interpType on of 'nearest', 'biliniear'
 */
export const interpolatePixel = (image, coordinates, interpType = 'nearest') => {
  // TODO: support bilinear later
  const validInterpolationTypes = [
    'nearest'
    // 'bilinear'
  ];
  if (validInterpolationTypes.indexOf(interpType) < 0) {
    throw new Error(`unsupported interpolation type: ${interpType}`);
  }
  if (interpType !== 'nearest')
    throw new Error('only "nearest" interpolation type currently supported');
  return cvPixelToRgb(image.atRaw(Math.round(coordinates[0]), Math.round(coordinates[1])));
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
