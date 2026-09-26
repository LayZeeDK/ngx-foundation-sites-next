// PROTOTYPE (throwaway) -- evidence for "Prototype: Nested menu directive family
// with breakpoint mode switching". Runs against the SSR server on port 4500.
import { expect, Locator, Page, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WIDTH = { small: 400, medium: 800, large: 1280 } as const;
type Bp = keyof typeof WIDTH;

let errors: string[] = [];

test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      errors.push(`${m.type()}: ${m.text()}`);
    }
  });
});

test.afterEach(() => {
  expect(errors, 'console errors, warnings, page errors').toEqual([]);
});

async function open(page: Page, path: string, bp: Bp) {
  await page.setViewportSize({ width: WIDTH[bp], height: 800 });
  await page.goto(path);
  // afterNextRender has run (hydration done) once the simulated service reports the real breakpoint.
  await expect(page.getByTestId('status')).toHaveText(`breakpoint: ${bp === 'large' ? 'large' : bp}`);
}

async function resize(page: Page, bp: Bp) {
  await page.setViewportSize({ width: WIDTH[bp], height: 800 });
  await expect(page.getByTestId('status')).toHaveText(`breakpoint: ${bp}`);
}

const toggle = (page: Page, name: string) => page.getByRole('button', { name, exact: true, includeHidden: true });
const li = (l: Locator) => l.locator('xpath=..');
const sub = (l: Locator) => l.locator('xpath=following-sibling::ul[1]');
const nav = (page: Page) => page.getByRole('navigation', { name: 'Prototype site' });
const rootUl = (page: Page) => nav(page).locator('ul').first();

async function focusedText(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;

    if (!el || el === document.body) {
      return 'BODY';
    }

    return `${el.tagName}:${el.textContent?.trim()}`;
  });
}

async function isRenderedVisible(l: Locator) {
  return l.evaluate(
    (el) =>
      !el.closest('[inert]') && getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0,
  );
}

/** 2.4.11 Focus Not Obscured (Minimum), plus on screen: the focused control's centre hit-tests to itself. */
async function focusNotObscured(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);

    return {
      control: el.textContent?.trim(),
      rect: [r.left, r.top, r.width, r.height].map(Math.round),
      visible: !!hit && (hit === el || el.contains(hit)),
    };
  });
}

async function axe(page: Page, label: string) {
  // Mid-transition the clipped grid row overlaps its neighbours (axe target-size), so settle first.
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  const summary = result.violations.map((v) => `${v.id} [${v.nodes.map((n) => n.target.join(' ')).join(' | ')}]`);
  console.log(`[axe] ${label}: ${summary.length ? summary.join(', ') : 'no violations'}`);
  expect(result.violations.map((v) => v.id), label).toEqual([]);
}

async function noMenuRoles(page: Page) {
  const roles = await nav(page).locator('[role]').evaluateAll((els) => els.map((e) => e.getAttribute('role')));
  expect(roles).toEqual([]);
}

async function ariaControlsResolve(page: Page) {
  const ok = await nav(page)
    .locator('button[aria-controls]')
    .evaluateAll((btns) => btns.every((b) => !!document.getElementById(b.getAttribute('aria-controls')!)));
  expect(ok).toBe(true);
}

// ------------------------------------------------------------ sub-question 1

test.describe('class emission, roles, per-mode behaviour (standalone roots)', () => {
  test('AccordionMenu', async ({ page }) => {
    await open(page, '/accordion', 'large');
    const item1 = toggle(page, 'Item 1');
    await expect(rootUl(page)).toHaveClass(/accordion-menu/);
    await expect(li(item1)).toHaveClass(/is-accordion-submenu-parent/);
    await expect(sub(item1)).toHaveClass(/submenu/);
    await expect(sub(item1)).toHaveClass(/is-accordion-submenu/);
    await expect(sub(item1)).toHaveAttribute('inert', '');
    await expect(li(toggle(page, 'Item 1A'))).toHaveClass(/is-submenu-item is-accordion-submenu-item|is-accordion-submenu-item/);
    await expect(li(toggle(page, 'Item 2 pages'))).toHaveClass(/has-submenu-toggle/);
    await expect(toggle(page, 'Item 2 pages')).toHaveClass(/submenu-toggle/);
    await noMenuRoles(page);
    await ariaControlsResolve(page);
    await axe(page, 'accordion closed');

    // Keyboard: Right opens (focus stays), Down moves, Escape closes the group and refocuses its button.
    await item1.focus();
    await page.keyboard.press('ArrowRight');
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await expect(item1).toBeFocused();
    await expect(li(item1)).toHaveClass(/is-expanded/);
    await expect(sub(item1)).toHaveClass(/is-active/);
    await expect(sub(item1)).not.toHaveAttribute('inert');
    await page.keyboard.press('ArrowDown');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('link', { name: 'Item 1B' })).toBeFocused(); // closed 1A group skipped
    await axe(page, 'accordion open');
    await page.keyboard.press('Escape');
    await expect(item1).toBeFocused();
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    // Enter and Space are native button activation.
    await page.keyboard.press('Enter');
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
  });

  test('Drilldown', async ({ page }) => {
    await open(page, '/drilldown', 'large');
    const item1 = toggle(page, 'Item 1');
    const wrapper = nav(page).locator('[nfsdrilldownwrapper]');
    await expect(wrapper).toHaveClass(/is-drilldown/);
    await expect(rootUl(page)).toHaveClass(/drilldown/);
    await expect(li(item1)).toHaveClass(/is-drilldown-submenu-parent/);
    await expect(sub(item1)).toHaveClass(/is-drilldown-submenu/);
    await expect(sub(item1)).toHaveClass(/invisible/);
    await expect(sub(item1)).toHaveAttribute('inert', '');
    await noMenuRoles(page);
    await ariaControlsResolve(page);
    await axe(page, 'drilldown closed');

    // Enter opens and hands focus to the first item of the new level.
    await item1.focus();
    await page.keyboard.press('Enter');
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await expect(rootUl(page)).toHaveClass(/invisible/);
    await expect(sub(item1)).toHaveClass(/is-active/);
    await expect(sub(item1)).toHaveClass(/visible/);
    expect(await isRenderedVisible(item1)).toBe(false); // hidden level
    await page.waitForTimeout(300); // slide done
    const shown = await focusNotObscured(page);
    console.log(`[drilldown] focused after open ${JSON.stringify(shown)}`);
    expect(shown.visible).toBe(true);
    expect(await wrapper.evaluate((el) => el.scrollLeft)).toBe(0);
    await axe(page, 'drilldown level 1 open');

    // Tab order: Back, Item 1A, Item 1B, then out of the menu (hidden levels are skipped).
    await page.getByRole('button', { name: 'Back' }).first().focus();
    const order: string[] = [];

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      order.push(await focusedText(page));
    }

    console.log(`[drilldown] tab order from Back: ${JSON.stringify(order)}`);
    // WebKit's default Tab sequence skips links (Safari's "Press Tab to highlight
    // each item" preference is off by default), so there only buttons are reached;
    // either way no control of a hidden level (Item 1, Item 2 pages) is reached.
    expect(order).toEqual(
      test.info().project.name === 'webkit'
        ? ['BUTTON:Item 1A', 'BODY', 'BUTTON:Back']
        : ['BUTTON:Item 1A', 'A:Item 1B', 'A:Link after the menu'],
    );

    // Escape goes back one level and refocuses the parent button.
    await toggle(page, 'Item 1A').focus();
    await page.keyboard.press('Escape');
    await expect(item1).toBeFocused();
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    await expect(sub(item1)).toHaveClass(/is-closing/);
    await expect(sub(item1)).not.toHaveClass(/is-closing/); // cleared on transitionend
    await expect(sub(item1)).toHaveClass(/invisible/);

    // The Back button (pointer) does the same.
    await item1.click();
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await page.getByRole('button', { name: 'Back' }).first().click();
    await expect(item1).toBeFocused();
  });

  test('DropdownMenu', async ({ page }) => {
    await open(page, '/dropdown', 'large');
    const item1 = toggle(page, 'Item 1');
    await expect(rootUl(page)).toHaveClass(/dropdown/);
    await expect(li(item1)).toHaveClass(/is-dropdown-submenu-parent/);
    await expect(li(item1)).toHaveClass(/opens-right/);
    await expect(sub(item1)).toHaveClass(/is-dropdown-submenu/);
    await expect(sub(item1)).toHaveClass(/first-sub/);
    await expect(sub(item1)).toBeHidden();
    await noMenuRoles(page);
    await ariaControlsResolve(page);
    await axe(page, 'dropdown closed');

    // Horizontal top level: Right/Left move, Down opens and focuses the first item.
    await item1.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('link', { name: 'Item 2', exact: true })).toBeFocused();
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowLeft');
    await expect(item1).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await expect(li(item1)).toHaveClass(/is-active/);
    await expect(sub(item1)).toHaveClass(/js-dropdown-active/);
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await axe(page, 'dropdown open');
    // Escape closes and refocuses the button (APG, WCAG 1.4.13).
    await page.keyboard.press('Escape');
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    await expect(item1).toBeFocused();

    // Opening a sibling closes the open one; focus leaving the menu closes all.
    await item1.click();
    await toggle(page, 'Item 2 pages').click();
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page, 'Item 2 pages')).toHaveAttribute('aria-expanded', 'true');
    await toggle(page, 'Item 2 pages').focus();
    await page.getByRole('link', { name: 'Link after the menu' }).focus();
    await expect(toggle(page, 'Item 2 pages')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('ResponsiveMenu: three root behaviours on one ul, one live', () => {
  test('drilldown medium-dropdown: classes and keys follow the breakpoint', async ({ page }) => {
    await open(page, '/responsive', 'small');
    const item1 = toggle(page, 'Item 1');
    const wrapper = nav(page).locator('[nfsdrilldownwrapper]');
    await expect(rootUl(page)).toHaveClass(/drilldown/);
    await expect(rootUl(page)).not.toHaveClass(/(^|\s)dropdown(\s|$)|accordion-menu/);
    await expect(wrapper).toHaveClass(/is-drilldown/);
    await expect(li(item1)).toHaveClass(/is-drilldown-submenu-parent/);
    await noMenuRoles(page);
    // Drilldown key handling is the live one: Right opens and moves focus into the level.
    await item1.focus();
    await page.keyboard.press('ArrowRight');
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await axe(page, 'responsive small (drilldown) open');
    await page.keyboard.press('Escape');
    await expect(item1).toBeFocused();

    await resize(page, 'medium');
    await expect(rootUl(page)).toHaveClass(/(^|\s)dropdown(\s|$)/);
    await expect(rootUl(page)).not.toHaveClass(/drilldown/);
    await expect(wrapper).not.toHaveClass(/is-drilldown/);
    expect(await wrapper.evaluate((el) => (el as HTMLElement).style.minHeight)).toBe('');
    const liClass = (await li(item1).getAttribute('class')) ?? '';
    expect(liClass).toContain('is-dropdown-submenu-parent');
    expect(liClass).not.toContain('drilldown');
    await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0); // hidden outside drilldown
    await noMenuRoles(page);
    // Dropdown key handling is now the live one: Right moves to the next top-level item.
    await item1.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('link', { name: 'Item 2', exact: true })).toBeFocused();
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    await item1.focus();
    await page.keyboard.press('ArrowDown');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await axe(page, 'responsive medium (dropdown) open');
  });

  test('accordion medium-dropdown: accordion keys at small', async ({ page }) => {
    await open(page, '/responsive-accordion', 'small');
    const item1 = toggle(page, 'Item 1');
    await expect(rootUl(page)).toHaveClass(/accordion-menu/);
    await expect(li(item1)).toHaveClass(/is-accordion-submenu-parent/);
    await item1.focus();
    await page.keyboard.press('ArrowRight');
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await expect(item1).toBeFocused(); // accordion: focus stays
    await axe(page, 'responsive small (accordion) open');
  });
});

// ------------------------------------------------------------ sub-question 2

test.describe('render and measure', () => {
  test('accordion li grid animates height open and closed', async ({ page }) => {
    await open(page, '/accordion', 'large');
    const run = (name: string) =>
      page.evaluate(async (label) => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === label)!;
        const item = btn.closest('li')!;
        const before = item.getBoundingClientRect().height;
        btn.click();
        const samples: number[] = [];
        const t0 = performance.now();
        await new Promise<void>((resolve) => {
          const tick = () => {
            samples.push(Math.round(item.getBoundingClientRect().height));
            if (performance.now() - t0 < 450) {
              requestAnimationFrame(tick);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(tick);
        });

        return { before: Math.round(before), after: Math.round(item.getBoundingClientRect().height), samples };
      }, name);

    const opening = await run('Item 1');
    const closing = await run('Item 1');
    const between = (s: number[], a: number, b: number) => s.some((h) => h > Math.min(a, b) && h < Math.max(a, b));
    console.log(`[grid] opening ${JSON.stringify(opening)}`);
    console.log(`[grid] closing ${JSON.stringify(closing)}`);
    expect(opening.after).toBeGreaterThan(opening.before);
    expect(between(opening.samples, opening.before, opening.after)).toBe(true);
    expect(closing.after).toBe(opening.before);
    expect(between(closing.samples, closing.before, closing.after)).toBe(true);

    // Hybrid parent (a + absolute .submenu-toggle + ul): closed height is the link row only.
    const hybrid = await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find((a) => a.textContent?.trim() === 'Item 2')!;
      const item = link.closest('li')!;

      return { li: Math.round(item.getBoundingClientRect().height), link: Math.round(link.getBoundingClientRect().height) };
    });
    console.log(`[grid] hybrid closed ${JSON.stringify(hybrid)}`);
    expect(hybrid.li).toBe(hybrid.link);
  });

  test('accordion grid under prefers-reduced-motion is instant', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/accordion', 'large');
    const item1 = toggle(page, 'Item 1');
    const before = await li(item1).evaluate((el) => el.getBoundingClientRect().height);
    await item1.click();
    await page.waitForTimeout(50);
    const after = await li(item1).evaluate((el) => el.getBoundingClientRect().height);
    const full = await li(item1).evaluate((el) => el.scrollHeight);
    console.log(`[grid] reduced motion ${before} -> ${after} (content ${full})`);
    expect(Math.round(after)).toBe(full);
  });

  test('drilldown wrapper min-height is the tallest level, re-measured on resize', async ({ page }) => {
    await open(page, '/drilldown', 'large');
    const read = () =>
      page.evaluate(() => {
        const wrapper = document.querySelector<HTMLElement>('[nfsdrilldownwrapper]')!;
        const levels = [wrapper.querySelector('ul')!, ...Array.from(wrapper.querySelectorAll('ul ul'))];

        return {
          minHeight: wrapper.style.minHeight,
          tallest: Math.ceil(Math.max(...levels.map((l) => l.getBoundingClientRect().height))),
          heights: levels.map((l) => Math.round(l.getBoundingClientRect().height)),
        };
      });
    const first = await read();
    console.log(`[drilldown] ${JSON.stringify(first)}`);
    expect(first.minHeight).toBe(`${first.tallest}px`);
    // Content change: add a sixth link to the tallest level; ResizeObserver re-measures.
    await page.evaluate(() => {
      const ul = document.querySelectorAll('[nfsdrilldownwrapper] ul ul ul')[0];
      ul.insertAdjacentHTML('beforeend', '<li><a href="#x">Item 1A extra</a></li>');
    });
    await expect.poll(async () => (await read()).minHeight).toBe(`${(await read()).tallest}px`);
    expect((await read()).tallest).toBeGreaterThan(first.tallest);
  });

  test('inert on the hidden parent level would disable the open level too (why drilldown uses visibility)', async ({ page }) => {
    await open(page, '/drilldown', 'large');
    await toggle(page, 'Item 1').click();
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    const result = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>('[nfsdrilldownwrapper] > ul')!;
      root.inert = true;
      const btn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Item 1A')!;
      btn.blur();
      btn.focus();
      const focused = document.activeElement === btn;
      root.inert = false;

      return { focusedWithInertAncestor: focused };
    });
    console.log(`[drilldown] ${JSON.stringify(result)}`);
    expect(result.focusedWithInertAncestor).toBe(false);
  });
});

// ------------------------------------------------------------ WCAG 2.2 AA checks

const MODES = [
  { path: '/accordion', open: ['Item 1', 'Item 1A'] },
  { path: '/drilldown', open: ['Item 1'] },
  { path: '/dropdown', open: ['Item 1'] },
] as const;

test.describe('WCAG 2.2 AA details per mode', () => {
  for (const { path, open: toOpen } of MODES) {
    test(`${path}: 2.5.8 target size, 1.4.11 arrow contrast, 2.4.7 focus visible`, async ({ page }) => {
      await open(page, path, 'large');

      for (const name of toOpen) {
        await toggle(page, name).click();
        await page.waitForTimeout(300);
      }

      const report = await page.evaluate(() => {
        const nav = document.querySelector('nav')!;
        const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => {
            const c = v / 255;

            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          };

          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const bgOf = (el: Element | null): number[] => {
          for (; el; el = el.parentElement) {
            const c = parse(getComputedStyle(el).backgroundColor);

            if (c.length === 3 || (c.length === 4 && c[3] > 0)) {
              return c.slice(0, 3);
            }
          }

          return [255, 255, 255];
        };
        const controls = Array.from(nav.querySelectorAll<HTMLElement>('a[href], button')).filter((el) => {
          const cs = getComputedStyle(el);

          return !el.closest('[inert],[hidden]') && cs.visibility !== 'hidden' && el.getClientRects().length > 0;
        });
        const small = controls
          .map((el) => ({
            text: el.textContent?.trim(),
            w: Math.round(el.getBoundingClientRect().width),
            h: Math.round(el.getBoundingClientRect().height),
          }))
          .filter((c) => c.w < 24 || c.h < 24);
        const arrows = controls
          .map((el) => {
            const has = (p: CSSStyleDeclaration) => p.content !== 'none' && p.content !== 'normal';
            const after = getComputedStyle(el, '::after');
            const before = getComputedStyle(el, '::before');
            const pseudo = has(after) ? after : has(before) ? before : null;

            if (!pseudo) {
              return null;
            }

            const colors = [pseudo.borderTopColor, pseudo.borderRightColor, pseudo.borderBottomColor, pseudo.borderLeftColor]
              .map(parse)
              .filter((c) => c.length === 3 || c[3] > 0);

            if (!colors.length) {
              return null;
            }

            const fg = colors[0].slice(0, 3);
            const bg = bgOf(el);
            const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);

            return {
              text: el.textContent?.trim(),
              fg: fg.join(','),
              bg: bg.join(','),
              ratio: Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100,
            };
          })
          .filter((x) => !!x);

        return { controls: controls.length, small, arrows };
      });
      console.log(`[wcag] ${path} ${test.info().project.name} ${JSON.stringify(report)}`);
      expect(report.small).toEqual([]);
      expect(report.arrows.length).toBeGreaterThan(0);
      expect(report.arrows.filter((a) => a!.ratio < 3)).toEqual([]);

      // 2.4.7: keyboard focus on a disclosure button shows an outline.
      await toggle(page, 'Item 1').focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      const outline = await page.evaluate(() => {
        const el = document.activeElement!;
        const cs = getComputedStyle(el);

        return {
          el: el.textContent?.trim(),
          style: cs.outlineStyle,
          width: cs.outlineWidth,
          color: cs.outlineColor,
          focusVisible: el.matches(':focus-visible'),
        };
      });
      console.log(`[wcag] ${path} ${test.info().project.name} focus ring ${JSON.stringify(outline)}`);
      expect(outline.focusVisible).toBe(true);
      expect(outline.style).not.toBe('none');
    });
  }

  test('/dropdown: 2.4.11 focus is never obscured by an open submenu while tabbing', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit Tab skips links by default');
    await open(page, '/dropdown', 'large');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1').focus();
    const seen: unknown[] = [];

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const state = await focusNotObscured(page);
      seen.push(state);
      expect(state.visible, JSON.stringify(state)).toBe(true);
    }

    console.log(`[wcag] dropdown tab sweep ${JSON.stringify(seen)}`);
  });
});

test.describe('DropdownMenu collision classes', () => {
  test('opens-left near the right edge, opens-inner when neither side fits', async ({ page, browserName }) => {
    const sideOf = (l: Locator) => l.evaluate((el) => el.className.match(/opens-(left|right|inner)/)?.[0]);
    await open(page, '/dropdown-edge', 'medium');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1A').click();
    await expect.poll(() => sideOf(li(toggle(page, 'Item 1A')))).toBe('opens-left');
    const box = await sub(toggle(page, 'Item 1A')).boundingBox();
    console.log(`[collision] edge 800px: 1A opens-left submenu x=${box?.x} w=${box?.width}`);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(800);
    // Closing restores the base side (Foundation _hide).
    await toggle(page, 'Item 1A').click();
    await expect.poll(() => sideOf(li(toggle(page, 'Item 1A')))).toBe('opens-right');

    await open(page, '/dropdown', 'small');
    await toggle(page, 'Item 1').click();
    await toggle(page, 'Item 1A').click();
    await expect.poll(() => sideOf(li(toggle(page, 'Item 1A')))).toBe('opens-inner');
    const inner = await sub(toggle(page, 'Item 1A')).boundingBox();
    console.log(`[collision] 400px: 1A opens-inner submenu x=${inner?.x} w=${inner?.width}`);
    await axe(page, 'dropdown opens-inner');
    // opens-inner drops the submenu over its later siblings; 2.4.11 when focus moves on to Item 1B.
    // (WebKit Tab skips links by default, so this step runs in Chromium and Firefox.)
    if (browserName === 'webkit') {
      return;
    }

    await page.getByRole('link', { name: 'Item 1A ii' }).focus();
    await page.getByRole('link', { name: 'Item 1A ii' }).press('Tab');
    await expect(page.getByRole('link', { name: 'Item 1B' })).toBeFocused();
    const next = await focusNotObscured(page);
    console.log(`[collision] focus on Item 1B after the opens-inner submenu ${JSON.stringify(next)}`);
    expect(next.visible).toBe(true);
  });
});

// ------------------------------------------------------------ sub-question 3

test.describe('focus continuity across a breakpoint swap', () => {
  test('F1 dropdown -> drilldown, focus inside the open submenu', async ({ page }) => {
    await open(page, '/responsive', 'medium');
    const item1 = toggle(page, 'Item 1');
    await item1.focus();
    await page.keyboard.press('ArrowDown');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await resize(page, 'small');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await expect(item1).toHaveAttribute('aria-expanded', 'true');
    await expect(sub(item1)).toHaveClass(/is-active/);
    await expect(sub(item1)).toHaveClass(/visible/);
    expect(await isRenderedVisible(toggle(page, 'Item 1A'))).toBe(true);
    await page.waitForTimeout(300);
    expect((await focusNotObscured(page)).visible).toBe(true);
    await axe(page, 'F1 after swap to drilldown');
  });

  test('F2 drilldown -> dropdown, focus inside the open level', async ({ page }) => {
    await open(page, '/responsive', 'small');
    const item1 = toggle(page, 'Item 1');
    await item1.focus();
    await page.keyboard.press('Enter');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await resize(page, 'medium');
    await expect(toggle(page, 'Item 1A')).toBeFocused();
    await expect(sub(item1)).toHaveClass(/js-dropdown-active/);
    expect(await isRenderedVisible(toggle(page, 'Item 1A'))).toBe(true);
    await axe(page, 'F2 after swap to dropdown');
  });

  for (const fixup of [true, false]) {
    test(`F3 dropdown -> drilldown, focus on the open submenu's own toggle (fixup ${fixup ? 'on' : 'off'})`, async ({ page }) => {
      await open(page, `/responsive${fixup ? '' : '?fixup=off'}`, 'medium');
      const item1 = toggle(page, 'Item 1');
      await item1.focus();
      await page.keyboard.press('Enter');
      await expect(item1).toHaveAttribute('aria-expanded', 'true');
      await expect(item1).toBeFocused();
      await resize(page, 'small');
      await page.waitForTimeout(300);
      const state = {
        focused: await focusedText(page),
        expanded: await item1.getAttribute('aria-expanded'),
        toggleVisible: await isRenderedVisible(item1),
      };
      console.log(`[F3 fixup ${fixup ? 'on' : 'off'}] ${JSON.stringify(state)}`);

      if (fixup) {
        expect(state).toEqual({ focused: 'BUTTON:Item 1', expanded: 'false', toggleVisible: true });
      } else {
        // Recorded, not asserted: focus is left on (or dropped from) a hidden control.
        expect(state.toggleVisible).toBe(false);
      }
    });
  }

  test('F4 accordion -> dropdown with two open siblings, focus in the second', async ({ page }) => {
    await open(page, '/responsive-accordion', 'small');
    const item1 = toggle(page, 'Item 1');
    const item2 = toggle(page, 'Item 2 pages');
    await item1.click();
    await item2.click();
    // Zoneless change detection removes `inert` in the next frame; focus() before that is a no-op.
    await expect(sub(item2)).not.toHaveAttribute('inert');
    await page.getByRole('link', { name: 'Item 2A' }).focus();
    await expect(page.getByRole('link', { name: 'Item 2A' })).toBeFocused();
    await resize(page, 'medium');
    await expect(page.getByRole('link', { name: 'Item 2A' })).toBeFocused();
    await expect(item1).toHaveAttribute('aria-expanded', 'false');
    await expect(item2).toHaveAttribute('aria-expanded', 'true');
    await expect(sub(item2)).toHaveClass(/js-dropdown-active/);
    expect(await isRenderedVisible(page.getByRole('link', { name: 'Item 2A' }))).toBe(true);
  });
});

// ------------------------------------------------------------ server render

test.describe('server render', () => {
  test('server HTML carries the serverBreakpoint mode (drilldown) and ARIA; client swaps after hydration', async ({ page, request }) => {
    const html = await (await request.get('/responsive')).text();
    const navHtml = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'));
    expect(navHtml).toContain('class="is-drilldown"');
    expect(navHtml).toMatch(/class="vertical medium-horizontal menu drilldown"/);
    expect(navHtml).toContain('is-drilldown-submenu-parent');
    expect(navHtml).toMatch(/is-drilldown-submenu submenu" id="nfs-submenu-[^"]+" inert=""/);
    expect(navHtml).toContain('aria-expanded="false"');
    expect(navHtml).not.toMatch(/role=/);
    expect(navHtml).not.toMatch(/min-height/); // measured only after hydration
    expect(navHtml).toMatch(/jsaction="keydown:;focusout:;"/); // root listeners replayable
    expect(navHtml).toMatch(/nfssubmenutoggle=""[^>]*jsaction="click:;"/);

    await open(page, '/responsive', 'large');
    await expect(rootUl(page)).toHaveClass(/(^|\s)dropdown(\s|$)/);
  });

  test('first paint before hydration at large width (main bundle blocked)', async ({ page }, info) => {
    // Blocking the app bundle keeps the server HTML as-is while axe can still run.
    await page.route(/main-.*\.js$/, (route) => route.abort());
    await page.setViewportSize({ width: WIDTH.large, height: 800 });
    await page.goto('/responsive');
    await expect(rootUl(page)).toHaveClass(/drilldown/);
    await page.screenshot({ path: info.outputPath(`first-paint-${info.project.name}.png`) });
    await axe(page, 'responsive first paint, server drilldown at large width');
    errors = errors.filter((e) => !/Failed to load resource|main-.*\.js/.test(e));
  });

  for (const path of ['/accordion', '/drilldown', '/dropdown', '/responsive', '/responsive-accordion']) {
    for (const bp of ['small', 'large'] as const) {
      test(`screenshot ${path} ${bp}, closed then Item 1 open`, async ({ page }, info) => {
        await open(page, path, bp);
        const name = `${path.slice(1)}-${bp}-${info.project.name}`;
        await page.screenshot({ path: info.outputPath(`${name}-closed.png`) });
        await toggle(page, 'Item 1').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: info.outputPath(`${name}-open.png`) });
      });
    }
  }
});
