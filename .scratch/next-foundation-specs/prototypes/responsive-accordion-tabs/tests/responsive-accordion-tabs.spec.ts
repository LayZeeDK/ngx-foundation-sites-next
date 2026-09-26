// PROTOTYPE (throwaway). Run against the SSR server on port 4510 (bash serve.sh).
import { expect, test } from '@playwright/test';
import {
  NARROW,
  WIDE,
  axe,
  dev,
  errorsIn,
  expectAccordion,
  expectTabs,
  finding,
  focusedText,
  framesAfterLive,
  holdMain,
  instrument,
  rat,
  swaps,
  waitHydrated,
} from './helpers';

test.describe('server output', () => {
  test('server and prerendered HTML render the Server breakpoint mode (accordion)', async ({ request }) => {
    for (const path of ['/', '/prerendered']) {
      const html = await (await request.get(path)).text();
      const host = html.match(/<nfs-responsive-accordion-tabs[\s\S]*?<\/nfs-responsive-accordion-tabs>/)?.[0] ?? '';
      expect(host).toContain('data-mode="accordion"');
      expect(host).toMatch(/<h3><button[^>]*class="accordion-title"/);
      expect(host).not.toContain('role="tab"');
      expect(host).toContain('Overview content, projected');
      expect(html).toContain('"nfsServerBreakpoint":"small"');
      const context = html.match(/ng-server-context="(\w+)"/)?.[1];
      finding(`${path}: ng-server-context=${context}; accordion titles=${(host.match(/accordion-title/g) ?? []).length}`);
    }
  });
});

test.describe('hydration at 1300 px (server rendered accordion, client resolves tabs)', () => {
  test.use({ viewport: WIDE });

  for (const path of ['/', '/instance', '/prerendered', '/client']) {
    test(`${path}: swaps to tabs in the first render callback, no painted accordion frame after going live`, async ({ page }) => {
      const log = await instrument(page);
      await page.goto(path);
      await waitHydrated(page);
      await expectTabs(page, 'Overview');
      await page.waitForTimeout(300);
      const s = (await swaps(page)) as { t: number; from: string; to: string }[];
      const live = await page.evaluate(() => (window as unknown as { __nfsLive: number }).__nfsLive);
      const frames = await framesAfterLive(page);
      const before = await page.evaluate(() =>
        (window as unknown as { __frames: { mode: string; t: number }[]; __nfsLive: number }).__frames
          .filter((f) => f.t <= (window as unknown as { __nfsLive: number }).__nfsLive)
          .map((f) => f.mode),
      );
      finding(
        `${path}: swaps=${JSON.stringify(s.map((x) => `${x.from}->${x.to} at +${(x.t - live).toFixed(2)}ms`))}; frames before live: ${[...new Set(before)].join(',')} (${before.length}); first frame after live: ${frames[0]?.mode} at +${((frames[0]?.t ?? 0) - live).toFixed(1)}ms; accordion frames after live: ${frames.filter((f) => f.mode !== 'tabs').length}`,
      );
      expect(s).toHaveLength(1);
      expect(s[0]).toMatchObject({ from: 'accordion', to: 'tabs' });
      expect(frames.filter((f) => f.mode !== 'tabs')).toHaveLength(0);

      if (dev) {
        const stats = await page.evaluate(() => {
          const d = (window as unknown as { ngDevMode?: Record<string, number> }).ngDevMode;
          return d ? { hydratedComponents: d['hydratedComponents'], hydratedNodes: d['hydratedNodes'], componentsSkippedHydration: d['componentsSkippedHydration'] } : null;
        });
        finding(`${path} dev stats: ${JSON.stringify(stats)}; console: ${JSON.stringify(log.filter((l) => !l.includes('[vite]')))}`);

        if (path !== '/client') {
          expect(stats?.componentsSkippedHydration).toBe(0);
          expect(log.some((l) => l.includes('Angular hydrated'))).toBe(true);
        }
      }

      expect(errorsIn(log)).toEqual([]);
    });
  }
});

test.describe('resize across medium in both directions', () => {
  test.use({ viewport: WIDE });

  test('selected state and focus survive, focus lands on the equivalent control, keys work after the swap', async ({ page }) => {
    const log = await instrument(page);
    await page.goto('/');
    await waitHydrated(page);
    await expectTabs(page, 'Overview');
    await axe(page, 'tabs mode (hydrated, 1300 px)');

    await rat(page).getByRole('tab', { name: 'Specs' }).click();
    await expectTabs(page, 'Specs');
    await expect(page.getByTestId('state')).toContainText('selected=specs');
    expect(await focusedText(page)).toBe('a[role=tab] "Specs"');

    // tabs -> accordion
    await page.setViewportSize(NARROW);
    await expectAccordion(page, 'Specs');
    await expect(rat(page).getByRole('button', { name: 'Specs' })).toBeFocused();
    finding(`tabs->accordion: focus=${await focusedText(page)}`);
    await axe(page, 'accordion mode after swap from tabs (500 px)');

    // Aria keyboard works on the new nodes
    await page.keyboard.press('ArrowDown');
    await expect(rat(page).getByRole('button', { name: 'Reviews' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expectAccordion(page, 'Reviews');
    await expect(page.getByTestId('state')).toContainText('selected=reviews');

    // accordion -> tabs
    await page.setViewportSize(WIDE);
    await expectTabs(page, 'Reviews');
    await expect(rat(page).getByRole('tab', { name: 'Reviews' })).toBeFocused();
    finding(`accordion->tabs: focus=${await focusedText(page)}`);
    await axe(page, 'tabs mode after swap from accordion (1300 px)');
    await page.keyboard.press('ArrowLeft');
    await expect(rat(page).getByRole('tab', { name: 'Specs' })).toBeFocused();
    await expectTabs(page, 'Specs'); // Aria selection follows focus
    const tabindex = await rat(page).getByRole('tab').evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')).join(','));
    finding(`tab tabindex after swap and ArrowLeft: ${tabindex}`);
    expect(tabindex).toBe('-1,0,-1');

    const s = (await swaps(page)) as { from: string; to: string; restore: string | null; refocused?: string }[];
    finding(`swap log: ${JSON.stringify(s)}`);
    expect(errorsIn(log)).toEqual([]);
  });

  test('accordion with nothing expanded -> tabs shows the first panel; focus on the focused title equivalent', async ({ page }) => {
    await instrument(page);
    await page.setViewportSize(NARROW);
    await page.goto('/');
    await waitHydrated(page);
    await expectAccordion(page, null);
    await axe(page, 'accordion mode (hydrated, 500 px, all collapsed)');
    await rat(page).getByRole('button', { name: 'Reviews' }).focus();
    await page.setViewportSize(WIDE);
    await expectTabs(page, 'Overview');
    finding(`nothing expanded, Reviews title focused -> tabs: selected=Overview, focus=${await focusedText(page)}`);
    await expect(rat(page).getByRole('tab', { name: 'Reviews' })).toBeFocused();
    await expect(page.getByTestId('state')).toContainText('selected= ');
  });

  test('focus outside the widget is not moved by a swap', async ({ page }) => {
    await instrument(page);
    await page.goto('/');
    await waitHydrated(page);
    await page.getByTestId('before').focus();
    await page.setViewportSize(NARROW);
    await expectAccordion(page, 'Overview'); // the visible tab carries over
    await expect(page.getByTestId('before')).toBeFocused();
    await page.setViewportSize(WIDE);
    await expectTabs(page, 'Overview');
    await expect(page.getByTestId('before')).toBeFocused();
  });

  test('focus inside panel content, and consumer state inside panels, across a swap', async ({ page }) => {
    await instrument(page);
    await page.goto('/');
    await waitHydrated(page);
    await page.getByTestId('overview-link').focus();
    await page.setViewportSize(NARROW);
    await expectAccordion(page, 'Overview');
    finding(`focus in Overview panel link, tabs->accordion: focus=${await focusedText(page)}`);
    await expect(rat(page).getByRole('button', { name: 'Overview' })).toBeFocused();

    await rat(page).getByRole('button', { name: 'Specs' }).click();
    await page.getByTestId('specs-input').fill('typed before the swap');
    await page.setViewportSize(WIDE);
    await expectTabs(page, 'Specs');
    const value = await page.getByTestId('specs-input').inputValue();
    finding(`input value in Specs panel after accordion->tabs swap: ${JSON.stringify(value)}; focus=${await focusedText(page)}`);
  });
});

test.describe('focus before hydration (main bundle held back)', () => {
  test.use({ viewport: WIDE });

  for (const path of ['/', '/instance']) {
    test(`${path}: focus on a server-rendered accordion title moves to the equivalent tab at hydration`, async ({ page }) => {
      const log = await instrument(page);
      const release = await holdMain(page);
      await page.goto(path, { waitUntil: 'commit' });
      await rat(page).waitFor();
      await expectAccordion(page, null);
      await rat(page).getByRole('button', { name: 'Specs' }).focus();
      expect(await focusedText(page)).toBe('button[role=button] "Specs"');
      release();
      await waitHydrated(page);
      await expectTabs(page, 'Overview');
      const f = await focusedText(page);
      finding(`${path} pre-hydration focus on "Specs" title -> after hydration focus=${f}; swaps=${JSON.stringify(await swaps(page))}`);
      await expect(rat(page).getByRole('tab', { name: 'Specs' })).toBeFocused();
      expect(errorsIn(log)).toEqual([]);
    });
  }

  for (const viewport of [WIDE, NARROW]) {
    test(`a pre-hydration click on the "Specs" title at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const log = await instrument(page);
      const release = await holdMain(page);
      await page.goto('/', { waitUntil: 'commit' });
      await rat(page).waitFor();
      await rat(page).getByRole('button', { name: 'Specs' }).click();
      release();
      await waitHydrated(page);
      await page.waitForTimeout(500);
      const mode = await rat(page).getAttribute('data-mode');
      const state = await page.getByTestId('state').textContent();
      finding(`pre-hydration click on "Specs" at ${viewport.width}px: mode=${mode}; ${state?.trim()}; errors=${JSON.stringify(errorsIn(log))}`);
    });
  }

  test('a pre-hydration ArrowDown on a title the swap removes', async ({ page }) => {
    const log = await instrument(page);
    const release = await holdMain(page);
    await page.goto('/', { waitUntil: 'commit' });
    await rat(page).waitFor();
    await rat(page).getByRole('button', { name: 'Overview' }).focus();
    await page.keyboard.press('ArrowDown');
    release();
    await waitHydrated(page);
    await page.waitForTimeout(500);
    finding(`pre-hydration ArrowDown on "Overview" at 1300px: focus=${await focusedText(page)}; errors=${JSON.stringify(errorsIn(log))}`);
  });
});

test.describe('incremental hydration: @defer (hydrate on viewport)', () => {
  test.use({ viewport: WIDE });

  for (const path of ['/deferred', '/deferred-instance']) {
    test(`${path}: block below the fold hydrates into tabs when scrolled into view`, async ({ page }) => {
      const log = await instrument(page);
      await page.goto(path);
      await waitHydrated(page);
      await page.waitForTimeout(300);
      await expectAccordion(page, null); // still dehydrated server HTML
      expect(await swaps(page)).toHaveLength(0);
      await rat(page).scrollIntoViewIfNeeded();
      await expectTabs(page, 'Overview');
      await page.waitForTimeout(300);
      finding(`${path}: swaps=${JSON.stringify(await swaps(page))}; console=${JSON.stringify(log)}`);

      if (dev) {
        const stats = await page.evaluate(() => {
          const d = (window as unknown as { ngDevMode?: Record<string, number> }).ngDevMode;
          return d ? { hydratedComponents: d['hydratedComponents'], componentsSkippedHydration: d['componentsSkippedHydration'] } : null;
        });
        finding(`${path} dev stats: ${JSON.stringify(stats)}`);
        expect(stats?.componentsSkippedHydration).toBe(0);
      }

      expect(errorsIn(log)).toEqual([]);
      await axe(page, `${path} tabs after incremental hydration`);
    });

    test(`${path}: focus on a dehydrated accordion title, block hydrates on focusin`, async ({ page }) => {
      const log = await instrument(page);
      await page.goto(path);
      await waitHydrated(page);
      await page.waitForTimeout(300);
      await rat(page).getByRole('button', { name: 'Specs' }).focus();
      await expectTabs(page, 'Overview');
      await page.waitForTimeout(300);
      const f = await focusedText(page);
      finding(`${path}: focus on dehydrated "Specs" title -> after block hydration focus=${f}; swaps=${JSON.stringify(await swaps(page))}; errors=${JSON.stringify(errorsIn(log))}`);
    });
  }
});
