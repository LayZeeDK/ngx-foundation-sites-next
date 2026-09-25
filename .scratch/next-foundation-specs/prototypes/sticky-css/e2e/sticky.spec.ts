import { test, expect, Page } from '@playwright/test';

interface DocRect {
  top: number;
  height: number;
}

async function docRect(page: Page, testId: string): Promise<DocRect> {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const rect = el.getBoundingClientRect();
    return { top: window.scrollY + rect.top, height: rect.height };
  }, testId);
}

async function state(page: Page, testId: string) {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const cs = getComputedStyle(el);
    return {
      classes: [...el.classList].filter((c) => c !== 'sticky'),
      position: cs.position,
      top: cs.top,
      bottom: cs.bottom,
      rectTop: el.getBoundingClientRect().top,
    };
  }, testId);
}

async function scrollWindowTo(page: Page, y: number): Promise<void> {
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), y);
  await page.waitForTimeout(150); // IntersectionObserver callbacks are async (a macrotask)
}

test.describe('Sticky CSS prototype (ticket 48)', () => {
  test('case-basic-top: is-stuck / is-at-top / is-at-bottom contract', async ({ page }) => {
    await page.goto('/');
    const container = await docRect(page, 'basic-top-container');

    await scrollWindowTo(page, container.top - 100);
    let s = await state(page, 'basic-top');
    expect(s.classes.sort()).toEqual(['is-anchored', 'is-at-top']);
    expect(s.position).toBe('sticky');
    expect(s.top).toBe('16px'); // 1em default at 16px base font

    await scrollWindowTo(page, container.top + container.height / 2);
    s = await state(page, 'basic-top');
    expect(s.classes.sort()).toEqual(['is-at-top', 'is-stuck']);
    expect(s.rectTop).toBeCloseTo(16, 0); // pinned at the 1em offset

    await scrollWindowTo(page, container.top + container.height + 50);
    s = await state(page, 'basic-top');
    expect(s.classes.sort()).toEqual(['is-anchored', 'is-at-bottom']);
  });

  test('case-stick-bottom: stickTo bottom sticks and unsticks', async ({ page }) => {
    await page.goto('/');
    const container = await docRect(page, 'stick-bottom-container');

    // The stuck window starts well before the container's own top for a
    // bottom-anchored element (the pin target is measured from the viewport
    // bottom), so "before the range" needs a much larger scroll-back margin
    // than the top-sticky case.
    await scrollWindowTo(page, container.top - 1500);
    let s = await state(page, 'stick-bottom');
    expect(s.classes).toContain('is-anchored');
    expect(s.position).toBe('sticky');
    expect(s.bottom).toBe('16px');

    await scrollWindowTo(page, container.top + 50);
    s = await state(page, 'stick-bottom');
    expect(s.classes.sort()).toEqual(['is-at-bottom', 'is-stuck']);
    expect(s.rectTop).toBeCloseTo(720 - 16 - 60, 0); // pinned: viewport bottom - offset - own height

    await scrollWindowTo(page, container.top + container.height + 50);
    s = await state(page, 'stick-bottom');
    expect(s.classes).toContain('is-anchored');
  });

  test('case-margin-em: marginTop 3em resolves to 48px at 16px base font', async ({ page }) => {
    await page.goto('/');
    const s = await state(page, 'margin-em');
    expect(s.top).toBe('48px');
  });

  test('case-stickyon-gate: position toggles static/sticky at the breakpoint, stuck state follows', async ({
    page,
  }) => {
    await page.goto('/');
    const container = await docRect(page, 'stickyon-gate-container');
    await scrollWindowTo(page, container.top + container.height / 2);

    await page.setViewportSize({ width: 700, height: 720 }); // below "large" (1024px)
    await page.waitForTimeout(150);
    let s = await state(page, 'stickyon-gate');
    expect(s.position).toBe('static');
    expect(s.classes).not.toContain('is-stuck');

    await page.setViewportSize({ width: 1280, height: 720 }); // at/above "large"
    await page.waitForTimeout(150);
    s = await state(page, 'stickyon-gate');
    expect(s.position).toBe('sticky');
    expect(s.classes).toContain('is-stuck');
  });

  test('case-overflow-hidden: an overflow:hidden ancestor breaks sticky positioning', async ({ page }) => {
    await page.goto('/');
    const wrapper = await docRect(page, 'overflow-hidden-wrapper');

    // Two scroll positions, both deep inside the window range where the
    // directive's own sentinels believe the element should be pinned.
    await scrollWindowTo(page, wrapper.top + 20);
    const first = await state(page, 'overflow-hidden');

    await scrollWindowTo(page, wrapper.top + 250);
    const second = await state(page, 'overflow-hidden');

    // The CSS rule and (per the window-relative sentinels) the class
    // contract both say "stuck"...
    expect(first.position).toBe('sticky');
    expect(second.position).toBe('sticky');

    // ...but the element is NOT actually pinned: its real position keeps
    // drifting with the page instead of holding at the offset. This is the
    // documented `overflow: hidden` ancestor limit (web-platform-features.md
    // 8): the element's true nearest scroll container is the overflow:hidden
    // wrapper, not the window, so it never visually sticks - and because our
    // sentinels only ever measure window-relative geometry, the class
    // contract can actively lie (report .is-stuck while nothing is pinned).
    expect(Math.abs(second.rectTop - first.rectTop)).toBeGreaterThan(100);
  });

  test('case-anchor-container-match: sizing the container to the anchor range works', async ({ page }) => {
    await page.goto('/');
    const start = await docRect(page, 'anchor-match-start');
    const end = await docRect(page, 'anchor-match-end');
    const container = await docRect(page, 'anchor-match-container');

    // The container's own box already spans exactly from the start marker to
    // the end marker: the recipe is "place the container between the anchors",
    // not "read topAnchor/btmAnchor" (the directive never reads those inputs).
    expect(Math.abs(container.top - (start.top + start.height))).toBeLessThan(2);
    expect(Math.abs(container.top + container.height - end.top)).toBeLessThan(2);

    await scrollWindowTo(page, container.top + container.height / 2);
    const s = await state(page, 'anchor-match');
    expect(s.classes).toContain('is-stuck');
  });

  test('case-anchor-outside: an anchor id outside the containing block is ignored', async ({ page }) => {
    await page.goto('/');
    const container = await docRect(page, 'anchor-outside-container');
    const farEnd = await docRect(page, 'anchor-outside-far-end');

    // btmAnchor points at a marker far past this 150px container - the JS
    // plugin would keep the element stuck all the way out to that marker.
    expect(farEnd.top - (container.top + container.height)).toBeGreaterThan(1900);

    // CSS sticky only ever obeys the small container's own box: well before
    // the far anchor, the element has already un-stuck and is resting at the
    // container's own bottom.
    await scrollWindowTo(page, container.top + container.height + 200);
    const s = await state(page, 'anchor-outside');
    expect(s.classes).not.toContain('is-stuck');
    expect(s.classes).toContain('is-anchored');
    expect(s.classes).toContain('is-at-bottom');
  });
});
