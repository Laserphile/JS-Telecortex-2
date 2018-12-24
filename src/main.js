// var Apa102spi = require('apa102-spi');
const sprintf = require('sprintf-js').sprintf;
const SPI = require('pi-spi');
const colorsys = require('colorsys');

// const spi = SPI.initialize('./mntpoint/spidev0.0');
const spi = SPI.initialize('/dev/spidev0.0');
spi.clockSpeed(5e5);

const LEDS = 360;

// const spidev = spi.openSync(0, 0);

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
  return [first, rgb['b'] % 0xff, rgb['g'] % 0xff, rgb['r'] % 0xff];
}

/**
 * Things which determine LED colours
 */
let hue = 360,
  sat = 100,
  val = 10;
// Temporarily store a colour value for colour calculations
let rgb;
// Temporarily store a single pixel for colour calculations
let pixel;
// eslint-disable-next-line no-unused-vars
// Frame counter for FPS calculation
let frames = 0;
// time when script started for FPS calculation
const start = now();
// Last time something was printed
let last_print = now();
// FPS rate calculated
let rate = 0.0;

function static_rainbow() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    hue = (hue + 1) % 360;
    frames += 1;
    rgb = colorsys.hsvToRgb({ h: hue, s: sat, v: val });
    pixel = rgb2sk9822(rgb);
    var data = [0, 0, 0, 0];
    for (const led of Array(LEDS).keys()) {
      data = data.concat(pixel);
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
          'h +%3d s +%3d v +%3d | r +%3d g +%3d b +%3d : +%0.2f : %s',
          hue,
          sat,
          val,
          rgb['r'],
          rgb['g'],
          rgb['b'],
          rate,
          data.toString().slice(0, 32)
        )
      );
      last_print = now();
    }
  }
}

static_rainbow();
