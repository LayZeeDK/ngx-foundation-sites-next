// Case 2: state computed from the host's own rectangle against the stick line matches the
// pinned geometry under REAL wheel and keyboard scrolling (page.mouse.wheel, Page Down, End,
// arrow keys) -- the prototype's older sibling only proved this with window.scrollTo.
import { expect, type Page, test } from '@playwright/test';

async function assertClassMatchesGeometry(page: Page): Promise<void> {
  const state = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="case2-sticky"]') as HTMLElement;
    const rect = el.getBoundingClientRect();

    return {
      isStuck: el.classList.contains('is-stuck'),
      top: rect.top,
    };
  });

  if (state.isStuck) {
    // stickTo="top" (default) with the default marginTop of 1em at the 16px root font.
    expect(state.top).toBeGreaterThan(14);
    expect(state.top).toBeLessThan(18);
  }
}

test('case 2: real wheel scrolling keeps the class contract matching pinned geometry', async ({ page }) => {
  await page.goto('/');
  const sticky = page.locator('[data-testid="case2-sticky"]');
  await sticky.hover();

  await assertClassMatchesGeometry(page);

  for (let step = 0; step < 8; step += 1) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(80);
    await assertClassMatchesGeometry(page);
  }

  // Scroll back up in real steps too.
  for (let step = 0; step < 8; step += 1) {
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(80);
    await assertClassMatchesGeometry(page);
  }
});

test('case 2: keyboard End/Home/PageDown/arrow scrolling keeps the class contract matching pinned geometry', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('body').click({ position: { x: 5, y: 5 } });

  await assertClassMatchesGeometry(page);

  // End is the biggest single instantaneous jump -- exactly what exposed the
  // IntersectionObserver-only correctness gap in the sticky-css prototype.
  await page.keyboard.press('End');
  await page.waitForTimeout(150);
  await assertClassMatchesGeometry(page);

  await page.keyboard.press('Home');
  await page.waitForTimeout(150);
  await assertClassMatchesGeometry(page);

  await page.keyboard.press('PageDown');
  await page.waitForTimeout(150);
  await assertClassMatchesGeometry(page);

  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(80);
  await assertClassMatchesGeometry(page);

  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(80);
  await assertClassMatchesGeometry(page);
});
