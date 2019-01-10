import { parseOPCHeader } from './parser';

describe('parseOPCHeader', () => {
  it('handles blank message', () => {
    expect(() => parseOPCHeader()).toThrow(Error);
  });
  it('handles short message', () => {
    expect(() => parseOPCHeader(Buffer.from('\x00\x00'))).toThrow(Error);
  });
  it('works with all null bytes', () => {
    expect(parseOPCHeader(Buffer.from('\x00\x00\x00\x00'))).toEqual({
      channel: 0,
      command: 0,
      length: 0
    });
  });
  it('works with a small header', () => {
    expect(parseOPCHeader(Buffer.from('\x01\x00\x00\x09'))).toEqual({
      channel: 1,
      command: 0,
      length: 9
    });
  });
  it('works with a big header (low bytes)', () => {
    expect(parseOPCHeader(Buffer.from('\x0a\x00\x02\x01'))).toEqual({
      channel: 10,
      command: 0,
      length: 513
    });
  });
});
