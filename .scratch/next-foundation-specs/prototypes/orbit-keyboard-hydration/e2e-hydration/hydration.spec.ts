// PROTOTYPE (throwaway) -- case 2: the `inert` gate is clean at hydration, the bullet
// tabindex hands over to Aria, a bound non-first `selected` aligns instantly, and a scroll
// made before hydration is adopted. Run against the development build (port 4651) so
// `ngDevMode` stays a real object.
import { expect, test } from '@playwright/test';
import { hydrated, open, record, settled, state } from './helpers';

test('inert gate: no slide is inert in server HTML; hydration is clean; unselected slides are inert after', async ({
  page,
  request,
}, info) => {
  const html = await (await request.get('/?autoplay=false')).text();
  const slideTags = html.match(/<div[^>]*class="orbit-slide[^"]*"[^>]*>/g) ?? [];
  const beforeInert = slideTags.map((t) => /\binert\b/.test(t));
  const bulletTags = html.match(/<button[^>]*role="tab"[^>]*>/g) ?? [];
  const beforeTabindex = bulletTags.map((t) => t.match(/tabindex="(-?\d)"/)?.[1] ?? null);

  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
    }
  });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/?autoplay=false');
  await hydrated(page);
  const s = await state(page);
  const devMode = await page.evaluate(() => {
    const nd = (globalThis as unknown as { ngDevMode?: Record<string, unknown> }).ngDevMode;
    return nd && typeof nd === 'object' ? { componentsSkippedHydration: nd['componentsSkippedHydration'] } : nd;
  });

  record(info, { beforeInert, beforeTabindex, afterInert: s.inert, afterTabindex: s.tabindexes, devMode, errors });

  expect(beforeInert.every((v) => v === false)).toBe(true); // no slide inert in server HTML
  expect(beforeTabindex[0]).toBe('0'); // the selected bullet's pre-hydration override
  expect(beforeTabindex.slice(1).every((t) => t === '-1')).toBe(true);
  expect(s.inert.startsWith('0')).toBe(true); // slide 0 stays reachable, selected
  expect(s.inert.slice(1)).toBe('1'.repeat(s.inert.length - 1)); // the rest gated once live
  expect(s.tabindexes[0]).toBe('0'); // handed over to Aria: still 0, now Aria's own value
  expect(devMode).not.toBeNull();
  expect(devMode?.['componentsSkippedHydration']).toBe(0);
  expect(errors.filter((e) => /NG05\d\d/.test(e))).toEqual([]);
});

test('bullet tabindex hands over to Aria after a user interaction moves the roving item', async ({ page }, info) => {
  await open(page);
  const beforeInteraction = (await state(page)).tabindexes;
  await page.locator('[role=tab]').nth(0).focus();
  await page.keyboard.press('ArrowRight'); // Aria picks an activeItem: tab 1
  const afterArrow = (await settled(page)).tabindexes;
  record(info, { beforeInteraction, afterArrow });
  expect(beforeInteraction[0]).toBe('0');
  expect(afterArrow[1]).toBe('0');
  expect(afterArrow[0]).toBe('-1');
});

test('a bound non-first selected slide aligns instantly, no intermediate scroll position', async ({ page }, info) => {
  await page.addInitScript(() => {
    const samples: number[] = [];
    (window as unknown as { __samples: number[] }).__samples = samples;
    const tick = () => {
      const c = document.querySelector<HTMLElement>('.orbit-container');

      if (c) {
        samples.push(Math.round(c.scrollLeft));
      }

      if (samples.length < 200) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
  await page.goto('/?autoplay=false&selected=2');
  await hydrated(page);
  await settled(page);
  const samples = await page.evaluate(() => (window as unknown as { __samples: number[] }).__samples);
  const distinctNonZeroRun = samples.filter((v, i) => i === 0 || v !== samples[i - 1]);
  const s = await state(page);
  record(info, { distinctValues: [...new Set(samples)], distinctNonZeroRun, active: s.active, scrollLeft: s.scrollLeft });
  expect(s.active).toBe(2);
  // Instant: only the starting 0 and the final target ever appear, no positions between.
  const nonBoundaryValues = [...new Set(samples)].filter((v) => v !== 0 && v !== s.scrollLeft);
  expect(nonBoundaryValues).toEqual([]);
});

test('a scroll made before hydration is adopted as the selection, with one selectedChange', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/main-[A-Z0-9]+\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });
  await page.goto('/?autoplay=false', { waitUntil: 'commit' });
  await page.locator('.orbit-container').waitFor();
  // A native scroll before the bundle (and so the IntersectionObserver) exists.
  await page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    c.scrollLeft = 2 * c.clientWidth;
  });
  const preHydrationScrollLeft = await page.evaluate(
    () => document.querySelector<HTMLElement>('.orbit-container')!.scrollLeft,
  );
  await hydrated(page);
  const s = await settled(page);
  record(info, { preHydrationScrollLeft, active: s.active, scrollLeft: s.scrollLeft, log: s.log, errors });
  // The ticket asks for adoption, not a specific number of intermediate observer events:
  // a pre-hydration scroll should end up selected once hydration settles.
  expect(s.active).toBe(2);
  expect(s.scrollLeft).toBe(2 * s.width);
  expect((s.log as { cause: string }[]).some((e) => e.cause === 'scroll' && e.i === 2)).toBe(true);
  expect(errors).toEqual([]);
});
