import { parseOPCHeader, parseOPCBody, OPC_HEADER_LEN } from './parser';
import chalk from 'chalk';
import { consoleErrorHandler } from '../util';
import { colourRateLogger } from '../util/graphics';
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
 * Limit number of colours to display in a body dump
 */
// const colourLimit = 3;

/**
 * parse a single OPC message and send data to channels
 * @return number of bytes read
 */
export const handleOPCMessage = (context, msg) => {
  // TODO
  const { channels, brightness } = context;
  const header = parseOPCHeader(msg);
  // console.log(chalk`{bgMagenta.black  header: } {cyan ${JSON.stringify(header)}}`);
  // console.log(`channels: ${JSON.stringify(channels)}`);
  if (Object.keys(channels).indexOf(String(header.channel)) < 0) {
    // TODO: throw error instead of just console.log?
    console.error(chalk`{red invalid channel ${header.channel} not in ${Object.keys(channels)}}`);
    return OPC_HEADER_LEN + header.length;
  }
  const colours = parseOPCBody(msg, header.length);
  // console.log(
  //   [
  //     chalk`{bgMagenta.black  body: } (${colours.length})`,
  //     coloursToString(colours.slice(0, colourLimit ? colourLimit : colours.length)),
  //     colours.length > colourLimit ? '...' : ''
  //   ].join('\n')
  // );
  context.channelColours = { [header.channel]: colours };
  if (header.channel >= 0) {
    colourRateLogger(context);
  }
  // TODO: perhaps put message on an async queue
  const dataBuff = Buffer.from(colours2sk9822(colours, brightness));
  channels[header.channel].spi.transfer(dataBuff, dataBuff.length, consoleErrorHandler);
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
