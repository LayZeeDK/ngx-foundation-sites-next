import { describe, expect, it } from 'vitest';
import { pxToRem } from './px-to-rem';
import { remToPx } from './rem-to-px';

describe('pxToRem', () => {
  it('converts px string to rem', () => {
    expect(pxToRem('16px')).toBe('1rem');
    expect(pxToRem('14.4px')).toBe('0.9rem');
    expect(pxToRem('32px')).toBe('2rem');
  });

  it('converts numeric px value to rem', () => {
    expect(pxToRem(16)).toBe('1rem');
    expect(pxToRem(14.4)).toBe('0.9rem');
    expect(pxToRem(8)).toBe('0.5rem');
  });

  it('uses custom base font size', () => {
    expect(pxToRem('20px', 20)).toBe('1rem');
    expect(pxToRem(10, 20)).toBe('0.5rem');
  });

  it('handles zero values', () => {
    expect(pxToRem('0px')).toBe('0rem');
    expect(pxToRem(0)).toBe('0rem');
  });

  it('rounds to avoid floating point precision issues', () => {
    // 13.6 / 16 = 0.85, not 0.8500000000000001
    expect(pxToRem('13.6px')).toBe('0.85rem');
  });

  it('is the inverse of remToPx', () => {
    expect(pxToRem(remToPx('0.9rem'))).toBe('0.9rem');
    expect(remToPx(pxToRem('14.4px'))).toBe('14.4px');
  });
});
