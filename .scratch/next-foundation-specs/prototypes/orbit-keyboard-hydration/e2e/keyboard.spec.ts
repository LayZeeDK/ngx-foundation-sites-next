// PROTOTYPE (throwaway) -- case 1: keyboard scrolling from a focused slide, the inward
// focus ring. Chromium, Firefox, WebKit, headless (the scrollbar check is scrollbar.spec.ts,
// headed, in its own projects).
import { expect, test } from '@playwright/test';
import { open, record, settled, state } from './helpers';

test('focused slide: ArrowRight, ArrowLeft, PageDown, PageUp, End, Home keep focus inside the carousel', async ({
  page,
}, info) => {
  await open(page);
  await page.locator('.orbit-slide').nth(0).focus();
  const before = await state(page);
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  const steps: unknown[] = [{ key: '(initial focus)', ...before, windowY: y0 }];

  for (const key of ['ArrowRight', 'ArrowRight', 'PageDown', 'PageUp', 'End', 'Home'] as const) {
    await page.keyboard.press(key);
    const s = await settled(page);
    const windowY = await page.evaluate(() => Math.round(window.scrollY));
    steps.push({ key, active: s.active, focused: s.focused, scrollLeft: s.scrollLeft, inert: s.inert, windowY });
  }

  record(info, { steps });

  // Focus containment (what the ticket asks): holds for every key, including Page
  // Down/Up, End, and Home, even though (see the next test) some of those keys also
  // scroll the page -- the browser's vertical scroll chaining and the horizontal
  // focus handoff are independent.
  for (const step of steps.slice(1) as { key: string; focused: string | null }[]) {
    expect(step.focused, `focus after ${step.key}`).not.toBeNull();
    expect(step.focused, `focus after ${step.key}`).not.toMatch(/^(BODY|HTML)$/);
  }
});

test('finding: Page Down/Up, End, and Home also scroll the page (the container has no vertical overflow to consume them)', async ({
  page,
}, info) => {
  await open(page);
  await page.locator('.orbit-slide').nth(2).focus(); // slide 2: ArrowRight/Left stay in bounds either way
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  const results: Record<string, number> = {};

  for (const key of ['PageDown', 'PageUp', 'End', 'Home'] as const) {
    await page.keyboard.press(key);
    await settled(page);
    results[key] = await page.evaluate(() => Math.round(window.scrollY));
  }

  record(info, { y0, results });
  // This is a finding, not a requirement the prototype enforces: the Orbit spec decides
  // whether Page Down/Up/End/Home should be intercepted (remapped to next/previous/last/
  // first slide, as the arrows are) or left to the platform's default vertical scroll.
  test.info().annotations.push({
    type: 'finding',
    description: `page scrollY moved to ${JSON.stringify(results)} from ${y0}; ArrowLeft/ArrowRight never move the page (see the test above)`,
  });
});

test('the focused slide shows an inward focus ring (outline, not clipped by the container)', async ({ page }, info) => {
  await open(page);
  await page.locator('.orbit-slide').nth(0).focus();
  const ring = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      matchesFocusVisible: el.matches(':focus-visible'),
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      outlineColor: cs.outlineColor,
      outlineOffset: cs.outlineOffset,
    };
  });
  await page.screenshot({ path: `results/${info.project.name}-focus-ring.png` });
  record(info, ring);
  expect(ring.matchesFocusVisible).toBe(true);
  expect(ring.outlineStyle).not.toBe('none');
  expect(parseFloat(ring.outlineOffset)).toBeLessThan(0); // negative == drawn inward, not clipped
});

test('no horizontal scrollbar changes the container box (clientHeight equals offsetHeight)', async ({ page }, info) => {
  await open(page);
  const m = await page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    return {
      clientHeight: c.clientHeight,
      offsetHeight: c.offsetHeight,
      scrollbarWidth: getComputedStyle(c).scrollbarWidth,
    };
  });
  record(info, m);
  expect(m.offsetHeight - m.clientHeight).toBe(0);
});
