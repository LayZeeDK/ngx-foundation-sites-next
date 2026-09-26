// PROTOTYPE probe: does a Tab pressed during the 150ms drilldown slide scroll the
// overflow:hidden wrapper (the preventScroll fix covers only the programmatic focus)?
import { expect, test } from '@playwright/test';

for (const clip of [false, true]) test('tab during the drilldown slide, overflow clip ' + clip, async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit Tab skips links by default');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/drilldown');
  await expect(page.getByTestId('status')).toHaveText('breakpoint: large');
  if (clip) { await page.addStyleTag({ content: '.is-drilldown { overflow: clip; }' }); }
  const scroll = await page.evaluate(async () => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Item 1')!;
    const wrapper = document.querySelector<HTMLElement>('[nfsdrilldownwrapper]')!;
    btn.click();
    // Wait for the directive's afterNextRender focus, then Tab-equivalent: focus the next link mid-slide.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const next = Array.from(wrapper.querySelectorAll('a')).find((a) => a.textContent?.trim() === 'Item 1B')!;
    const midSlide = getComputedStyle(next.closest('ul')!).transform;
    next.focus(); // what the browser does on Tab (no preventScroll)
    await new Promise((r) => setTimeout(r, 400));

    return { midSlide, scrollLeft: wrapper.scrollLeft, overflow: getComputedStyle(wrapper).overflowX };
  });
  console.log(`[probe] clip=${clip} ${browserName} ${JSON.stringify(scroll)}`);
});
