// var Apa102spi = require('apa102-spi');
const sprintf = require('sprintf-js').sprintf;
const spi = require('spi-device');

const LEDS = 360;

const spidev = spi.openSync(0, 0);

// const LedDriver = new Apa102spi(LEDS, 100);

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
  return [first, rgb[2], rgb[1], rgb[0]];
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
    const data = [0, 0, 0, 0];
    for (const led of Array(LEDS).keys()) {
      data.concat(rgb2sk9822(rgb));
      // LedDriver.setLedColor(
      //     led,
      //     brightness,
      //     Math.round(rgb[0] * 255),
      //     Math.round(rgb[1] * 255),
      //     Math.round(rgb[2] * 255)
      // );
    }
    // LedDriver.sendLeds();
    spidev.transfer(
      [
        {
          sendBuffer: Buffer.from(data),
          byteLength: data.length,
          mode: spi.MODE0,
          speedHz: 5000000
        }
      ],
      (err, message) => {
        if (err) throw err;
      }
    );
    if (now() - last_print > 1) {
      rate = frames / (now() - start + 1);
      console.log(
        sprintf(
          'h +%0.2f s +%0.2f v +%0.2f | r +%0.2f g +%0.2f b +%0.2f : +%0.2f',
          hue,
          sat,
          val,
          rgb[0],
          rgb[1],
          rgb[2],
          rate
        )
      );
      last_print = now();
    }
  }
}

static_rainbow();

// LedDriver.setLedColor(0, 1, rgb[0], rgb[1], rgb[2]);
// LedDriver.sendLeds();
