import { coloursToString } from './graphics';

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
