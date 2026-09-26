import { test } from '@playwright/test';

test('diagnostic: does a native fragment click reload the document?', async ({ page }) => {
  const navigations: string[] = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      navigations.push(frame.url());
    }
  });

  const consoleMessages: string[] = [];
  page.on('console', (m) => consoleMessages.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => consoleMessages.push(`pageerror: ${e}`));

  await page.goto('/page-a?restoration=enabled');
  await page.waitForFunction(
    () => (window as unknown as { ngDevMode?: { hydratedComponents: number } }).ngDevMode
      ?.hydratedComponents !== undefined,
  );

  await page.evaluate(() => {
    (window as unknown as { __marker: string }).__marker = 'before-click';
  });

  navigations.length = 0; // clear the goto navigation entry, keep only what the click causes

  const linkHrefProp = await page.getByTestId('case1-link-safe').evaluate((el) => (el as HTMLAnchorElement).href);
  const linkHrefAttr = await page.getByTestId('case1-link-safe').getAttribute('href');
  const baseURI = await page.evaluate(() => document.baseURI);

  await page.evaluate(() => {
    (window as unknown as { __diag: unknown }).__diag = { popstate: 0, hashchange: 0 };
    window.addEventListener('popstate', () => {
      (window as unknown as { __diag: { popstate: number } }).__diag.popstate++;
    });
    window.addEventListener('hashchange', () => {
      (window as unknown as { __diag: { hashchange: number } }).__diag.hashchange++;
    });
  });

  await page.getByTestId('case1-link-safe').click();
  await page.waitForTimeout(600);

  const markerSurvived = await page.evaluate(
    () => (window as unknown as { __marker?: string }).__marker,
  );
  const diag = await page.evaluate(() => (window as unknown as { __diag: unknown }).__diag);
  const finalUrl = page.url();

  test.info().annotations.push(
    { type: 'linkHrefAttr', description: String(linkHrefAttr) },
    { type: 'linkHrefProp', description: String(linkHrefProp) },
    { type: 'baseURI', description: baseURI },
    { type: 'navigationsAfterClick', description: JSON.stringify(navigations) },
    { type: 'markerSurvived (undefined = document reloaded)', description: String(markerSurvived) },
    { type: 'diag (popstate/hashchange counts)', description: JSON.stringify(diag) },
    { type: 'finalUrl', description: finalUrl },
    { type: 'consoleMessages', description: JSON.stringify(consoleMessages) },
  );
});
