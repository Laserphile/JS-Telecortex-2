import { parseOPCHeader, parseOPCBody, OPC_HEADER_LEN } from './parser';
import chalk from 'chalk';
import { coloursToString, consoleErrorHandler } from '../util';
import { colours2sk9822 } from '../util/sk9822';

export const OPC_BODY_FIELDS = ['r', 'g', 'b'];

/**
 * Thrown when an incomplete OPC Message is detected
 */
export class PartialOPCMsgError extends Error {
  constructor() {
    super(...arguments);
  }
}

/**
 * parse a single OPC message and send data to spidevs
 * @return number of bytes read
 */
export const handleOPCMessage = (context, msg) => {
  // TODO
  const { spidevs, brightness } = context;
  const header = parseOPCHeader(msg);
  console.log(chalk`{bgMagenta.black  header: } {cyan ${JSON.stringify(header)}}`);
  // console.log(`spidevs: ${JSON.stringify(spidevs)}`);
  if (header.channel >= spidevs.length) {
    // TODO: throw error instead of just console.log?
    console.error(chalk`{red invalid channel ${header.channel} >= ${spidevs.length}}`);
    return OPC_HEADER_LEN + header.length;
  }
  const colours = parseOPCBody(msg, header.length);
  console.log(chalk`{bgMagenta.black  body: } (${colours.length}) \n${coloursToString(colours)}`);
  // TODO: perhaps put message on an async queue
  const dataBuff = Buffer.from(colours2sk9822(colours, brightness));
  spidevs[header.channel].spi.transfer(dataBuff, dataBuff.length, consoleErrorHandler);
  return OPC_HEADER_LEN + header.length;
};

/**
 * Handle all OPC messages
 * @return the final partial opcMessage || empty buffer
 */
export const handleAllOPCMessages = (context, data) => {
  let bytesRead;
  while (data.length > 0) {
    try {
      bytesRead = handleOPCMessage(context, data);
    } catch (err) {
      if (err instanceof PartialOPCMsgError) return data;
      console.error(err);
      return undefined;
    }
    data = data.slice(bytesRead);
    // console.log(chalk`{cyan 🛰  read: ${bytesRead}, remaining: ${data.length} bytes}`);
  }
};
