import cv from 'opencv4nodejs';
import fs from 'fs';
import { interpolatePixel, interpolatePixelMap } from './interpolation';
import { denormalizeCoordinate } from '../util';

const testFilename = 'src/client/test-data/rainbow.png';

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
  [
    {
      name: 'handles square image',
      shape: img.sizes,
      tests: [{ in_: [0.5, 0.5], out: [300, 300] }]
    },
    {
      name: 'handles portrait image',
      shape: [300, 400],
      tests: [
        { in_: [0.5, 0.5], out: [150, 200] },
        { in_: [0, 0.5], out: [0, 200] },
        { in_: [0.5, 0], out: [150, 50] }
      ]
    },
    {
      name: 'handles landscape image',
      shape: [400, 300],
      tests: [
        { in_: [0.5, 0], out: [200, 0] },
        { in_: [0, 0.5], out: [50, 150] },
        { in_: [0.5, 0.5], out: [200, 150] }
      ]
    }
  ].forEach(({ name, shape, tests }) => {
    it(name, () => {
      tests.forEach(({ in_, out }) => {
        expect(denormalizeCoordinate(shape, in_)).toEqual(out);
      });
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
