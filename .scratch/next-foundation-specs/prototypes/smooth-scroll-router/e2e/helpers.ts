import { Page } from '@playwright/test';

/** Polls window.scrollY until it stops changing, and returns the settled value. */
export async function waitForScrollSettled(
  page: Page,
  options: { timeoutMs?: number; stableForMs?: number; pollMs?: number } = {},
): Promise<number> {
  // A CSS-smooth (scroll-behavior: smooth) native jump plus a delayed Router popstate
  // correction can together take longer than a short poll window to settle -- widened after an
  // observed one-off flake (restoration=top, mixin=1) where a mid-animation plateau read as
  // "stable" just before the Router's own scrollToPosition([0,0]) landed a moment later.
  const timeoutMs = options.timeoutMs ?? 6000;
  const stableForMs = options.stableForMs ?? 400;
  const pollMs = options.pollMs ?? 50;
  const stableReadsNeeded = Math.ceil(stableForMs / pollMs);

  const deadline = Date.now() + timeoutMs;
  let lastValue = await page.evaluate(() => window.scrollY);
  let stableReads = 1;

  while (Date.now() < deadline) {
    await page.waitForTimeout(pollMs);
    const value = await page.evaluate(() => window.scrollY);

    if (Math.abs(value - lastValue) < 1) {
      stableReads++;

      if (stableReads >= stableReadsNeeded) {
        return value;
      }
    } else {
      stableReads = 1;
    }

    lastValue = value;
  }

  return lastValue;
}

/** Collects console errors as plain strings for the lifetime of the returned array. */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(String(error));
  });

  return errors;
}

export async function targetOffsetTop(page: Page, id: string): Promise<number> {
  return page.evaluate((elementId) => {
    const el = document.getElementById(elementId);
    return el ? el.getBoundingClientRect().top + window.scrollY : -1;
  }, id);
}
