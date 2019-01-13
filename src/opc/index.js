import { parseOPCHeader, parseOPCBody, OPC_HEADER_LEN } from './parser';
import chalk from 'chalk';
import { coloursToString, consoleErrorHandler } from '../util';
import { colours2sk9822 } from '../util/sk9822';

/**
 * parse OPC message and send data to spidevs
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
 * Thrown when an incomplete OPC Message is detected
 */
export class PartialOPCMsgError extends Error {
  constructor() {
    super(...arguments);
  }
}
