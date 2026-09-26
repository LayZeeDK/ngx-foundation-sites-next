import { expect, Page, test } from '@playwright/test';

/**
 * PROTOTYPE: the rendering-mode seam for Playwright e2e, against the prerendered fixture app
 * (`fixture:build:development`, `outputMode: 'static'`, served by `fixture:serve-static`).
 */

type HydrationStats = { hydrated: number; skipped: number };

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', async (message) => {
    if (message.type() !== 'error' && !/NG0\d{3}/.test(message.text())) {
      return;
    }

    // Firefox reports `console.error('ERROR', error)` as the text "ERROR Error", so read the
    // Error argument's message instead of message.text().
    const parts = await Promise.all(
      message.args().map((arg) => arg.evaluate((value) => (value instanceof Error ? value.message : String(value)))),
    );
    errors.push(parts.join(' '));
  });
  page.on('pageerror', (error) => errors.push(error.message));

  return errors;
}

async function hydrationStats(page: Page): Promise<HydrationStats> {
  return page.evaluate(() => {
    const ngDevMode = (window as unknown as { ngDevMode: Record<string, number> }).ngDevMode;

    return { hydrated: ngDevMode['hydratedComponents'], skipped: ngDevMode['componentsSkippedHydration'] };
  });
}

test.describe('first paint without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('server HTML carries the classes, jsaction, and the dehydrated block', async ({ page }) => {
    await page.goto('/');

    const closed = page.getByRole('button', { name: 'Closed at first paint' });
    const open = page.getByRole('button', { name: 'Open at first paint' });
    const deferred = page.getByRole('button', { name: 'Inside hydrate on interaction' });

    await expect(closed).not.toHaveClass(/is-active/);
    await expect(open).toHaveClass(/is-active/);
    await expect(closed).toHaveAttribute('jsaction', 'click:;');
    await expect(open).toHaveAttribute('jsaction', 'click:;');
    await expect(open).not.toHaveAttribute('data-ready');
    await expect(deferred).toHaveAttribute('ngb', /^d\d+$/);
    await expect(page.getByText('placeholder')).toHaveCount(0);
    await expect(page.locator('script#ng-event-dispatch-contract')).toHaveCount(1);

    await closed.click();
    await expect(closed).not.toHaveClass(/is-active/);
  });
});

test('a click before hydration is replayed after the main bundle loads', async ({ page }) => {
  const errors = collectErrors(page);
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));

  await page.route('**/main.js', async (route) => {
    await released;
    await route.continue();
  });

  // Module scripts delay both DOMContentLoaded and load, so wait for the first response only.
  await page.goto('/', { waitUntil: 'commit' });

  const closed = page.getByRole('button', { name: 'Closed at first paint' });
  await expect(closed).toBeVisible();
  expect(await page.evaluate(() => typeof (window as unknown as { ngDevMode: unknown }).ngDevMode)).toBe('undefined');

  await closed.click();
  await expect(closed).not.toHaveClass(/is-active/);

  release();

  await expect(closed).toHaveClass(/is-active/);
  await expect(closed).toHaveAttribute('data-ready', '');
  await expect(closed).not.toHaveAttribute('jsaction');

  const stats = await hydrationStats(page);
  expect(stats.hydrated).toBeGreaterThan(0);
  expect(stats.skipped).toBe(0);
  expect(errors).toEqual([]);
});

test('a hydrate on interaction block loads, hydrates, and replays the triggering click', async ({ page }) => {
  const errors = collectErrors(page);
  const scripts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') {
      scripts.push(new URL(request.url()).pathname);
    }
  });

  await page.goto('/');

  const open = page.getByRole('button', { name: 'Open at first paint' });
  const deferred = page.getByRole('button', { name: 'Inside hydrate on interaction' });

  // The page hydrated; the block did not.
  await expect(open).toHaveAttribute('data-ready', '');
  await expect(deferred).toHaveAttribute('ngb', /^d\d+$/);
  await expect(deferred).not.toHaveAttribute('data-ready');
  const scriptsBeforeClick = [...scripts];

  await deferred.click();

  await expect(deferred).toHaveClass(/is-active/);
  await expect(deferred).toHaveAttribute('data-ready', '');
  const lazyChunks = scripts.filter((path) => !scriptsBeforeClick.includes(path));
  expect(lazyChunks).toHaveLength(1);

  const stats = await hydrationStats(page);
  expect(stats.skipped).toBe(0);
  expect(errors).toEqual([]);
});

test('negative control: a server HTML that does not match the client logs NG0500', async ({ page }) => {
  const errors = collectErrors(page);

  await page.route('**/', async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace('<h1>Rendering-mode fixture</h1>', '');
    await route.fulfill({ response, body: html });
  });

  await page.goto('/');
  await expect.poll(() => errors.join('\n')).toContain('NG0500');
  console.log(errors.find((error) => error.includes('NG0500')));
});

test('negative control: without the replay bootstrap script the pre-hydration click is lost', async ({ page }) => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));

  await page.route('**/', async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(/<script>window\.__jsaction_bootstrap\([^<]*<\/script>/, '');
    await route.fulfill({ response, body: html });
  });
  await page.route('**/main.js', async (route) => {
    await released;
    await route.continue();
  });

  await page.goto('/', { waitUntil: 'commit' });
  const closed = page.getByRole('button', { name: 'Closed at first paint' });
  await expect(closed).toBeVisible();
  await closed.click();

  release();

  await expect(closed).toHaveAttribute('data-ready', '');
  await expect(closed).not.toHaveClass(/is-active/);
});
