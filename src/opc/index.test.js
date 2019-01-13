import { handleOPCMessage } from './index';
import 'jest';

describe('handleOPCMessage', () => {
  const mockContext = {
    spidevs: [
      {
        spi: {
          transfer: jest.fn()
        },
        bus: 0,
        device: 0
      }
    ]
  };
  const mockCalls = mockContext.spidevs[0].spi.transfer.mock.calls;
  it('handles invalid channel', () => {
    const data = Buffer.from([0x01, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00]);
    const bytesRead = handleOPCMessage(mockContext, data);
    expect(mockCalls.length).toBe(0);
    expect(bytesRead).toBe(data.length);
    // TODO: test console.error
    // clear calls
    mockCalls.splice(0, mockCalls.length);
  });
  it('works', () => {
    handleOPCMessage(mockContext, Buffer.from([0x00, 0x00, 0x00, 0x03, 0xff, 0x00, 0x00]));
    expect(mockCalls.length).toBe(1);
    expect(mockCalls[0]).toMatchSnapshot();
    mockCalls.splice(0, mockCalls.length);
  });
});
