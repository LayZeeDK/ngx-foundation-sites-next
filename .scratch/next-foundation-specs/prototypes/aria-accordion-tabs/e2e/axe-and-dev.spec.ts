// PROTOTYPE (throwaway). axe on the hydrated page and on the server
// paint (WCAG 2.2 AA tags), plus a console dump used for the development build
// (run with NFS_DEV=1 after `ng build --configuration development`).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('axe: hydrated page and server paint (main bundle blocked)', async ({ page, browser }, info) => {
  test.skip(info.project.name !== 'chromium' || !!process.env['NFS_DEV'], 'one engine, production build');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const hydrated = await new AxeBuilder({ page }).include('main').withTags(tags).analyze();
  // axe needs script injection, so the server paint is checked with the main bundle blocked.
  const ctx = await browser.newContext();
  const noJs = await ctx.newPage();
  await noJs.route(/\/main-[A-Z0-9]+\.js$/, (r) => r.abort());
  await noJs.goto('/');
  const server = await new AxeBuilder({ page: noJs }).include('main').withTags(tags).analyze();
  await ctx.close();
  const fmt = (r: typeof hydrated) => r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`).join('; ') || 'none';
  console.log(`FINDING axe hydrated: ${fmt(hydrated)}\nFINDING axe server paint: ${fmt(server)}`);
  // Foundation's default tab palette (#1779ba on #e6e6e6) fails contrast; that is the
  // theme, not the composition. Everything else must be clean.
  const ratios = hydrated.violations
    .filter((v) => v.id === 'color-contrast')
    .flatMap((v) => v.nodes.map((n) => `${n.target.join(' ')} ${(n.any[0]?.data as { contrastRatio?: number })?.contrastRatio}`));
  console.log(`FINDING axe color-contrast nodes: ${ratios.join('; ')}`);
  const structural = (r: typeof hydrated) => r.violations.filter((v) => v.id !== 'color-contrast');
  expect(structural(hydrated)).toEqual([]);
  expect(structural(server)).toEqual([]);
});

test('development build: console output at load', async ({ page }, info) => {
  test.skip(!process.env['NFS_DEV'], 'set NFS_DEV=1 against a development build');
  const logs: string[] = [];
  page.on('console', (m) => logs.push(`console.${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log(`FINDING [${info.project.name}] dev console:\n  ${logs.join('\n  ')}`);
});
