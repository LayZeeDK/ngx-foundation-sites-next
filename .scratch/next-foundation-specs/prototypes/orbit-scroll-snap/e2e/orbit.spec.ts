// PROTOTYPE (throwaway): Orbit on CSS scroll snap, in Chromium, Firefox, and WebKit.
// Every test appends its measured numbers to results/<project>.jsonl.
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { appendFileSync, mkdirSync } from 'node:fs';

mkdirSync('results', { recursive: true });

function record(info: TestInfo, data: Record<string, unknown>) {
  appendFileSync(`results/${info.project.name}.jsonl`, JSON.stringify({ case: info.title, ...data }) + '\n');
}

async function state(page: Page) {
  // Let zoneless change detection flush after the last input before reading the DOM.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    const slides = [...document.querySelectorAll<HTMLElement>('.orbit-slide')];
    const tabs = [...document.querySelectorAll<HTMLElement>('[role=tab]')];
    return {
      active: slides.findIndex((s) => s.classList.contains('is-active')),
      selectedTab: tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'),
      activeBullet: tabs.findIndex((t) => t.classList.contains('is-active')),
      tabStop: tabs.findIndex((t) => t.getAttribute('tabindex') === '0'),
      inert: slides.map((s) => s.hasAttribute('inert')).map(Number).join(''),
      scrollLeft: Math.round(c.scrollLeft),
      width: c.clientWidth,
      windowY: Math.round(window.scrollY),
      live: c.getAttribute('aria-live'),
      rotationLabel: document.querySelector('[data-rotation]')!.textContent!.trim(),
      log: (window as unknown as { __orbitLog?: unknown[] }).__orbitLog ?? [],
    };
  });
}

async function hydrated(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __stableAt?: number }).__stableAt !== undefined);
}

/** Waits until the container stops moving, then returns the state. */
async function settled(page: Page) {
  let prev = -1e9;

  for (let i = 0; i < 60; i++) {
    const s = await state(page);

    if (s.scrollLeft === prev) {
      return s;
    }

    prev = s.scrollLeft;
    await page.waitForTimeout(100);
  }

  throw new Error('container never settled');
}

async function open(page: Page, query = 'autoplay=false') {
  await page.goto(`/?${query}`);
  await hydrated(page);
}

test('layout: every slide paints, container follows the tallest slide', async ({ page }, info) => {
  await open(page);
  const m = await page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    const cr = c.getBoundingClientRect();
    const slides = [...document.querySelectorAll<HTMLElement>('.orbit-slide')].map((s) => {
      const r = s.getBoundingClientRect();
      return { left: Math.round(r.left - cr.left), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const imgs = [...document.querySelectorAll<HTMLImageElement>('.orbit-image')].map((i) => Math.round(i.getBoundingClientRect().height));
    return {
      containerW: c.clientWidth,
      containerH: Math.round(cr.height),
      scrollbarH: c.offsetHeight - c.clientHeight,
      scrollWidth: c.scrollWidth,
      slides,
      imgs,
      snapType: getComputedStyle(c).scrollSnapType,
      scrollBehavior: getComputedStyle(c).scrollBehavior,
    };
  });
  record(info, m);
  expect(m.containerH).toBeGreaterThan(0);
  expect(m.slides.map((s) => s.left)).toEqual([0, 1, 2, 3].map((i) => i * m.containerW));
  expect(m.slides.map((s) => s.h)).toEqual(m.imgs); // each slide keeps its own height
  expect(m.containerH - m.scrollbarH).toBe(Math.max(...m.imgs)); // container follows the tallest
  expect(m.imgs[2]).toBe(Math.round(m.containerW / 2)); // 1200x600 slide
  expect(m.snapType).toContain('x');
  expect(m.snapType).toContain('mandatory');
  expect(m.scrollBehavior).toBe('smooth');
});

test('previous and next scroll with scrollIntoView and move is-active', async ({ page }, info) => {
  await open(page);
  const seq: unknown[] = [];

  for (const action of ['next', 'next', 'next', 'previous'] as const) {
    await page.locator(`.orbit-${action}`).click();
    const s = await settled(page);
    seq.push({ action, active: s.active, selectedTab: s.selectedTab, scrollLeft: s.scrollLeft, inert: s.inert });
  }

  const final = await state(page);
  record(info, { width: final.width, seq, log: final.log });
  expect(seq.map((x) => (x as { active: number }).active)).toEqual([1, 2, 3, 2]);
  expect(seq.map((x) => (x as { scrollLeft: number }).scrollLeft)).toEqual([1, 2, 3, 2].map((i) => i * final.width));
  expect((seq[3] as { inert: string }).inert).toBe('1101');
});

test('bullet click jumps without intermediate selections', async ({ page }, info) => {
  await open(page);
  await page.locator('[role=tab]').nth(3).click();
  const s = await settled(page);
  record(info, { active: s.active, selectedTab: s.selectedTab, activeBullet: s.activeBullet, scrollLeft: s.scrollLeft, width: s.width, log: s.log, inert: s.inert });
  expect(s.active).toBe(3);
  expect(s.selectedTab).toBe(3);
  expect(s.activeBullet).toBe(3);
  expect(s.scrollLeft).toBe(3 * s.width);
  expect(s.log).toEqual([expect.objectContaining({ i: 3, cause: 'user' })]);
});

test('keyboard: tab order and Aria tablist keys', async ({ page }, info) => {
  await open(page);
  await page.locator('body').focus();
  const order: string[] = [];

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    order.push(
      await page.evaluate(() => {
        const a = document.activeElement as HTMLElement;
        return a.getAttribute('role') === 'tab' ? `tab${a.dataset['index']}` : a.dataset['index'] !== undefined ? `slide${a.dataset['index']}` : a.className || a.tagName;
      }),
    );
  }

  const keys: unknown[] = [];

  for (const key of ['ArrowRight', 'End', 'Home', 'ArrowLeft']) {
    await page.keyboard.press(key);
    const s = await settled(page);
    const focused = await page.evaluate(() => (document.activeElement as HTMLElement).dataset['index']);
    keys.push({ key, active: s.active, selectedTab: s.selectedTab, focused, scrollLeft: s.scrollLeft, tabStop: s.tabStop });
  }

  record(info, { order, keys });
  expect(order.slice(0, 5)).toEqual(['button small', 'orbit-previous', 'orbit-next', 'slide0', 'tab0']);
  expect(keys.map((k) => (k as { active: number }).active)).toEqual([1, 3, 0, 3]);
});

test('native scroll (wheel swipe, scrollbar-style scrollLeft) drives the active slide via IO', async ({ page }, info) => {
  await open(page);
  const box = (await page.locator('.orbit-container').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(box.width * 0.6, 0);
  const afterWheel = await settled(page);
  await page.evaluate(() => (document.querySelector<HTMLElement>('.orbit-container')!.scrollLeft = 2 * document.querySelector<HTMLElement>('.orbit-container')!.clientWidth));
  const afterSet = await settled(page);
  await page.mouse.wheel(-box.width * 0.2, 0); // small wheel: snaps back or forward, not in between
  const afterSmall = await settled(page);
  record(info, {
    width: afterWheel.width,
    afterWheel: { active: afterWheel.active, selectedTab: afterWheel.selectedTab, scrollLeft: afterWheel.scrollLeft },
    afterSet: { active: afterSet.active, selectedTab: afterSet.selectedTab, scrollLeft: afterSet.scrollLeft },
    afterSmall: { active: afterSmall.active, selectedTab: afterSmall.selectedTab, scrollLeft: afterSmall.scrollLeft },
    log: afterSmall.log,
  });
  expect(afterWheel.active).toBe(1);
  expect(afterWheel.scrollLeft).toBe(afterWheel.width);
  expect(afterSet.active).toBe(2);
  expect(afterSet.selectedTab).toBe(2);
  expect(afterSmall.scrollLeft % afterSmall.width).toBe(0);
});

test.describe('touch', () => {
  test.use({ hasTouch: true });

  // synthesizeScrollGesture moved nothing (headless or headed); headless shell does not
  // run the post-gesture snap for CDP touch input even on plain HTML: run this one --headed.
  for (const mode of ['dispatchTouchEvent'] as const) {
    test(`touch swipe (Chromium CDP ${mode})`, async ({ page, browserName }, info) => {
      test.skip(browserName !== 'chromium', 'CDP touch input exists only in Chromium');
      test.skip(process.env['HEADED'] !== '1', 'run with HEADED=1 and --headed: headless shell skips the post-gesture snap');
      await open(page);
      const box = (await page.locator('.orbit-container').boundingBox())!;
      const cdp = await page.context().newCDPSession(page);
      const y = box.y + box.height / 2;
      const x0 = box.x + box.width * 0.8;

      if (mode === 'dispatchTouchEvent') {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });

        for (let i = 1; i <= 10; i++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * box.width * 0.06, y }] });
        }

        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await cdp.send('Input.synthesizeScrollGesture', { x: x0, y, xDistance: -Math.round(box.width * 0.6), yDistance: 0, gestureSourceType: 'touch', speed: 1200 });
      }

      await page.waitForTimeout(1500);
      const s = await settled(page);
      record(info, { active: s.active, scrollLeft: s.scrollLeft, width: s.width, log: s.log });
      expect(s.active).toBe(1);
      expect(s.scrollLeft).toBe(s.width);
    });
  }
});

test('autoplay advances, wraps, and never scrolls the page', async ({ page }, info) => {
  await page.goto('/?delay=700');
  await hydrated(page);
  // Scroll the page so the carousel is fully out of view, then let autoplay run.
  await page.evaluate(() => window.scrollTo(0, 1200));
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  await page.waitForTimeout(700 * 5 + 1000);
  const s = await state(page);
  const stableAt = await page.evaluate(() => (window as unknown as { __stableAt: number }).__stableAt);
  record(info, { y0, windowY: s.windowY, stableAt, log: s.log, active: s.active, scrollLeft: s.scrollLeft, live: s.live });
  const seq = (s.log as { i: number; cause: string }[]).filter((e) => e.cause === 'auto').map((e) => e.i);
  expect(seq.slice(0, 4)).toEqual([1, 2, 3, 0]);
  expect(s.windowY).toBe(y0);
  expect(s.live).toBe('off');
});

test('autoplay with infiniteWrap=false stops at the last slide', async ({ page }, info) => {
  await page.goto('/?delay=500&wrap=false');
  await hydrated(page);
  await page.waitForTimeout(500 * 6);
  const s = await state(page);
  await page.locator('.orbit-next').click();
  const afterNext = await settled(page);
  await page.locator('[role=tab]').nth(3).focus();
  await page.keyboard.press('ArrowRight');
  const afterKey = await settled(page);
  record(info, { active: s.active, log: s.log, afterNext: afterNext.active, afterKey: afterKey.active, scrollLeft: afterKey.scrollLeft });
  expect(s.active).toBe(3);
  expect(afterNext.active).toBe(3);
  expect(afterKey.active).toBe(3);
});

test('infiniteWrap: next on the last slide rewinds across every slide to the first', async ({ page }, info) => {
  await open(page);
  await page.locator('[role=tab]').nth(3).click();
  await settled(page);
  await page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    const samples: number[] = [];
    (window as unknown as { __samples: number[] }).__samples = samples;
    const tick = () => {
      samples.push(Math.round(c.scrollLeft));

      if (samples.length < 90) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
  await page.locator('.orbit-next').click();
  const s = await settled(page);
  const samples = await page.evaluate(() => (window as unknown as { __samples: number[] }).__samples);
  const distinct = samples.filter((v, i) => i === 0 || v !== samples[i - 1]);
  record(info, { active: s.active, scrollLeft: s.scrollLeft, log: s.log, pathSampleCount: distinct.length, pathFirst: distinct.slice(0, 3), pathLast: distinct.slice(-3) });
  expect(s.active).toBe(0);
  expect(s.scrollLeft).toBe(0);
  expect(s.log.slice(-1)).toEqual([expect.objectContaining({ i: 0, cause: 'user' })]);
  expect((s.log as unknown[]).length).toBe(2); // bullet 3, then wrap to 0; no intermediates
});

test('hover pauses autoplay and leaving resumes it', async ({ page }, info) => {
  await page.goto('/?delay=500');
  await hydrated(page);
  const box = (await page.locator('.orbit-container').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const a = await state(page);
  await page.waitForTimeout(1600);
  const b = await state(page);
  await page.mouse.move(5, 790);
  await page.waitForTimeout(1300);
  const c = await state(page);
  record(info, { atHover: a.active, afterHover: b.active, afterLeave: c.active, labelDuringHover: b.rotationLabel, liveDuringHover: b.live });
  expect(b.active).toBe(a.active);
  expect(c.active).not.toBe(b.active);
});

test('focus stops autoplay until the rotation control restarts it', async ({ page }, info) => {
  await page.goto('/?delay=500');
  await hydrated(page);
  await page.locator('body').focus();
  await page.keyboard.press('Tab'); // rotation control: exempt, keeps rotating
  await page.waitForTimeout(1300);
  const onRotation = await state(page);
  await page.keyboard.press('Tab'); // previous button: focus entered the carousel
  const stoppedAt = await state(page);
  await page.waitForTimeout(1600);
  const afterWait = await state(page);
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter'); // "Start automatic slide show"
  const restarted = await state(page);
  await page.waitForTimeout(1300);
  const afterRestart = await state(page);
  record(info, {
    onRotationAdvanced: onRotation.log.length,
    stoppedAt: { active: stoppedAt.active, label: stoppedAt.rotationLabel, live: stoppedAt.live },
    afterWait: afterWait.active,
    restarted: { label: restarted.rotationLabel, live: restarted.live },
    afterRestart: afterRestart.active,
  });
  expect(onRotation.log.length).toBeGreaterThan(0);
  expect(stoppedAt.rotationLabel).toBe('Start automatic slide show');
  expect(stoppedAt.live).toBe('polite');
  expect(afterWait.active).toBe(stoppedAt.active);
  expect(restarted.rotationLabel).toBe('Stop automatic slide show');
  expect(afterRestart.active).not.toBe(afterWait.active);
});

test('rotation control is first and toggles label and live region', async ({ page }, info) => {
  await page.goto('/?delay=5000');
  await hydrated(page);
  const btn = page.locator('[data-rotation]');
  const before = await state(page);
  await btn.click();
  const stopped = await state(page);
  await btn.click();
  const startedWhileHovered = await state(page);
  await page.mouse.move(5, 790);
  const started = await state(page);
  const firstInOrbit = await page.evaluate(() => {
    const f = document.querySelector('.orbit')!.querySelectorAll('button, [tabindex]');
    return (f[0] as HTMLElement).hasAttribute('data-rotation');
  });
  record(info, { before: [before.rotationLabel, before.live], stopped: [stopped.rotationLabel, stopped.live], startedWhileHovered: [startedWhileHovered.rotationLabel, startedWhileHovered.live], started: [started.rotationLabel, started.live], firstInOrbit });
  expect(firstInOrbit).toBe(true);
  expect(stopped.rotationLabel).toBe('Start automatic slide show');
  expect(stopped.live).toBe('polite');
  expect(started.rotationLabel).toBe('Stop automatic slide show');
  expect(started.live).toBe('off');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('scroll-behavior auto, autoplay off, instant movement', async ({ page }, info) => {
    await page.goto('/?delay=500');
    await hydrated(page);
    const behavior = await page.evaluate(() => getComputedStyle(document.querySelector('.orbit-container')!).scrollBehavior);
    await page.waitForTimeout(1600);
    const s = await state(page);
    // Instant: the scroll position is final in the same task as the click handler.
    const jump = await page.evaluate(() => {
      const c = document.querySelector<HTMLElement>('.orbit-container')!;
      document.querySelector<HTMLElement>('.orbit-next')!.click();
      return Math.round(c.scrollLeft);
    });
    record(info, { behavior, activeAfterWait: s.active, label: s.rotationLabel, live: s.live, jumpScrollLeft: jump, width: s.width });
    expect(behavior).toBe('auto');
    expect(s.active).toBe(0);
    expect(s.rotationLabel).toBe('Start automatic slide show');
    expect(jump).toBe(s.width);
  });
});

test('axe: carousel is clean in rotating, stopped, and moved states', async ({ page }, info) => {
  await page.goto('/?delay=60000');
  await hydrated(page);
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
  const run = async () => (await new AxeBuilder({ page }).include('.orbit').withTags(tags).analyze()).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  const rotating = await run();
  await page.locator('[data-rotation]').click();
  const stopped = await run();
  await page.locator('[role=tab]').nth(2).click();
  await settled(page);
  const moved = await run();
  record(info, { rotating, stopped, moved });
  expect([...rotating, ...stopped, ...moved]).toEqual([]);
});

test('RTL: next scrolls toward negative scrollLeft, Aria flips arrow keys', async ({ page }, info) => {
  await open(page, 'autoplay=false&dir=rtl');
  await page.locator('.orbit-next').click();
  const n = await settled(page);
  await page.locator('[role=tab]').nth(1).focus();
  await page.keyboard.press('ArrowLeft'); // in RTL ArrowLeft is "next"
  const k = await settled(page);
  record(info, { afterNext: { active: n.active, scrollLeft: n.scrollLeft }, afterArrowLeft: { active: k.active, scrollLeft: k.scrollLeft }, width: n.width });
  expect(n.active).toBe(1);
  expect(n.scrollLeft).toBe(-n.width);
  expect(k.active).toBe(2);
  expect(k.scrollLeft).toBe(-2 * k.width);
});

for (const nav of ['scrollIntoView', 'container'] as const) test(`page scroll side effect of arrow navigation: ${nav}`, async ({ page }, info) => {
  await open(page, nav === 'container' ? 'autoplay=false&nav=container' : 'autoplay=false');
  // Put the carousel's top edge above the viewport while the arrows stay visible.
  const top = await page.evaluate(() => document.querySelector('.orbit-container')!.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((t) => window.scrollTo(0, t + 120), top);
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  await page.locator('.orbit-next').click();
  const s = await settled(page);
  record(info, { y0, windowYAfterNext: s.windowY, active: s.active, scrollLeft: s.scrollLeft });
  expect(s.active).toBe(1);

  if (nav === 'container') {
    expect(s.windowY).toBe(y0);
  }
});

test('server HTML: first slide is-active, every slide present, rotation control present', async ({ request }, info) => {
  const html = await (await request.get('/?delay=700')).text();
  const slides = html.match(/<div[^>]*class="orbit-slide[^"]*"[^>]*>/g) ?? [];
  const tabs = html.match(/<button[^>]*role="tab"[^>]*>/g) ?? [];
  const m = {
    slideCount: slides.length,
    firstActive: /is-active/.test(slides[0] ?? ''),
    othersActive: slides.slice(1).filter((s) => /is-active/.test(s)).length,
    inertCount: slides.filter((s) => /inert/.test(s)).length,
    imgCount: (html.match(/<img class="orbit-image"/g) ?? []).length,
    rotationControl: /data-rotation/.test(html),
    live: /aria-live="off"/.test(html),
    firstTabSelected: /aria-selected="true"/.test(tabs[0] ?? ''),
    tabindexZeroTabs: tabs.filter((t) => /tabindex="0"/.test(t)).length,
    jsactionOnNext: /class="orbit-next" jsaction="click:;"/.test(html),
    jsactionOnTablist: /role="tablist"[^>]*jsaction="keydown:;click:;focusin:;"/.test(html),
  };
  record(info, m);
  expect(m.slideCount).toBe(4);
  expect(m.firstActive).toBe(true);
  expect(m.othersActive).toBe(0);
  expect(m.imgCount).toBe(4);
  expect(m.rotationControl).toBe(true);
});

test.describe('JavaScript disabled (dehydrated / hydrate never residue)', () => {
  test.use({ javaScriptEnabled: false });

  test('slides paint and native scrolling works without JavaScript', async ({ page }, info) => {
    await page.goto('/?delay=700');
    const box = (await page.locator('.orbit-container').boundingBox())!;
    const before = await page.evaluate(() => {
      const c = document.querySelector<HTMLElement>('.orbit-container')!;
      return { h: Math.round(c.getBoundingClientRect().height), w: c.clientWidth, sw: c.scrollWidth, sl: c.scrollLeft };
    });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(box.width * 0.6, 0);
    await page.waitForTimeout(1500);
    const after = await page.evaluate(() => Math.round(document.querySelector<HTMLElement>('.orbit-container')!.scrollLeft));
    const active = await page.evaluate(() => [...document.querySelectorAll('.orbit-slide')].findIndex((s) => s.classList.contains('is-active')));
    record(info, { ...before, scrollLeftAfterWheel: after, isActiveStays: active });
    expect(before.h).toBeGreaterThan(0);
    expect(before.sw).toBe(4 * before.w);
  });
});

test.describe('event replay with a delayed bundle', () => {
  for (const target of ['next', 'bullet'] as const) {
    test(`pre-hydration ${target} click replays`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route(/main-[A-Z0-9]+\.js$/, async (route) => {
        await new Promise((r) => setTimeout(r, 2500));
        await route.continue();
      });
      await page.goto('/?autoplay=false', { waitUntil: 'commit' });
      await page.locator('.orbit-next').waitFor();
      const loc = target === 'next' ? page.locator('.orbit-next') : page.locator('[role=tab]').nth(2);
      await loc.click();
      const clickedAt = await page.evaluate(() => Math.round(performance.now()));
      const pre = await state(page);
      await hydrated(page);
      const s = await settled(page);
      const stableAt = await page.evaluate(() => (window as unknown as { __stableAt: number }).__stableAt);
      record(info, { clickedAt, stableAt, preActive: pre.active, preScrollLeft: pre.scrollLeft, active: s.active, selectedTab: s.selectedTab, scrollLeft: s.scrollLeft, width: s.width, log: s.log, errors });
      expect(pre.active).toBe(0);
      expect(s.active).toBe(target === 'next' ? 1 : 2);
      expect(errors).toEqual([]);
    });
  }
});

test('tab stop after the user used the tablist and then scrolled natively', async ({ page }, info) => {
  await open(page);
  await page.locator('[role=tab]').nth(0).focus();
  await page.keyboard.press('ArrowRight'); // user interaction: active tab 1
  await settled(page);
  await page.locator('body').focus();
  await page.evaluate(() => (document.querySelector<HTMLElement>('.orbit-container')!.scrollLeft = 3 * document.querySelector<HTMLElement>('.orbit-container')!.clientWidth));
  const s = await settled(page);
  record(info, { active: s.active, selectedTab: s.selectedTab, tabStop: s.tabStop });
  expect(s.selectedTab).toBe(3);
});
