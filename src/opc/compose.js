import { OPC_BODY_FIELDS } from './index';

export const composeOPCHeader = (channel, bytes) => [channel, 0, bytes >> 8, bytes % 0x100];

/**
 * TODO: write OPC composer
 */
export const composeOPCMessage = (channel, colours) => {
  return Buffer.from(
    colours.reduce((opcArray, colour) => {
      const pixelBytes = OPC_BODY_FIELDS.map(key => colour[key]);
      console.log(pixelBytes);
      opcArray.push(...pixelBytes);
      return opcArray;
    }, composeOPCHeader(channel, colours.length * 3))
  );
};
