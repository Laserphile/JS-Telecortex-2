import chalk from 'chalk';
import { driverFactory, opcClientDriver } from './drivers/driverFactory';
import { colorRainbows } from './drivers/colorRainbows';
import { colourRateLogger } from './util';
import { RPI_SPIDEVS, DRV_CONF_DEFAULTS } from './main';
import net from 'net';

const { opc_port } = DRV_CONF_DEFAULTS;
const client = new net.Socket();

client.on('data', function(data) {
  console.error(chalk`{cyan 📡 Client recieved ${data.toString('hex')}}`);
  client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.error(chalk`{cyan 📡 Client closed`);
});

client.on('error', function(err) {
  console.error(chalk`{cyan 📡 Client error {white ${err}}}`);
});

client.connect(
  opc_port,
  'raspberrypi.local',
  function() {
    console.log(chalk`{cyan 📡 Client connected on port: {white ${opc_port}}}`);
    // client.write('Hello, server! Love, Client.');
    // eslint-disable-next-line no-constant-condition

    const driverConfig = {
      ...DRV_CONF_DEFAULTS,
      spidevs: RPI_SPIDEVS,
      client
    };

    const staticRainbowLoop = driverFactory(
      driverConfig,
      [colourRateLogger, colorRainbows],
      opcClientDriver
    );

    // eslint-disable-next-line no-constant-condition
    while (true) {
      staticRainbowLoop();
    }
  }
);
