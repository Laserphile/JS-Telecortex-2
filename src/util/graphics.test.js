import { coloursToString, colourRateLogger } from './graphics';
import { now } from '.';

const someColours = [
  { r: 0xff, g: 0x00, b: 0x00 },
  { r: 0x00, g: 0xff, b: 0x00 },
  { r: 0x00, g: 0x00, b: 0xff }
];

describe('coloursToString', () => {
  it('works', () => {
    expect(coloursToString(someColours)).toBeTruthy();
    // This doesn't work because chalk uses different ANSI
    // escape codes on debian / bsd:
    // expect(coloursToString(someColours)).toMatchSnapshot();
  });
});

describe('colourRateLogger', () => {
  it("doesn't print too often", () => {
    console.log = jest.fn();
    const context = { lastPrint: now(), start: now(), channelColours: { 0: someColours } };
    colourRateLogger(context);
    expect(console.log.mock.calls.length).toBe(0);
  });
  it('prints after a more than a second', () => {
    console.log = jest.fn();
    const context = { lastPrint: now() - 2, start: now() - 2, channelColours: { 0: someColours } };
    colourRateLogger(context);
    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0]).toBeTruthy();
  });
});
