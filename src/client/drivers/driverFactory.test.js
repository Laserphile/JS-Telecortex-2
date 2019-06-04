import { difference } from 'lodash';
import { driverFactory, ledDriver, opcClientDriver } from './driverFactory';
import { coloursToAllChannels, coloursToChannels, rainbowFlow, singleRainbow } from './middleware';
import { mockMultiChannel, mockSingleChannel, mockSpi } from '../testing';

const mockSpi0 = mockSpi(jest.fn());
const mockSpi1 = mockSpi(jest.fn());
const mockSpi2 = mockSpi(jest.fn());
const mockSpi3 = mockSpi(jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

const oldError = console.error;
console.error = jest.fn();

afterAll(() => {
  jest.resetAllMocks();
  console.error = oldError;
});

const channelColours = { 0: [{ r: 1, g: 2, b: 3 }] };

describe('ledDriver', () => {
  it('transfers data', () => {
    const staticRainbow = driverFactory(
      {
        channels: mockMultiChannel(mockSpi0, mockSpi1, mockSpi2, mockSpi3),
        channelColours
      },
      [],
      ledDriver
    );
    staticRainbow();
    expect(mockSpi0.transfer.mock.calls.length).toBe(1);
    expect(mockSpi0.transfer.mock.calls[0][0] instanceof Buffer).toBeTruthy();
    expect(mockSpi0.transfer.mock.calls[0][1]).toBe(8);
    expect(typeof mockSpi0.transfer.mock.calls[0][2]).toBe('function');
  });

  it("doesn't send the same value when driving rainbows", () => {
    const staticRainbow = driverFactory(
      {
        spidevs: mockSingleChannel(mockSpi0),
        channels: mockMultiChannel(mockSpi0, mockSpi1, mockSpi2, mockSpi3)
      },
      [singleRainbow, coloursToAllChannels],
      ledDriver
    );
    staticRainbow();
    staticRainbow();
    expect(mockSpi0.transfer.mock.calls.length).toBe(2);
    expect(
      difference(mockSpi0.transfer.mock.calls[0][0], mockSpi0.transfer.mock.calls[0][1])
    ).not.toEqual([]);
  });

  it('sends colours to the right channels', () => {
    const staticRainbow = driverFactory(
      {
        channels: mockMultiChannel(mockSpi0, mockSpi1, mockSpi2, mockSpi3)
      },
      [
        singleRainbow,
        coloursToChannels({
          1: {},
          3: {}
        })
      ],
      ledDriver
    );
    staticRainbow();
    expect(mockSpi0.transfer.mock.calls.length).toBe(0);
    expect(mockSpi1.transfer.mock.calls.length).toBe(1);
    expect(mockSpi2.transfer.mock.calls.length).toBe(0);
    expect(mockSpi3.transfer.mock.calls.length).toBe(1);
    expect(
      difference(mockSpi1.transfer.mock.calls[0][0], mockSpi3.transfer.mock.calls[0][1])
    ).not.toEqual([]);
  });

  it('logs spi transfer errors', () => {
    const singleErroringChannel = JSON.parse(JSON.stringify(mockSingleChannel(mockSpi0)));
    singleErroringChannel[0].spi.transfer = (_, __, callback) => {
      const err = new Error('test');
      callback(err);
    };
    const staticRainbow = driverFactory(
      { channels: singleErroringChannel },
      [singleRainbow, coloursToAllChannels],
      ledDriver
    );
    staticRainbow();
    expect(console.error.mock.calls.length).toBe(1);
  });

  it('ignores spi loopback', () => {
    const singleLoopingChannel = JSON.parse(JSON.stringify(mockSingleChannel(mockSpi0)));
    singleLoopingChannel[0].spi.transfer = (data, length, callback) => {
      callback(undefined, data.slice(0, length));
    };
    const staticRainbow = driverFactory(
      { channels: singleLoopingChannel },
      [singleRainbow, coloursToAllChannels],
      ledDriver
    );
    staticRainbow();
    expect(console.error.mock.calls.length).toBe(0);
  });
});

describe('opcClientDriver', () => {
  const mockClient = { write: jest.fn() };
  it('writes data to OPC Server socket', () => {
    const rainbowFlowLoop = driverFactory(
      {
        client: mockClient,
        channelColours,
        channels: mockMultiChannel(mockSpi0, mockSpi1, mockSpi2, mockSpi3)
      },
      [rainbowFlow, coloursToChannels([2])],
      opcClientDriver
    );
    rainbowFlowLoop();
    expect(mockClient.write.mock.calls.length).toBe(1);
    expect(mockClient.write.mock.calls.length).toMatchInlineSnapshot(`1`);
  });
});
