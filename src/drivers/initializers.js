import { getSquareCanvas, setupMainWindow, showPreview } from '../util/graphics';

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

}
