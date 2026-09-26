import { test } from '@playwright/test';
import { targetOffsetTop } from './helpers';

test('diagnostic: section offsets for case 3', async ({ page }) => {
  await page.goto('/page-a');
  await page.waitForFunction(
    () => (window as unknown as { ngDevMode?: { hydratedComponents: number } }).ngDevMode
      ?.hydratedComponents !== undefined,
  );

  const s1 = await targetOffsetTop(page, 'm-s1');
  const s2 = await targetOffsetTop(page, 'm-s2');
  const s3 = await targetOffsetTop(page, 'm-s3');

  test.info().annotations.push(
    { type: 's1', description: String(s1) },
    { type: 's2', description: String(s2) },
    { type: 's3', description: String(s3) },
  );
});
