import SPI from 'pi-spi';

import { staticRainbowFactory } from './drivers/staticRainbow';

const server = () => {
  // const spi = SPI.initialize('./mntpoint/spidev0.0');
  // const spi = SPI.initialize('/dev/spidev0.0');
  const spidevs = [
    {
      bus: 0,
      device: 0
    },
    {
      bus: 0,
      device: 1
    },
    {
      bus: 1,
      device: 0
    },
    {
      bus: 1,
      device: 1
    }
  ].map(spec => {
    spec.spi = SPI.initialize(`/dev/spidev${spec.bus}.${spec.device}`);
    spec.spi.clockSpeed(5e5);
    return spec;
  });

  const staticeRainbow = staticRainbowFactory(spidevs);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    staticeRainbow();
  }
};

server();
