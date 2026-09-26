import { Page, expect, test } from '@playwright/test';
import { readProbe, waitForHydration } from './helpers';

// PROTOTYPE (throwaway, re-run of ticket 67). The first prototype's finding
// tests asserted `replaced-dom-check:large:NOT-SHOWN`; with the rendered-rule
// handoff they must assert `shown` on every emission, and the stronger
// inner check (the new view's `@if` link with its bound attribute) must be
// `shown` too. The candidate routes are measured and logged, and asserted on
// what the mechanism does.

type Probe = { label: string; at: number }[];

async function waitForReplaced(page: Page, rule: string, count = 1): Promise<void> {
  await page
    .waitForFunction(
      ([r, n]) =>
        ((window as unknown as { __nfsProbe?: { label: string }[] }).__nfsProbe ?? []).filter((e) =>
          e.label.startsWith(`replaced-dom-check:${r}:`),
        ).length >= (n as number),
      [rule, count] as const,
      { timeout: 5000 },
    )
    .catch(() => {});
}

function checks(probe: Probe, kind: 'dom' | 'inner' | 'focus'): string[] {
  return probe.filter((e) => e.label.startsWith(`replaced-${kind}-check:`) || (kind === 'focus' && e.label.startsWith('replaced-focus:'))).map((e) => e.label);
}

function log(tag: string, value: unknown): void {
  // Picked up from the list reporter's stdout for the ticket's evidence table.
  console.log(`[rerun-67] ${test.info().project.name} ${tag} ${JSON.stringify(value)}`);
}

test.describe('re-run: replaced fires only after the DOM shows the rule (first-render handoff)', () => {
  for (const path of ['/csr', '/ssr', '/prerendered']) {
    test(`${path}: every replaced emission sees its rule's view, including the update pass`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForReplaced(page, 'large');

      const probe = await readProbe(page);
      const dom = checks(probe, 'dom');
      const inner = checks(probe, 'inner');
      const replacedLog = await page.getByTestId('replaced-log').textContent();
      log(`${path} dom`, dom);
      log(`${path} inner`, inner);
      log(`${path} replaced-log`, replacedLog);
      const paint = await page.evaluate(() => performance.getEntriesByType('paint').map((e) => [e.name, e.startTime]));
      log(`${path} timeline`, {
        marks: probe
          .filter((e) => /^(mq-live-after-set|outlet-swap:large|replaced:large)$/.test(e.label))
          .map((e) => [e.label, Math.round(e.at * 10) / 10]),
        paint,
      });

      expect(dom.length, JSON.stringify(probe)).toBeGreaterThan(0);
      expect(dom.every((l) => l.endsWith(':shown')), JSON.stringify(dom)).toBe(true);
      expect(inner.every((l) => l.endsWith(':shown')), JSON.stringify(inner)).toBe(true);
      // The main outlet reports exactly once, `large`, on a large viewport: the
      // Server breakpoint's rule is never reported (defer- entries on /csr are
      // the @defer block's own outlet, which a client-rendered route loads on
      // idle because `hydrate on viewport` has no client trigger).
      expect(dom.filter((l) => !l.includes(':defer-')), JSON.stringify(dom)).toEqual([
        'replaced-dom-check:large:shown',
      ]);
    });
  }
});

test.describe('re-run finding: the ngDoCheck fallback never swaps once replaced stops firing early', () => {
  for (const path of ['/csr-fallback', '/ssr-fallback', '/prerendered-fallback']) {
    test(`${path}: the Server breakpoint's view stays, nothing is emitted`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);

      const probe = await readProbe(page);
      log(`${path} labels`, probe.map((e) => e.label));
      await expect(page.getByTestId('interchange-small')).toBeVisible();
      expect(await page.getByTestId('interchange-large').count()).toBe(0);
      expect(probe.some((e) => e.label === 'mq-live-after-set')).toBe(true);
      expect(probe.some((e) => e.label.startsWith('replaced-docheck:'))).toBe(false);
    });
  }
});

test.describe('re-run: @defer (hydrate on viewport) block', () => {
  for (const path of ['/ssr', '/prerendered']) {
    test(`${path}: the deferred outlet's replaced sees its view`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForHydration(page);
      await page.locator('[data-testid=defer-placeholder], [data-testid=defer-replaced-log]').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('defer-replaced-log')).toHaveText(/large$/, { timeout: 5000 });

      const probe = await readProbe(page);
      const dom = checks(probe, 'dom');
      const inner = checks(probe, 'inner');
      log(`${path} defer dom`, dom);
      expect(dom.every((l) => l.endsWith(':shown')), JSON.stringify(dom)).toBe(true);
      expect(inner.every((l) => l.endsWith(':shown')), JSON.stringify(inner)).toBe(true);
    });
  }
});

test.describe('re-run: background mode (host style binding), handoff vs naive', () => {
  for (const path of ['/csr', '/ssr', '/prerendered']) {
    test(`${path}: record what background replaced sees`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await page
        .waitForFunction(
          () =>
            ((window as unknown as { __nfsProbe?: { label: string }[] }).__nfsProbe ?? []).filter((e) =>
              e.label.startsWith('bg-check:'),
            ).length >= 2,
          undefined,
          { timeout: 5000 },
        )
        .catch(() => {});

      const probe = await readProbe(page);
      const bg = probe.filter((e) => e.label.startsWith('bg-check:')).map((e) => e.label);
      log(`${path} bg`, bg);

      expect(bg.filter((l) => l.startsWith('bg-check:handoff:'))).toEqual(['bg-check:handoff:large:shown']);
      // Recorded, not asserted: the spec as published (emit from a render
      // callback reading selected()).
      expect(bg.filter((l) => l.startsWith('bg-check:naive:')).length).toBeGreaterThan(0);
    });
  }
});

test.describe('re-run: candidate fix (swap and emit in one render callback), measured', () => {
  for (const path of ['/csr-candidate', '/ssr-candidate', '/csr-candidate-detect']) {
    test(`${path}: record what replaced sees`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForReplaced(page, 'large');

      const probe = await readProbe(page);
      const dom = checks(probe, 'dom');
      const inner = checks(probe, 'inner');
      log(`${path} dom`, dom);
      log(`${path} inner`, inner);

      await expect(page.getByTestId('large-link')).toBeVisible();
      expect(dom).toEqual(['replaced-dom-check:large:shown']);

      if (path === '/csr-candidate-detect') {
        expect(inner.at(-1)).toBe('replaced-inner-check:large:shown');
      } else {
        // The new view has had only its creation pass: no `@if` content yet.
        expect(inner.at(-1)).toBe('replaced-inner-check:large:NOT-SHOWN');
      }
    });
  }
});

test.describe('re-run: a later swap with focus inside the removed view', () => {
  const cases: { path: string; fromRenderCallback: boolean }[] = [
    { path: '/csr', fromRenderCallback: true },
    { path: '/csr', fromRenderCallback: false },
    { path: '/ssr', fromRenderCallback: true },
    { path: '/csr-candidate', fromRenderCallback: true },
    { path: '/csr-candidate-detect', fromRenderCallback: true },
  ];

  for (const { path, fromRenderCallback } of cases) {
    test(`${path}: swap to small ${fromRenderCallback ? 'from a render callback' : 'from a plain signal write'}`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await waitForReplaced(page, 'large');
      await expect(page.getByTestId('large-link')).toBeVisible();

      await page.getByTestId('large-link').focus();
      await expect(page.getByTestId('large-link')).toBeFocused();

      await page.evaluate(
        (fromCallback) =>
          (window as unknown as { __nfsSetBreakpoint: (n: string, f: boolean) => void }).__nfsSetBreakpoint(
            'small',
            fromCallback,
          ),
        fromRenderCallback,
      );
      await waitForReplaced(page, 'small');
      await expect(page.getByTestId('interchange-small')).toBeVisible();

      const probe = await readProbe(page);
      const smallDom = checks(probe, 'dom').filter((l) => l.includes(':small:'));
      const smallInner = checks(probe, 'inner').filter((l) => l.includes(':small:'));
      const smallFocus = checks(probe, 'focus').filter((l) => l.includes(':small:'));
      const activeAfter = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.nodeName,
      );
      log(`${path} fromRenderCallback=${fromRenderCallback} small`, { smallDom, smallInner, smallFocus, activeAfter });
      log(`${path} fromRenderCallback=${fromRenderCallback} labels`, probe.map((e) => e.label));

      if (path.startsWith('/csr-candidate') && path !== '/csr-candidate-detect') {
        // Candidate without detectChanges: the @if link is not rendered when
        // the focus rule and the emission run, so focus stays on <body>.
        expect(smallInner).toEqual(['replaced-inner-check:small:NOT-SHOWN']);
        expect(activeAfter).toBe('BODY');
      } else {
        expect(smallDom).toEqual(['replaced-dom-check:small:shown']);
        expect(smallInner).toEqual(['replaced-inner-check:small:shown']);
        // The focus move happened before the emission, and it stuck.
        expect(smallFocus).toEqual(['replaced-focus:small:small-link']);
        expect(activeAfter).toBe('small-link');
      }
    });
  }
});
