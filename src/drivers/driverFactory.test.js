import { driverFactory } from './driverFactory';
import { difference } from 'lodash/array';
import { colorRainbows } from './colorRainbows';

const mockSpi = {
  transfer: jest.fn()
};

const spidevs = [
  {
    bus: 0,
    device: 0,
    spi: mockSpi
  }
];

afterEach(() => {
  mockSpi.transfer.mockClear();
});

it('transfers data', () => {
  const channelColours = { 0: [{ r: 1, g: 2, b: 3 }] };
  const staticRainbow = driverFactory({ spidevs, channelColours });
  staticRainbow();
  expect(mockSpi.transfer.mock.calls.length).toBe(1);
  expect(mockSpi.transfer.mock.calls[0][0] instanceof Buffer).toBeTruthy();
  expect(mockSpi.transfer.mock.calls[0][1]).toBe(8);
  expect(typeof mockSpi.transfer.mock.calls[0][2]).toBe('function');
});

it("doesn't send the same value when driving rainbows", () => {
  const staticRainbow = driverFactory({ spidevs }, [colorRainbows]);
  staticRainbow();
  staticRainbow();
  expect(mockSpi.transfer.mock.calls.length).toBe(2);
  expect(
    difference(mockSpi.transfer.mock.calls[0][0], mockSpi.transfer.mock.calls[0][1])
  ).not.toEqual([]);
});
