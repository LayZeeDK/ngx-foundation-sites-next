// PROTOTYPE (throwaway). Run against the SSR server on port 4705 (bash serve.sh).
// Rules everywhere: drilldown medium-dropdown large-accordion; Server breakpoint small.
import { Page, expect, test } from '@playwright/test';
import {
  Entry,
  LARGE,
  MEDIUM,
  SMALL,
  axe,
  backIn,
  dev,
  devStats,
  entries,
  errorsIn,
  finding,
  focused,
  frames,
  holdMain,
  instrument,
  menu,
  passCheck,
  settle,
  summarize,
  toggle,
  waitApp,
  waitMode,
} from './helpers';

type Viewport = { width: number; height: number };

async function openPage(page: Page, path: string, vp: Viewport, mode: string) {
  await page.setViewportSize(vp);
  await page.goto(path);
  await waitApp(page);
  await waitMode(page, mode);
  await settle(page);
}

async function openSubmenus(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-testid="menu"] ul[nfssubmenu]:not([inert])')).map((u) =>
      (u.parentElement?.querySelector(':scope > button[nfssubmenutoggle]')?.textContent ?? '').trim(),
    ),
  );
}

function outputs(e: Entry[], from: number, kind: 'opened' | 'closed') {
  return e
    .slice(from)
    .filter((x) => x.kind === 'output' && x.output === kind)
    .map((x) => `${x.item}@${x.mode}`);
}

/** Checks shared by every swap: pass atomicity, focus, open set, outputs, no console errors. */
async function assertSwap(
  page: Page,
  log: string[],
  label: string,
  mark: number,
  expected: { focus: string; open: string[]; closed: string[]; swaps?: number },
) {
  await settle(page);
  const e = await entries(page);
  const pc = passCheck(e, mark);
  const focus = await focused(page);
  const open = await openSubmenus(page);
  const closed = outputs(e, mark, 'closed');
  const opened = outputs(e, mark, 'opened');
  finding(
    `${label}: ${summarize(e, mark)} | passes=${JSON.stringify(pc.map((p) => ({ to: p.to, passes: p.passes, bad: p.bad.length, firstNewOpen: p.firstNew?.open })))} | focus=${focus} open=[${open}]`,
  );
  expect(pc).toHaveLength(expected.swaps ?? 1);

  for (const p of pc) {
    expect(p.bad, `pass showing ${p.to} over closing submenus`).toEqual([]);
    // The pass that first shows the new root class already has the pruned Open path.
    expect(p.firstNew).toBeTruthy();
  }

  expect(focus).toBe(expected.focus);
  expect(open.sort()).toEqual([...expected.open].sort());
  expect(closed.map((c) => c.split('@')[0]).sort()).toEqual([...expected.closed].sort());
  expect(opened).toEqual([]);
  expect(errorsIn(log)).toEqual([]);

  return e;
}

// ------------------------------------------------------------------ question 1

test.describe('Q1 runtime swaps across each threshold (/ssr, hydrated)', () => {
  test('F1 dropdown -> drilldown (800 -> 500), focus inside the open submenu', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', MEDIUM, 'dropdown');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1A').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'F1', mark, { focus: 'button "Item 1A"', open: ['Item 1'], closed: [] });
  });

  test('F2 drilldown -> dropdown (500 -> 800), focus inside the open level', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', SMALL, 'drilldown');
    await toggle(page, 'Item 1').click();
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await settle(page);
    const mark = (await entries(page)).length;
    await page.setViewportSize(MEDIUM);
    await waitMode(page, 'dropdown');
    await assertSwap(page, log, 'F2', mark, { focus: 'button "Item 1A"', open: ['Item 1'], closed: [] });
  });

  test('F3 dropdown -> drilldown (800 -> 500), focus on the open submenu toggle', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', MEDIUM, 'dropdown');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'F3', mark, { focus: 'button "Item 1"', open: [], closed: ['Item 1'] });
    await expect(toggle(page, 'Item 1')).toHaveAttribute('aria-expanded', 'false');
  });

  test('F4 accordion -> dropdown (1280 -> 800), two open, focus in the second', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', LARGE, 'accordion');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Products pages').click();
    await settle(page);
    await menu(page).getByRole('link', { name: 'Boards' }).focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(MEDIUM);
    await waitMode(page, 'dropdown');
    await assertSwap(page, log, 'F4', mark, { focus: 'a "Boards"', open: ['Products pages'], closed: ['Item 1'] });
  });

  test('dropdown -> accordion (800 -> 1280), focus inside: nothing closes', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', MEDIUM, 'dropdown');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1A').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(LARGE);
    await waitMode(page, 'accordion');
    await assertSwap(page, log, 'dropdown->accordion', mark, { focus: 'button "Item 1A"', open: ['Item 1'], closed: [] });
  });

  test('back button, drilldown -> dropdown (500 -> 800): focus to the level first control', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', SMALL, 'drilldown');
    await toggle(page, 'Item 1').click();
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await settle(page);
    await backIn(page, 'Item 1').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(MEDIUM);
    await waitMode(page, 'dropdown');
    await assertSwap(page, log, 'back->dropdown', mark, { focus: 'button "Item 1A"', open: ['Item 1'], closed: [] });
  });

  test('back button, drilldown -> accordion (500 -> 1280, two thresholds)', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', SMALL, 'drilldown');
    await toggle(page, 'Item 1').click();
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await settle(page);
    await backIn(page, 'Item 1').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(LARGE);
    await waitMode(page, 'accordion');
    await assertSwap(page, log, 'back->accordion', mark, { focus: 'button "Item 1A"', open: ['Item 1'], closed: [] });
  });

  test('accordion -> drilldown (1280 -> 500), focus inside the second open section', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', LARGE, 'accordion');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Products pages').click();
    await settle(page);
    await menu(page).getByRole('link', { name: 'Boards' }).focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'accordion->drilldown focus inside', mark, {
      focus: 'a "Boards"',
      open: ['Products pages'],
      closed: ['Item 1'],
    });
  });

  test('accordion -> drilldown (1280 -> 500), focus outside: first open per level stays', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', LARGE, 'accordion');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Products pages').click();
    await settle(page);
    await page.getByTestId('outside').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'accordion->drilldown focus outside', mark, {
      focus: 'a "Link after the menu"',
      open: ['Item 1'],
      closed: ['Products pages'],
    });
  });

  test('accordion -> dropdown (1280 -> 800), focus outside: every submenu closes', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', LARGE, 'accordion');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1A').click();
    await settle(page);
    await page.getByTestId('outside').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(MEDIUM);
    await waitMode(page, 'dropdown');
    await assertSwap(page, log, 'accordion->dropdown focus outside', mark, {
      focus: 'a "Link after the menu"',
      open: [],
      closed: ['Item 1', 'Item 1A'],
    });
  });

  test('F3 with a Hybrid link: dropdown -> drilldown, focus on the Products link (published rule)', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', MEDIUM, 'dropdown');
    await toggle(page, 'Products pages').click();
    await menu(page).getByRole('link', { name: 'Products' }).focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await settle(page);
    const e = await entries(page);
    const pc = passCheck(e, mark);
    const focus = await focused(page);
    const open = await openSubmenus(page);
    finding(`hybrid-link spec rule: ${summarize(e, mark)} | bad passes=${pc.map((p) => p.bad.length)} | focus=${focus} open=[${open}]`);
    // Recorded, not asserted: the published keep rule keeps Products open (its li holds focus).
    expect(pc).toHaveLength(1);
  });

  test('F3 with a Hybrid link, row variant (?rule=row)', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr?rule=row', MEDIUM, 'dropdown');
    await toggle(page, 'Products pages').click();
    await menu(page).getByRole('link', { name: 'Products' }).focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'hybrid-link row rule', mark, { focus: 'a "Products"', open: [], closed: ['Products pages'] });
  });

  test('axe (WCAG 2.2 AA tags) after each swap: 500 -> 800 -> 1280 -> 500', async ({ page }) => {
    await instrument(page);
    await openPage(page, '/ssr', SMALL, 'drilldown');
    await toggle(page, 'Item 1').click();
    await settle(page);
    const all: unknown[] = [];

    for (const [vp, mode] of [
      [MEDIUM, 'dropdown'],
      [LARGE, 'accordion'],
      [SMALL, 'drilldown'],
    ] as const) {
      await page.setViewportSize(vp);
      await waitMode(page, mode);
      await settle(page);
      all.push(...(await axe(page, `after swap to ${mode}`)));
    }

    expect(all).toEqual([]);
  });
});

test.describe('Q1 rules changes (window.__setRules, focus not moved)', () => {
  test('F3 by rules: dropdown -> drilldown at 800', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', MEDIUM, 'dropdown');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1').focus();
    const mark = (await entries(page)).length;
    await page.evaluate(() => (window as unknown as { __setRules: (r: string) => void }).__setRules('drilldown'));
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'rules F3', mark, { focus: 'button "Item 1"', open: [], closed: ['Item 1'] });
  });

  test('rules drilldown -> accordion -> drilldown at 500, focus inside', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', SMALL, 'drilldown');
    await toggle(page, 'Item 1').click();
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await settle(page);
    const mark = (await entries(page)).length;
    await page.evaluate(() => (window as unknown as { __setRules: (r: string) => void }).__setRules('accordion'));
    await waitMode(page, 'accordion');
    await settle(page);
    await page.evaluate(() => (window as unknown as { __setRules: (r: string) => void }).__setRules('drilldown'));
    await waitMode(page, 'drilldown');
    await assertSwap(page, log, 'rules round trip', mark, { focus: 'button "Item 1A"', open: ['Item 1'], closed: [], swaps: 2 });
  });
});

// ------------------------------------------------------- question 1: first render

test.describe('Q1 focus before hydration, main bundle held back', () => {
  for (const [path, vp, mode] of [
    ['/ssr', LARGE, 'accordion'],
    ['/prerendered', LARGE, 'accordion'],
    ['/ssr', MEDIUM, 'dropdown'],
  ] as const) {
    test(`${path} at ${vp.width}: toggle focused before hydration keeps focus (-> ${mode})`, async ({ page }) => {
      const log = await instrument(page);
      await page.setViewportSize(vp);
      const release = await holdMain(page);
      await page.goto(path, { waitUntil: 'commit' });
      await toggle(page, 'Item 1').waitFor();
      await toggle(page, 'Item 1').focus();
      const before = await focused(page);
      release();
      await waitApp(page);
      await waitMode(page, mode);
      await assertSwap(page, log, `pre-hydration ${path} ${vp.width}`, 0, { focus: 'button "Item 1"', open: [], closed: [] });
      expect(before).toBe('button "Item 1"');
    });
  }

  test('/ssr/current at 800: link inside the open level focused before hydration', async ({ page }) => {
    const log = await instrument(page);
    await page.setViewportSize(MEDIUM);
    const release = await holdMain(page);
    await page.goto('/ssr/current', { waitUntil: 'commit' });
    const boards = menu(page).getByRole('link', { name: 'Boards' });
    await boards.waitFor();
    await boards.focus();
    release();
    await waitApp(page);
    await waitMode(page, 'dropdown');
    await assertSwap(page, log, 'pre-hydration current, focus Boards', 0, { focus: 'a "Boards"', open: ['Products pages'], closed: [] });
    await expect(page.getByTestId('status')).toContainText('productsOpen=true');
  });

  for (const [vp, mode] of [
    [MEDIUM, 'dropdown'],
    [LARGE, 'accordion'],
  ] as const) {
    test(`/ssr/current at ${vp.width}: back button focused before hydration -> ${mode}`, async ({ page }) => {
      const log = await instrument(page);
      await page.setViewportSize(vp);
      const release = await holdMain(page);
      await page.goto('/ssr/current', { waitUntil: 'commit' });
      const back = backIn(page, 'Products pages');
      await back.waitFor();
      await back.focus();
      const before = await focused(page);
      release();
      await waitApp(page);
      await waitMode(page, mode);
      await assertSwap(page, log, `pre-hydration back ${vp.width}`, 0, { focus: 'a "Boards"', open: ['Products pages'], closed: [] });
      expect(before).toBe('button "Back to main menu"');
    });
  }
});

// ------------------------------------------------------------------ question 2

test.describe('Q2 first-render handoff, no painted frame of the Server breakpoint mode', () => {
  for (const [path, vp, mode] of [
    ['/csr', LARGE, 'accordion'],
    ['/csr', MEDIUM, 'dropdown'],
    ['/ssr', LARGE, 'accordion'],
    ['/ssr', MEDIUM, 'dropdown'],
    ['/prerendered', LARGE, 'accordion'],
    ['/prerendered', MEDIUM, 'dropdown'],
  ] as const) {
    test(`${path} at ${vp.width}: swap committed in the first tick (-> ${mode})`, async ({ page }) => {
      const log = await instrument(page);
      await openPage(page, path, vp, mode);
      const e = await entries(page);
      const f = await frames(page);
      const at = (k: string) => e.find((x) => x.kind === k)?.t ?? NaN;
      const live = at('mq-live');
      const rendered = at('swap-rendered');
      const paint = await page.evaluate(() => performance.getEntriesByType('paint').map((p) => ({ n: p.name, t: p.startTime })));
      const firstPaint = Math.min(...paint.map((p) => p.t));
      const framesAfterLive = f.filter((x) => x.t > live);
      const betweenLiveAndRendered = f.filter((x) => x.t > live && x.t < rendered);
      const ctor = at('mq-ctor');
      const betweenCtorAndRendered = f.filter((x) => x.t > ctor && x.t < rendered);
      const menuFramesBeforeRendered = f.filter((x) => x.mode !== 'absent' && x.t < rendered);
      const order = e
        .filter((x) => ['mq-ctor', 'mq-live', 'flag', 'swap-plan', 'swap-commit', 'swap-rendered', 'app-rendered'].includes(x.kind))
        .map((x) => `${x.kind}@${x.t}`);
      finding(
        `${path} ${vp.width}: ${order.join(' ')} | first paint ${firstPaint.toFixed(1)} | frames between service ctor and swap render=${betweenCtorAndRendered.length} | frames between live and rendered=${betweenLiveAndRendered.length} | menu frames before swap render=${menuFramesBeforeRendered.length} (${[...new Set(menuFramesBeforeRendered.map((x) => x.mode))]}) | drilldown frames after live=${framesAfterLive.filter((x) => x.mode === 'drilldown').length} | drilldown frames total=${f.filter((x) => x.mode === 'drilldown').length} | ${summarize(e)}`,
      );
      expect(e.filter((x) => x.kind === 'swap-commit')).toHaveLength(1);
      expect(e.find((x) => x.kind === 'swap-plan')).toMatchObject({ from: 'drilldown', to: mode });
      expect(betweenLiveAndRendered).toEqual([]);
      expect(framesAfterLive.filter((x) => x.mode !== mode)).toEqual([]);

      if (path === '/csr') {
        // A client-rendered route shows no frame of the menu before the swap rendered: the
        // menu is created, rendered in the Server breakpoint's mode, and swapped in one task.
        // (Paint Timing is reported only: its first paint can be the page shell, before the
        // router created the menu at all.)
        expect(f.filter((x) => x.mode === 'drilldown')).toEqual([]);
        expect(menuFramesBeforeRendered).toEqual([]);
        expect(betweenCtorAndRendered).toEqual([]);
      }

      for (const p of passCheck(e)) {
        expect(p.bad).toEqual([]);
      }

      if (dev && path !== '/csr') {
        const stats = await devStats(page);
        finding(`${path} ${vp.width} dev stats: ${JSON.stringify(stats)}`);
        expect(stats?.componentsSkippedHydration).toBe(0);
      }

      expect(errorsIn(log)).toEqual([]);
    });
  }

  test('/ssr at 500: no swap', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr', SMALL, 'drilldown');
    const e = await entries(page);
    expect(e.filter((x) => x.kind.startsWith('swap'))).toEqual([]);
    expect(errorsIn(log)).toEqual([]);
  });

  test('/late at 800: client-created instance after the service went live', async ({ page }) => {
    const log = await instrument(page);
    await page.setViewportSize(MEDIUM);
    await page.goto('/late');
    await waitApp(page);
    const mark = (await entries(page)).length;
    await page.getByTestId('show').click();
    await waitMode(page, 'dropdown');
    await settle(page);
    const e = await entries(page);
    const f = await frames(page);
    const rendered = e.slice(mark).find((x) => x.kind === 'swap-rendered')?.t ?? NaN;
    const menuFramesBeforeRendered = f.filter((x) => x.mode !== 'absent' && x.t < rendered);
    finding(
      `/late 800: ${summarize(e, mark)} | drilldown frames=${f.filter((x) => x.mode === 'drilldown').length} | menu frames before swap render=${menuFramesBeforeRendered.length} | frames with menu=${f.filter((x) => x.mode !== 'absent').length}`,
    );
    expect(e.slice(mark).find((x) => x.kind === 'swap-plan')).toMatchObject({ from: 'drilldown', to: 'dropdown' });
    expect(f.filter((x) => x.mode === 'drilldown')).toEqual([]);
    expect(menuFramesBeforeRendered).toEqual([]);
    expect(errorsIn(log)).toEqual([]);
  });

  for (const path of ['/deferred', '/deferred-prerendered']) {
    for (const [vp, mode] of [
      [LARGE, 'accordion'],
      [MEDIUM, 'dropdown'],
    ] as const) {
      test(`${path} at ${vp.width}: hydrate on viewport hydrates as sent, then swaps (-> ${mode})`, async ({ page }) => {
        const log = await instrument(page);
        await page.setViewportSize(vp);
        await page.goto(path);
        await waitApp(page);
        await expect(page.getByTestId('page-breakpoint')).not.toContainText('small');
        await expect(menu(page)).toHaveClass(/drilldown/);
        const mark = (await entries(page)).length;
        const before = await devStats(page);
        await menu(page).scrollIntoViewIfNeeded();
        await waitMode(page, mode);
        await settle(page);
        const e = await entries(page);
        const f = await frames(page);
        const post = e.slice(mark);
        const plan = post.find((x) => x.kind === 'swap-plan');
        const firstPass = post.find((x) => x.kind === 'pass');
        const passesBeforePlan = post.filter((x, i) => x.kind === 'pass' && i < post.indexOf(plan!));
        const rendered = post.find((x) => x.kind === 'swap-rendered')?.t ?? NaN;
        const t0 = firstPass?.t ?? NaN;
        const framesBetween = f.filter((x) => x.t > t0 && x.t < rendered);
        const stats = await devStats(page);
        finding(
          `${path} ${vp.width}: ${summarize(e, mark)} | plan saw ${plan?.shown.mode} | passes before plan=${JSON.stringify(passesBeforePlan.map((p) => p.mode))} | frames between hydration pass and swap render=${framesBetween.length} | dev before=${JSON.stringify(before)} after=${JSON.stringify(stats)}`,
        );
        expect(plan).toMatchObject({ from: 'drilldown', to: mode });
        expect(plan?.shown.mode).toBe('drilldown');
        expect(passesBeforePlan.every((p) => p.mode === 'drilldown')).toBe(true);
        expect(framesBetween).toEqual([]);

        if (dev) {
          expect(stats?.componentsSkippedHydration).toBe(0);
        }

        expect(errorsIn(log)).toEqual([]);
      });
    }
  }

  test('/deferred at 1280: toggle focused before the block hydrates keeps focus', async ({ page }) => {
    const log = await instrument(page);
    await page.setViewportSize(LARGE);
    await page.goto('/deferred');
    await waitApp(page);
    await expect(menu(page)).toHaveClass(/drilldown/);
    await toggle(page, 'Item 1').focus(); // scrolls it into view, which triggers hydration
    await waitMode(page, 'accordion');
    await assertSwap(page, log, 'deferred focus before block hydration', 0, { focus: 'button "Item 1"', open: [], closed: [] });
  });
});

// ------------------------------------------------------------------ question 3

test.describe('Q3 swap into dropdown with focus outside closes a static is-active section', () => {
  for (const path of ['/csr/current', '/ssr/current', '/prerendered/current', '/deferred/current', '/late/current']) {
    test(`${path} at 800: first-render swap closes Products, closed once, [(expanded)] false`, async ({ page }) => {
      const log = await instrument(page);
      await page.setViewportSize(MEDIUM);
      await page.goto(path);
      await waitApp(page);
      const mark = path.startsWith('/deferred') || path.startsWith('/late') ? (await entries(page)).length : 0;

      if (path.startsWith('/deferred')) {
        await expect(menu(page)).toHaveClass(/drilldown/);
        await expect(toggle(page, 'Products pages')).toHaveAttribute('aria-expanded', 'true');
        await menu(page).scrollIntoViewIfNeeded();
      }

      if (path.startsWith('/late')) {
        await page.getByTestId('show').click();
        await page.getByTestId('outside').focus();
      }

      await waitMode(page, 'dropdown');
      const e = await assertSwap(page, log, `Q3 ${path}`, mark, {
        focus: path.startsWith('/late') ? 'a "Link after the menu"' : 'body',
        open: [],
        closed: ['Products pages'],
      });
      // The prototype seeds from the submenu constructor, after the li's listeners exist, so
      // the seed also emits `true` (the spec seeds before subscribers); the swap writes `false` once.
      const xc = e.slice(mark).filter((x) => x.kind === 'expandedChange');
      finding(`Q3 ${path} expandedChange sequence: ${JSON.stringify(xc.map((x) => x.value))}`);
      expect(xc.filter((x) => x.value === false)).toHaveLength(1);
      expect(xc.at(-1)?.value).toBe(false);
      expect(outputs(e, mark, 'closed')).toEqual(['Products pages@dropdown']);
      await expect(page.getByTestId('status')).toContainText('productsOpen=false');
      await expect(toggle(page, 'Products pages')).toHaveAttribute('aria-expanded', 'false');
    });
  }

  test('/ssr/current at 1280: first-render swap into accordion keeps Products open, no output', async ({ page }) => {
    const log = await instrument(page);
    await page.setViewportSize(LARGE);
    await page.goto('/ssr/current');
    await waitApp(page);
    await waitMode(page, 'accordion');
    await assertSwap(page, log, 'Q3 accordion keeps', 0, { focus: 'body', open: ['Products pages'], closed: [] });
    await expect(page.getByTestId('status')).toContainText('productsOpen=true');
  });

  for (const [path, from, fromMode] of [
    ['/ssr/current', SMALL, 'drilldown'],
    ['/csr/current', LARGE, 'accordion'],
  ] as const) {
    test(`${path}: runtime swap ${fromMode} -> dropdown with focus outside`, async ({ page }) => {
      const log = await instrument(page);
      await openPage(page, path, from, fromMode);
      await expect(toggle(page, 'Products pages')).toHaveAttribute('aria-expanded', 'true');
      await page.getByTestId('outside').focus();
      const mark = (await entries(page)).length;
      await page.setViewportSize(MEDIUM);
      await waitMode(page, 'dropdown');
      const e = await assertSwap(page, log, `Q3 runtime ${fromMode}`, mark, {
        focus: 'a "Link after the menu"',
        open: [],
        closed: ['Products pages'],
      });
      expect(e.slice(mark).filter((x) => x.kind === 'expandedChange').map((x) => x.value)).toEqual([false]);
      expect(outputs(e, mark, 'closed')).toEqual(['Products pages@dropdown']);
      await expect(page.getByTestId('status')).toContainText('productsOpen=false');
    });
  }

  test('/ssr/current at 500: rules change to dropdown with focus outside', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr/current', SMALL, 'drilldown');
    await page.getByTestId('outside').focus();
    const mark = (await entries(page)).length;
    await page.evaluate(() => (window as unknown as { __setRules: (r: string) => void }).__setRules('dropdown'));
    await waitMode(page, 'dropdown');
    const e = await assertSwap(page, log, 'Q3 rules', mark, { focus: 'a "Link after the menu"', open: [], closed: ['Products pages'] });
    expect(outputs(e, mark, 'closed')).toEqual(['Products pages@dropdown']);
    await expect(page.getByTestId('status')).toContainText('productsOpen=false');
  });
});

// ------------------------------------------------------------------- controls

test.describe('Controls', () => {
  test('CONTROL ?commit=old (Nested menu spec as written): F3 shows a pass with drilldown over the open submenu', async ({ page }) => {
    const log = await instrument(page);
    await openPage(page, '/ssr?commit=old', MEDIUM, 'dropdown');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1').focus();
    const mark = (await entries(page)).length;
    await page.setViewportSize(SMALL);
    await waitMode(page, 'drilldown');
    await settle(page);
    const e = await entries(page);
    const pc = passCheck(e, mark);
    finding(
      `CONTROL commit=old F3: ${summarize(e, mark)} | bad passes=${JSON.stringify(pc.map((p) => p.bad.map((b) => ({ pass: b.pass, mode: b.mode, open: b.open, focus: b.focus }))))} | focus=${await focused(page)} open=[${await openSubmenus(page)}] | errors=${JSON.stringify(errorsIn(log))}`,
    );
    // The recorder must catch the intermediate pass the amendment removes.
    expect(pc.flatMap((p) => p.bad).length).toBeGreaterThan(0);
  });

  for (const commit of ['old', 'amended']) {
    test(`CONTROL ?force=1 (a style-forcing earlyRead first), commit=${commit}: F3 focus`, async ({ page }) => {
      const log = await instrument(page);
      await openPage(page, `/ssr?force=1${commit === 'old' ? '&commit=old' : ''}`, MEDIUM, 'dropdown');
      await toggle(page, 'Item 1').click();
      await toggle(page, 'Item 1').focus();
      const mark = (await entries(page)).length;
      await page.setViewportSize(SMALL);
      await waitMode(page, 'drilldown');
      await settle(page);
      const e = await entries(page);
      const pc = passCheck(e, mark);
      const focus = await focused(page);
      finding(
        `CONTROL force=1 commit=${commit} F3: ${summarize(e, mark)} | bad=${pc.map((p) => p.bad.length)} | focus=${focus} open=[${await openSubmenus(page)}] | errors=${JSON.stringify(errorsIn(log))}`,
      );

      if (commit === 'amended') {
        expect(pc.flatMap((p) => p.bad)).toEqual([]);
        expect(focus).toBe('button "Item 1"');
      }
    });
  }

  for (const path of ['/deferred', '/deferred/current']) {
    test(`CONTROL ?start=current (ADR 0014 handoff) on ${path} at 800`, async ({ page }) => {
      const log = await instrument(page);
      await page.setViewportSize(MEDIUM);
      await page.goto(`${path}?start=current`);
      await waitApp(page);
      await expect(menu(page)).toHaveClass(/drilldown/);
      const mark = (await entries(page)).length;
      await menu(page).scrollIntoViewIfNeeded();
      await waitMode(page, 'dropdown');
      await settle(page);
      const e = await entries(page);
      const post = e.slice(mark);
      const passes = post.filter((x) => x.kind === 'pass');
      finding(
        `CONTROL start=current ${path}: ${summarize(e, mark) || 'no swap'} | passes=${JSON.stringify(passes.map((p) => ({ mode: p.mode, open: p.open })))} | open=[${await openSubmenus(page)}] | dev=${JSON.stringify(await devStats(page))} | errors=${JSON.stringify(errorsIn(log))}`,
      );
    });
  }

  test('CONTROL ?start=current on /late/current at 800: client-created instance skips the swap rule', async ({ page }) => {
    const log = await instrument(page);
    await page.setViewportSize(MEDIUM);
    await page.goto('/late/current?start=current');
    await waitApp(page);
    const mark = (await entries(page)).length;
    await page.getByTestId('show').click(); // focus stays outside the menu (on the button, or body in WebKit)
    await waitMode(page, 'dropdown');
    await settle(page);
    const e = await entries(page);
    finding(
      `CONTROL start=current /late/current: ${summarize(e, mark) || 'no swap'} | open=[${await openSubmenus(page)}] | errors=${JSON.stringify(errorsIn(log))}`,
    );
  });
});
