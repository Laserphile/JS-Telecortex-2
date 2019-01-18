import { normalizePixMap } from './mapping';

const testPixMap = [[100, 100], [100, 300], [200, 100], [200, 300], [150, 200]];
const expectPixMap = [[0, 0], [0, 1], [0.5, 0], [0.5, 1], [0.25, 0.5]];

describe('normalizePixelMap', () => {
  it('works', () => {
    expect(normalizePixMap(testPixMap)).toEqual(expectPixMap);
  });
});
