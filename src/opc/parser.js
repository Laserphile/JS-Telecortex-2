import { parse } from 'binary';
import chalk from 'chalk';

const parseOPCHeader = msg => {
  return parse(msg)
    .word8u('channel')
    .word8u('command')
    .word16bu('length').vars;
};
/**
 * parse OPC message and send data to spidevs
 */
export const parseOPCMessage = (context, msg) => {
  // TODO
  const { spidevs, max_panels } = context;
  const header = parseOPCHeader(msg);
  console.log(chalk`{bgMagenta.black  header: } {cyan ${JSON.stringify(header)}}`);
  if (header.channel > max_panels) {
    console.log(chalk`{red invalid channel ${header.channel} > ${max_panels}}`);
  }
  // TODO: perhaps put message on a queue
  if (spidevs) {
    console.log(`spidevs: ${JSON.stringify(spidevs)}`);
  }
};
