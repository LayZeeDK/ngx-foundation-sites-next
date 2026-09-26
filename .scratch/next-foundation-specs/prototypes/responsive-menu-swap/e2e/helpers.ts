// PROTOTYPE (throwaway) test helpers.
import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const SMALL = { width: 500, height: 900 }; // drilldown
export const MEDIUM = { width: 800, height: 900 }; // dropdown
export const LARGE = { width: 1280, height: 900 }; // accordion
export const dev = process.env['NFS_DEV'] === '1';

export type Entry = Record<string, any> & { kind: string; t: number };

export function finding(text: string) {
  console.log(`FINDING ${text}`);
}

/** Console and page errors, plus a rAF recorder of the menu's mode class and open submenus per frame. */
export async function instrument(page: Page) {
  const log: string[] = [];
  page.on('console', (m) => log.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    const w = window as unknown as { __frames: { t: number; mode: string; open: number }[] };
    w.__frames = [];
    const tick = () => {
      const root = document.querySelector('[data-testid="menu"]');
      let mode = 'absent';
      let open = 0;

      if (root) {
        const c = root.classList;
        mode = c.contains('drilldown') ? 'drilldown' : c.contains('dropdown') ? 'dropdown' : c.contains('accordion-menu') ? 'accordion' : 'none';
        open = root.querySelectorAll('ul[nfssubmenu]:not([inert])').length;
      }

      w.__frames.push({ t: performance.now(), mode, open });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  return log;
}

export function errorsIn(log: string[]) {
  return log.filter((l) => l.startsWith('error') || l.startsWith('pageerror') || /NG0\d{3}/.test(l));
}

export async function entries(page: Page): Promise<Entry[]> {
  return page.evaluate(() => (window as unknown as { __nfsLog?: Entry[] }).__nfsLog ?? []);
}

export async function frames(page: Page): Promise<{ t: number; mode: string; open: number }[]> {
  return page.evaluate(() => (window as unknown as { __frames: { t: number; mode: string; open: number }[] }).__frames);
}

export async function waitApp(page: Page) {
  await page.waitForFunction(() =>
    ((window as unknown as { __nfsLog?: { kind: string }[] }).__nfsLog ?? []).some((e) => e.kind === 'app-rendered'),
  );
}

export async function waitMode(page: Page, mode: string) {
  await expect(page.getByTestId('status')).toContainText(`mode=${mode}`);
}

/** Completion outputs run after the mode's transition plus 100 ms (accordion 250 ms, drilldown 150 ms). */
export async function settle(page: Page) {
  await page.waitForTimeout(450);
}

export async function focused(page: Page) {
  return page.evaluate(() => {
    const a = document.activeElement;

    return !a || a === document.body ? 'body' : `${a.tagName.toLowerCase()} "${(a.textContent ?? '').trim().replace(/\s+/g, ' ')}"`;
  });
}

/** Holds every request for the main bundle until release() is called. */
export async function holdMain(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/\/main(-[A-Z0-9]+)?\.js$/, async (route) => {
    await gate;
    await route.continue();
  });

  return release;
}

export function menu(page: Page) {
  return page.getByTestId('menu');
}

const exact = (text: string) => new RegExp(`^\\s*${text}\\s*$`);

/** A submenu toggle by its exact text (CSS locator: also finds toggles in `invisible` levels). */
export function toggle(page: Page, name: string) {
  return menu(page).locator('button[nfssubmenutoggle]').filter({ hasText: exact(name) });
}

/** The back button of the level a toggle opens. */
export function backIn(page: Page, toggleName: string) {
  return menu(page)
    .locator('li', { has: page.locator('button[nfssubmenutoggle]').filter({ hasText: exact(toggleName) }) })
    .last()
    .locator(':scope > ul > li.js-drilldown-back > button');
}

/**
 * Per-pass atomicity: for every committed swap, look at every pass between the previous
 * commit and the next plan; a pass that shows the new root class while a submenu the swap
 * closes is still open (not inert) is a violation.
 */
export function passCheck(all: Entry[], from = 0) {
  const e = all.slice(from);
  const out: { from: string; to: string; closing: string[]; passes: number; bad: Entry[]; firstNew?: Entry }[] = [];

  e.forEach((c, i) => {
    if (c.kind !== 'swap-commit') {
      return;
    }

    let start = i - 1;

    while (start >= 0 && e[start].kind !== 'swap-commit') {
      start--;
    }

    const next = e.findIndex((x, j) => j > i && x.kind === 'swap-plan');
    const passes = e.slice(start + 1, next === -1 ? e.length : next).filter((x) => x.kind === 'pass');
    const bad = passes.filter((p) => p.mode === c.to && (c.closing as string[]).some((l) => p.open.includes(l)));
    out.push({ from: c.from, to: c.to, closing: c.closing, passes: passes.length, bad, firstNew: passes.find((p) => p.mode === c.to) });
  });

  return out;
}

export function summarize(all: Entry[], from = 0) {
  return all
    .slice(from)
    .filter((x) => ['swap-plan', 'swap-commit', 'refocus', 'swap-rendered', 'completion', 'output', 'expandedChange', 'forced'].includes(x.kind))
    .map((x) => {
      switch (x.kind) {
        case 'swap-plan':
          return `plan ${x.from}->${x.to} close=[${x.closing}] focus=${x.focusBefore}`;
        case 'swap-commit':
          return `commit ${x.to}`;
        case 'refocus':
          return `refocus ${x.to}`;
        case 'swap-rendered':
          return `rendered ${x.to} focus=${x.focusAfter} open=[${x.shown.open}]`;
        case 'output':
          return `(${x.output}) ${x.item} in ${x.mode}`;
        case 'expandedChange':
          return `expandedChange ${x.value}`;
        case 'forced':
          return `forced-style focus=${x.focus}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('; ');
}

export async function axe(page: Page, label: string) {
  const result = await new AxeBuilder({ page })
    .include('[data-testid="menu-nav"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  const lines = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
  finding(`axe ${label}: ${lines.length === 0 ? 'no violations' : lines.join(' || ')}`);

  return result.violations;
}

export async function devStats(page: Page) {
  return page.evaluate(() => {
    const d = (window as unknown as { ngDevMode?: Record<string, number> }).ngDevMode;

    return d && typeof d === 'object'
      ? { hydratedComponents: d['hydratedComponents'], componentsSkippedHydration: d['componentsSkippedHydration'] }
      : null;
  });
}
