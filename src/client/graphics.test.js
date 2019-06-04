import cv from 'opencv4nodejs';
import { now, colourRateLogger, coloursToString } from '@js-telecortex-2/js-telecortex-2-util';
import {
  rgbTocvPixelRaw,
  cvPixelToRgb,
  fillRainbows,
  getSquareCanvas,
  setupMainWindow,
  MAX_ANGLE,
  showPreview,
  fillColour,
  cvGreyPixel,
  cvBlackPixel,
  cvWhitePixel,
  directRainbows
} from './graphics';

const someColours = [
  { r: 0xff, g: 0x00, b: 0x00 },
  { r: 0x00, g: 0xff, b: 0x00 },
  { r: 0x00, g: 0x00, b: 0xff }
];

const size = 64;
const img = getSquareCanvas(size);

let waitKeyRetval = 0xff;
cv.waitKey = jest.fn(() => waitKeyRetval);
cv.destroyAllWindows = jest.fn();
cv.imshow = jest.fn();

beforeEach(() => {
  cv.waitKey.mockClear();
  cv.destroyAllWindows.mockClear();
  cv.imshow.mockClear();
});

afterAll(() => {
  jest.resetAllMocks();
});

describe('coloursToString', () => {
  it('works', () => {
    expect(coloursToString(someColours)).toBeTruthy();
    // This doesn't work because chalk uses different ANSI
    // escape codes on debian / bsd:
    // expect(coloursToString(someColours)).toMatchSnapshot();
  });
});

describe('colourRateLogger', () => {
  it("doesn't print too often", () => {
    console.log = jest.fn();
    const context = { lastPrint: now(), start: now(), channelColours: { 0: someColours } };
    colourRateLogger(context);
    expect(console.log.mock.calls.length).toBe(0);
  });
  it('prints after a more than a second', () => {
    console.log = jest.fn();
    const context = { lastPrint: now() - 2, start: now() - 2, channelColours: { 0: someColours } };
    colourRateLogger(context);
    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0]).toBeTruthy();
  });
});

describe('rgbTocvPixelRaw', () => {
  it('works', () => {
    expect(rgbTocvPixelRaw({ r: 255, g: 128, b: 0 })).toEqual([0, 128, 255]);
  });
});

describe('cvPixelToRgb', () => {
  it('works', () => {
    expect(cvPixelToRgb([0, 128, 255])).toEqual({ r: 255, g: 128, b: 0 });
  });
});

describe('fillRainbows', () => {
  it('works', () => {
    fillColour(img, cvBlackPixel);
    expect(img.at(size / 2, size / 2)).toEqual(cvBlackPixel);
    fillRainbows(img, 0, 1);
    expect(img.atRaw(size / 2, size / 2)).toEqual([255, 231, 0]);
  });
  it('works with nonzero angle', () => {
    fillColour(img, cvBlackPixel);
    expect(img.at(size / 2, size / 2)).toEqual(cvBlackPixel);
    fillRainbows(img, MAX_ANGLE / 6, 1);
    expect(img.atRaw(size / 2, size / 2)).toEqual([255, 0, 24]);
    // setupMainWindow(img);
    // cv.waitKey();
  });
});

describe('directRainbows', () => {
  it('works', () => {
    const pixMap = [[0.5, 0.5], [1, 1]];
    // expect(directRainbows(pixMap)).toEqual([{ b: 255, g: 0, r: 62 }, { b: 124, g: 255, r: 0 }]);
    expect(directRainbows(pixMap)).toMatchSnapshot();
  });
});

describe('showPreview', () => {
  const someMaps = {
    smol: [[0.5, 0.5]]
  };
  const tinyImg = getSquareCanvas(9);
  fillColour(tinyImg, cvGreyPixel);

  it('draws a map', () => {
    expect(tinyImg.at(4, 4)).toEqual(cvGreyPixel);
    expect(tinyImg.at(7, 4)).toEqual(cvGreyPixel);
    expect(tinyImg.at(8, 4)).toEqual(cvGreyPixel);
    // console.error(tinyImg.getDataAsArray());
    showPreview(tinyImg, someMaps, 3, false);
    // console.error(tinyImg.getDataAsArray());
    expect(tinyImg.at(4, 4)).toEqual(cvGreyPixel);
    expect(tinyImg.at(7, 4)).toEqual(cvBlackPixel);
    expect(tinyImg.at(8, 4)).toEqual(cvWhitePixel);
    expect(cv.waitKey.mock.calls.length).toBe(1);
    expect(cv.destroyAllWindows.mock.calls.length).toBe(0);
  });

  it.skip('exits on escape key', () => {
    showPreview(tinyImg, someMaps);
    expect(cv.waitKey.mock.calls.length).toBe(1);
    expect(cv.destroyAllWindows.mock.calls.length).toBe(0);
    waitKeyRetval = 27;
    showPreview(tinyImg, someMaps);
    expect(cv.waitKey.mock.calls.length).toBe(2);
    expect(cv.destroyAllWindows.mock.calls.length).toBe(1);
  });
});

describe('setupMainWindow', () => {
  it('shows image', () => {
    setupMainWindow(img);
    expect(cv.imshow.mock.calls.length).toBe(1);
  });
});
