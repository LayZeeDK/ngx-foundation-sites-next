// PROTOTYPE -- measures the same fixtures three ways: Foundation 6.9's own JavaScript
// (/foundation-ref.html, the oracle), the Positionable port (/fixture?impl=port), and CDK Overlay
// (/fixture?impl=cdk). Every number lands in results/<project>.jsonl; assertions are soft so one
// mismatch never hides the others.
import { expect, Page, test } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';
import { Alignment, explicitOffsets, Position } from '../src/app/positionable';

type Impl = 'foundation' | 'port' | 'cdk';
const IMPLS: Impl[] = ['foundation', 'port', 'cdk'];

interface Params {
  kind: 'dropdown' | 'tooltip';
  pos?: string;
  align?: string;
  v?: number;
  h?: number;
  x?: number;
  y?: number;
  ctx?: string;
  dir?: string;
  stageH?: number;
  text?: string;
  center?: boolean;
  cdkfix?: boolean;
  follow?: boolean;
}

interface Case {
  name: string;
  p: Params;
  viewport?: { width: number; height: number };
  scrollerTop?: number; // scroll the fixture scroller before opening
  thenScroll?: number; // scroll it again after opening, then re-measure
  resizeTo?: { width: number; height: number }; // resize after opening, then re-measure
  reopen?: { resizeTo?: { width: number; height: number } }; // close, optionally resize, open again
  expectPlacement?: string; // Foundation-formula expectation where it is known in advance
  knownFoundationDiff?: string; // the port deliberately differs from Foundation's output here
}

function url(impl: Impl, p: Params) {
  const q = new URLSearchParams();

  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) {
      q.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
    }
  }

  if (impl === 'foundation') {
    return `/foundation-ref.html?${q}`;
  }

  q.set('impl', impl);

  return `/fixture?${q}`;
}

interface Measured {
  anchor: { top: number; left: number; width: number; height: number };
  pane: { top: number; left: number; width: number; height: number };
  placement: string | null;
  scroller: { top: number; left: number; width: number; height: number } | null;
  paneInTopLayer: boolean;
  paneParent: string;
  bottomPainted: boolean;
}

async function measure(page: Page, kind: Params['kind']): Promise<Measured> {
  return page.evaluate((kind) => {
    const pane = document.querySelector<HTMLElement>(kind === 'dropdown' ? '.dropdown-pane' : '.tooltip')!;
    const anchor = document.querySelector<HTMLElement>('.fx-trigger')!;
    const scroller = document.querySelector<HTMLElement>('.fx-scroller');
    const r = (el: Element) => {
      const b = el.getBoundingClientRect();

      return { top: b.top + scrollY, left: b.left + scrollX, width: b.width, height: b.height };
    };
    const cls = [...pane.classList];
    let pos: string | undefined;
    let align: string | undefined;

    if (kind === 'dropdown') {
      pos = cls.find((c) => c.startsWith('has-position-'))?.slice(13);
      align = cls.find((c) => c.startsWith('has-alignment-'))?.slice(14);
    } else {
      pos = ['top', 'bottom', 'left', 'right'].find((c) => cls.includes(c));
      align = cls.find((c) => c.startsWith('align-'))?.slice(6);
    }

    return {
      anchor: r(anchor),
      pane: r(pane),
      placement: pos && align ? `${pos}-${align}` : null,
      scroller: scroller ? r(scroller) : null,
      paneInTopLayer: !!pane.closest('[popover]'),
      paneParent: pane.parentElement!.tagName.toLowerCase() + '.' + [...pane.parentElement!.classList].join('.'),
      // Is the pane's lowest visible row actually painted (hit-testable), or clipped away?
      bottomPainted: (() => {
        const b = pane.getBoundingClientRect();
        const hit = document.elementFromPoint(b.left + b.width / 2, b.bottom - 3);

        return !!hit && (hit === pane || pane.contains(hit));
      })(),
    };
  }, kind);
}

async function open(page: Page, impl: Impl, c: Case) {
  if (c.viewport) {
    await page.setViewportSize(c.viewport);
  }

  await page.goto(url(impl, c.p));

  if (impl === 'foundation') {
    await page.waitForFunction(() => (window as unknown as { __fxReady?: boolean }).__fxReady === true);
  } else {
    await page.waitForLoadState('networkidle');
  }

  if (c.scrollerTop !== undefined) {
    await page.evaluate((t) => (document.querySelector('.fx-scroller')!.scrollTop = t), c.scrollerTop);
  }

  // Open without Playwright's auto-scroll (it would scroll a partly hidden trigger into view).
  if (c.p.kind === 'dropdown') {
    await page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.click());
  } else {
    await page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.focus({ preventScroll: true }));
  }

  await expect
    .poll(async () => (await page.$(c.p.kind === 'dropdown' ? '.dropdown-pane' : '.tooltip')) !== null && (await measure(page, c.p.kind)).placement, {
      timeout: 5000,
    })
    .toBeTruthy();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Foundation's formula for the resolved placement, from the measured anchor and pane size. */
function formula(m: Measured, kind: Params['kind'], v: number, h: number) {
  const [position, alignment] = m.placement!.split('-') as [Position, Alignment];
  const vert = position === 'top' || position === 'bottom';
  const pv = v + (kind === 'tooltip' && vert ? 14 : 0);
  const ph = h + (kind === 'tooltip' && !vert ? 12 : 0);
  const e = explicitOffsets(m.anchor, m.pane, { position, alignment }, pv, ph);

  return { top: e.top, left: e.left, err: Math.max(Math.abs(e.top - m.pane.top), Math.abs(e.left - m.pane.left)) };
}

const rel = (m: Measured) => ({ dx: +(m.pane.left - m.anchor.left).toFixed(2), dy: +(m.pane.top - m.anchor.top).toFixed(2) });

function record(project: string, row: object) {
  mkdirSync('results', { recursive: true });
  appendFileSync(`results/${project}.jsonl`, JSON.stringify(row) + '\n');
}

const P12: Case[] = [];

for (const kind of ['dropdown', 'tooltip'] as const) {
  for (const pos of ['top', 'bottom', 'left', 'right']) {
    for (const align of pos === 'top' || pos === 'bottom' ? ['left', 'right', 'center'] : ['top', 'bottom', 'center']) {
      P12.push({ name: `12 placements: ${kind} ${pos}-${align}`, p: { kind, pos, align, v: 7, h: 11, x: 500, y: 500 }, expectPlacement: `${pos}-${align}` });
    }
  }
}

const CASES: Case[] = [
  ...P12,
  // Auto fallback near each viewport edge (default options unless stated).
  { name: 'fallback: dropdown default near right edge', p: { kind: 'dropdown', x: 1100, y: 300 }, expectPlacement: 'bottom-right' },
  { name: 'fallback: dropdown pos=left near left edge', p: { kind: 'dropdown', pos: 'left', x: 20, y: 300 }, expectPlacement: 'right-top' },
  { name: 'fallback: dropdown pos=top near top edge', p: { kind: 'dropdown', pos: 'top', x: 500, y: 10 }, expectPlacement: 'bottom-left' },
  { name: 'fallback: dropdown default near bottom edge (allowBottomOverlap)', p: { kind: 'dropdown', x: 500, y: 1950, stageH: 2000 }, expectPlacement: 'bottom-left' },
  { name: 'fallback: tooltip default near top edge', p: { kind: 'tooltip', x: 500, y: 5 }, expectPlacement: 'bottom-left' },
  { name: 'fallback: tooltip default near left edge', p: { kind: 'tooltip', x: 0, y: 300, text: 'long' } },
  { name: 'fallback: tooltip pos=right near right edge', p: { kind: 'tooltip', pos: 'right', x: 1180, y: 300 }, knownFoundationDiff: 'stale tip height' },
  { name: 'fallback: tooltip pos=left near left edge', p: { kind: 'tooltip', pos: 'left', x: 10, y: 300 } },
  { name: 'nothing fits: dropdown in a 300x300 viewport', p: { kind: 'dropdown', x: 30, y: 100, stageH: 300, text: 'long' }, viewport: { width: 300, height: 300 } },
  // Containing blocks.
  { name: 'relative ancestor: dropdown bottom-left', p: { kind: 'dropdown', pos: 'bottom', align: 'left', ctx: 'relative', v: 7, h: 11 } },
  { name: 'relative ancestor: tooltip default', p: { kind: 'tooltip', ctx: 'relative' } },
  { name: 'scrolling ancestor (positioned): dropdown, trigger partly scrolled out', p: { kind: 'dropdown', ctx: 'scroll', x: 40, y: 300 }, scrollerTop: 265, thenScroll: 30 },
  { name: 'scrolling ancestor (positioned): tooltip, trigger partly scrolled out', p: { kind: 'tooltip', pos: 'bottom', ctx: 'scroll', x: 40, y: 300 }, scrollerTop: 265, thenScroll: 30 },
  { name: 'scrolling ancestor (static): dropdown, trigger partly scrolled out', p: { kind: 'dropdown', ctx: 'scroll-static', x: 40, y: 300 }, scrollerTop: 265, thenScroll: 30 },
  { name: 'scrolling ancestor (positioned): tall dropdown overflows the scroller', p: { kind: 'dropdown', ctx: 'scroll', x: 40, y: 300, text: 'long' }, scrollerTop: 150 },
  { name: 'scrolling ancestor (positioned): long tooltip overflows the scroller', p: { kind: 'tooltip', pos: 'bottom', ctx: 'scroll', x: 40, y: 300, text: 'long' }, scrollerTop: 150 },
  { name: 'scrolling ancestor (static): tall dropdown overflows the scroller', p: { kind: 'dropdown', ctx: 'scroll-static', x: 40, y: 300, text: 'long' }, scrollerTop: 150 },
  { name: 'scrolling ancestor (static, no cdkScrollable): dropdown, trigger partly scrolled out', p: { kind: 'dropdown', ctx: 'scroll-plain', x: 40, y: 300 }, scrollerTop: 265, thenScroll: 30 },
  { name: 'scrolling ancestor (static) with followScroll: dropdown re-placed on scroll', p: { kind: 'dropdown', ctx: 'scroll-plain', x: 40, y: 300, follow: true } as Params, scrollerTop: 265, thenScroll: 30 },
  // CDK tooltip with the one-rule override for Foundation's .tooltip top (cdkfix=1; the port and Foundation ignore it).
  { name: 'CDK tip override: tooltip top-center', p: { kind: 'tooltip', pos: 'top', align: 'center', cdkfix: true } as Params, expectPlacement: 'top-center' },
  { name: 'CDK tip override: tooltip left-bottom', p: { kind: 'tooltip', pos: 'left', align: 'bottom', cdkfix: true } as Params, expectPlacement: 'left-bottom' },
  { name: 'CDK tip override: tooltip default near left edge', p: { kind: 'tooltip', x: 0, y: 300, text: 'long', cdkfix: true } as Params },
  // Re-open: measurement freshness and Foundation's kept tried-positions set.
  { name: 'reopen: tooltip pos=right near right edge (shrink-to-fit tip)', p: { kind: 'tooltip', pos: 'right', x: 1180, y: 300 }, reopen: {}, knownFoundationDiff: 'stale tip height' },
  {
    name: 'reopen: dropdown pos=right after a nothing-fits open, then widened',
    p: { kind: 'dropdown', pos: 'right', x: 1100, y: 100, stageH: 300 },
    viewport: { width: 300, height: 300 },
    reopen: { resizeTo: { width: 1280, height: 720 } },
  },
  // RTL.
  { name: 'RTL: dropdown auto alignment', p: { kind: 'dropdown', dir: 'rtl' }, expectPlacement: 'bottom-right' },
  { name: 'RTL: dropdown explicit left-top stays physical', p: { kind: 'dropdown', dir: 'rtl', pos: 'left', align: 'top' }, expectPlacement: 'left-top' },
  { name: 'RTL: tooltip explicit right stays physical', p: { kind: 'tooltip', dir: 'rtl', pos: 'right' }, expectPlacement: 'right-center' },
  // Resize: a centred trigger moves when the viewport narrows.
  { name: 'resize: dropdown on a centred trigger, 1280 -> 900 wide', p: { kind: 'dropdown', center: true, y: 300 }, resizeTo: { width: 900, height: 720 } },
  { name: 'resize: tooltip on a centred trigger, 1280 -> 900 wide', p: { kind: 'tooltip', center: true, y: 300 }, resizeTo: { width: 900, height: 720 } },
  // Body-box bound: Foundation bounds by the body box, not the viewport.
  { name: 'body box: short body (400px), tooltip bottom past the body but inside the viewport', p: { kind: 'tooltip', pos: 'bottom', y: 330, stageH: 400 } },
  { name: 'body box: tall body, tooltip bottom past the viewport but inside the body', p: { kind: 'tooltip', pos: 'bottom', y: 670, stageH: 2000 } },
];

for (const c of CASES) {
  test(c.name, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') {
        errors.push(m.text());
      }
    });
    page.on('pageerror', (e) => errors.push(String(e)));
    const results: Record<string, unknown> = {};
    const measured: Partial<Record<Impl, Measured>> = {};

    for (const impl of IMPLS) {
      await open(page, impl, c);
      const m = await measure(page, c.p.kind);
      measured[impl] = m;
      const row: Record<string, unknown> = {
        placement: m.placement,
        ...rel(m),
        formulaErr: +formula(m, c.p.kind, c.p.v ?? 0, c.p.h ?? 0).err.toFixed(2),
        paneInTopLayer: m.paneInTopLayer,
        paneParent: m.paneParent,
        bottomPainted: m.bottomPainted,
      };

      if (c.thenScroll !== undefined) {
        await page.evaluate((d) => (document.querySelector('.fx-scroller')!.scrollTop += d), c.thenScroll);
        await page.waitForTimeout(400);
        const m2 = await measure(page, c.p.kind);
        const r2 = rel(m2);
        row['afterScroll'] = { ...r2, followsAnchor: Math.abs(r2.dy - (row['dy'] as number)) < 1 };
      }

      if (c.reopen) {
        const trigger = async () =>
          c.p.kind === 'dropdown'
            ? page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.click())
            : page.evaluate(() => {
                const t = document.querySelector<HTMLElement>('.fx-trigger')!;
                t.blur();
                t.focus({ preventScroll: true });
              });

        if (c.p.kind === 'dropdown') {
          await trigger(); // close
        } else {
          await page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.blur());
        }

        await page.waitForTimeout(300);

        if (c.reopen.resizeTo) {
          await page.setViewportSize(c.reopen.resizeTo);
          await page.waitForTimeout(700);
        }

        if (c.p.kind === 'dropdown') {
          await trigger();
        } else {
          await page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.focus({ preventScroll: true }));
        }

        await page.waitForTimeout(400);
        const m2 = await measure(page, c.p.kind);
        row['afterReopen'] = { placement: m2.placement, ...rel(m2), formulaErr: +formula(m2, c.p.kind, c.p.v ?? 0, c.p.h ?? 0).err.toFixed(2) };
      }

      if (c.resizeTo) {
        await page.setViewportSize(c.resizeTo);
        await page.waitForTimeout(700); // Foundation's resizeme is debounced 250 ms
        const m2 = await measure(page, c.p.kind);
        row['afterResize'] = { placement: m2.placement, ...rel(m2), formulaErr: +formula(m2, c.p.kind, c.p.v ?? 0, c.p.h ?? 0).err.toFixed(2) };
        await page.setViewportSize(c.viewport ?? { width: 1280, height: 720 });
      }

      results[impl] = row;
    }

    const f = results['foundation'] as Record<string, number | string>;

    for (const impl of ['port', 'cdk'] as const) {
      const r = results[impl] as Record<string, number | string>;
      r['matchesFoundation'] =
        r['placement'] === f['placement'] && Math.abs((r['dx'] as number) - (f['dx'] as number)) < 1 && Math.abs((r['dy'] as number) - (f['dy'] as number)) < 1;
    }

    const trig = { foundation: measured.foundation!.anchor, port: measured.port!.anchor };
    record(info.project.name, { case: c.name, expectPlacement: c.expectPlacement ?? null, ...results, triggerSize: trig, errors });

    // Soft assertions: the port must match Foundation; CDK is measured and recorded.
    if (c.expectPlacement) {
      expect.soft(f['placement'], 'Foundation reference placement').toBe(c.expectPlacement);
    }

    if (!c.knownFoundationDiff) {
      expect.soft((results['port'] as Record<string, unknown>)['matchesFoundation'], `port vs Foundation: ${JSON.stringify(results)}`).toBe(true);
    }
    expect.soft((results['port'] as Record<string, number>)['formulaErr'], 'port vs formula').toBeLessThan(1);
    expect.soft(errors.filter((e) => /NG0\d+/.test(e)), 'Angular errors').toEqual([]);
  });
}

test('server HTML: pane present and hidden, no tip, no aria-describedby', async ({ request }, info) => {
  const dd = await (await request.get('/fixture?kind=dropdown')).text();
  const tt = await (await request.get('/fixture?kind=tooltip')).text();
  const fixture = (html: string) => html.match(/<app-fixture[\s\S]*<\/app-fixture>/)![0];
  const row = {
    case: 'server HTML',
    dropdown: fixture(dd),
    tooltip: fixture(tt),
    paneInServerHtml: /class="dropdown-pane"/.test(dd),
    paneOpenInServerHtml: /dropdown-pane[^"]*is-open/.test(dd),
    ariaControlsTargetsPane: /aria-controls="([^"]+)"[\s\S]*id="\1"/.test(fixture(dd)),
    tipInServerHtml: /class="[^"]*\btooltip\b/.test(fixture(tt)),
    describedbyInServerHtml: /aria-describedby/.test(fixture(tt)),
    cdkPaneInServerHtml: /dropdown-pane/.test(fixture(await (await request.get('/fixture?kind=dropdown&impl=cdk')).text())),
  };
  record(info.project.name, row);
  expect(row.paneInServerHtml).toBe(true);
  expect(row.paneOpenInServerHtml).toBe(false);
  expect(row.ariaControlsTargetsPane).toBe(true);
  expect(row.tipInServerHtml).toBe(false);
  expect(row.describedbyInServerHtml).toBe(false);
});

test('computed pane and tip styles: port versus CDK-hosted', async ({ page }, info) => {
  const read = async (path: string, kind: 'dropdown' | 'tooltip') => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    if (kind === 'dropdown') {
      await page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.click());
    } else {
      await page.evaluate(() => document.querySelector<HTMLElement>('.fx-trigger')!.focus({ preventScroll: true }));
    }

    await page.waitForSelector(kind === 'dropdown' ? '.dropdown-pane.is-open' : '.tooltip:not([hidden])');

    return page.evaluate((kind) => {
      const el = document.querySelector<HTMLElement>(kind === 'dropdown' ? '.dropdown-pane' : '.tooltip')!;
      const cs = getComputedStyle(el);

      return { position: cs.position, display: cs.display, maxWidth: cs.maxWidth, width: cs.width, zIndex: cs.zIndex, pointerEvents: cs.pointerEvents };
    }, kind);
  };
  const row = {
    case: 'computed styles',
    portPane: await read('/fixture?kind=dropdown&impl=port', 'dropdown'),
    cdkPane: await read('/fixture?kind=dropdown&impl=cdk', 'dropdown'),
    portTip: await read('/fixture?kind=tooltip&impl=port&text=long', 'tooltip'),
    cdkTip: await read('/fixture?kind=tooltip&impl=cdk&text=long&cdkfix=1', 'tooltip'),
  };
  record(info.project.name, row);
  expect(row.portTip.maxWidth).toBe('160px'); // Foundation's $tooltip-max-width: 10rem
});

test('hydrated page: pane hidden by Foundation CSS before open, tip created on first show and kept', async ({ page }, info) => {
  await page.goto('/fixture?kind=dropdown');
  await page.waitForLoadState('networkidle');
  const hidden = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.dropdown-pane')!);

    return { display: cs.display, visibility: cs.visibility };
  });
  await page.goto('/fixture?kind=tooltip');
  await page.waitForLoadState('networkidle');
  const before = await page.$$eval('.tooltip', (els) => els.length);
  const t = page.locator('.fx-trigger');
  await t.focus();
  await expect(page.locator('.tooltip')).toBeVisible();
  const describedby = await t.getAttribute('aria-describedby');
  const tipId = await page.locator('.tooltip').getAttribute('id');
  await t.blur();
  await expect(page.locator('.tooltip')).toBeHidden();
  const afterClose = await page.$$eval('.tooltip', (els) => els.length);
  const row = { case: 'hydrated page', paneStyleBeforeOpen: hidden, tipsBeforeShow: before, describedbyMatchesTip: describedby === tipId, tipsAfterClose: afterClose };
  record(info.project.name, row);
  expect(hidden).toEqual({ display: 'none', visibility: 'hidden' });
  expect(before).toBe(0);
  expect(row.describedbyMatchesTip).toBe(true);
  expect(afterClose).toBe(1);
});
