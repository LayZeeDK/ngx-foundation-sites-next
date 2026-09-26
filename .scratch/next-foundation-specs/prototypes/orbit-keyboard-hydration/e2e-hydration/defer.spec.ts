// PROTOTYPE (throwaway) -- case 2: `@defer (hydrate on viewport)` starts rotation once
// the carousel scrolls into view and hydrates.
import { expect, test } from '@playwright/test';
import { record } from './helpers';

test('`@defer (hydrate on viewport)`: rotation is silent off-screen, starts once scrolled into view', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/deferred?delay=500');
  await page.waitForTimeout(900); // several timerDelay periods, carousel is off-screen
  const beforeLog = await page.evaluate(() => ((window as unknown as { __orbitLog?: unknown[] }).__orbitLog ?? []).length);

  await page.locator('.orbit').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600); // a few ticks once hydrated
  const afterLog = await page.evaluate(() => ((window as unknown as { __orbitLog?: unknown[] }).__orbitLog ?? []).length);
  const rotating = await page.evaluate(() => document.querySelector('.orbit-container')!.getAttribute('aria-live'));

  record(info, { beforeLog, afterLog, rotating, errors });
  expect(beforeLog).toBe(0); // never constructed while off-screen: no autoplay ticks logged
  expect(afterLog).toBeGreaterThan(0); // hydrated and rotating once visible
  expect(rotating).toBe('off'); // aria-live off while rotating (APG)
  expect(errors).toEqual([]);
});
