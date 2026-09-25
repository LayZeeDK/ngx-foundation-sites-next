// PROTOTYPE -- the evidence for the Slider range-input prototype.
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { PNG } from 'pngjs';

const THUMB_RGB = [23, 121, 186]; // $primary-color, Foundation's $slider-handle-background
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

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

      if (c.classList.contains('vertical')) {
        return { x: r.left + r.width / 2, y: r.bottom - T / 2 - n * (r.height - T), T, vertical: true };
      }

      const rtl = getComputedStyle(c).direction === 'rtl';
      const x = rtl ? r.right - T / 2 - n * (r.width - T) : r.left + T / 2 + n * (r.width - T);

      return { x, y: r.top + r.height / 2, T, vertical: false };
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

async function open(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
    }
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  // Hydrated once a keypress updates the printed state.
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });

  return errors;
}

test('server HTML carries min, max, step, value and the fill', async ({ request, browserName }) => {
  test.skip(browserName !== 'chromium', 'engine-independent');
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<input id="single"[^>]*min="0" max="200" step="1" value="50"/);
  expect(html).toMatch(/--nfs-slider-lo: 0; --nfs-slider-hi: 0\.25;/);
  expect(html).toMatch(/<input id="double-min"[^>]*min="0" max="75" step="1" value="25"/);
  expect(html).toMatch(/<input id="double-max"[^>]*min="25" max="100" step="1" value="75"/);
  expect(html).toMatch(/<input id="vertical"[^>]*aria-orientation="vertical"/);
  expect(html).toMatch(/<input id="disabled-native"[^>]*disabled=""/);
  expect(html).toMatch(/<input id="disabled-soft"[^>]*aria-disabled="true"/);
  expect(html).toMatch(/<input id="stepped"[^>]*step="5" value="50" aria-valuetext="50 percent"/);
  expect(html).toMatch(/<input id="log"[^>]*min="0" max="1000" step="any" value="309[.0-9]*" aria-valuetext="50"/);
});

test('server HTML with the app bundle blocked: axe-clean, painted, native keyboard works', async ({ browser }) => {
  // Blocking the bundle keeps the page dehydrated (the `hydrate never` residue);
  // axe still runs because it is injected by evaluate, not by the page.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(/\.js(\?|$)/, (route) => route.abort());
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  // Thumb is painted at the server value.
  const p = await point(page, 'single', 0.25);
  expect(near(await pixel(page, p.x, p.y), THUMB_RGB)).toBe(true);
  await page.locator('#single').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#single')).toHaveJSProperty('value', '51');
  await context.close();
});

test('keys pressed before hydration survive hydration', async ({ page }) => {
  // Hold the app bundle back so the user acts on the server HTML first.
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/main-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  // `commit`: the load event waits for the held-back module script.
  await page.goto('/', { waitUntil: 'commit' });
  await page.locator('#single').focus();

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowRight');
  }

  await expect(page.locator('#single')).toHaveJSProperty('value', '55');
  release();
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
  await page.waitForTimeout(300);
  const native = await page.locator('#single').inputValue();
  const model = await state(page, 'single');
  test.info().annotations.push({ type: 'after hydration', description: `native=${native} ${model}` });
  expect.soft(native, 'native value after hydration').toBe('55');
  expect.soft(model, 'model after hydration').toBe('value=55');
});

test('hydrated page: no console errors and axe-clean', async ({ page }) => {
  const errors = await open(page);
  await page.locator('#single').focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => state(page, 'single')).toBe('value=51');
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(',')}`)).toEqual([]);
  expect(errors).toEqual([]);
});

test('every thumb is painted where the value says', async ({ page }) => {
  await open(page);
  const cases: [string, number][] = [
    ['single', 0.25],
    ['double-min', 0.25],
    ['double-max', 0.75],
    ['vertical', 0.125],
    ['vd-min', 0.2],
    ['vd-max', 0.6],
    ['stepped', 0.5],
    ['log', 0.30901699],
    ['pow', 0.68260619],
    ['rtl-min', 0.25],
    ['rtl-max', 0.75],
    ['bare', 0.3],
  ];

  for (const [id, f] of cases) {
    const p = await point(page, id, f);
    const off = p.T / 2 + 3;
    const centre = await pixel(page, p.x, p.y);
    const outside = p.vertical ? await pixel(page, p.x + off, p.y) : await pixel(page, p.x, p.y + off);
    expect.soft(near(centre, THUMB_RGB), `${id} centre ${centre}`).toBe(true);
    expect.soft(near(outside, THUMB_RGB), `${id} outside ${outside}`).toBe(false);
  }
});

test('fill runs from the low thumb to the high thumb', async ({ page }) => {
  await open(page);
  const fill = async (name: string) => page.locator(`[data-case="${name}"] .slider-fill`).boundingBox();
  const tol = 1.5;
  // The fill ends at the thumbs' outer edges: centre +- T/2.

  const s = (await fill('single'))!;
  const ps = await point(page, 'single', 0.25);
  expect(Math.abs(s.x + s.width - (ps.x + ps.T / 2))).toBeLessThan(tol);
  const trackLeft = (await page.locator('[data-case="single"] .slider').boundingBox())!.x;
  expect(Math.abs(s.x - trackLeft)).toBeLessThan(tol);

  const d = (await fill('double'))!;
  const p1 = await point(page, 'double-min', 0.25);
  const p2 = await point(page, 'double-max', 0.75);
  expect(Math.abs(d.x - (p1.x - p1.T / 2))).toBeLessThan(tol);
  expect(Math.abs(d.x + d.width - (p2.x + p2.T / 2))).toBeLessThan(tol);

  const r = (await fill('rtl'))!;
  const r1 = await point(page, 'rtl-min', 0.25);
  const r2 = await point(page, 'rtl-max', 0.75);
  expect(Math.abs(r.x + r.width - (r1.x + r1.T / 2))).toBeLessThan(tol);
  expect(Math.abs(r.x - (r2.x - r2.T / 2))).toBeLessThan(tol);

  const v = (await fill('vertical-double'))!;
  const v1 = await point(page, 'vd-min', 0.2);
  const v2 = await point(page, 'vd-max', 0.6);
  expect(Math.abs(v.y + v.height - (v1.y + v1.T / 2))).toBeLessThan(tol);
  expect(Math.abs(v.y - (v2.y - v2.T / 2))).toBeLessThan(tol);

  // Fill follows a value change.
  await page.locator('#double-max').focus();
  await page.keyboard.press('End');
  await expect.poll(() => state(page, 'double')).toBe('lo=25 hi=100');
  const d2 = (await fill('double'))!;
  const p3 = await point(page, 'double-max', 1);
  expect(Math.abs(d2.x + d2.width - (p3.x + p3.T / 2))).toBeLessThan(tol);
});

test('APG slider keys on a single slider', async ({ page }) => {
  await open(page);
  const input = page.locator('#single');
  await input.focus();
  const seq: [string, string][] = [
    ['ArrowRight', '51'],
    ['ArrowUp', '52'],
    ['ArrowLeft', '51'],
    ['ArrowDown', '50'],
    ['Home', '0'],
    ['End', '200'],
  ];

  for (const [key, expected] of seq) {
    await page.keyboard.press(key);
    await expect.poll(() => state(page, 'single')).toBe(`value=${expected}`);
  }

  await page.keyboard.press('PageDown');
  const afterPageDown = await input.inputValue();
  test.info().annotations.push({ type: 'PageDown from 200 (range 0-200, step 1)', description: afterPageDown });
  expect(Number(afterPageDown)).toBeLessThan(200);
  await expect.poll(() => state(page, 'single')).toBe(`value=${afterPageDown}`);
});

test('APG multi-thumb: dependent bounds, no crossing, constant tab order', async ({ page }) => {
  await open(page);
  const min = page.locator('#double-min');
  const max = page.locator('#double-max');
  await min.focus();
  await page.keyboard.press('End');
  await expect.poll(() => state(page, 'double')).toBe('lo=75 hi=75');
  await expect(max).toHaveAttribute('min', '75');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => state(page, 'double')).toBe('lo=75 hi=75');
  await page.keyboard.press('Tab');
  await expect(max).toBeFocused();
  await page.keyboard.press('Home');
  await expect.poll(() => state(page, 'double')).toBe('lo=75 hi=75');
  await page.keyboard.press('End');
  await expect.poll(() => state(page, 'double')).toBe('lo=75 hi=100');
  await expect(min).toHaveAttribute('max', '100');
  await page.keyboard.press('Shift+Tab');
  await expect(min).toBeFocused();
  await page.keyboard.press('Home');
  await expect.poll(() => state(page, 'double')).toBe('lo=0 hi=100');
  await expect(max).toHaveAttribute('min', '0');
});

test('vertical: Up and Right increase, Down and Left decrease', async ({ page }) => {
  await open(page);
  await page.locator('#vertical').focus();
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => state(page, 'vertical')).toBe('value=26');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => state(page, 'vertical')).toBe('value=27');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => state(page, 'vertical')).toBe('value=25');
});

test('pointer drag moves every thumb along its axis', async ({ page }) => {
  await open(page);
  // Polls: WebKit delivers the last input events of a drag after mouse.up resolves.
  const within = async (name: string, re: RegExp, check: (m: RegExpMatchArray) => boolean) => {
    await expect
      .poll(async () => {
        const s = await state(page, name);
        const m = s.match(re);

        return m && check(m) ? 'ok' : s;
      }, { message: name })
      .toBe('ok');
  };
  const about = (v: string, want: number, tol = 1) => Math.abs(Number(v) - want) <= tol;

  await drag(page, 'single', 0.25, 0.75);
  await within('single', /value=(\S+)/, (m) => about(m[1], 150, 1));

  await drag(page, 'double-min', 0.25, 0.1);
  await drag(page, 'double-max', 0.75, 0.9);
  await within('double', /lo=(\S+) hi=(\S+)/, (m) => about(m[1], 10) && about(m[2], 90));

  // Crossing: drag the minimum past the maximum; it stops at the maximum.
  await drag(page, 'double-min', 0.1, 0.99);
  await within('double', /lo=(\S+) hi=(\S+)/, (m) => m[1] === m[2]);

  await drag(page, 'vertical', 0.125, 0.75);
  await within('vertical', /value=(\S+)/, (m) => about(m[1], 150, 1));

  await drag(page, 'vd-min', 0.2, 0.05);
  await drag(page, 'vd-max', 0.6, 0.95);
  await within('vertical-double', /lo=(\S+) hi=(\S+)/, (m) => about(m[1], 5) && about(m[2], 95));

  await drag(page, 'rtl-min', 0.25, 0.1);
  await drag(page, 'rtl-max', 0.75, 0.9);
  await within('rtl', /lo=(\S+) hi=(\S+)/, (m) => about(m[1], 10) && about(m[2], 90));

  await drag(page, 'stepped', 0.5, 0.63);
  await within('stepped', /value=(\S+)/, (m) => Number(m[1]) % 5 === 0 && about(m[1], 63, 3));

  // Non-linear: bar midpoint maps through Foundation's formulas.
  await drag(page, 'log', 0.30901699, 0.5);
  await within('log', /value=(\S+)/, (m) => about(m[1], 68));
  await drag(page, 'pow', 0.68260619, 0.5);
  await within('pow', /value=(\S+)/, (m) => about(m[1], 31));
});

test('long fast drag lands on the release point (single vs double)', async ({ page }) => {
  await open(page);
  // Same gesture on a plain single input and on the overlapped range form.
  await drag(page, 'single', 0.05, 0.95);
  await drag(page, 'double-max', 0.75, 0.95);
  await drag(page, 'double-min', 0.25, 0.9);
  await expect.poll(() => state(page, 'single')).toBe('value=190');
  await expect.poll(() => state(page, 'double')).toBe('lo=90 hi=95');
});

test('meeting thumbs stay separable at both ends', async ({ page }) => {
  await open(page);
  await page.locator('#double-max').focus();
  await page.keyboard.press('End');
  await page.locator('#double-min').focus();
  await page.keyboard.press('End');
  await expect.poll(() => state(page, 'double')).toBe('lo=100 hi=100');
  await drag(page, 'double-min', 1, 0.5);
  await expect.poll(() => state(page, 'double')).toBe('lo=50 hi=100');

  // WebKit does not focus a range input on press, so focus explicitly.
  await page.locator('#double-min').focus();
  await page.keyboard.press('Home');
  await expect.poll(() => state(page, 'double')).toBe('lo=0 hi=100');
  await page.locator('#double-max').focus();
  await page.keyboard.press('Home');
  await expect.poll(() => state(page, 'double')).toBe('lo=0 hi=0');
  await drag(page, 'double-max', 0, 0.5);
  await expect.poll(() => state(page, 'double')).toBe('lo=0 hi=50');
});

test('cross-thumb keys in the same frame never invert the range', async ({ page }) => {
  await open(page);
  // hi down to 25 and lo to its End in one burst, before change detection runs.
  await page.evaluate(() => {
    const max = document.getElementById('double-max') as HTMLInputElement;
    const min = document.getElementById('double-min') as HTMLInputElement;
    max.value = '30';
    max.dispatchEvent(new Event('input', { bubbles: true }));
    min.value = '75'; // still allowed by the stale native max
    min.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(() => state(page, 'double')).toBe('lo=30 hi=30');
  await expect(page.locator('#double-min')).toHaveJSProperty('value', '30');
});

test('clickSelect on the range track moves the nearest thumb', async ({ page }) => {
  await open(page);
  const p = await point(page, 'double-min', 0.1);
  await page.mouse.click(p.x, p.y);
  await expect.poll(() => state(page, 'double')).toBe('lo=10 hi=75');
  await expect(page.locator('#double-min')).toBeFocused();
  const q = await point(page, 'double-max', 0.9);
  await page.mouse.click(q.x, q.y);
  await expect.poll(() => state(page, 'double')).toBe('lo=10 hi=90');
});

test('disabled: soft stays focusable and inert to keys and pointer; native leaves the tab order', async ({ page }) => {
  await open(page);
  const soft = page.locator('#disabled-soft');
  await soft.focus();
  await expect(soft).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('End');
  await drag(page, 'disabled-soft', 0.4, 0.9);
  await expect.poll(() => state(page, 'disabled-soft')).toBe('value=40');
  await expect(soft).toHaveJSProperty('value', '40');

  const native = page.locator('#disabled-native');
  await native.focus();
  await expect(native).not.toBeFocused();
  await drag(page, 'disabled-native', 0.4, 0.9);
  await expect(native).toHaveJSProperty('value', '40');
});

test('stepped and non-linear: keys move one value step; valuetext carries the value', async ({ page }) => {
  await open(page);
  await page.locator('#stepped').focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => state(page, 'stepped')).toBe('value=55');
  await expect(page.locator('#stepped')).toHaveAttribute('aria-valuetext', '55 percent');

  const log = page.locator('#log');
  await log.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => state(page, 'log')).toBe('value=51');
  await expect(log).toHaveAttribute('aria-valuetext', '51');
  await page.keyboard.press('PageUp');
  await expect.poll(() => state(page, 'log')).toBe('value=61');
  await page.keyboard.press('End');
  await expect.poll(() => state(page, 'log')).toBe('value=100');
  await expect(log).toHaveJSProperty('value', '1000');
  await page.keyboard.press('Home');
  await expect.poll(() => state(page, 'log')).toBe('value=0');
});

test('keyboard focus is visible on the thumb', async ({ page }) => {
  await open(page);
  const p = await point(page, 'single', 0.25);
  const ring = { x: p.x, y: p.y + p.T / 2 + 3 };
  expect(near(await pixel(page, ring.x, ring.y), [0, 0, 0], 60)).toBe(false);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Tab');
  await expect(page.locator('#single')).toBeFocused();
  expect(near(await pixel(page, ring.x, ring.y), [0, 0, 0], 60)).toBe(true);
});

test('Chromium accessibility tree: slider role, bounds, orientation, valuetext', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP only');
  await open(page);
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const sliders = nodes
    .filter((n: any) => n.role?.value === 'slider')
    .map((n: any) => {
      const props = Object.fromEntries((n.properties ?? []).map((p: any) => [p.name, p.value.value]));

      return {
        name: n.name?.value,
        value: n.value?.value,
        min: props.valuemin,
        max: props.valuemax,
        orientation: props.orientation,
        valuetext: props.valuetext,
        disabled: props.disabled,
        focusable: props.focusable,
      };
    });
  test.info().attach('ax-sliders.json', { body: JSON.stringify(sliders, null, 2), contentType: 'application/json' });
  const byName = (n: string) => sliders.find((s: any) => s.name === n);
  expect(byName('Minimum')).toMatchObject({ min: 0, max: 75, value: 25 });
  expect(byName('Maximum')).toMatchObject({ min: 25, max: 100, value: 75 });
  // Finding, not a pass condition: Chromium keeps the native orientation.
  test.info().annotations.push({ type: 'vertical orientation in AX tree', description: String(byName('Vertical (0 to 200)')?.orientation) });
  expect(byName('Disabled (aria-disabled, focusable)')).toMatchObject({ disabled: true, focusable: true });
});
