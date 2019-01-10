import { parseOPCHeader } from './parser';

describe('parseOPCHeader', () => {
  it('handles blank message', () => {
    expect(() => parseOPCHeader()).toThrow(Error);
  });
  it('handles short message', () => {
    expect(() => parseOPCHeader(Buffer.from([0x00, 0x00]))).toThrow(Error);
  });
  it('works with all null bytes', () => {
    expect(parseOPCHeader(Buffer.from([0x00, 0x00, 0x00, 0x00]))).toEqual({
      channel: 0,
      command: 0,
      length: 0
    });
  });
  it('works with a small header', () => {
    expect(parseOPCHeader(Buffer.from([0x01, 0x00, 0x00, 0x09]))).toEqual({
      channel: 1,
      command: 0,
      length: 9
    });
  });
  it('works with a big header (low bytes)', () => {
    expect(parseOPCHeader(Buffer.from([0x0a, 0x00, 0x02, 0x01]))).toEqual({
      channel: 10,
      command: 0,
      length: 513
    });
  });
  it('works with a big header (utf-8 fuckery)', () => {
    expect(parseOPCHeader(Buffer.from([0xff, 0x00, 0x01, 0x00]))).toEqual({
      channel: 255,
      command: 0,
      length: 256
    });
  });
});
