// PROTOTYPE (throwaway) test helpers.
import { Locator, Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const WIDE = { width: 1300, height: 900 };
export const NARROW = { width: 500, height: 900 };
export const dev = process.env['NFS_DEV'] === '1';

export function finding(text: string) {
  console.log(`FINDING ${text}`);
}

/** Collects console output and page errors; installs a rAF recorder of the widget's mode per frame. */
export async function instrument(page: Page) {
  const log: string[] = [];
  page.on('console', (m) => log.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    const w = window as unknown as { __frames: { t: number; mode: string }[] };
    w.__frames = [];
    const tick = () => {
      const h = document.querySelector('nfs-responsive-accordion-tabs');
      const mode = !h ? 'absent' : h.querySelector('ul.tabs') ? 'tabs' : h.querySelector('ul.accordion') ? 'accordion' : 'none';
      w.__frames.push({ t: performance.now(), mode });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  return log;
}

export function errorsIn(log: string[]) {
  return log.filter((l) => l.startsWith('error') || l.startsWith('pageerror') || /NG0\d{3}/.test(l));
}

export function rat(page: Page): Locator {
  return page.getByTestId('rat');
}

export async function expectTabs(page: Page, selected: string) {
  const r = rat(page);
  await expect(r).toHaveAttribute('data-mode', 'tabs');
  await expect(r.getByRole('tablist', { name: 'Product details' })).toBeVisible();
  await expect(r.getByRole('tab')).toHaveCount(3);
  await expect(r.locator('h3 > button.accordion-title')).toHaveCount(0);
  const tab = r.getByRole('tab', { name: selected });
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(r.locator('li.tabs-title.is-active')).toHaveCount(1);
  await expect(r.locator('li.tabs-title.is-active')).toHaveAttribute('role', 'presentation');
  await expect(r.locator('li.tabs-title.is-active > a')).toHaveText(selected);
  await expect(r.locator('.tabs-panel.is-active')).toHaveCount(1);
  await expect(r.getByRole('tabpanel')).toHaveCount(1); // hidden panels are inert and display:none
  await expect(r.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', (await tab.getAttribute('id'))!);
}

export async function expectAccordion(page: Page, expanded: string | null) {
  const r = rat(page);
  await expect(r).toHaveAttribute('data-mode', 'accordion');
  await expect(r.getByRole('tablist')).toHaveCount(0);
  await expect(r.getByRole('tab')).toHaveCount(0);
  await expect(r.locator('ul.accordion > li.accordion-item > h3 > button.accordion-title')).toHaveCount(3);
  if (expanded === null) {
    await expect(r.locator('li.accordion-item.is-active')).toHaveCount(0);
    await expect(r.locator('button[aria-expanded="true"]')).toHaveCount(0);
  } else {
    await expect(r.getByRole('button', { name: expanded })).toHaveAttribute('aria-expanded', 'true');
    await expect(r.locator('li.accordion-item.is-active')).toHaveCount(1);
    await expect(r.locator('li.accordion-item.is-active button')).toHaveText(expanded);
    await expect(r.getByRole('region', { name: expanded })).toBeVisible();
  }
}

export async function focusedText(page: Page) {
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null;
    return a === document.body ? 'body' : a ? `${a.tagName.toLowerCase()}${a.getAttribute('role') ? `[role=${a.getAttribute('role')}]` : ''} "${a.textContent?.trim()}"` : 'none';
  });
}

export async function axe(page: Page, label: string) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const lines = result.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => `${n.target.join(' ')} -- ${n.failureSummary?.replace(/\s+/g, ' ')}`).join(' | ')}`,
  );
  finding(`axe ${label}: ${lines.length === 0 ? 'no violations' : lines.join(' || ')}`);

  return result.violations;
}

/** Holds every request for the main bundle until release() is called. */
export async function holdMain(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/\/main-[A-Z0-9]+\.js$/, async (route) => {
    await gate;
    await route.continue();
  });

  return release;
}

export async function waitHydrated(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __appRendered?: number }).__appRendered !== undefined);
}

export async function swaps(page: Page) {
  return page.evaluate(() => (window as unknown as { __nfsSwaps?: unknown[] }).__nfsSwaps ?? []);
}

/** Frames recorded after the service went live, with the widget's mode in each. */
export async function framesAfterLive(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __frames: { t: number; mode: string }[]; __nfsLive: number };
    return w.__frames.filter((f) => f.t > w.__nfsLive);
  });
}
