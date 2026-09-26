import { expect, test } from '@playwright/test';
import { targetOffsetTop, waitForScrollSettled } from './helpers';

/**
 * Case 1 (ticket question 1): a native in-page jump with no directive at all, under
 * scrollPositionRestoration 'enabled' and 'top', with and without the nfs-smooth-scroll mixin.
 * Where does the page end up?
 *
 * Two link forms are tested. "safe" (full path + fragment) is the one this case is actually
 * about: a same-document jump the Router can react to. "bare" (a literal "#frag" href) is run
 * once on its own below to confirm the Smooth Scroll spec's base-href hazard: on this non-root
 * route it resolves against <base href="/"> and reloads the document instead of jumping.
 */
for (const restoration of ['enabled', 'top'] as const) {
  for (const mixin of [0, 1] as const) {
    test(`native jump (safe href), restoration=${restoration}, mixin=${mixin}`, async ({ page }) => {
      await page.goto(`/page-a?restoration=${restoration}&mixin=${mixin}`);

      // Wait for hydration (ngDevMode hydration stats need the development build).
      await page.waitForFunction(
        () => (window as unknown as { ngDevMode?: { hydratedComponents: number } }).ngDevMode
          ?.hydratedComponents !== undefined,
      );

      // Let the Router's own initial-navigation Scroll event (scheduled via setTimeout/rAF)
      // resolve before we click, so the click's own effect is not conflated with it.
      const scrollYAfterInitialNav = await waitForScrollSettled(page, { stableForMs: 400 });

      const targetTop = await targetOffsetTop(page, 'c1-target');

      await page.evaluate(() => {
        (window as unknown as { __marker: string }).__marker = 'before-click';
      });

      await page.getByTestId('case1-link-safe').click();

      const finalScrollY = await waitForScrollSettled(page);
      const documentReloaded = (await page.evaluate(
        () => (window as unknown as { __marker?: string }).__marker,
      )) === undefined;
      const landedOnTarget = Math.abs(finalScrollY - targetTop) < 5;
      const landedAtTop = finalScrollY < 5;

      test.info().annotations.push(
        { type: 'restoration', description: restoration },
        { type: 'mixin', description: String(mixin) },
        { type: 'scrollYAfterInitialNav', description: String(scrollYAfterInitialNav) },
        { type: 'targetTop', description: String(targetTop) },
        { type: 'finalScrollY', description: String(finalScrollY) },
        { type: 'landedOnTarget', description: String(landedOnTarget) },
        { type: 'landedAtTop', description: String(landedAtTop) },
        { type: 'documentReloaded', description: String(documentReloaded) },
        { type: 'finalUrl', description: page.url() },
      );

      expect(documentReloaded).toBe(false);
      // Report only otherwise: the point of this case is to observe, not to assert a fixed
      // expectation (that is exactly the open question).
      expect(landedOnTarget || landedAtTop).toBe(true);
    });
  }
}

test('native jump (bare href) demonstrates the <base href> hazard on a non-root route', async ({ page }) => {
  await page.goto('/page-a?restoration=enabled');
  await page.waitForFunction(
    () => (window as unknown as { ngDevMode?: { hydratedComponents: number } }).ngDevMode
      ?.hydratedComponents !== undefined,
  );

  const linkHrefProp = await page
    .getByTestId('case1-link-bare')
    .evaluate((el) => (el as HTMLAnchorElement).href);

  await page.evaluate(() => {
    (window as unknown as { __marker: string }).__marker = 'before-click';
  });

  await page.getByTestId('case1-link-bare').click();
  await page.waitForTimeout(600);

  const documentReloaded = (await page.evaluate(
    () => (window as unknown as { __marker?: string }).__marker,
  )) === undefined;

  test.info().annotations.push(
    { type: 'linkHrefProp', description: linkHrefProp },
    { type: 'documentReloaded', description: String(documentReloaded) },
    { type: 'finalUrl', description: page.url() },
  );

  expect(linkHrefProp).not.toContain('/page-a#');
  expect(documentReloaded).toBe(true);
});
