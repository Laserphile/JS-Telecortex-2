import { parse } from 'binary';
import chalk from 'chalk';

const OPC_HEADER_LEN = 4;

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
 * @return an array of colorsys RGB objects
 */
const parseOPCBody = msg => {
  // skip over the message header
  const body = msg.slice(OPC_HEADER_LEN);
  const result = Array();
  while (body.length > 2) {
    result.push({
      r: body.shift(),
      g: body.shift(),
      b: body.shift()
    });
  }
  return result;
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
  console.log(`{bgMagenta.black  body: } ${colours}`);
};
