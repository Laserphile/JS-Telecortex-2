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
};
