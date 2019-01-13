import { parse } from 'binary';
import sprintf from 'sprintf-js';
import { rgbToHsv } from 'colorsys';
import { colourMessage } from '../util';

const OPC_HEADER_LEN = 4;
const OPC_BODY_FIELDS = ['r', 'g', 'b'];

/**
 * parse header from OPC message.
 * @return an object containing the channel, command and length
 */
export const parseOPCHeader = msg => {
  if (msg === undefined) throw Error('msg is undefined');
  if (msg.length < OPC_HEADER_LEN) throw Error('msg too short to have header');
  return parse(msg)
    .word8u('channel')
    .word8u('command')
    .word16bu('length').vars;
};

/**
 * parse body from OPC message.
 * body message format: R0G0B0R1G1B1
 * @return an array of colorsys RGB objects
 */
export const parseOPCBody = msg => {
  // skip over the message header
  if (msg.length < OPC_HEADER_LEN) throw Error('msg too short to have body');
  const body = msg.slice(OPC_HEADER_LEN);
  return Array.from(
    {
      length: Math.floor(body.length / OPC_BODY_FIELDS.length)
    },
    (_, index) =>
      OPC_BODY_FIELDS.reduce(
        (accumulator, key, offset, source) => (
          (accumulator[key] = body[index * source.length + offset]), accumulator
        ),
        {}
      )
  );
};
