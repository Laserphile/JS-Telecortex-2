import { OPC_BODY_FIELDS } from './index';

/**
 * TODO: write OPC composer
 */
export const composeOPCMessage = (channel, colours) => {
  const bytes = colours.length * 3;
  return Buffer.from(
    colours.reduce(
      (opcArray, colour) => {
        const pixelBytes = OPC_BODY_FIELDS.map(key => colour[key]);
        console.log(pixelBytes);
        opcArray.push(...pixelBytes);
        return opcArray;
      },
      [channel, 0, bytes >> 8, bytes % 0x100]
    )
  );
};
