// PROTOTYPE -- Reveal on native <dialog> under Foundation Sass. Every test logs its observations
// (prefixed with the project name) so the README can quote them; assertions encode the verdict.
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const log = (page: Page, msg: string) => console.log(`[${test.info().project.name}] ${test.info().title}: ${msg}`);

async function ready(page: Page, path = '/', width = 1024) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(path);
  await page.locator('body[data-hydrated]').waitFor();
}

const settle = (page: Page) => page.waitForTimeout(400); // 250 ms keyframes + margin

/** Open without Playwright's scroll-into-view (which moves a scrolled page): focus without scrolling, press Enter. */
async function openByKeyboard(page: Page, trigger: string) {
  await page.evaluate((s) => (document.querySelector(s) as HTMLElement).focus({ preventScroll: true }), trigger);
  await page.keyboard.press('Enter');
}

async function rectOf(page: Page, sel: string) {
  return page.evaluate((s) => {
    const r = document.querySelector(s)!.getBoundingClientRect();
    return [r.x, r.y, r.width, r.height].map(Math.round);
  }, sel);
}

/** Foundation's own `.reveal` inside `.reveal-overlay`, shown the way its JS showed it (inline display). */
async function referenceRect(page: Page, classes: string, withoutOverlay = false) {
  return page.evaluate(
    ([classes, withoutOverlay]) => {
      const m = document.createElement('div');
      m.className = `reveal ${classes}`;
      m.style.display = 'block';
      m.innerHTML = document.querySelector('#size')!.innerHTML;
      let root: HTMLElement = m;

      if (withoutOverlay) {
        m.classList.add('without-overlay');
      } else {
        root = document.createElement('div');
        root.className = 'reveal-overlay';
        root.style.display = 'block';
        root.appendChild(m);
      }

      document.body.appendChild(root);
      const r = m.getBoundingClientRect();
      const out = {
        rect: [r.x, r.y, r.width, r.height].map(Math.round),
        overlayBg: getComputedStyle(root).backgroundColor,
        color: getComputedStyle(m).color,
      };
      root.remove();

      return out;
    },
    [classes, withoutOverlay] as const,
  );
}

test.describe('geometry: dialog.reveal vs Foundation .reveal in .reveal-overlay', () => {
  for (const width of [320, 640, 1024]) {
    test(`size classes at ${width}px`, async ({ page }) => {
      await ready(page, '/', width);

      for (const s of ['default', 'tiny', 'small', 'large', 'full']) {
        await page.click(`#open-size-${s}`);
        await settle(page);
        const dlg = await page.evaluate(() => {
          const el = document.querySelector('#size') as HTMLElement;
          const r = el.getBoundingClientRect();

          return {
            rect: [r.x, r.y, r.width, r.height].map(Math.round),
            backdrop: getComputedStyle(el, '::backdrop').backgroundColor,
            color: getComputedStyle(el).color,
          };
        });
        await page.keyboard.press('Escape');
        await settle(page);
        const ref = await referenceRect(page, s === 'default' ? '' : s);
        log(page, `${s}: dialog=${dlg.rect} foundation=${ref.rect} backdrop=${dlg.backdrop} overlay=${ref.overlayBg}`);
        expect(dlg.rect, `${s} at ${width}`).toEqual(ref.rect);
        expect(dlg.backdrop).toBe(ref.overlayBg);
        expect(dlg.color).toBe(ref.color);
      }
    });
  }

  test('scrolled page: dialog stays in view and the page does not jump', async ({ page }) => {
    await ready(page);
    await page.evaluate(() => window.scrollTo(0, 1000));
    await openByKeyboard(page, '#open-basic');
    await settle(page);
    const during = { rect: await rectOf(page, '#basic'), scrollY: await page.evaluate(() => window.scrollY) };
    await page.click('#basic-close');
    await settle(page);
    const after = await page.evaluate(() => window.scrollY);
    log(page, `during=${JSON.stringify(during)} after=${after}`);
    expect(during.rect[1]).toBe(100);
    expect(during.scrollY).toBe(1000);
    expect(after).toBe(1000);
  });

  test('tall content: the dialog box ends inside the viewport and its end is reachable', async ({ page }) => {
    await ready(page);
    await page.click('#open-tall');
    await settle(page);
    const box = await rectOf(page, '#tall');
    await page.evaluate(() => {
      const el = document.querySelector('#tall')!;
      el.scrollTop = el.scrollHeight;
    });
    const end = await rectOf(page, '#tl-end');
    log(page, `dialog=${box} end=${end}`);
    expect(box[1] + box[3]).toBeLessThanOrEqual(800);
    expect(end[1] + end[3]).toBeLessThanOrEqual(box[1] + box[3]);
  });
});

test.describe('modes', () => {
  test('overlay false: show(), not modal, Foundation .without-overlay, page stays interactive', async ({ page }) => {
    await ready(page);
    await page.click('#open-nonmodal');
    await settle(page);
    const state = await page.evaluate(() => {
      const el = document.querySelector('#nonmodal') as HTMLDialogElement;

      return { open: el.open, modal: el.matches(':modal'), cls: el.className, pos: getComputedStyle(el).position };
    });
    const dlg = await rectOf(page, '#nonmodal');
    const ref = await referenceRect(page, '', true);
    // Foundation's CSS alone leaves `.without-overlay` at its static x; its JS centred it with an
    // inline `left` (hOffset 'auto', js/foundation.reveal.js _updatePosition). The dialog centres in CSS.
    log(page, `state=${JSON.stringify(state)} dialog=${dlg} foundationCssOnlyWithoutOverlay=${ref.rect}`);
    expect(dlg[0]).toBe((1024 - dlg[2]) / 2);
    expect(dlg[1]).toBe(100);
    expect(state.open).toBe(true);
    expect(state.modal).toBe(false);
    expect(state.cls).toContain('without-overlay');
    // Escape reaches a non-modal dialog only through the directive's keydown listener.
    await page.keyboard.press('Escape');
    await settle(page);
    expect(await page.evaluate(() => (document.querySelector('#nonmodal') as HTMLDialogElement).open)).toBe(false);
    // Reopen: the page behind is interactive, and an outside press closes (Foundation closeOnClick without overlay).
    await page.click('#open-nonmodal');
    await settle(page);
    await page.click('#behind');
    await settle(page);
    const after = await page.evaluate(() => ({
      open: (document.querySelector('#nonmodal') as HTMLDialogElement).open,
      behind: document.querySelector('#behind')!.textContent!.trim(),
    }));
    log(page, `after outside click: ${JSON.stringify(after)}`);
    expect(after.open).toBe(false);
    expect(after.behind).toContain('(1)');
  });

  test('nested modals, multipleOpened: stacked, Escape closes the top one, focus returns per layer', async ({ page }) => {
    await ready(page);
    await page.click('#open-outer');
    await settle(page);
    await page.click('#open-inner-multi');
    await settle(page);
    const stacked = await page.evaluate(() => {
      const inner = document.querySelector('#inner-multi')!.getBoundingClientRect();
      const hit = document.elementFromPoint(inner.x + inner.width / 2, inner.y + 10);

      return {
        outerOpen: (document.querySelector('#outer') as HTMLDialogElement).open,
        innerOpen: (document.querySelector('#inner-multi') as HTMLDialogElement).open,
        topIsInner: !!hit?.closest('#inner-multi'),
        focus: document.activeElement?.id,
      };
    });
    await page.keyboard.press('Escape');
    await settle(page);
    const afterFirst = await page.evaluate(() => ({
      outerOpen: (document.querySelector('#outer') as HTMLDialogElement).open,
      innerOpen: (document.querySelector('#inner-multi') as HTMLDialogElement).open,
      focus: document.activeElement?.id,
    }));
    await page.keyboard.press('Escape');
    await settle(page);
    const afterSecond = await page.evaluate(() => document.activeElement?.id);
    log(page, `stacked=${JSON.stringify(stacked)} afterFirstEsc=${JSON.stringify(afterFirst)} afterSecondEsc focus=${afterSecond}`);
    expect(stacked).toEqual({ outerOpen: true, innerOpen: true, topIsInner: true, focus: 'im-close' });
    expect(afterFirst).toEqual({ outerOpen: true, innerOpen: false, focus: 'open-inner-multi' });
    expect(afterSecond).toBe('open-outer');
  });

  test('nested modals, multipleOpened false: opening the inner closes the outer first', async ({ page }) => {
    await ready(page);
    await page.click('#open-outer');
    await settle(page);
    await page.click('#open-inner-single');
    await settle(page);
    const s = await page.evaluate(() => ({
      outerOpen: (document.querySelector('#outer') as HTMLDialogElement).open,
      innerOpen: (document.querySelector('#inner-single') as HTMLDialogElement).open,
      focus: document.activeElement?.id,
    }));
    await page.click('#is-close');
    await settle(page);
    const focusAfter = await page.evaluate(() => document.activeElement?.tagName + '#' + document.activeElement?.id);
    log(page, `state=${JSON.stringify(s)} focusAfterInnerClose=${focusAfter}`);
    expect(s).toEqual({ outerOpen: false, innerOpen: true, focus: 'is-close' });
  });
});

test.describe('closing', () => {
  test('backdrop pointerdown closes; the press does not reach the page; padding and drag-out do not close', async ({ page }) => {
    await ready(page);
    await page.click('#open-basic');
    await settle(page);
    const d = await rectOf(page, '#basic');
    // Press inside the dialog's padding (target is the dialog element itself, inside its box).
    await page.mouse.click(d[0] + 3, d[1] + 3);
    await settle(page);
    const afterPadding = await page.evaluate(() => (document.querySelector('#basic') as HTMLDialogElement).open);
    // Drag that starts inside the content and ends on the backdrop (text selection).
    await page.mouse.move(d[0] + 40, d[1] + 60);
    await page.mouse.down();
    await page.mouse.move(d[0] - 50, d[1] + d[3] + 50);
    await page.mouse.up();
    await settle(page);
    const afterDrag = await page.evaluate(() => (document.querySelector('#basic') as HTMLDialogElement).open);
    // Click on the backdrop right above the page's #behind button.
    const b = await rectOf(page, '#behind');
    await page.mouse.click(b[0] + b[2] / 2, b[1] + b[3] / 2);
    await settle(page);
    const afterBackdrop = await page.evaluate(() => ({
      open: (document.querySelector('#basic') as HTMLDialogElement).open,
      behind: document.querySelector('#behind')!.textContent!.trim(),
    }));
    log(page, `padding keeps open=${afterPadding} drag-out keeps open=${afterDrag} backdrop=${JSON.stringify(afterBackdrop)}`);
    expect(afterPadding).toBe(true);
    expect(afterDrag).toBe(true);
    expect(afterBackdrop.open).toBe(false);
    expect(afterBackdrop.behind).toContain('(0)');
    // closeOnClick false.
    await page.click('#open-noclick');
    await settle(page);
    await page.mouse.click(b[0] + b[2] / 2, b[1] + b[3] / 2);
    await settle(page);
    expect(await page.evaluate(() => (document.querySelector('#noclick') as HTMLDialogElement).open)).toBe(true);
  });

  test('Escape: closes through cancel after the exit keyframes; closeOnEsc false keeps it open', async ({ page }) => {
    await ready(page);
    await page.click('#open-basic');
    await settle(page);
    await page.keyboard.press('Escape');
    // The .is-closing host binding lands on the next render; catch the first frame that has it.
    const mid = await page.evaluate(
      () =>
        new Promise<{ open: boolean; closing: boolean }>((resolve) => {
          const el = document.querySelector('#basic') as HTMLDialogElement;
          const check = () =>
            el.classList.contains('is-closing') || !el.open
              ? resolve({ open: el.open, closing: el.classList.contains('is-closing') })
              : requestAnimationFrame(check);
          check();
        }),
    );
    await settle(page);
    const end = await page.evaluate(() => (document.querySelector('#basic') as HTMLDialogElement).open);
    await page.click('#open-noesc');
    await settle(page);
    await page.keyboard.press('Escape');
    await settle(page);
    const noesc1 = await page.evaluate(() => (document.querySelector('#noesc') as HTMLDialogElement).open);
    await page.keyboard.press('Escape');
    await settle(page);
    await page.keyboard.press('Escape');
    await settle(page);
    const noesc2 = await page.evaluate(() => ({
      open: (document.querySelector('#noesc') as HTMLDialogElement).open,
      log: document.querySelector('#log')!.textContent,
    }));
    log(page, `during exit=${JSON.stringify(mid)} closed=${!end} noesc after 1st Esc open=${noesc1} after 2nd and 3rd Esc (no activation between)=${JSON.stringify(noesc2)}`);
    expect(mid).toEqual({ open: true, closing: true });
    expect(end).toBe(false);
    expect(noesc1).toBe(true);
  });
});

test.describe('focus', () => {
  const cases: [string, string, string][] = [
    ['#open-basic', '#basic', 'first tabbable (directive)'],
    ['#open-af-selector', '#af-selector', 'autoFocus selector (directive)'],
    ['#open-af-native', '#af-native', 'native default, no autofocus attribute'],
    ['#open-af-attr', '#af-attr', 'native, autofocus attribute on OK'],
    ['#open-textonly', '#textonly', 'no focusable content (directive leaves the native choice)'],
    ['#open-af-collide', '#af-collide', 'static autoFocus="native" on the dialog (= HTML autofocus)'],
  ];

  test('initial focus per case, and never the dialog when content is focusable', async ({ page }) => {
    await ready(page);
    const results: Record<string, string> = {};

    for (const [trigger, dialog, label] of cases) {
      await page.click(trigger);
      await settle(page);
      results[label] = await page.evaluate(() => {
        const a = document.activeElement!;

        return `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}`;
      });
      await page.evaluate((d) => (document.querySelector(d) as HTMLDialogElement).close(), dialog);
      await settle(page);
    }

    log(page, JSON.stringify(results));
    expect(results['first tabbable (directive)']).toBe('a#basic-link');
    expect(results['autoFocus selector (directive)']).toBe('button#af-ok');
    expect(results['native, autofocus attribute on OK']).toBe('button#afa-ok');
    // With the directive stripping the host's `autofocus` before showModal(), no engine focuses the dialog.
    expect(results['static autoFocus="native" on the dialog (= HTML autofocus)']).toBe('a#afc-link');
  });

  test('wrapFocus: Tab and Shift+Tab wrap inside the dialog in every engine', async ({ page }) => {
    await ready(page);
    await page.click('#open-wrap');
    await settle(page);
    const where = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    const seq: string[] = [(await where())!];

    for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      seq.push((await where())!);
    }

    log(page, seq.join(' -> '));
    expect(seq).toEqual(['wr-link', 'wr-close', 'wr-link', 'wr-close', 'wr-link', 'wr-close']);
  });

  test('Tab and Shift+Tab at the ends of the dialog', async ({ page }) => {
    await ready(page);
    await page.click('#open-basic');
    await settle(page);
    const seq: string[] = [];
    const where = () =>
      page.evaluate(() => {
        const a = document.activeElement;

        return a ? `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}` : 'null';
      });

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      seq.push(await where());
    }

    log(page, `from #basic-link, Tab x4: ${seq.join(' -> ')}`);
    expect(seq).not.toContain('button#open-basic');
    expect(seq.every((s) => !s.startsWith('button#open'))).toBe(true);
  });

  test('restore focus to the invoker: directive and native', async ({ page }) => {
    await ready(page);
    await page.click('#open-basic');
    await settle(page);
    await page.click('#basic-close');
    await settle(page);
    const directive = await page.evaluate(() => document.activeElement?.id);
    await page.click('#open-norestore');
    await settle(page);
    await page.click('#nr-close');
    await settle(page);
    const nativeOnly = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    log(page, `directive restore -> ${directive}; restoreFocus=false (native close only) -> ${nativeOnly}`);
    expect(directive).toBe('open-basic');
  });
});

test.describe('scroll behind an open modal', () => {
  async function probe(page: Page, trigger: string, dialog: string) {
    await page.evaluate(() => window.scrollTo(0, 500));
    const before = await page.evaluate(() => ({
      y: window.scrollY,
      behindTop: Math.round(document.querySelector('#behind')!.getBoundingClientRect().top),
      width: document.documentElement.clientWidth,
    }));
    await openByKeyboard(page, trigger);
    await settle(page);
    const opened = await page.evaluate(() => ({
      y: window.scrollY,
      behindTop: Math.round(document.querySelector('#behind')!.getBoundingClientRect().top),
      width: document.documentElement.clientWidth,
      htmlClass: document.documentElement.className,
    }));
    const pos = () => page.evaluate(() => Math.round(document.querySelector('#behind')!.getBoundingClientRect().top));
    // Wheel over the backdrop (bottom right corner, outside the dialog).
    await page.mouse.move(1000, 780);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
    const afterWheelBackdrop = await pos();
    // Wheel over the dialog (content does not overflow).
    const d = await rectOf(page, dialog);
    await page.mouse.move(d[0] + d[2] / 2, d[1] + 20);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
    const afterWheelDialog = await pos();
    // Keyboard with focus inside the dialog (on its first tabbable element).
    for (const key of ['PageDown', 'ArrowDown', 'End']) {
      await page.keyboard.press(key);
    }

    await page.waitForTimeout(400);
    const afterKeys = await pos();
    const focusStillInside = await page.evaluate((s) => !!document.activeElement?.closest(s), dialog);
    await page.keyboard.press('Escape');
    await settle(page);
    const closed = await page.evaluate(() => ({ y: window.scrollY, htmlClass: document.documentElement.className }));

    return { before, opened, afterWheelBackdrop, afterWheelDialog, afterKeys, focusStillInside, closed };
  }

  for (const variant of ['none', 'foundation']) {
    for (const [trigger, dialog] of [
      ['#open-basic', '#basic'],
      ['#open-contain', '#contain'],
    ]) {
      test(`lock=${variant} ${dialog}`, async ({ page }) => {
        await ready(page, `/?lock=${variant}`);
        const r = await probe(page, trigger, dialog);
        const moved = [r.afterWheelBackdrop, r.afterWheelDialog, r.afterKeys].some((t) => t !== r.opened.behindTop);
        log(page, `pageMovedBehindModal=${moved} ${JSON.stringify(r)}`);

        if (variant === 'foundation') {
          expect(moved).toBe(false);
          expect(r.opened.behindTop).toBe(r.before.behindTop); // no visual jump on open
          expect(r.closed.y).toBe(500); // scroll restored on close
          expect(r.opened.width).toBe(r.before.width); // no layout shift from a vanishing scrollbar
          expect(r.closed.htmlClass).toBe('');
        }
      });
    }
  }
});

test.describe('exit keyframes before close()', () => {
  async function timeClose(page: Page) {
    return page.evaluate(async () => {
      const el = document.querySelector('#basic') as HTMLDialogElement;
      let ends = 0;
      let backdropEnds = 0;
      const pseudo: string[] = [];
      el.addEventListener('animationend', (e) => {
        // Counted by keyframe name, since WebKit reports the backdrop's event with pseudoElement ''.
        pseudo.push(`${e.animationName}:${JSON.stringify(e.pseudoElement)}`);

        if (e.animationName === 'nfs-fade-out') {
          ends++;
        } else if (e.animationName === 'nfs-reveal-backdrop-out') {
          backdropEnds++;
        }
      });
      const t0 = performance.now();
      (document.querySelector('#basic-close') as HTMLButtonElement).click();
      await new Promise<void>((resolve) => {
        const check = () => (el.open ? requestAnimationFrame(check) : resolve());
        check();
      });

      const ms = Math.round(performance.now() - t0);
      // Let the zoneless scheduler render the `closed` output into #log.
      await new Promise((r) => setTimeout(r, 50));

      return { ms, animationEnds: ends, backdropEnds, events: pseudo, log: document.querySelector('#log')!.textContent };
    });
  }

  test('animationend path', async ({ page }) => {
    await ready(page);
    await page.click('#open-basic');
    await settle(page);
    const r = await timeClose(page);
    log(page, JSON.stringify(r));
    expect(r.ms).toBeGreaterThanOrEqual(230);
    expect(r.ms).toBeLessThan(340); // before the 350 ms fallback
    expect(r.animationEnds).toBeGreaterThanOrEqual(1);
    expect(r.log).toContain('basic:closed');
  });

  test('fallback timer (animationend never fires: paused keyframes)', async ({ page }) => {
    await ready(page);
    await page.addStyleTag({ content: '.reveal.is-closing { animation-play-state: paused !important; }' });
    await page.click('#open-basic');
    await settle(page);
    const r = await timeClose(page);
    log(page, JSON.stringify(r));
    expect(r.animationEnds).toBe(0);
    expect(r.backdropEnds).toBeGreaterThanOrEqual(1); // the backdrop fade still ended on the dialog element
    expect(r.ms).toBeGreaterThanOrEqual(340);
    expect(r.ms).toBeLessThan(700);
  });

  test('prefers-reduced-motion: 1ms keyframes, animationend still fires', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.click('#open-basic');
    await settle(page);
    const r = await timeClose(page);
    log(page, JSON.stringify(r));
    expect(r.ms).toBeLessThan(100);
    expect(r.log).toContain('basic:closed');
  });
});

test.describe('server render and hydration', () => {
  test('server HTML: closed dialog with content; open-by-default opens with showModal after hydration', async ({ page }) => {
    const html = await (await page.request.get('/')).text();
    const basicTag = html.match(/<dialog[^>]*id="basic"[^>]*>/)![0];
    const obdHtml = await (await page.request.get('/open-by-default')).text();
    const obdTag = obdHtml.match(/<dialog[^>]*id="obd"[^>]*>/)![0];
    log(page, `server basic tag: ${basicTag}`);
    log(page, `server open-by-default tag: ${obdTag}`);
    expect(basicTag).not.toMatch(/\sopen[\s>=]/);
    expect(html).toContain('Your couch. It is mine.');
    expect(obdTag).not.toMatch(/\sopen[\s>=]/);
    expect(obdHtml).toContain('Server-rendered dialog content');

    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        errors.push(m.text());
      }
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await ready(page, '/open-by-default');
    await settle(page);
    const s = await page.evaluate(() => {
      const el = document.querySelector('#obd') as HTMLDialogElement;

      return { open: el.open, modal: el.matches(':modal'), focus: document.activeElement?.id };
    });
    log(page, `client after hydration: ${JSON.stringify(s)} console=${JSON.stringify(errors)}`);
    expect(s).toEqual({ open: true, modal: true, focus: 'obd-close' });
    expect(errors).toEqual([]);
  });

  test('JavaScript disabled: closed dialogs stay hidden, content stays in the DOM', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4420' });
    const page = await ctx.newPage();
    await page.goto('/open-by-default');
    const s = await page.evaluate(() => {
      const el = document.querySelector('#obd') as HTMLElement;

      return { open: el.hasAttribute('open'), display: getComputedStyle(el).display, text: el.textContent!.includes('Server-rendered') };
    });
    log(page, JSON.stringify(s));
    await ctx.close();
    expect(s).toEqual({ open: false, display: 'none', text: true });
  });
});

test('axe on the open dialog (WCAG 2.2 AA tags)', async ({ page }) => {
  await ready(page);
  await page.click('#open-basic');
  await settle(page);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  log(page, `violations=${JSON.stringify(r.violations.map((v) => [v.id, v.nodes.length]))} passes=${r.passes.length}`);
  expect(r.violations).toEqual([]);
});

const WCAG22AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('WCAG 2.2 AA', () => {
  for (const width of [320, 1024]) {
    test(`axe on the open dialog in each size at ${width}px`, async ({ page }) => {
      await ready(page, '/', width);
      const found: Record<string, unknown> = {};

      for (const s of ['default', 'tiny', 'small', 'large', 'full']) {
        await page.click(`#open-size-${s}`);
        await settle(page);
        const r = await new AxeBuilder({ page }).withTags(WCAG22AA).analyze();
        found[s] = {
          violations: r.violations.map((v) => [v.id, v.nodes.map((n) => n.target.join(' '))]),
          incomplete: r.incomplete.map((v) => v.id),
          targetSize: r.passes.some((p) => p.id === 'target-size') ? 'pass' : r.inapplicable.some((p) => p.id === 'target-size') ? 'inapplicable' : 'other',
        };
        await page.keyboard.press('Escape');
        await settle(page);
      }

      log(page, JSON.stringify(found));
      expect(Object.values(found).flatMap((f) => (f as { violations: unknown[] }).violations)).toEqual([]);
    });
  }

  for (const width of [320, 1024]) {
    test(`2.5.8 target size, 1.4.11 contrast, focus indicator on the close button at ${width}px`, async ({ page }) => {
      await ready(page, '/', width);
      await page.click('#open-basic');
      await settle(page);
      // Keyboard focus on the close button so :focus-visible styles apply.
      await page.evaluate(() => (document.querySelector('#basic-link') as HTMLElement).focus());
      await page.keyboard.press('Tab');
      const m = await page.evaluate(() => {
        const lum = (c: string) => {
          const [r, g, b] = c.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => {
            const s = v / 255;

            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          });

          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const ratio = (a: string, b: string) => {
          const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);

          return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
        };
        const blend = (over: string, under: string) => {
          const o = over.match(/[\d.]+/g)!.map(Number);
          const u = under.match(/[\d.]+/g)!.map(Number);
          const a = o[3] ?? 1;

          return `rgb(${[0, 1, 2].map((i) => Math.round(o[i] * a + u[i] * (1 - a))).join(',')})`;
        };
        const dialog = document.querySelector('#basic') as HTMLElement;
        const btn = document.querySelector('#basic-close') as HTMLElement;
        const r = btn.getBoundingClientRect();
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        // 2.5.8 spacing exception: distance from the close button's centre to every other target in the dialog.
        const others = [...dialog.querySelectorAll<HTMLElement>('a[href], button')].filter((e) => e !== btn);
        const minDist = Math.min(
          ...others.map((o) => {
            const q = o.getBoundingClientRect();
            const dx = Math.max(q.left - cx, 0, cx - q.right);
            const dy = Math.max(q.top - cy, 0, cy - q.bottom);

            return Math.round(Math.hypot(dx, dy));
          }),
        );
        const bs = getComputedStyle(btn);
        const ds = getComputedStyle(dialog);
        const backdrop = getComputedStyle(dialog, '::backdrop').backgroundColor;
        const pageBg = getComputedStyle(document.body).backgroundColor;
        const dimmed = blend(backdrop, pageBg);

        return {
          size: [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10],
          minDistToOtherTarget: minDist,
          glyphColourFocused: bs.color,
          glyphVsDialogFocused: ratio(bs.color, ds.backgroundColor),
          focusOutline: `${bs.outlineStyle} ${bs.outlineWidth} ${bs.outlineColor}`,
          focusVisible: btn.matches(':focus-visible'),
          dimmedPage: dimmed,
          dialogVsDimmedPage: ratio(ds.backgroundColor, dimmed),
          dialogBorderVsDimmed: ratio(ds.borderTopColor, dimmed),
        };
      });
      // Unfocused glyph colour (Foundation's $closebutton-color), measured after focus moves away.
      await page.evaluate(() => (document.querySelector('#basic-link') as HTMLElement).focus());
      const idle = await page.evaluate(() => getComputedStyle(document.querySelector('#basic-close')!).color);
      // Idle glyph colour ($closebutton-color) against the white dialog background.
      const idleRatio = await page.evaluate((c) => {
        const l = (v: number) => {
          const s = v / 255;

          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const [r, g, b] = c.match(/\d+/g)!.map(Number);
        const L = 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);

        return Math.round((1.05 / (L + 0.05)) * 100) / 100;
      }, idle);
      log(page, `${JSON.stringify(m)} glyphColourIdle=${idle} idleVsWhite=${idleRatio}`);
      // The glyph is 32px (large text), so 1.4.3 and 1.4.11 both ask 3:1.
      expect(idleRatio).toBeGreaterThanOrEqual(3);
      const meetsSize = m.size[0] >= 24 && m.size[1] >= 24;
      const meetsSpacing = m.minDistToOtherTarget >= 12;
      expect(meetsSize || meetsSpacing).toBe(true);
      expect(m.dialogVsDimmedPage).toBeGreaterThanOrEqual(3);
    });
  }

  test('2.4.11 focus not obscured: every focus stop in the dialog, the tall dialog end, and the restored Trigger', async ({ page }) => {
    await ready(page);
    const visible = (sel?: string) =>
      page.evaluate((s) => {
        const el = (s ? document.querySelector(s) : document.activeElement) as HTMLElement;
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        const inViewport = r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;

        return { id: el.id, inViewport, notCovered: !!hit && (hit === el || el.contains(hit)) };
      }, sel);
    const out: unknown[] = [];
    await page.click('#open-basic');
    await settle(page);
    out.push(await visible());
    await page.keyboard.press('Tab');
    out.push(await visible());
    await page.keyboard.press('Escape');
    await settle(page);
    out.push(await visible());
    await page.click('#open-tall');
    await settle(page);
    out.push(await visible());
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300); // WebKit: the scroll-into-view of the focused element may land a frame later
    out.push(await visible());
    log(page, JSON.stringify(out));

    for (const o of out as { inViewport: boolean; notCovered: boolean }[]) {
      expect(o.inViewport && o.notCovered).toBe(true);
    }
  });
});
