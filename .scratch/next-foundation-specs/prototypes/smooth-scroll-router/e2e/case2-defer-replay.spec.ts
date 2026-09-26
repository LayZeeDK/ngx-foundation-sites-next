import { expect, Page, test } from '@playwright/test';
import { collectConsoleErrors, targetOffsetTop, waitForScrollSettled } from './helpers';

/**
 * Case 2 (ticket question 2): inside a dehydrated @defer (hydrate on interaction) block, click
 * a link before hydration (main.js held back with page.route), once with nfsSmoothScroll on a
 * container host and once on a link host. Which scroll lands last: the Router's, or the
 * replayed click's? Any console error?
 *
 * NfsSmoothScroll.onClick pushes one instrumentation row per call into window.__nfsClicks (see
 * smooth-scroll.ts), recording the host kind, the event's eventPhase/defaultPrevented at entry,
 * and what the handler did. This is how the test tells a live pre-hydration call apart from a
 * later replay, and shows exactly whether preventDefault() was attempted or skipped.
 */

async function holdBackMainBundle(page: Page) {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/main.js', async (route) => {
    await held;
    await route.continue();
  });

  return () => release();
}

async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as { ngDevMode?: { hydratedComponents: number } }).ngDevMode
      ?.hydratedComponents !== undefined,
  );
}

async function initClickLog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __nfsClicks: unknown[] }).__nfsClicks = [];
  });
}

async function readClickLog(page: Page) {
  return page.evaluate(() => (window as unknown as { __nfsClicks: unknown[] }).__nfsClicks);
}

test('container host: click before hydration', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await initClickLog(page);
  const release = await holdBackMainBundle(page);

  await page.goto('/page-a', { waitUntil: 'commit' });

  const hydratedBefore = await page.evaluate(
    () => (window as unknown as { ngDevMode?: unknown }).ngDevMode,
  );
  expect(hydratedBefore).toBeUndefined();

  // waitUntil: 'commit' resolves as soon as the response is committed, before some engines
  // (Firefox) have necessarily parsed this far into the body; wait for the element itself.
  await page.waitForSelector('#c2-container-target', { state: 'attached' });
  const targetTop = await targetOffsetTop(page, 'c2-container-target');
  await page.evaluate(() => {
    (window as unknown as { __marker: string }).__marker = 'before-click';
  });

  await page.getByTestId('case2-container-link').click();

  // The container's jsaction is on the div, not the <a>, so the early contract's default click
  // handling (it never calls preventDefault before the whole app hydrates) lets the native jump
  // proceed at once, before main.js has even loaded.
  const scrollYBeforeHydration = await waitForScrollSettled(page, { timeoutMs: 1500 });
  const jumpedNativelyBeforeHydration = Math.abs(scrollYBeforeHydration - targetTop) < 5;
  const documentReloadedBeforeHydration = (await page.evaluate(
    () => (window as unknown as { __marker?: string }).__marker,
  )) === undefined;

  release();
  await waitForHydration(page);

  const finalScrollY = await waitForScrollSettled(page);
  const landedOnTarget = Math.abs(finalScrollY - targetTop) < 5;
  const landedAtTop = finalScrollY < 5;
  const clickLog = await readClickLog(page);

  test.info().annotations.push(
    { type: 'targetTop', description: String(targetTop) },
    { type: 'scrollYBeforeHydration', description: String(scrollYBeforeHydration) },
    { type: 'jumpedNativelyBeforeHydration', description: String(jumpedNativelyBeforeHydration) },
    { type: 'documentReloadedBeforeHydration', description: String(documentReloadedBeforeHydration) },
    { type: 'finalScrollY', description: String(finalScrollY) },
    { type: 'landedOnTarget', description: String(landedOnTarget) },
    { type: 'landedAtTop', description: String(landedAtTop) },
    { type: 'clickLog', description: JSON.stringify(clickLog) },
    { type: 'consoleErrors', description: JSON.stringify(consoleErrors) },
  );

  expect(documentReloadedBeforeHydration).toBe(false);
  expect(jumpedNativelyBeforeHydration).toBe(true);
});

test('link host: click before hydration', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await initClickLog(page);
  const release = await holdBackMainBundle(page);

  await page.goto('/page-a', { waitUntil: 'commit' });

  const hydratedBefore = await page.evaluate(
    () => (window as unknown as { ngDevMode?: unknown }).ngDevMode,
  );
  expect(hydratedBefore).toBeUndefined();

  await page.waitForSelector('#c2-link-target', { state: 'attached' });
  const targetTop = await targetOffsetTop(page, 'c2-link-target');
  await page.evaluate(() => {
    (window as unknown as { __marker: string }).__marker = 'before-click';
  });

  await page.getByTestId('case2-link-link').click();

  const scrollYBeforeHydration = await waitForScrollSettled(page, { timeoutMs: 1500 });
  const jumpedNativelyBeforeHydration = Math.abs(scrollYBeforeHydration - targetTop) < 5;
  const documentReloadedBeforeHydration = (await page.evaluate(
    () => (window as unknown as { __marker?: string }).__marker,
  )) === undefined;

  release();
  await waitForHydration(page);

  const finalScrollY = await waitForScrollSettled(page);
  const landedOnTarget = Math.abs(finalScrollY - targetTop) < 5;
  const landedAtTop = finalScrollY < 5;
  const clickLog = await readClickLog(page);

  test.info().annotations.push(
    { type: 'targetTop', description: String(targetTop) },
    { type: 'scrollYBeforeHydration', description: String(scrollYBeforeHydration) },
    { type: 'jumpedNativelyBeforeHydration', description: String(jumpedNativelyBeforeHydration) },
    { type: 'documentReloadedBeforeHydration', description: String(documentReloadedBeforeHydration) },
    { type: 'finalScrollY', description: String(finalScrollY) },
    { type: 'landedOnTarget', description: String(landedOnTarget) },
    { type: 'landedAtTop', description: String(landedAtTop) },
    { type: 'clickLog', description: JSON.stringify(clickLog) },
    { type: 'consoleErrors', description: JSON.stringify(consoleErrors) },
  );

  expect(documentReloadedBeforeHydration).toBe(false);
  expect(landedOnTarget).toBe(true);
});
