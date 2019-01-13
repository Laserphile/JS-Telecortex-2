import { parseOPCHeader, parseOPCBody } from './parser';
import chalk from 'chalk';
import { coloursToString } from '../util';

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
  console.log(chalk`{bgMagenta.black  body: }\n${coloursToString(colours)}`);
};
