// Node-side check of the pure state-derivation function (no browser needed): the "one runnable
// check" for the non-trivial logic in src/app/sticky/state.ts. Runs once (browser fixture is
// never requested), not per engine.
import { expect, test } from '@playwright/test';

import { canonicalizeStickyOn, computeStickyState } from '../src/app/sticky/state';

test.describe('computeStickyState (pure)', () => {
  const container = { top: 0, bottom: 1000 };
  const viewport = { top: 0, bottom: 800 };

  test('before the range: not stuck, edge top', () => {
    const result = computeStickyState({
      hostRect: { top: 500, bottom: 560 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'top',
      canStick: true,
    });
    expect(result).toEqual({ isStuck: false, edge: 'top' });
  });

  test('pinned at the top stick line', () => {
    const result = computeStickyState({
      hostRect: { top: 16, bottom: 76 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'top',
      canStick: true,
    });
    expect(result).toEqual({ isStuck: true, edge: 'top' });
  });

  test('past the range: not stuck, edge bottom', () => {
    const result = computeStickyState({
      hostRect: { top: -300, bottom: -240 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'top',
      canStick: true,
    });
    expect(result).toEqual({ isStuck: false, edge: 'bottom' });
  });

  test('gate closed: always not stuck, edge top, regardless of geometry', () => {
    const result = computeStickyState({
      hostRect: { top: 16, bottom: 76 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'top',
      canStick: false,
    });
    expect(result).toEqual({ isStuck: false, edge: 'top' });
  });

  test('stickTo bottom, pinned at the bottom stick line', () => {
    const result = computeStickyState({
      hostRect: { top: 724, bottom: 784 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'bottom',
      canStick: true,
    });
    expect(result).toEqual({ isStuck: true, edge: 'bottom' });
  });

  test('1px tolerance: 1px off the line still counts as stuck, 2px does not', () => {
    const withinTolerance = computeStickyState({
      hostRect: { top: 17, bottom: 77 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'top',
      canStick: true,
    });
    expect(withinTolerance.isStuck).toBe(true);

    const outsideTolerance = computeStickyState({
      hostRect: { top: 18.5, bottom: 78.5 },
      containerRect: container,
      scrollContainerRect: viewport,
      insetPx: 16,
      stickTo: 'top',
      canStick: true,
    });
    expect(outsideTolerance.isStuck).toBe(false);
  });
});

test.describe('canonicalizeStickyOn (pure)', () => {
  const cases: Array<[string, string]> = [
    ['', 'all'],
    ['all', 'all'],
    ['  all  ', 'all'],
    ['medium', 'medium'],
    ['medium up', 'medium'],
    ['  medium   up ', 'medium'],
    ['medium only', 'medium only'],
    ['medium down', 'medium down'],
    ['large only', 'large only'],
  ];

  for (const [input, expected] of cases) {
    test(`"${input}" -> "${expected}"`, () => {
      expect(canonicalizeStickyOn(input)).toBe(expected);
    });
  }
});
