import {
  coloursToString,
  colourRateLogger,
  rgbTocvPixelRaw,
  cvPixelToRgb,
  fillRainbows,
  getSquareCanvas,
  // setupMainWindow,
  MAX_ANGLE
} from './graphics';
import { now } from '.';
// const cv = require('opencv4nodejs');

const someColours = [
  { r: 0xff, g: 0x00, b: 0x00 },
  { r: 0x00, g: 0xff, b: 0x00 },
  { r: 0x00, g: 0x00, b: 0xff }
];

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
    const size = 64;
    const img = getSquareCanvas(size);
    // expect(img.atRaw(size / 2, size / 2)).toEqual([0, 0, 0]);
    fillRainbows(img);
    expect(img.atRaw(size / 2, size / 2)).toEqual([255, 231, 0]);
  });
  it('works with nonzero angle', () => {
    const size = 64;
    const img = getSquareCanvas(size);
    // expect(img.atRaw(size / 2, size / 2)).toEqual([0, 0, 0]);
    fillRainbows(img, MAX_ANGLE / 6);
    expect(img.atRaw(size / 2, size / 2)).toEqual([255, 0, 24]);
    // setupMainWindow(img);
    // cv.waitKey();
  });
});
