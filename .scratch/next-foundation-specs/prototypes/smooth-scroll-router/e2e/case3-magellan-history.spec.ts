import { expect, test } from '@playwright/test';
import { collectConsoleErrors, waitForScrollSettled } from './helpers';

/**
 * Case 3 (ticket question 3, added from the Magellan spec): Back and Forward over Magellan-lite's
 * replaceState (deepLinking, default) and pushState (updateHistory) entries, under the three
 * scrollPositionRestoration modes, and whether a replaceState entry survives navigating away to
 * the other route and back.
 */

async function waitForHydration(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => (window as unknown as { ngDevMode?: { hydratedComponents: number } }).ngDevMode
      ?.hydratedComponents !== undefined,
  );
}

function fragment(url: string): string {
  const hashIndex = url.indexOf('#');
  return hashIndex === -1 ? '' : url.slice(hashIndex);
}

for (const restoration of ['enabled', 'top', 'disabled'] as const) {
  for (const historyMode of ['replace', 'push'] as const) {
    test(`Back/Forward over Magellan-lite entries, restoration=${restoration}, historyMode=${historyMode}`, async ({ page }) => {
      const consoleErrors = collectConsoleErrors(page);
      const params = historyMode === 'push'
        ? `restoration=${restoration}&historyMode=push`
        : `restoration=${restoration}`;

      await page.goto(`/page-a?${params}`);
      await waitForHydration(page);

      await page.getByTestId('case3-link-1').click();
      await waitForScrollSettled(page);
      const afterLink1 = fragment(page.url());

      await page.getByTestId('case3-link-2').click();
      await waitForScrollSettled(page);
      const afterLink2 = fragment(page.url());

      await page.getByTestId('case3-link-3').click();
      await waitForScrollSettled(page);
      const afterLink3 = fragment(page.url());

      await page.goBack();
      await waitForScrollSettled(page);
      const back1Url = fragment(page.url());
      const back1ScrollY = await page.evaluate(() => window.scrollY);

      await page.goBack();
      await waitForScrollSettled(page);
      const back2Url = fragment(page.url());
      const back2ScrollY = await page.evaluate(() => window.scrollY);

      await page.goForward();
      await waitForScrollSettled(page);
      const forward1Url = fragment(page.url());
      const forward1ScrollY = await page.evaluate(() => window.scrollY);

      test.info().annotations.push(
        { type: 'afterLink1', description: afterLink1 },
        { type: 'afterLink2', description: afterLink2 },
        { type: 'afterLink3', description: afterLink3 },
        { type: 'back1Url', description: back1Url },
        { type: 'back1ScrollY', description: String(back1ScrollY) },
        { type: 'back2Url', description: back2Url },
        { type: 'back2ScrollY', description: String(back2ScrollY) },
        { type: 'forward1Url', description: forward1Url },
        { type: 'forward1ScrollY', description: String(forward1ScrollY) },
        { type: 'consoleErrors', description: JSON.stringify(consoleErrors) },
      );

      // Report only: exactly what Back/Forward land on is the open question this case answers.
      expect(afterLink1).toBe('#m-s1');
      expect(afterLink3).toBe('#m-s3');
    });
  }
}

for (const restoration of ['enabled', 'top', 'disabled'] as const) {
  test(`replaceState entry survives navigating away and back, restoration=${restoration}`, async ({ page }) => {
    const consoleErrors = collectConsoleErrors(page);

    await page.goto(`/page-a?restoration=${restoration}`);
    await waitForHydration(page);

    await page.getByTestId('case3-link-2').click();
    await waitForScrollSettled(page);
    const beforeLeavingUrl = fragment(page.url());

    await page.getByTestId('to-page-b').click();
    await page.waitForURL('**/page-b');
    await waitForScrollSettled(page);

    await page.goBack();
    await waitForScrollSettled(page);
    const backOnPageAUrl = page.url();
    const backOnPageAFragment = fragment(backOnPageAUrl);
    const backOnPageAScrollY = await page.evaluate(() => window.scrollY);
    const survivedFragment = backOnPageAFragment === beforeLeavingUrl;

    test.info().annotations.push(
      { type: 'beforeLeavingUrl', description: beforeLeavingUrl },
      { type: 'backOnPageAUrl', description: backOnPageAUrl },
      { type: 'backOnPageAFragment', description: backOnPageAFragment },
      { type: 'backOnPageAScrollY', description: String(backOnPageAScrollY) },
      { type: 'survivedFragment', description: String(survivedFragment) },
      { type: 'consoleErrors', description: JSON.stringify(consoleErrors) },
    );

    expect(backOnPageAUrl).toContain('/page-a');
  });
}
