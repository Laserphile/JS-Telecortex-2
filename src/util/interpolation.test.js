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
    expect(denormalizeCoordinate([300, 400], [0.5, 0.5])).toMatchObject([150, 200]);
    expect(denormalizeCoordinate([300, 400], [0, 0.5])).toMatchObject([0, 200]);
    expect(denormalizeCoordinate([300, 400], [0.5, 0])).toMatchObject([150, 50]);
  });
  it('handles landscape image', () => {
    expect(denormalizeCoordinate([400, 300], [0.5, 0.5])).toMatchObject([200, 150]);
    expect(denormalizeCoordinate([400, 300], [0, 0.5])).toMatchObject([50, 150]);
    expect(denormalizeCoordinate([400, 300], [0.5, 0])).toMatchObject([200, 0]);
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
