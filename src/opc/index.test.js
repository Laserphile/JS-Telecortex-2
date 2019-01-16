import { handleOPCMessage, handleAllOPCMessages } from './index';
import 'jest';
import { composeOPCHeader } from './compose';
import { mockSpi0, singleChannels } from '../drivers/driverFactory.test';

const mockContext = {
  channels: singleChannels
};

const redPixel = [0xff, 0x00, 0x00];
const incompleteRedPixel = redPixel.slice(0, redPixel.length - 1);

describe('handleOPCMessage', () => {
  [
    {
      testName: 'handles invalid channel',
      inArray: composeOPCHeader(1, 3).concat(redPixel),
      validate: (data, response) => {
        expect(mockSpi0.transfer.mock.calls.length).toBe(0);
        expect(response).toBe(data.length);
      }
    },
    {
      testName: 'works',
      inArray: composeOPCHeader(0, 3).concat(redPixel),
      validate: (data, response) => {
        expect(mockSpi0.transfer.mock.calls.length).toBe(1);
        expect(mockSpi0.transfer.mock.calls[0]).toMatchSnapshot();
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
      testName: 'handles multiple messages',
      inArray: Array.of(
        ...composeOPCHeader(0, 3),
        ...redPixel,
        ...composeOPCHeader(0, 3),
        ...redPixel
      ),
      callLength: 2,
      validate: (_, response) => {
        expect(mockSpi0.transfer.mock.calls).toMatchSnapshot();
        expect(response).toBe(undefined);
      }
    },
    {
      testName: 'handles partial messages',
      inArray: composeOPCHeader(0, 3).concat(incompleteRedPixel),
      callLength: 0,
      validate: (data, response) => {
        expect(response).toBe(data);
      }
    },
    {
      testName: 'handles invalid channel',
      inArray: composeOPCHeader(0xff, 3).concat(redPixel),
      callLength: 0,
      validate: (_, response) => {
        expect(response).toBe(undefined);
      }
    }
  ].forEach(({ testName, inArray, callLength, validate }) => {
    it(testName, () => {
      const data = Buffer.from(inArray);
      validate(data, handleAllOPCMessages(mockContext, data));
      expect(mockSpi0.transfer.mock.calls.length).toBe(callLength);
    });
  });
});
