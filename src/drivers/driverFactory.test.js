import { driverFactory, opcClientDriver } from './driverFactory';
import {
  singleRainbow,
  rainbowFlow,
  coloursToAllChannels,
  coloursToChannels
} from './middleware';
import { difference } from 'lodash/array';

const mockSpi0 = { transfer: jest.fn() };
const mockSpi1 = { transfer: jest.fn() };
const mockSpi2 = { transfer: jest.fn() };
const mockSpi3 = { transfer: jest.fn() };

const singleSpidevs = [
  {
    bus: 0,
    device: 0,
    spi: mockSpi0
  }
];

const multiSpidevs = [
  {
    bus: 0,
    device: 0,
    spi: mockSpi0
  },
  {
    bus: 0,
    device: 1,
    spi: mockSpi1
  },
  {
    bus: 1,
    device: 0,
    spi: mockSpi2
  },
  {
    bus: 1,
    device: 1,
    spi: mockSpi3
  }
];

afterEach(() => {
  mockSpi0.transfer.mockClear();
  mockSpi1.transfer.mockClear();
  mockSpi2.transfer.mockClear();
  mockSpi3.transfer.mockClear();
});

const channelColours = { 0: [{ r: 1, g: 2, b: 3 }] };

it('transfers data', () => {
  const staticRainbow = driverFactory({ spidevs: singleSpidevs, channelColours });
  staticRainbow();
  expect(mockSpi0.transfer.mock.calls.length).toBe(1);
  expect(mockSpi0.transfer.mock.calls[0][0] instanceof Buffer).toBeTruthy();
  expect(mockSpi0.transfer.mock.calls[0][1]).toBe(8);
  expect(typeof mockSpi0.transfer.mock.calls[0][2]).toBe('function');
});

it("doesn't send the same value when driving rainbows", () => {
  const staticRainbow = driverFactory({ spidevs: singleSpidevs }, [
    singleRainbow,
    coloursToAllChannels
  ]);
  staticRainbow();
  staticRainbow();
  expect(mockSpi0.transfer.mock.calls.length).toBe(2);
  expect(
    difference(mockSpi0.transfer.mock.calls[0][0], mockSpi0.transfer.mock.calls[0][1])
  ).not.toEqual([]);
});

it('sends colours to the right channels', () => {
  const staticRainbow = driverFactory({ spidevs: multiSpidevs }, [
    singleRainbow,
    coloursToChannels([1, 3])
  ]);
  staticRainbow();
  expect(mockSpi0.transfer.mock.calls.length).toBe(0);
  expect(mockSpi1.transfer.mock.calls.length).toBe(1);
  expect(mockSpi2.transfer.mock.calls.length).toBe(0);
  expect(mockSpi3.transfer.mock.calls.length).toBe(1);
  expect(
    difference(mockSpi1.transfer.mock.calls[0][0], mockSpi3.transfer.mock.calls[0][1])
  ).not.toEqual([]);
});

describe('opcClientDriver', () => {
  const mockClient = { write: jest.fn() };
  it('writes data to OPC Server socket', () => {
    const rainbowFlowLoop = driverFactory(
      { client: mockClient, channelColours },
      [rainbowFlow, coloursToChannels([2])],
      opcClientDriver
    );
    rainbowFlowLoop();
    expect(mockClient.write.mock.calls.length).toBe(1);
    expect(mockClient.write.mock.calls.length).toMatchSnapshot();
  });
});
