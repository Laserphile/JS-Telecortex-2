import { handleOPCMessage, handleAllOPCMessages } from './index';
import 'jest';

const transferFn = jest.fn();

const mockContext = {
  spidevs: [
    {
      spi: {
        transfer: transferFn
      },
      bus: 0,
      device: 0
    }
  ]
};

afterEach(() => {
  mockContext.spidevs[0].spi.transfer.mockClear();
});

describe('handleOPCMessage', () => {
  [
    {
      testName: 'handles invalid channel',
      inArray: [0x01, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00],
      validate: (data, response) => {
        expect(transferFn.mock.calls.length).toBe(0);
        expect(response).toBe(data.length);
      }
    },
    {
      testName: 'works',
      inArray: [0x00, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00],
      validate: (data, response) => {
        expect(transferFn.mock.calls.length).toBe(1);
        expect(transferFn.mock.calls[0]).toMatchSnapshot();
        expect(response).toBe(data.length);
      }
    }
  ].forEach(({ testName, inArray, validate }) => {
    it(testName, () => {
      const data = Buffer.from(inArray);
      validate(data, handleOPCMessage(mockContext, data));
    });
  });
});

describe('handleAllOPCMessages', () => {
  [
    {
      testName: 'handles partial messages',
      inArray: [0x00, 0x00, 0x00, 0x03, 0xff, 0x00],
      validate: (data, response) => {
        expect(transferFn.mock.calls.length).toBe(0);
        expect(response).toBe(data);
      }
    },
    {
      testName: 'handles invalid messages',
      inArray: [0xff, 0x00, 0x00, 0x03, 0xff, 0x00],
      validate: (_, response) => {
        expect(transferFn.mock.calls.length).toBe(0);
        expect(response).toBe(undefined);
      }
    },
    {
      testName: 'handles multiple messages',
      inArray: [0x00, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00],
      validate: (_, response) => {
        expect(transferFn.mock.calls.length).toBe(2);
        expect(transferFn.mock.calls).toMatchSnapshot();
        expect(response).toBe(undefined);
      }
    }
  ].forEach(({ testName, inArray, validate }) => {
    it(testName, () => {
      const data = Buffer.from(inArray);
      validate(data, handleAllOPCMessages(mockContext, data));
    });
  });
});
