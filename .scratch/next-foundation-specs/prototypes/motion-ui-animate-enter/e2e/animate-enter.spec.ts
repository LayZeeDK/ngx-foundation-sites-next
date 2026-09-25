import { test, expect, type Page } from '@playwright/test';

/**
 * Records animationstart/animationend/transitionrun/transitionend for every
 * element carrying a data-testid, via document-level capture-phase
 * listeners installed before the page's own scripts run. Read back with
 * page.evaluate(() => window.__events).
 */
async function installEventRecorder(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __events: Array<{ type: string; testid: string; atMs: number }> }).__events = [];

    const record = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const testid = target?.dataset?.['testid'];

      if (!testid) {
        return;
      }

      (window as unknown as { __events: Array<{ type: string; testid: string; atMs: number }> }).__events.push({
        type: event.type,
        testid,
        atMs: performance.now(),
      });
    };

    for (const type of ['animationstart', 'animationend', 'transitionrun', 'transitionend']) {
      document.addEventListener(type, record, true);
    }
  });
}

async function eventsFor(page: Page, testid: string): Promise<Array<{ type: string; testid: string; atMs: number }>> {
  return page.evaluate(
    (id) =>
      (window as unknown as { __events: Array<{ type: string; testid: string; atMs: number }> }).__events.filter(
        (event) => event.testid === id,
      ),
    testid,
  );
}

const TOGGLE_BUTTON_LABEL: Record<string, string> = {
  'fade-box': 'Toggle fade box',
  'slide-box': 'Toggle slide box',
  'hinge-spin-box': 'Toggle hinge/spin box',
};

test.describe('Case 1: animate.enter/animate.leave on inserted and removed elements', () => {
  for (const testid of ['fade-box', 'slide-box', 'hinge-spin-box'] as const) {
    test(`${testid} plays its enter keyframe on insert and its leave keyframe on removal`, async ({ page }) => {
      await installEventRecorder(page);
      await page.goto('/');

      const toggleButton = page.getByRole('button', { name: TOGGLE_BUTTON_LABEL[testid] });
      const box = page.getByTestId(testid);

      // Insert: animate.enter.
      await toggleButton.click();
      await expect(box).toBeVisible();
      await expect
        .poll(async () => (await eventsFor(page, testid)).filter((e) => e.type === 'animationstart').length)
        .toBeGreaterThanOrEqual(1);
      await expect
        .poll(async () => (await eventsFor(page, testid)).filter((e) => e.type === 'animationend').length)
        .toBeGreaterThanOrEqual(1);

      // Remove: animate.leave. The leave class is held on the element until
      // animationend, and the element stays attached until then; under
      // reduced motion (1ms) that window is too short to reliably observe
      // between the click resolving and the next assertion running, so this
      // does not assert "still visible right after the click" and instead
      // asserts the animationstart/animationend event log plus the
      // eventual removal.
      await toggleButton.click();
      await expect
        .poll(async () => (await eventsFor(page, testid)).filter((e) => e.type === 'animationstart').length)
        .toBeGreaterThanOrEqual(2);
      await expect(box).toBeHidden();
      await expect
        .poll(async () => (await eventsFor(page, testid)).filter((e) => e.type === 'animationend').length)
        .toBeGreaterThanOrEqual(2);
    });
  }
});

test.describe('Case 2/3: persistent element, bound State class, animationend plus fallback timer, prefers-reduced-motion', () => {
  test('normal state box completes via animationend (1ms under reduced motion)', async ({ page }, testInfo) => {
    await page.goto('/');

    const box = page.getByTestId('normal-state-box');
    await page.getByRole('button', { name: 'Open normal state box' }).click();

    await expect(box).toHaveAttribute('data-completion-via', 'animationend', { timeout: 5000 });
    const atMs = Number(await box.getAttribute('data-completion-at-ms'));

    if (testInfo.project.name.includes('reduced-motion')) {
      // nfs-motion's reduced-motion rule collapses animation-duration to 1ms.
      expect(atMs).toBeLessThan(200);
    } else {
      expect(atMs).toBeGreaterThan(400);
      expect(atMs).toBeLessThan(2000);
    }
  });

  test('state box with a dropped stylesheet animation completes via the fallback timer', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    const box = page.getByTestId('broken-state-box');
    await page.getByRole('button', { name: 'Open broken-stylesheet state box' }).click();

    // animation: none means animationend never fires; only the
    // duration(500ms)+100ms fallback timer can complete this, regardless
    // of prefers-reduced-motion (the CSS rule that would shorten it is the
    // very rule "no-anim" overrides).
    await expect(box).toHaveAttribute('data-completion-via', 'fallback', { timeout: 5000 });
    const atMs = Number(await box.getAttribute('data-completion-at-ms'));
    expect(atMs).toBeGreaterThanOrEqual(560);
    expect(atMs).toBeLessThan(2000);
    void testInfo;
  });
});

test.describe('Case 4: consumer-supplied Motion UI transition classes under animate.enter', () => {
  test('Motion UI\'s own two-class transition never animates (mui-enter is never added)', async ({ page }) => {
    await installEventRecorder(page);
    await page.goto('/');

    const box = page.getByTestId('motion-ui-class-box');
    await page.getByRole('button', { name: 'Toggle real Motion UI class box' }).click();
    await expect(box).toBeVisible();

    // Give the 500ms Motion UI transition duration plenty of room to have
    // started, if it were ever going to.
    await page.waitForTimeout(800);

    const events = await eventsFor(page, 'motion-ui-class-box');
    expect(events.some((e) => e.type === 'transitionrun' || e.type === 'animationstart')).toBe(false);

    // "slide-in-down" alone (mui-enter is never added, so this compound
    // selector never matches) leaves the element with no transition or
    // animation property configured at all. Angular's own animate.enter
    // cleanup (found by prototype 52: "no animation counted -> remove the
    // classes right away") strips the class before the next frame instead
    // of leaving it attached, so by the time this check runs the class list
    // has already settled back to the element's static "box" class.
    const classList = await box.evaluate((el) => Array.from(el.classList));
    expect(classList).not.toContain('slide-in-down');
    expect(classList).not.toContain('mui-enter');
    expect(classList).not.toContain('mui-enter-active');
  });

  test('a single-class transition stand-in does not animate either (no @starting-style)', async ({ page }) => {
    await installEventRecorder(page);
    await page.goto('/');

    const box = page.getByTestId('solo-transition-box');
    await page.getByRole('button', { name: 'Toggle solo transition box' }).click();
    await expect(box).toBeVisible();
    await expect(box).toHaveClass(/solo-slide-in-down/);

    await page.waitForTimeout(600);

    const events = await eventsFor(page, 'solo-transition-box');
    expect(events.some((e) => e.type === 'transitionrun' || e.type === 'transitionend')).toBe(false);
  });
});
