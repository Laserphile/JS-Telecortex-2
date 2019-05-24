import { OPC_BODY_FIELDS } from './constants';

// eslint-disable-next-line no-bitwise
export const composeOPCHeader = (channel, bytes) => [channel, 0, bytes >> 8, bytes % 0x100];

/**
 * TODO: write OPC composer
 */
export const composeOPCMessage = (channel, colours) =>
  Buffer.from(
    colours.reduce((opcArray, colour) => {
      const pixelBytes = OPC_BODY_FIELDS.map(key => colour[key]);
      opcArray.push(...pixelBytes);
      return opcArray;
    }, composeOPCHeader(channel, colours.length * 3))
  );
