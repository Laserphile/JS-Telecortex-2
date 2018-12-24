import { staticRainbowFactory } from './staticRainbow';
import { difference } from 'lodash/array';

const mockSpi = {
  transfer: jest.fn()
};

afterEach(() => {
  mockSpi.transfer.mockClear();
});

it('transfers data', () => {
  const staticRainbow = staticRainbowFactory([{spi: mockSpi}]);
  staticRainbow();
  expect(mockSpi.transfer.mock.calls.length).toBe(1);
  expect(mockSpi.transfer.mock.calls[0][0] instanceof Buffer).toBeTruthy();
  expect(mockSpi.transfer.mock.calls[0][1]).toBe(1444);
  expect(typeof mockSpi.transfer.mock.calls[0][2]).toBe('function');
});

it("doesn't send the same value", () => {
  const staticRainbow = staticRainbowFactory([{ spi: mockSpi }], 1);
  staticRainbow();
  staticRainbow();
  expect(mockSpi.transfer.mock.calls.length).toBe(2);
  expect(
    difference(mockSpi.transfer.mock.calls[0][0], mockSpi.transfer.mock.calls[0][1])
  ).not.toEqual([]);
});
