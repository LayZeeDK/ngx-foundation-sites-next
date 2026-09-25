import { test, expect, type Page } from '@playwright/test';

/**
 * PROTOTYPE (throwaway). Records `animationstart` events fired anywhere in the
 * page (capture phase, from an init script installed before any application
 * code runs) so we can tell, per data-testid, whether the nfs-fade-in /
 * nfs-fade-in-gated keyframe actually started playing.
 */
async function installAnimationRecorder(page: Page) {
  await page.addInitScript(() => {
    (window as any).__animEvents = [] as Array<{ testId: string | null; time: number }>;
    window.addEventListener(
      'animationstart',
      (e) => {
        const target = e.target as HTMLElement;
        (window as any).__animEvents.push({
          testId: target?.dataset?.['testid'] ?? null,
          time: performance.now(),
        });
      },
      true,
    );
  });
}

async function animEvents(page: Page): Promise<Array<{ testId: string | null; time: number }>> {
  return page.evaluate(() => (window as any).__animEvents);
}

async function animatedTestIds(page: Page): Promise<string[]> {
  const events = await animEvents(page);
  return events.map((e) => e.testId).filter((id): id is string => id !== null);
}

test.describe('full hydration route (/full)', () => {
  test('case1-static, case1-suppressed, case1-cssgate variants, case4-control', async ({ page }) => {
    await installAnimationRecorder(page);
    await page.goto('/full');

    // give hydration (immediate), the control's 50ms setTimeout, the delayed
    // gate's 700ms removal, and each 400ms keyframe time to fully resolve.
    await page.waitForTimeout(1600);

    const events = await animEvents(page);
    const animated = events.map((e) => e.testId);
    console.log('[RESULT /full]', JSON.stringify(events));

    expect(animated).toContain('case4-control'); // control: must animate
  });
});

test.describe('prerendered route (/prerendered)', () => {
  test('case3-static, case3-suppressed, case3-cssgate', async ({ page }) => {
    await installAnimationRecorder(page);
    await page.goto('/prerendered');
    await page.waitForTimeout(1200);
    const animated = await animatedTestIds(page);
    console.log('[RESULT /prerendered]', JSON.stringify(animated));
  });
});

test.describe('defer hydration routes (/defer)', () => {
  test('case2-interaction: hydrate on interaction', async ({ page }) => {
    await installAnimationRecorder(page);
    await page.goto('/defer');
    const el = page.getByTestId('case2-interaction');
    await expect(el).toBeVisible();
    // Click hydrates the block (jsaction on the block's root element, per
    // research/angular-rendering-modes.md section 3).
    await el.click();
    await page.waitForTimeout(800);
    const animated = await animatedTestIds(page);
    console.log('[RESULT /defer interaction]', JSON.stringify(animated));
  });

  test('case2-viewport: hydrate on viewport', async ({ page }) => {
    await installAnimationRecorder(page);
    await page.goto('/defer');
    const el = page.getByTestId('case2-viewport');
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const animated = await animatedTestIds(page);
    console.log('[RESULT /defer viewport]', JSON.stringify(animated));
  });
});
