const cv = require('opencv4nodejs');
const fs = require('fs');
import { interpolatePixel, denormalizeCoordinate, interpolatePixelMap } from '../interpolation';

const testFilename = 'test_data/rainbow.png';

if (!fs.existsSync(testFilename)) {
  throw Error("test file doesn't exist");
}

const img = cv.imread(testFilename);

describe('interpolatePixel', () => {
  it('works', () => {
    expect(interpolatePixel(img, [0, 0])).toMatchObject({
      b: 255,
      g: 255,
      r: 0
    });
  });
});
describe('denormalizeCoordinate', () => {
  it('works', () => {
    expect(denormalizeCoordinate(img.sizes, [0.5, 0.5])).toMatchObject([300, 300]);
  });
});
describe('interpolatePixelMap', () => {
  it('works', () => {
    expect(
      interpolatePixelMap(img, [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]])
    ).toMatchObject([
      {
        b: 255,
        g: 255,
        r: 0
      },
      {
        b: 128,
        g: 0,
        r: 255
      },
      {
        b: 0,
        g: 129,
        r: 255
      },
      {
        b: 255,
        g: 255,
        r: 0
      }
    ]);
  });
});
