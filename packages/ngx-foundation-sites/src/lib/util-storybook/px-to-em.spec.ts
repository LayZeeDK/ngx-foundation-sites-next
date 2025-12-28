import { describe, expect, it } from 'vitest';
import { pxToEm } from './px-to-em';

describe('pxToEm', () => {
  it('converts px string to em using element font-size', () => {
    // 14.4px font-size (0.9rem at 16px base)
    expect(pxToEm('12.24px', 14.4)).toBe('0.85em');
    expect(pxToEm('14.4px', 14.4)).toBe('1em');
    expect(pxToEm('28.8px', 14.4)).toBe('2em');
  });

  it('converts numeric px value to em', () => {
    expect(pxToEm(16, 16)).toBe('1em');
    expect(pxToEm(8, 16)).toBe('0.5em');
    expect(pxToEm(24, 16)).toBe('1.5em');
  });

  it('handles different element font-sizes', () => {
    // 20px font-size
    expect(pxToEm('20px', 20)).toBe('1em');
    expect(pxToEm('10px', 20)).toBe('0.5em');

    // 12px font-size
    expect(pxToEm('12px', 12)).toBe('1em');
    expect(pxToEm('6px', 12)).toBe('0.5em');
  });

  it('handles zero values', () => {
    expect(pxToEm('0px', 16)).toBe('0em');
    expect(pxToEm(0, 14.4)).toBe('0em');
  });

  it('rounds to avoid floating point precision issues', () => {
    // 13.6 / 16 = 0.85, not 0.8500000000000001
    expect(pxToEm('13.6px', 16)).toBe('0.85em');
  });
});
