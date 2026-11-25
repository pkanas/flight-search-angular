import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats hours and minutes', () => {
    expect(pipe.transform(315)).toBe('5h 15m');
  });

  it('formats minutes only when the duration is under an hour', () => {
    expect(pipe.transform(45)).toBe('45m');
  });

  it('formats zero minutes as "0m"', () => {
    expect(pipe.transform(0)).toBe('0m');
  });

  it('returns an empty string for missing values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
  });
});
