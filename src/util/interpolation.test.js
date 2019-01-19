const cv = require('opencv4nodejs');
const fs = require('fs');
import { interpolatePixel, denormalizeCoordinate, interpolatePixelMap } from './interpolation';

const testFilename = 'test_data/rainbow.png';

if (!fs.existsSync(testFilename)) {
  throw Error("test file doesn't exist");
}

const img = cv.imread(testFilename);

describe('interpolatePixel', () => {
  it('works', () => {
    expect(interpolatePixel(img, [0, 0])).toMatchObject({ b: 255, g: 255, r: 0 });
  });
  it('handles unsupported interpolation type', () => {
    expect(() => interpolatePixel(img, [0, 0], 'foo')).toThrow();
  });
});
describe('denormalizeCoordinate', () => {
  it('handles square image', () => {
    expect(denormalizeCoordinate(img.sizes, [0.5, 0.5])).toMatchObject([300, 300]);
  });
  it('handles portrait image', () => {
    const imgShape = [300, 400];
    [
      { in_: [0.5, 0.5], out: [150, 200] },
      { in_: [0, 0.5], out: [0, 200] },
      { in_: [0.5, 0], out: [150, 50] }
    ].forEach(({ in_, out }) => {
      expect(denormalizeCoordinate(imgShape, in_)).toEqual(out);
    });
  });
  it('handles landscape image', () => {
    const imgShape = [400, 300];
    [
      { in_: [0.5, 0.5], out: [200, 150] },
      { in_: [0, 0.5], out: [50, 150] },
      { in_: [0.5, 0], out: [200, 0] }
    ].forEach(({ in_, out }) => {
      expect(denormalizeCoordinate(imgShape, in_)).toEqual(out);
    });
  });
});
describe('interpolatePixelMap', () => {
  it('works', () => {
    expect(
      interpolatePixelMap(img, [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]])
    ).toMatchObject([
      { b: 255, g: 255, r: 0 },
      { b: 128, g: 0, r: 255 },
      { b: 0, g: 129, r: 255 },
      { b: 255, g: 255, r: 0 }
    ]);
  });
});
