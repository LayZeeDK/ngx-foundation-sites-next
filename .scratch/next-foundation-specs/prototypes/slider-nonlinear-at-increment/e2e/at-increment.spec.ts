// PROTOTYPE -- the evidence for "Prototype: a non-linear Slider Handle that
// assistive-technology increments move". Every test runs in Chromium, Firefox,
// and WebKit against the production SSR build.
//
// Increment emulations (the real actions only run on devices; the source they
// copy is cited in the README). Each copies the arithmetic and the number to
// string conversion, because the conversion decides whether a zero step still
// changes the value:
// - 'blink': Chromium's AlterSliderOrSpinButtonValue with synthesized keys off.
//   StepValueForRange exposes no step for `any` or for 40 or more stops, so the
//   step is a default StepRange's 1; the value is a float, printed by
//   String::Number(float) as %.6g; AXSlider::OnNativeSetValueAction returns
//   early when the string equals the live value, otherwise sets it with input
//   and change events.
// - 'webkit': alterRangeValue -> changeValueByStep: float value plus the `step`
//   attribute's toFloat() (`any` is 0), printed as the shortest float string,
//   then AccessibilitySlider::setValue (set with input and change events when
//   the string differs).
// - 'gecko': Firefox for Android's ChangeValueBySteps: double CurValue plus
//   Step (`any` is 0), printed by AppendFloat (15 significant digits), then
//   SetUserInput.
import { expect, type Page, test } from '@playwright/test';

type Kind = 'blink' | 'webkit' | 'gecko';

async function ax(page: Page, id: string, dir: 1 | -1, kind: Kind) {
  return page.evaluate(
    ([inputId, d, k]) => {
      const el = document.getElementById(inputId as string) as HTMLInputElement;
      const f = Math.fround;
      const g = (x: number, p: number) => {
        const s = x.toPrecision(p);

        return s.includes('e') || !s.includes('.') ? s : s.replace(/0+$/, '').replace(/\.$/, '');
      };
      const shortestSingle = (x: number) => {
        for (let p = 1; p <= 9; p++) {
          const s = x.toPrecision(p);

          if (f(Number(s)) === x) {
            return String(Number(s));
          }
        }

        return String(x);
      };
      const parsed = parseFloat(el.getAttribute('step') ?? '');
      const attrStep = Number.isFinite(parsed) ? parsed : 0;
      const dir = d as number;
      let next: string;

      if (k === 'blink') {
        next = g(f(f(el.valueAsNumber) + dir), 6);
      } else if (k === 'webkit') {
        next = shortestSingle(f(f(el.valueAsNumber) + dir * attrStep));
      } else {
        next = g(el.valueAsNumber + dir * attrStep, 15);
      }

      const before = el.value;

      if (el.value === next) {
        return { before, after: el.value, dispatched: false };
      }

      el.value = next;
      const changed = el.value !== before;

      if (changed) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      return { before, after: el.value, dispatched: changed };
    },
    [id, dir, kind] as const,
  );
}

async function state(page: Page, name: string): Promise<string> {
  return (await page.locator(`[data-case="${name}"] [data-state]`).textContent())!.trim();
}

async function native(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((el: HTMLInputElement) => ({
    value: el.value,
    min: el.min,
    max: el.max,
    step: el.step,
    attrValue: el.getAttribute('value'),
  }));
}

async function point(page: Page, id: string, fraction: number) {
  return page.evaluate(
    ([inputId, f]) => {
      const input = document.getElementById(inputId as string)!;
      const c = input.parentElement!;
      c.scrollIntoView({ block: 'center' });
      const r = c.getBoundingClientRect();
      const T = 1.4 * parseFloat(getComputedStyle(document.documentElement).fontSize);

      return { x: r.left + T / 2 + (f as number) * (r.width - T), y: r.top + r.height / 2, T, width: r.width };
    },
    [id, fraction] as const,
  );
}

async function drag(page: Page, id: string, from: number, to: number, steps = 12) {
  const a = await point(page, id, from);
  const b = await point(page, id, to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps });
  await page.mouse.up();
}

async function open(page: Page) {
  await page.goto('/');
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
}

async function gated(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/main-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await page.locator('#set-nl-60').waitFor({ state: 'attached' });

  return async () => {
    release();
    await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
    await page.waitForTimeout(400);
  };
}

const note = (type: string, description: string) => test.info().annotations.push({ type, description });

/** Foundation's `log` option, base 5, 0..100: Bar position of a value times `max`, on the integer grid. */
const gridPos = (v: number, max = 1000, end = 100) => Math.round(((Math.pow(5, v / end) - 1) / 4) * max);

// ---------------------------------------------------------------------------
test.describe('A. native attributes and live values', () => {
  test('server attributes against the live, sanitized native value', async ({ page, browserName }) => {
    await open(page);
    const ids = ['nl-any', 'nl', 'nl5', 'nl-raw', 'nld-min', 'nld-max', 'nld-raw-min', 'nld-raw-max', 'nld-any-min', 'nld-any-max', 'pow', 'dense', 'dense-auto'];
    const rows: string[] = [];

    for (const id of ids) {
      const n = await native(page, id);
      rows.push(`${id}: min=${n.min} max=${n.max} step=${n.step} attr=${n.attrValue} live=${n.value}`);
    }

    note(`${browserName} attributes`, rows.join('\n'));
    // Grid mode: the live value is the attribute; nothing is sanitized away.
    for (const id of ['nl', 'nl5', 'nld-min', 'nld-max', 'pow', 'dense-auto']) {
      const n = await native(page, id);
      expect.soft(n.value, `${id} live equals attribute`).toBe(n.attrValue);
    }

    // Raw mode (step 1 with unrounded positions): the browser rounds to the grid
    // based on `min`, so the maximum handle's grid is shifted by its dependent min.
    const rawMax = await native(page, 'nld-raw-max');
    const rawMin = await native(page, 'nld-raw-min');
    note(`${browserName} raw sanitization`, `nld-raw-min live=${rawMin.value} (attr ${rawMin.attrValue}); nld-raw-max live=${rawMax.value} (attr ${rawMax.attrValue})`);
  });

  test('raw mode: End on the minimum stops short of the maximum on the native grid', async ({ page, browserName }) => {
    await open(page);
    await page.locator('#nld-raw-min').focus();
    await page.keyboard.press('End');
    await expect.poll(() => state(page, 'nld-raw')).toBe('lo=75 hi=75 rule=0/0');
    const lo = await native(page, 'nld-raw-min');
    const hi = await native(page, 'nld-raw-max');
    note(`${browserName} raw End`, `min handle live=${lo.value} max=${lo.max}; max handle live=${hi.value} min=${hi.min}`);
    await page.locator('#nld-min').focus();
    await page.keyboard.press('End');
    await expect.poll(() => state(page, 'nld')).toBe('lo=75 hi=75 rule=0/0');
    const glo = await native(page, 'nld-min');
    const ghi = await native(page, 'nld-max');
    note(`${browserName} grid End`, `min handle live=${glo.value} max=${glo.max}; max handle live=${ghi.value} min=${ghi.min}`);
    expect(glo.value).toBe(ghi.value);
  });
});

// ---------------------------------------------------------------------------
test.describe('B. single-handle increments', () => {
  // sequence: +, +, -, -, -. `asserted: false` cases are recorded only: the
  // spec's `any` form and the fixed 0..1000 range on a 1000-step scale.
  const cases: { id: string; start: number; asserted: boolean }[] = [
    { id: 'nl-any', start: 50, asserted: false },
    { id: 'nl', start: 50, asserted: true },
    { id: 'nl5', start: 5, asserted: true },
    { id: 'nl-raw', start: 50, asserted: true },
    { id: 'pow', start: 50, asserted: true },
    { id: 'dense', start: 5, asserted: false },
    { id: 'dense-auto', start: 5, asserted: true },
  ];

  for (const kind of ['blink', 'webkit', 'gecko'] as const) {
    for (const c of cases) {
      test(`${kind} increments on ${c.id}${c.asserted ? '' : ' (recorded)'}`, async ({ page, browserName }) => {
        await open(page);
        const seq: number[] = [];
        const trace: string[] = [];

        for (const dir of [1, 1, -1, -1, -1] as const) {
          const r = await ax(page, c.id, dir, kind);
          await page.waitForTimeout(50);
          const s = await state(page, c.id);
          const v = Number(/value=(\S+)/.exec(s)![1]);
          seq.push(v);
          trace.push(`${dir > 0 ? '+' : '-'} native ${r.before}->${r.after}${r.dispatched ? '' : ' (no event)'} => ${s} live=${(await native(page, c.id)).value}`);
        }

        note(`${browserName} ${kind} ${c.id}`, `${trace.join('\n')}\nsequence=${seq.join(',')}`);

        if (c.asserted) {
          const v = c.start;
          expect(seq).toEqual([v + 1, v + 2, v + 1, v, v - 1]);
        }
      });
    }
  }
});

// ---------------------------------------------------------------------------
test.describe('C. two-handle increments and dependent bounds', () => {
  for (const kind of ['blink', 'webkit', 'gecko'] as const) {
    for (const id of ['nld', 'nld-raw', 'nld-any']) {
      test(`${kind} increments on ${id}${id === 'nld-any' ? ' (recorded)' : ''}`, async ({ page, browserName }) => {
        await open(page);
        const trace: string[] = [];
        const step = async (handle: 'min' | 'max', dir: 1 | -1) => {
          const r = await ax(page, `${id}-${handle}`, dir, kind);
          await page.waitForTimeout(50);
          const s = await state(page, id);
          trace.push(`${handle} ${dir > 0 ? '+' : '-'} native ${r.before}->${r.after}${r.dispatched ? '' : ' (no event)'} => ${s}`);

          return s.replace(/ rule=.*/, '');
        };
        const got: string[] = [];
        got.push(await step('min', 1));
        await page.locator(`#${id}-min`).focus();
        await page.keyboard.press('End');
        trace.push(`min End => ${await state(page, id)}`);
        got.push(await step('min', 1));
        got.push(await step('max', -1));
        got.push(await step('max', 1));
        got.push(await step('min', 1));
        note(`${browserName} ${kind} ${id}`, `${trace.join('\n')}\nresult=${got.join(' | ')}`);

        if (id !== 'nld-any') {
          expect(got).toEqual(['lo=26 hi=75', 'lo=75 hi=75', 'lo=75 hi=75', 'lo=75 hi=76', 'lo=76 hi=76']);
        }
      });
    }
  }
});

// ---------------------------------------------------------------------------
test.describe('D. before hydration', () => {
  test('one key on each non-linear handle counts once', async ({ page, browserName }) => {
    const hydrate = await gated(page);
    const before: string[] = [];

    for (const id of ['nl', 'nl5', 'nl-any', 'pow', 'dense', 'dense-auto']) {
      await page.locator(`#${id}`).focus();
      await page.keyboard.press('ArrowRight');
      before.push(`${id} native after key=${await page.locator(`#${id}`).inputValue()}`);
    }

    await page.locator('#nld-min').focus();
    await page.keyboard.press('End');
    before.push(`nld-min native after End=${await page.locator('#nld-min').inputValue()}`);
    await hydrate();
    const after: string[] = [];

    for (const id of ['nl', 'nl5', 'nl-any', 'pow', 'dense', 'dense-auto', 'nld']) {
      after.push(`${id}: ${await state(page, id)}`);
    }

    after.push(`nl live=${await page.locator('#nl').inputValue()} nl5 live=${await page.locator('#nl5').inputValue()}`);
    note(`${browserName} pre-hydration keys`, `${before.join('\n')}\n--- after hydration ---\n${after.join('\n')}`);
    expect.soft(await state(page, 'nl')).toBe('value=51 rule=0');
    expect.soft(await page.locator('#nl').inputValue()).toBe(String(gridPos(51)));
    expect.soft(await state(page, 'nl5')).toBe('value=6 rule=0');
    expect.soft(await page.locator('#nl5').inputValue()).toBe(String(gridPos(6)));
    expect.soft(await state(page, 'nl-any')).toBe('value=51 rule=0');
    expect.soft(await state(page, 'pow')).toBe('value=51 rule=0');
    expect.soft(await state(page, 'dense-auto')).toBe('value=6 rule=0');
    expect.soft(await state(page, 'nld')).toBe('lo=75 hi=75 rule=0/0');
    // Recorded, not asserted: the fixed 0..1000 grid on 1000 value steps.
    note(`${browserName} dense fixed`, await state(page, 'dense'));
  });

  test('native residue without hydration: what the keys do natively (recorded)', async ({ page, browserName }) => {
    await gated(page);
    const rows: string[] = [];

    for (const id of ['nl-any', 'nl']) {
      await page.locator(`#${id}`).focus();

      for (const key of ['ArrowRight', 'PageUp', 'End', 'Home']) {
        const before = await page.locator(`#${id}`).inputValue();
        await page.keyboard.press(key);
        rows.push(`${id} ${key}: ${before} -> ${await page.locator(`#${id}`).inputValue()}`);
      }
    }

    note(`${browserName} native keys before hydration`, rows.join('\n'));
  });

  test('three keys count three steps', async ({ page, browserName }) => {
    const hydrate = await gated(page);
    await page.locator('#nl').focus();

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
    }

    const nativeBefore = await page.locator('#nl').inputValue();
    await hydrate();
    note(`${browserName} three keys`, `native before=${nativeBefore} after=${await page.locator('#nl').inputValue()} ${await state(page, 'nl')}`);
    expect(await state(page, 'nl')).toBe('value=53 rule=0');
  });

  test('drags survive and the rule does not add a step', async ({ page, browserName }) => {
    const hydrate = await gated(page);
    await drag(page, 'lin-min', 0.25, 0.1);
    const lin = await page.locator('#lin-min').inputValue();
    await drag(page, 'nl', 0.309, 0.62);
    const nl = await page.locator('#nl').inputValue();
    // A short drag that ends within half a value step of its start: on `pow` at
    // 50 a value step is about 8 native units, and 1 px is about 2.
    const p = await point(page, 'pow', 0.683);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 1, p.y, { steps: 2 });
    await page.mouse.up();
    const pow = await page.locator('#pow').inputValue();
    // The same short drag on the Handle whose rule ignores the pointer (recorded).
    const q = await point(page, 'nl-noguard', 0.309);
    await page.mouse.move(q.x, q.y);
    await page.mouse.down();
    await page.mouse.move(q.x + 1, q.y, { steps: 2 });
    await page.mouse.up();
    const noguard = await page.locator('#nl-noguard').inputValue();
    await hydrate();
    note(`${browserName} pre-hydration short drag without the pointer guard`, `nl-noguard native=${noguard} -> ${await state(page, 'nl-noguard')}`);
    note(
      `${browserName} pre-hydration drags`,
      `lin-min native=${lin} -> ${await state(page, 'lin')}\nnl native=${nl} -> ${await state(page, 'nl')} live=${await page.locator('#nl').inputValue()}\npow short drag native=${pow} -> ${await state(page, 'pow')} live=${await page.locator('#pow').inputValue()}`,
    );
    expect.soft(await state(page, 'lin')).toBe(`lo=${lin} hi=75 rule=0/0`);
    const expectedNl = Math.round(100 * (Math.log((Number(nl) / 1000) * 4 + 1) / Math.log(5)));
    expect.soft(await state(page, 'nl')).toBe(`value=${expectedNl} rule=0`);
    expect.soft(pow, 'the short drag moved the native value').not.toBe('683');
    const expectedPow = Math.round(100 * ((Math.pow(5, Number(pow) / 1000) - 1) / 4));
    expect.soft(expectedPow, 'the short drag stays inside one value step').toBe(50);
    expect.soft(await state(page, 'pow')).toBe('value=50 rule=0');
  });
});

// ---------------------------------------------------------------------------
test.describe('E. after hydration: drags, keys, track presses, code', () => {
  test('a drag that ends between steps, then increments go the right way', async ({ page, browserName }) => {
    await open(page);
    // 0.5 of the bar maps to 68.26 on this scale, between 68 (499.x) and 69 (507.x).
    await drag(page, 'nl', 0.309, 0.5, 40);
    await page.waitForTimeout(50);
    const afterDrag = `${await state(page, 'nl')} live=${await page.locator('#nl').inputValue()}`;
    const v = Number(/value=(\S+)/.exec(await state(page, 'nl'))![1]);
    const trace = [`drag end: ${afterDrag}`];

    for (const dir of [1, -1, -1] as const) {
      const r = await ax(page, 'nl', dir, 'blink');
      await page.waitForTimeout(50);
      trace.push(`${dir > 0 ? '+' : '-'} ${r.before}->${r.after} => ${await state(page, 'nl')} live=${await page.locator('#nl').inputValue()}`);
    }

    note(`${browserName} drag then increments`, trace.join('\n'));
    expect(afterDrag).toContain('rule=0');
    expect(await state(page, 'nl')).toBe(`value=${v - 1} rule=3`);
  });

  for (const id of ['nl', 'nl-noguard']) {
    test(`a slow drag in small moves on ${id}${id === 'nl' ? ' never triggers the rule' : ' (recorded: no pointer guard)'}`, async ({ page, browserName }) => {
      await open(page);
      const a = await point(page, id, 0.309);
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      const trace: string[] = [];

      for (let i = 1; i <= 30; i++) {
        await page.mouse.move(a.x + i * 0.5, a.y);
        trace.push(`${i * 0.5}px live=${await page.locator(`#${id}`).inputValue()} ${await state(page, id)}`);
      }

      await page.mouse.up();
      await page.waitForTimeout(50);
      const live = Number(await page.locator(`#${id}`).inputValue());
      const expected = Math.round(100 * (Math.log((live / 1000) * 4 + 1) / Math.log(5)));
      note(`${browserName} slow drag ${id}`, `${trace.filter((_, i) => i % 5 === 4).join('\n')}\nend: ${await state(page, id)} live=${live}`);

      if (id === 'nl') {
        expect(await state(page, id)).toBe(`value=${expected} rule=0`);
      }
    });
  }

  test('keys, a range track press, and a write from code never trigger the rule', async ({ page, browserName }) => {
    await open(page);
    await page.locator('#nl').focus();
    const trace: string[] = [];

    for (const key of ['ArrowRight', 'PageUp', 'ArrowLeft', 'PageDown', 'Home', 'End']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(50);
      trace.push(`${key} => ${await state(page, 'nl')} live=${await page.locator('#nl').inputValue()}`);
    }

    expect.soft(await state(page, 'nl')).toBe('value=100 rule=0');
    const p = await point(page, 'nld-min', 0.05);
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(50);
    trace.push(`track press at 0.05 => ${await state(page, 'nld')}`);
    expect.soft(await state(page, 'nld')).toMatch(/rule=0\/0$/);
    expect.soft(await state(page, 'nld')).not.toBe('lo=25 hi=75 rule=0/0');
    await page.locator('#set-nl-60').click();
    await page.waitForTimeout(50);
    trace.push(`code sets 60 => ${await state(page, 'nl')} live=${await page.locator('#nl').inputValue()}`);
    expect.soft(await state(page, 'nl')).toBe('value=60 rule=0');
    expect.soft(await page.locator('#nl').inputValue()).toBe(String(gridPos(60)));
    note(`${browserName} keys, track, code`, trace.join('\n'));
  });

  for (const id of ['nl', 'nl-noguard']) {
    test(`a touch drag on ${id} (Chromium, CDP touch)${id === 'nl' ? ' never triggers the rule' : ' (recorded: no pointer guard)'}`, async ({ browser, browserName }) => {
      test.skip(browserName !== 'chromium', 'CDP touch input is Chromium-only');
      const context = await browser.newContext({ hasTouch: true, baseURL: 'http://localhost:4861', viewport: { width: 1000, height: 1600 } });
      const page = await context.newPage();
      await open(page);
      const cdp = await context.newCDPSession(page);
      const a = await point(page, id, 0.309);
      const tp = (x: number) => [{ x, y: a.y, id: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(a.x) });
      const trace: string[] = [];

      for (let i = 1; i <= 30; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(a.x + 20 + i * 0.5) });
        trace.push(`${i * 0.5}px live=${await page.locator(`#${id}`).inputValue()} ${await state(page, id)}`);
      }

      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(50);
      const live = Number(await page.locator(`#${id}`).inputValue());
      const expected = Math.round(100 * (Math.log((live / 1000) * 4 + 1) / Math.log(5)));
      note(`${browserName} touch drag ${id}`, `${trace.filter((_, i) => i % 5 === 4).join('\n')}\nend: ${await state(page, id)} live=${live}`);

      if (id === 'nl') {
        expect(live, 'the touch drag moved the native value').not.toBe(309);
        expect(await state(page, id)).toBe(`value=${expected} rule=0`);
      }

      await context.close();
    });
  }
});
