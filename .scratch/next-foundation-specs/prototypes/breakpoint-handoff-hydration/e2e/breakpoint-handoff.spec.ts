import { expect, test } from '@playwright/test';
import { collectConsoleErrors, ng05xxErrors, readPaintEntries, readProbe, waitForHydration } from './helpers';

// PROTOTYPE (throwaway). Viewport is 1300px (playwright.config.ts), which
// resolves to the `xlarge` breakpoint (min-width 75em / 1200px) but not
// `xxlarge` (90em / 1440px) in the default map, and is `atLeast('large')`
// (>= 64em / 1024px) either way.

test.describe('case 1: client-rendered route never paints the Server breakpoint', () => {
  test('/csr switches to the live breakpoint before the first paint', async ({ page }, testInfo) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/csr');
    await page.waitForLoadState('load');

    // `load` can fire before Angular's bootstrap has reached its first
    // afterNextRender callback (observed in WebKit); wait for the mark
    // itself rather than racing it. This does not weaken the assertion
    // below -- that assertion is about the *ordering* of the mq-live
    // timestamp against the first-paint timestamp, not about how soon it
    // happens.
    await page
      .waitForFunction(
        () =>
          ((window as unknown as { __nfsProbe?: { label: string }[] }).__nfsProbe ?? []).some(
            (e) => e.label === 'mq-live-after-set',
          ),
        undefined,
        { timeout: 5000 },
      )
      .catch(() => {
        // Let the assertion below report the (still empty) probe contents.
      });

    const probe = await readProbe(page);
    const paint = await readPaintEntries(page);

    const mqLive = probe.find((e) => e.label === 'mq-live-after-set');
    expect(mqLive, `probe: ${JSON.stringify(probe)}`).toBeTruthy();

    const firstPaint = paint.find((p) => p.name === 'first-paint') ?? paint[0];

    if (firstPaint) {
      // The switch must land at or before the very first pixel the browser
      // painted -- if it landed after, an earlier paint could only have
      // shown the Server breakpoint's (small) layout. 2ms slack for
      // cross-context clock rounding.
      expect(
        mqLive!.at,
        `mq-live at ${mqLive!.at}ms, first paint at ${firstPaint.startTime}ms (paint entries: ${JSON.stringify(paint)})`,
      ).toBeLessThanOrEqual(firstPaint.startTime + 2);
    } else {
      testInfo.annotations.push({
        type: 'note',
        description: 'No Paint Timing entries in this engine; timing-vs-paint proof skipped, DOM-only proof below stands.',
      });
    }

    // What Playwright can actually observe (necessarily after the switch,
    // since navigation only resolves once the page has settled) never shows
    // the Server breakpoint's branch:
    await expect(page.locator('[data-testid=current]')).toHaveText('xlarge');
    await expect(page.locator('[data-testid=branch-large]')).toBeVisible();
    expect(await page.locator('[data-testid=branch-small]').count()).toBe(0);

    expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
  });
});

test.describe('case 2: hydration rebuilds the breakpoint-dependent @if branch', () => {
  for (const path of ['/ssr', '/prerendered']) {
    test(`${path} (server breakpoint 'small') hydrates to 'xlarge' with no NG05xx and no skipped components`, async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('load');

      const stats = await waitForHydration(page);
      expect(stats, 'ngDevMode was not present -- was this route built in the development configuration?').toBeTruthy();
      expect(stats!.componentsSkippedHydration, JSON.stringify(stats)).toBe(0);
      expect(stats!.hydratedComponents ?? 0, JSON.stringify(stats)).toBeGreaterThan(0);

      await expect(page.locator('[data-testid=current]')).toHaveText('xlarge');
      await expect(page.locator('[data-testid=branch-large]')).toBeVisible();
      expect(await page.locator('[data-testid=branch-small]').count()).toBe(0);

      expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
    });
  }

  test("/ssr?bp=large (per-request Server breakpoint via TransferState) still hydrates to 'xlarge'", async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/ssr?bp=large');
    await page.waitForLoadState('load');

    const stats = await waitForHydration(page);
    expect(stats, 'ngDevMode missing').toBeTruthy();
    expect(stats!.componentsSkippedHydration, JSON.stringify(stats)).toBe(0);

    // The server rendered 'large' (branch-large already, no structural
    // rebuild needed at hydration this time -- only the printed name
    // advances from 'large' to the live 'xlarge').
    await expect(page.locator('[data-testid=current]')).toHaveText('xlarge');
    await expect(page.locator('[data-testid=branch-large]')).toBeVisible();

    expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
  });
});

test.describe('case 3: @defer (hydrate on viewport) hydrates after the switch', () => {
  for (const path of ['/ssr', '/prerendered']) {
    test(`${path}: scrolling the deferred block into view hydrates it into the 'large' branch`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForHydration(page);

      await page.locator('[data-testid=defer-placeholder], [data-testid=defer-current]').scrollIntoViewIfNeeded();

      await expect(page.locator('[data-testid=defer-branch-large]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid=defer-current]')).toHaveText('xlarge');

      expect(ng05xxErrors(errors), errors.join('\n')).toEqual([]);
    });
  }
});
