import {formatFileSize} from '../src';

describe('formatFileSize', () => {
  it.each([
    [999, '999 B'],
    [1000, '1.0 KB'],
    [1000000, '1.0 MB'],
    [1500000, '1.5 MB'],
    [10000000, '10.0 MB'],
    [1000000000, '1.0 GB'],
    [1000000000000, '1.0 TB'],
  ])('"%s" should return %s', (input, expected) => {
    expect(formatFileSize(input)).toEqual(expected);
  });
});
