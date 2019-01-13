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

/**
 * Decorator which resets mockCalls after a callback
 */
const withTransferMockClear = callback => {
  return () => {
    callback();
    transferFn.mockClear();
  };
};

describe('handleOPCMessage', () => {
  it(
    'handles invalid channel',
    withTransferMockClear(() => {
      const data = Buffer.from([0x01, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00]);
      const bytesRead = handleOPCMessage(mockContext, data);
      expect(transferFn.mock.calls.length).toBe(0);
      expect(bytesRead).toBe(data.length);
      // TODO: test console.error
    })
  );
  it(
    'works',
    withTransferMockClear(() => {
      const data = Buffer.from([0x00, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00]);
      const bytesRead = handleOPCMessage(mockContext, data);
      expect(transferFn.mock.calls.length).toBe(1);
      expect(transferFn.mock.calls[0]).toMatchSnapshot();
      expect(bytesRead).toBe(data.length);
    })
  );
});

describe('handleAllOPCMessages', () => {
  it(
    'handles partial messages',
    withTransferMockClear(() => {
      const data = Buffer.from([0x00, 0x00, 0x00, 0x03, 0xff, 0x00]);
      const response = handleAllOPCMessages(mockContext, data);
      expect(transferFn.mock.calls.length).toBe(0);
      expect(response).toBe(data);
    })
  );
  it(
    'handles invalid messages',
    withTransferMockClear(() => {
      const data = Buffer.from([0xff, 0x00, 0x00, 0x03, 0xff, 0x00]);
      const response = handleAllOPCMessages(mockContext, data);
      expect(transferFn.mock.calls.length).toBe(0);
      expect(response).toBe(undefined);
    })
  );
  it(
    'handles multiple messages',
    withTransferMockClear(() => {
      const data = Buffer.from([
        0x00,
        0x00,
        0x00,
        0x03,
        0xff,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x03,
        0xff,
        0x00,
        0x00
      ]);
      const response = handleAllOPCMessages(mockContext, data);
      expect(transferFn.mock.calls.length).toBe(2);
      expect(transferFn.mock.calls).toMatchSnapshot();
      expect(response).toBe(undefined);
    })
  );
});
