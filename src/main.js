import SPI from 'pi-spi';

import { staticRainbowFactory } from './drivers';

const server = () => {
  const spi = SPI.initialize('./mntpoint/spidev0.0');
  // const spi = SPI.initialize('/dev/spidev0.0');
  spi.clockSpeed(5e5);
  const staticeRainbow = staticRainbowFactory(spi);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    staticeRainbow();
  }
};

server();
