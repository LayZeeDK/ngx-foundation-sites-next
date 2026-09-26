import { expect, test } from '@playwright/test';
import { collectConsoleErrors, ng05xxErrors, readPaintEntries, readProbe, waitForHydration } from './helpers';

// PROTOTYPE (throwaway). Viewport is 1300px (playwright.config.ts), which
// resolves to `atLeast('large')` (>= 64em / 1024px) in the default map, so
// the outlet's `large` rule template is the live-viewport answer everywhere,
// and `small` (the Zero breakpoint) is the Server breakpoint's answer.

test.describe('case 1: server HTML carries the Server breakpoint template', () => {
  for (const path of ['/ssr', '/prerendered']) {
    test(`${path} server HTML contains the small rule's template, not the large one's`, async ({ request }) => {
      const response = await request.get(path);
      const html = await response.text();

      expect(html).toContain('data-testid="interchange-small"');
      expect(html).not.toContain('data-testid="interchange-large"');
      // The output never emits on the server (render callbacks don't run
      // there) -- the replaced-log paragraph carries no rule name in server
      // HTML (only whitespace and/or Angular's empty-text-node comment marker).
      const replacedLogMatch = html.match(/data-testid="replaced-log">(.*?)<\/p>/);
      expect(replacedLogMatch, html).toBeTruthy();
      expect(replacedLogMatch![1]).not.toContain('small');
      expect(replacedLogMatch![1]).not.toContain('large');
    });
  }
});

test.describe('case 2: hydration claims the view with no NG05xx, then swaps to the live template', () => {
  for (const path of ['/ssr', '/prerendered']) {
    test(`${path} hydrates cleanly and swaps to the large rule's template`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('load');

      const stats = await waitForHydration(page);
      expect(stats, 'ngDevMode was not present -- was this route built in the development configuration?').toBeTruthy();
      expect(stats!.componentsSkippedHydration, JSON.stringify(stats)).toBe(0);
      expect(stats!.hydratedComponents ?? 0, JSON.stringify(stats)).toBeGreaterThan(0);

      await expect(page.locator('[data-testid=interchange-large]')).toBeVisible();
      expect(await page.locator('[data-testid=interchange-small]').count()).toBe(0);

      expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
    });
  }
});

test.describe('case 1 and 2, ngDoCheck fallback: same server HTML and hydration guarantees', () => {
  for (const path of ['/ssr-fallback', '/prerendered-fallback']) {
    test(`${path} server HTML carries the small template, hydrates cleanly, and (re-run finding) never swaps`, async ({
      page,
      request,
    }) => {
      const response = await request.get(path);
      const html = await response.text();
      expect(html).toContain('data-testid="interchange-small"');
      expect(html).not.toContain('data-testid="interchange-large"');

      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('load');

      const stats = await waitForHydration(page);
      expect(stats, 'ngDevMode was not present').toBeTruthy();
      expect(stats!.componentsSkippedHydration, JSON.stringify(stats)).toBe(0);
      expect(stats!.hydratedComponents ?? 0, JSON.stringify(stats)).toBeGreaterThan(0);

      // RE-RUN FINDING (ticket 67): with `replaced` no longer firing early,
      // nothing re-checks the page after the handoff, so ngDoCheck never runs
      // again and the zoneless fallback keeps the Server breakpoint's view.
      // In the first prototype the early `replaced` handler's signal write
      // (the page's replaced-log) was what scheduled that re-check.
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid=interchange-small]')).toBeVisible();
      expect(await page.locator('[data-testid=interchange-large]').count()).toBe(0);

      expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
    });
  }
});

test.describe('case 3: the swap lands in the same tick as the Breakpoint handoff on /csr', () => {
  test('/csr never paints the small rule template; the swap to large lands at or before first paint', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/csr');
    await page.waitForLoadState('load');

    await page
      .waitForFunction(
        () =>
          ((window as unknown as { __nfsProbe?: { label: string }[] }).__nfsProbe ?? []).some((e) =>
            e.label.startsWith('outlet-swap:large'),
          ),
        undefined,
        { timeout: 5000 },
      )
      .catch(() => {
        // Let the assertion below report the (still incomplete) probe contents.
      });

    const probe = await readProbe(page);
    const paint = await readPaintEntries(page);

    // The FIRST swap to 'large' is the one that matters for "no wrong frame
    // ever painted" -- a router/CSR-shell artifact independent of the outlet
    // (see README.md "What went wrong", CSR double-construction) can cause a
    // second, redundant reconstruction of the whole outlet shortly after,
    // which lands after first paint in some engines but always re-selects
    // 'large' again (never 'small'), so nothing incorrect is ever shown.
    const swaps = probe.filter((e) => e.label.startsWith('outlet-swap:'));
    const firstLargeSwap = swaps.find((e) => e.label === 'outlet-swap:large');
    expect(firstLargeSwap, `probe: ${JSON.stringify(probe)}`).toBeTruthy();
    expect(swaps.at(-1)!.label, `probe: ${JSON.stringify(probe)}`).toBe('outlet-swap:large');

    const firstPaint = paint.find((p) => p.name === 'first-paint') ?? paint[0];

    if (firstPaint) {
      expect(
        firstLargeSwap!.at,
        `first large swap at ${firstLargeSwap!.at}ms, first paint at ${firstPaint.startTime}ms (paint entries: ${JSON.stringify(paint)}, full probe: ${JSON.stringify(probe)})`,
      ).toBeLessThanOrEqual(firstPaint.startTime + 2);
    }

    await expect(page.locator('[data-testid=interchange-large]')).toBeVisible();
    expect(await page.locator('[data-testid=interchange-small]').count()).toBe(0);

    expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);

    // Record what the outlet's probe actually shows for the replaced output's
    // emission sequence on this route, for the ticket's evidence table --
    // not asserted beyond "ends with large", because the spec's "fires once"
    // wording is exactly the open question this case checks.
    const replacedMarks = probe.filter((e) => e.label.startsWith('replaced:')).map((e) => e.label);
    expect(replacedMarks.at(-1), JSON.stringify(replacedMarks)).toBe('replaced:large');
    test.info().annotations.push({ type: 'replaced-sequence-csr', description: JSON.stringify(replacedMarks) });
  });
});

test.describe('case 3b: @defer (hydrate on viewport) hydrates into the live template after scrolling', () => {
  for (const path of ['/ssr', '/prerendered']) {
    test(`${path}: scrolling the deferred block into view hydrates it into the large rule's template`, async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForHydration(page);

      await page
        .locator('[data-testid=defer-placeholder], [data-testid=defer-replaced-log]')
        .scrollIntoViewIfNeeded();

      await expect(page.locator('[data-testid=defer-interchange-large]')).toBeVisible({ timeout: 5000 });
      expect(await page.locator('[data-testid=defer-interchange-small]').count()).toBe(0);

      await expect(page.locator('[data-testid=defer-replaced-log]')).toHaveText(/large$/);

      expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
    });
  }
});

test.describe('case 3c: replaced emits after each render, ending with the selected content', () => {
  for (const path of ['/csr', '/ssr', '/prerendered']) {
    test(`${path}: the replaced-log ends with 'large'`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForHydration(page).catch(() => {
        // /csr never hydrates (RenderMode.Client skips it); nothing to wait for there.
      });

      await expect(page.locator('[data-testid=replaced-log]')).toHaveText(/large$/, { timeout: 5000 });
    });
  }
});

