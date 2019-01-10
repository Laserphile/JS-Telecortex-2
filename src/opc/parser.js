import { parse } from 'binary';
import chalk from 'chalk';
import sprintf from 'sprintf-js';

const OPC_HEADER_LEN = 4;
const OPC_BODY_FIELDS = ['r', 'g', 'b'];

/**
 * parse header from OPC message.
 * @return an object containing the channel, command and length
 */
const parseOPCHeader = msg => {
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
const parseOPCBody = msg => {
  // skip over the message header
  const body = msg.slice(OPC_HEADER_LEN);
  return Array.from(
    {
      length: Math.floor(body.length / OPC_BODY_FIELDS.length)
    },
    (_, index) =>
      OPC_BODY_FIELDS.reduce((acc, cur, idx, src) =>
        Object.assign(acc || {}, { [cur]: body[index * src.length + idx] })
      )
  );
};

/**
 * Convert a colours specification to string
 * @param {Array of colorsys RGB objects} colours
 */
const coloursToString = colours => {
  const colourFormat = `%0${Math.log10(colours.length)}d | {R:%03d G:%03d B:%03d}`;
  return colours.reduce(
    (accumulator, colour, count) =>
      accumulator.concat(sprintf.sprintf(colourFormat, count, colour.r, colour.g, colour.b)),
    ''
  );
};

/**
 * parse OPC message and send data to spidevs
 */
export const handleOPCMessage = (context, msg) => {
  // TODO
  const { spidevs } = context;
  const header = parseOPCHeader(msg);
  console.log(chalk`{bgMagenta.black  header: } {cyan ${JSON.stringify(header)}}`);
  // TODO: perhaps put message on a queue
  console.log(`spidevs: ${JSON.stringify(spidevs)}`);
  if (header.channel > spidevs.length) {
    console.error(chalk`{red invalid channel ${header.channel} > ${spidevs.length}}`);
    return;
  }
  const colours = parseOPCBody(msg);
  console.log(chalk`{bgMagenta.black  body: } ${coloursToString(colours)}`);
};
