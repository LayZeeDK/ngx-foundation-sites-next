import { ErrorHandler } from '@angular/core';

export function sanitizeTitleHeadingLevel(
  value: unknown,
  handler?: ErrorHandler,
): number | null {
  const n = Number(value);
  if (value == null) return null;
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    handler?.handleError(
      new Error('Invalid titleHeadingLevel: must be integer 1..6'),
    );
    return null;
  }
  if (n < 1 || n > 6) {
    handler?.handleError(
      new Error('Invalid titleHeadingLevel: out of range 1..6'),
    );
    return null;
  }
  return n;
}

export function sanitizeDeepLinkSmudgeDelay(
  value: unknown,
  handler?: ErrorHandler,
): number {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    handler?.handleError(
      new Error('Invalid deepLinkSmudgeDelay: must be numeric'),
    );
    return 300;
  }
  if (n < 0) {
    handler?.handleError(
      new Error('deepLinkSmudgeDelay: negative value coerced to absolute'),
    );
    return Math.abs(Math.trunc(n));
  }
  return Math.trunc(n);
}

export function sanitizeDeepLinkSmudgeOffset(
  value: unknown,
  handler?: ErrorHandler,
): number {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    handler?.handleError(
      new Error('Invalid deepLinkSmudgeOffset: must be numeric'),
    );
    return 0;
  }
  return Math.trunc(n);
}

/**
 * Apply validators to the accordion inputs and return coerced values.
 * Calls ErrorHandler.handleError() for any detected invalid inputs.
 */
export function applyValidators(
  opts: {
    titleHeadingLevel?: unknown;
    deepLinkSmudgeDelay?: unknown;
    deepLinkSmudgeOffset?: unknown;
  },
  handler?: ErrorHandler,
): {
  titleHeadingLevel: number | null;
  deepLinkSmudgeDelay: number;
  deepLinkSmudgeOffset: number;
} {
  const titleHeadingLevel = sanitizeTitleHeadingLevel(
    opts.titleHeadingLevel,
    handler,
  );
  const deepLinkSmudgeDelay = sanitizeDeepLinkSmudgeDelay(
    opts.deepLinkSmudgeDelay,
    handler,
  );
  const deepLinkSmudgeOffset = sanitizeDeepLinkSmudgeOffset(
    opts.deepLinkSmudgeOffset,
    handler,
  );

  return {
    titleHeadingLevel,
    deepLinkSmudgeDelay,
    deepLinkSmudgeOffset,
  };
}
