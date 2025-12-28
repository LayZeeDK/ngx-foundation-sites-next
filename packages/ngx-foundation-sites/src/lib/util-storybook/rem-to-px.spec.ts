import { describe, expect, it } from 'vitest';
import { remToPx } from './rem-to-px';

describe('remToPx', () => {
  it('converts rem string to px', () => {
    expect(remToPx('1rem')).toBe('16px');
    expect(remToPx('0.9rem')).toBe('14.4px');
    expect(remToPx('2rem')).toBe('32px');
  });

  it('converts numeric rem value to px', () => {
    expect(remToPx(1)).toBe('16px');
    expect(remToPx(0.9)).toBe('14.4px');
    expect(remToPx(0.5)).toBe('8px');
  });

  it('uses custom base font size', () => {
    expect(remToPx('1rem', 20)).toBe('20px');
    expect(remToPx(0.5, 20)).toBe('10px');
  });

  it('handles zero values', () => {
    expect(remToPx('0rem')).toBe('0px');
    expect(remToPx(0)).toBe('0px');
  });

  it('rounds to avoid floating point precision issues', () => {
    // 0.85 * 16 = 13.6, not 13.600000000000001
    expect(remToPx('0.85rem')).toBe('13.6px');
  });
});
