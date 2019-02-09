import { getSquareCanvas, setupMainWindow, showPreview } from '../util/graphics';
const cv = require('opencv4nodejs');

/**
 * Initializer used for animations which involve canvases
 * @param {Object} superContext
 */
export const canvasInit = superContext => {
  superContext.img = getSquareCanvas();
  return superContext;
};

export const previewInit = superContext => {
  setupMainWindow(superContext.img);
  showPreview(superContext.img, superContext.pixMaps);
  return superContext;
};

export const videoInit = superContext => {
  superContext.cap = new cv.VideoCapture(superContext.videoFile);
  superContext.img = superContext.cap.read() ;
}
