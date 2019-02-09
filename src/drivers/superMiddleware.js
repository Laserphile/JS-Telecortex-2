import { showPreview, fillRainbows } from '../util/graphics';
import { interpolatePixelMap } from '../util/interpolation';

export const basicRainbows = superContext => {
  fillRainbows(superContext.img, superContext.frameNumber);
  return superContext;
};

/**
 * Use the image provided by superContext to interpolate a pixelList
 * @param {Object} superContext
 */
export const interpolateImg = superContext => {
  try {
    Object.entries(superContext.pixMaps).forEach(([name, pixMap]) => {
      superContext.pixelLists[name] = interpolatePixelMap(superContext.img, pixMap);
    });
  } catch (err) {
    console.error(err);
    process.exit();
  }
  return superContext;
};

export const readCapture = superContext => {
  superContext.img = superContext.cap.read();
  const sizes = superContext.img.sizes;
  // console.log(`img dimensions ${sizes}, ${typeof sizes}, ${JSON.stringify(sizes)}`);
  // console.log(`1: ${superContext.cap.get(1)}`);
  if (!sizes.length) {
    // console.error('resetting!');
    superContext.cap.set(1, 1);
    superContext.img = superContext.cap.read();
  }
  // superContext.img = superContext.img.rescale(0.2);
  return superContext;
};

export const maybeShowPreview = superContext => {
  if (superContext.enablePreview) {
    showPreview(superContext.img, superContext.pixMaps);
  }
  return superContext;
};
