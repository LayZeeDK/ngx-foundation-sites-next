// Case 1: absolutely positioned sentinels appended at the container's end leave layout
// unchanged, in flex, grid, and padded containers, before and after they are appended.
// "Before" = JavaScript disabled (server HTML, no sentinels); "after" = hydrated client.
import { expect, test } from '@playwright/test';

const containers = [
  { id: 'case1-flex', label: 'flex container' },
  { id: 'case1-grid', label: 'grid container' },
  { id: 'case1-padded', label: 'padded container' },
];

for (const { id, label } of containers) {
  test(`case 1: ${label} -- sentinels do not change layout`, async ({ page, browser }) => {
    const noJsContext = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto('/');
    const before = await noJsPage.evaluate((testId) => {
      const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
      return { children: el.children.length, width: el.getBoundingClientRect().width, scrollHeight: el.scrollHeight };
    }, id);
    await noJsContext.close();

    await page.goto('/');
    await page.waitForTimeout(400); // afterNextRender + observer setup settle

    const after = await page.evaluate((testId) => {
      const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
      return {
        children: el.children.length,
        width: el.getBoundingClientRect().width,
        scrollHeight: el.scrollHeight,
        sentinels: el.querySelectorAll('[data-nfs-sticky-sentinel]').length,
      };
    }, id);

    expect(after.sentinels).toBe(2);
    expect(after.children).toBe(before.children + 2);
    expect(Math.abs(after.width - before.width)).toBeLessThan(0.5);
    expect(after.scrollHeight).toBe(before.scrollHeight);
  });
}
