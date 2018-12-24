// var Apa102spi = require('apa102-spi');
const sprintf = require('sprintf-js').sprintf;
const SPI = require('pi-spi');
const colorsys = require('colorsys');

// const spi = SPI.initialize('./mntpoint/spidev0.0');
const spi = SPI.initialize('/dev/spidev0.0');
spi.clockSpeed(1e6);

const LEDS = 360;

// const spidev = spi.openSync(0, 0);

function hsv2rgb(h, s, v) {
  const i = Math.round(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - s * (1 - f));
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][
    i % 6
  ];
}

function now() {
  return Math.round(new Date().getTime() / 1000);
}

/**
 * Given an array of floats from 0 to 1 [r, g, b],
 * return the sk9822 data for this pixel
 */
function rgb2sk9822(rgb, brightness = 0.5) {
  // first byte is a constant 0xE0 + 5 bit brightness value
  const first = 0xe0 + Math.round(brightness * 0x1f);
  return [
    first,
    Math.round(rgb[2] * 0xff) % 0xff,
    Math.round(rgb[1] * 0xff) % 0xff,
    Math.round(rgb[0] * 0xff) % 0xff
  ];
}

/**
 * Things which determine LED colours
 */
let hue = 0.0,
  sat = 1.0,
  val = 1.0;
let rgb;
// eslint-disable-next-line no-unused-vars
const brightness = 16;
let frames = 0;
const start = now();
let last_print = now();
let rate = 0.0;

function static_rainbow() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    hue = hue + 0.01 - Math.floor(hue);
    frames += 1;
    rgb = hsv2rgb(hue, sat, val);
    var data = [0, 0, 0, 0];
    for (const led of Array(LEDS).keys()) {
      data = data.concat(rgb2sk9822(rgb));
    }
    const dataBuff = Buffer.from(data);
    spi.transfer(dataBuff, dataBuff.length, function(e, d) {
      if (e) console.error(e);
      else console.log('Got "' + d.toString() + '" back.');

      if (dataBuff.toString() === d.toString()) {
        console.log('woo message sent');
      } else {
        // NOTE: this will likely happen unless MISO is jumpered to MOSI
        console.warn('aaaaaah death');
        process.exit(-2);
      }
    });
    if (now() - last_print > 1) {
      rate = frames / (now() - start + 1);
      console.log(
        sprintf(
          'h +%0.2f s +%0.2f v +%0.2f | r +%0.2f g +%0.2f b +%0.2f : +%0.2f : %s',
          hue,
          sat,
          val,
          rgb[0],
          rgb[1],
          rgb[2],
          rate,
          data.toString().slice(0, 32)
        )
      );
      last_print = now();
    }
  }
}

static_rainbow();
