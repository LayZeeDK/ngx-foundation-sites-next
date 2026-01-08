import { describe, it, expect, vi } from 'vitest';
import * as validators from './validators';
import { ErrorHandler } from '@angular/core';

describe('accordion validators', () => {
  it('sanitizeTitleHeadingLevel accepts valid values and rejects invalid', () => {
    const handler = { handleError: vi.fn() } as unknown as ErrorHandler;
    expect(validators.sanitizeTitleHeadingLevel(3, handler)).toBe(3);
    expect(validators.sanitizeTitleHeadingLevel('2', handler)).toBe(2);
    expect(validators.sanitizeTitleHeadingLevel(null, handler)).toBeNull();

    expect(validators.sanitizeTitleHeadingLevel(0, handler)).toBeNull();
    expect(validators.sanitizeTitleHeadingLevel(7, handler)).toBeNull();
    expect(validators.sanitizeTitleHeadingLevel(2.5, handler)).toBeNull();
    expect(handler.handleError).toHaveBeenCalled();
  });

  it('sanitizeDeepLinkSmudgeDelay coerces negatives and rejects non-numeric', () => {
    const handler = { handleError: vi.fn() } as unknown as ErrorHandler;
    expect(validators.sanitizeDeepLinkSmudgeDelay(200, handler)).toBe(200);
    expect(validators.sanitizeDeepLinkSmudgeDelay(-50, handler)).toBe(50);
    expect(validators.sanitizeDeepLinkSmudgeDelay('100', handler)).toBe(100);
    expect(validators.sanitizeDeepLinkSmudgeDelay(NaN, handler)).toBe(300);
  });

  it('sanitizeDeepLinkSmudgeOffset coerces to integer and defaults non-numeric to 0', () => {
    const handler = { handleError: vi.fn() } as unknown as ErrorHandler;
    expect(validators.sanitizeDeepLinkSmudgeOffset(10, handler)).toBe(10);
    expect(validators.sanitizeDeepLinkSmudgeOffset('5', handler)).toBe(5);
    expect(validators.sanitizeDeepLinkSmudgeOffset(NaN, handler)).toBe(0);
  });
});
