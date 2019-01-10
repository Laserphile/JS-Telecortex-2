import { parseOPCHeader } from './parser';

describe('parseOPCHeader', () => {
  it('handles blank message', () => {
    expect(parseOPCHeader()).toThrowErrorMatchingSnapshot();
  });
  it('handles short message', () => {
    expect(parseOPCHeader('\x00\x00')).toThrowErrorMatchingSnapshot();
  });
  it('works with all null bytes', () => {
    expect(parseOPCHeader('\x00\x00\x00\x00')).toEqual({
      channel: 0,
      command: 0,
      length: 0
    });
  });
});
