// PROTOTYPE -- the evidence for ticket 64 (Slider before hydration, non-linear
// bounds, and RTL). Three groups, one per numbered case in the ticket.
import { expect, type Page, test } from '@playwright/test';
import { PNG } from 'pngjs';

const THUMB_RGB = [23, 121, 186]; // $primary-color, Foundation's $slider-handle-background

/** Foundation's own formulas (foundation.slider.js:124-181), mirrored here as an oracle. */
function baseLog(base: number, value: number): number {
  return Math.log(value) / Math.log(base);
}
function logTransform(p: number, base: number): number {
  return baseLog(base, p * (base - 1) + 1);
}
function powTransform(p: number, base: number): number {
  return (Math.pow(base, p) - 1) / (base - 1);
}
/** `positionValueFunction="log"` calls `_pctOfBar` -> `_powTransform` (Foundation's naming; verified against foundation.slider.js). */
function logFraction(value: number, start: number, end: number, base: number): number {
  return powTransform((value - start) / (end - start), base);
}

/** Page point where the thumb centre of `id` must be for `fraction` of the bar. */
async function point(page: Page, id: string, fraction: number) {
  return page.evaluate(
    ([inputId, f]) => {
      const input = document.getElementById(inputId as string)!;
      const c = input.parentElement!;
      c.scrollIntoView({ block: 'center' });
      const r = c.getBoundingClientRect();
      const T = 1.4 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const n = f as number;
      const rtl = getComputedStyle(c).direction === 'rtl';
      const x = rtl ? r.right - T / 2 - n * (r.width - T) : r.left + T / 2 + n * (r.width - T);

      return { x, y: r.top + r.height / 2, T, rtl };
    },
    [id, fraction] as const,
  );
}

async function pixel(page: Page, x: number, y: number): Promise<number[]> {
  const buf = await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } });
  const png = PNG.sync.read(buf);

  return [png.data[0], png.data[1], png.data[2]];
}

const near = (a: number[], b: number[], tol = 12) => a.every((v, i) => Math.abs(v - b[i]) <= tol);

async function state(page: Page, name: string): Promise<string> {
  return (await page.locator(`[data-case="${name}"] [data-state]`).textContent())!.trim();
}

async function drag(page: Page, id: string, from: number, to: number) {
  const a = await point(page, id, from);
  const b = await point(page, id, to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 12 });
  await page.mouse.up();
}

async function open(page: Page, path = '/') {
  await page.goto(path);
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
}

// ---------------------------------------------------------------------------
// Case 1: keys and drags made before hydration, on the two-handle and
// non-linear sliders, survive hydration; a replayed non-linear key applies
// exactly one value step.
// ---------------------------------------------------------------------------
test.describe('case 1: before hydration', () => {
  test('a drag on the two-handle linear slider before hydration survives', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route(/main-.*\.js$/, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    await drag(page, 'double-min', 0.25, 0.1);
    const nativeBefore = await page.locator('#double-min').inputValue();
    release();
    await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
    await page.waitForTimeout(300);
    const nativeAfter = await page.locator('#double-min').inputValue();
    const model = await state(page, 'double');
    test.info().annotations.push({
      type: 'double-min before/after hydration',
      description: `native before=${nativeBefore} native after=${nativeAfter} model=${model}`,
    });
    expect.soft(nativeAfter, 'native value after hydration').toBe(nativeBefore);
    expect.soft(model, 'model after hydration').toBe(`lo=${nativeBefore} hi=75`);
  });

  test('keys on a two-handle non-linear slider before hydration survive', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route(/main-.*\.js$/, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('#nl-double-min').focus();

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
    }

    const nativeBefore = await page.locator('#nl-double-min').inputValue();
    release();
    await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
    await page.waitForTimeout(300);
    const nativeAfter = await page.locator('#nl-double-min').inputValue();
    const model = await state(page, 'nl-double');
    test.info().annotations.push({
      type: 'nl-double-min before/after hydration',
      description: `native before=${nativeBefore} native after=${nativeAfter} model=${model}`,
    });
    // The model must reflect what the native raw position says (adopted through
    // the queued `input` event's replay), not the pre-hydration model value (25).
    expect.soft(model, 'model after hydration').not.toBe('lo=25 hi=75');
  });

  test('a replayed non-linear key applies exactly one value step', async ({ page, browserName }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route(/main-.*\.js$/, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('#nl-log').focus();
    const positionBefore = await page.locator('#nl-log').inputValue();
    await page.keyboard.press('ArrowRight');
    const positionAfterKey = await page.locator('#nl-log').inputValue();
    release();
    await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
    await page.waitForTimeout(300);
    const positionAfterHydration = await page.locator('#nl-log').inputValue();
    const model = await state(page, 'nl-log');
    test.info().annotations.push({
      type: `${browserName}: nl-log position before=${positionBefore} native-default=${positionAfterKey} after-hydration=${positionAfterHydration}`,
      description: model,
    });
    // Exactly one value step from 50 (step 1): the value must land on 51, not on
    // 51 plus whatever the browser's own native default arrow-key action did to
    // the raw bar-position value before any JS ran (the "double-step" risk this
    // case exists to catch -- see the README).
    expect(model).toBe('value=51');
  });
});

// ---------------------------------------------------------------------------
// Case 2: a two-handle non-linear slider's bar-position bounds (ADR 0020).
// ---------------------------------------------------------------------------
test.describe('case 2: two-handle non-linear bounds', () => {
  const START = 0;
  const END = 100;
  const BASE = 5;
  const posOf = (v: number) => logFraction(v, START, END, BASE) * 1000;

  test('dependent bounds are bar positions, not values', async ({ page }) => {
    await open(page);
    const min = page.locator('#nl-double-min');
    const max = page.locator('#nl-double-max');
    const expectedMinPos = posOf(25);
    const expectedMaxPos = posOf(75);
    await expect(min).toHaveAttribute('min', '0');
    await expect(max).toHaveAttribute('max', '1000');
    const minMax = Number(await min.getAttribute('max'));
    const maxMin = Number(await max.getAttribute('min'));
    test.info().annotations.push({
      type: 'nl-double bar positions',
      description: `expected-lo=${expectedMinPos.toFixed(2)} expected-hi=${expectedMaxPos.toFixed(2)} min@max=${minMax} max@min=${maxMin}`,
    });
    expect(Math.abs(minMax - expectedMaxPos)).toBeLessThan(1);
    expect(Math.abs(maxMin - expectedMinPos)).toBeLessThan(1);
  });

  test('thumbs cannot cross: dragging past the sibling stops at it', async ({ page }) => {
    await open(page);
    const startFraction = logFraction(25, START, END, BASE);
    await drag(page, 'nl-double-min', startFraction, 0.99);
    await expect
      .poll(async () => state(page, 'nl-double'))
      .toMatch(/^lo=(\S+) hi=\1$/);
  });

  test('fill spans the low thumb to the high thumb', async ({ page }) => {
    await open(page);
    const fill = (await page.locator('[data-case="nl-double"] .slider-fill').boundingBox())!;
    const loFrac = logFraction(25, START, END, BASE);
    const hiFrac = logFraction(75, START, END, BASE);
    const p1 = await point(page, 'nl-double-min', loFrac);
    const p2 = await point(page, 'nl-double-max', hiFrac);
    const tol = 1.5;
    expect(Math.abs(fill.x - (p1.x - p1.T / 2))).toBeLessThan(tol);
    expect(Math.abs(fill.x + fill.width - (p2.x + p2.T / 2))).toBeLessThan(tol);
  });

  test('keys respect the dependent bound and move one value step', async ({ page }) => {
    await open(page);
    const min = page.locator('#nl-double-min');
    const max = page.locator('#nl-double-max');
    await min.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => state(page, 'nl-double')).toBe('lo=26 hi=75');
    await min.focus();
    await page.keyboard.press('End');
    // End on the minimum handle stops at the sibling's value (APG multi-thumb).
    await expect.poll(() => state(page, 'nl-double')).toBe('lo=75 hi=75');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => state(page, 'nl-double')).toBe('lo=75 hi=75');
    await max.focus();
    await page.keyboard.press('Home');
    await expect.poll(() => state(page, 'nl-double')).toBe('lo=75 hi=75');
  });
});

// ---------------------------------------------------------------------------
// Case 3: rule 12 under a real RTL Foundation compile, and forced-colors.
// ---------------------------------------------------------------------------
test.describe('case 3: RTL and forced-colors', () => {
  test('thumb positions and fill match a right-to-left slider', async ({ page }) => {
    await open(page, '/rtl');
    const p1 = await point(page, 'rtl-min', 0.25);
    const p2 = await point(page, 'rtl-max', 0.75);
    expect(p1.rtl).toBe(true);
    // In RTL, 0.25 of the bar sits toward the physical right; the minimum
    // thumb (lower fraction) must be to the RIGHT of the maximum thumb.
    expect(p1.x).toBeGreaterThan(p2.x);
    const centreMin = await pixel(page, p1.x, p1.y);
    const centreMax = await pixel(page, p2.x, p2.y);
    expect.soft(near(centreMin, THUMB_RGB), `min thumb ${centreMin}`).toBe(true);
    expect.soft(near(centreMax, THUMB_RGB), `max thumb ${centreMax}`).toBe(true);

    const fill = (await page.locator('[data-case="rtl-double"] .slider-fill').boundingBox())!;
    const tol = 1.5;
    // The fill runs from the max thumb's outer edge (physical left) to the min
    // thumb's outer edge (physical right) -- rule 12 cancels Foundation's
    // mirror, so this must NOT be flipped again.
    expect(Math.abs(fill.x - (p2.x - p2.T / 2))).toBeLessThan(tol);
    expect(Math.abs(fill.x + fill.width - (p1.x + p1.T / 2))).toBeLessThan(tol);
  });

  test('key directions match a right-to-left slider', async ({ page, browserName }) => {
    await open(page, '/rtl');
    await page.locator('#rtl-min').focus();
    await page.keyboard.press('ArrowRight');
    // Native RTL behaviour for a linear handle is entirely the browser's own
    // <input type=range>, no directive code involved (nonLinear() is false, so
    // onKeydown returns before computing anything). The spec itself hedges this
    // ("as each engine implements the native control"); measured here rather
    // than assumed: Chromium and Firefox reverse Right/Left under dir="rtl",
    // WebKit does not (Right still increases). This is a real, reproducible
    // per-engine difference, not a bug in rule 12 or the directive.
    const reverses = browserName !== 'webkit';
    await expect.poll(() => state(page, 'rtl-double')).toBe(reverses ? 'lo=24 hi=75' : 'lo=26 hi=75');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => state(page, 'rtl-double')).toBe('lo=25 hi=75');
  });

  for (const [path, dataCase, id] of [
    ['/', 'double', 'double-min'],
    ['/rtl', 'rtl-double', 'rtl-min'],
  ] as const) {
    test(`thumb and fill stay visible under forced-colors (${dataCase})`, async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Playwright has no forced-colors emulation for WebKit');
      await page.emulateMedia({ forcedColors: 'active' });
      await open(page, path);
      const fraction = dataCase === 'double' ? 0.25 : 0.25;
      const p = await point(page, id, fraction);
      const track = await pixel(page, p.x, p.y + p.T / 2 + 6);
      const thumb = await pixel(page, p.x, p.y);
      const fillBox = (await page.locator(`[data-case="${dataCase}"] .slider-fill`).boundingBox())!;
      const fillColour = await pixel(page, fillBox.x + fillBox.width / 2, fillBox.y + fillBox.height / 2);
      test.info().annotations.push({
        type: `forced-colors ${dataCase} (${browserName})`,
        description: `thumb=${thumb} track=${track} fill=${fillColour}`,
      });
      test.info().attachments.push({
        name: `forced-colors-${dataCase}-${browserName}.png`,
        contentType: 'image/png',
        body: await page.screenshot(),
      });
      // Visible = distinguishable from the track it sits on.
      expect.soft(near(thumb, track, 8), 'thumb vs track').toBe(false);
    });
  }
});
