// PROTOTYPE (throwaway). Drives the SSR build on :4430. Findings are printed
// with console.log (prefix "FINDING") and asserted where the answer is fixed.
import { Page, expect, test } from '@playwright/test';

const content = (page: Page, id: string) => page.getByTestId(id);

function collectLogs(page: Page) {
  const logs: string[] = [];
  page.on('console', (m) => logs.push(`console.${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));

  return logs;
}

async function hydrated(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

test.describe('step 1: server HTML', () => {
  test('open panel and selected tab panel are in server HTML; no ng-template', async ({ request }, info) => {
    test.skip(info.project.name !== 'chromium', 'engine-independent');
    const html = await (await request.get('/')).text();
    // Accordion item 1 is open: .is-active on the li, aria-expanded, content present, no inert.
    expect(html).toMatch(/<li nfsaccordionitem="" class="accordion-item is-active">/);
    expect(html).toContain('Panel 1 content is projected. It is open at first paint.');
    expect(html).toMatch(/data-testid="acc1-c1" class="accordion-content" id="[^"]+" aria-labelledby="[^"]+" ngh="0">/);
    expect(html).toMatch(/data-testid="acc1-c2"[^>]*inert="true"/);
    // Tabs: selected panel content present, .is-active on title li and panel, hidden panels inert.
    expect(html).toMatch(/<li role="presentation" nfstabstitle="" class="tabs-title is-active"><a role="tab"[^>]*value="panel1"[^>]*aria-selected="true"/);
    expect(html).toMatch(/class="tabs-panel is-active"[^>]*><p>Tab panel 1 content, projected\.<\/p>/);
    expect(html).toMatch(/value="panel2" class="tabs-panel"[^>]*inert="true"/);
    // Unbound tab set: the wrapper's write into Aria's selectedTab model selects the first tab on the server.
    expect(html).toMatch(/class="tabs-title is-active"><a role="tab"[^>]*value="x"[^>]*aria-selected="true"/);
    // Replay annotations on the Aria listener hosts.
    expect(html).toContain('jsaction="keydown:;click:;focusin:;"');
    expect(html).toContain('window.__jsaction_bootstrap(document.body,"ng",["keydown","click","focusin"],[]);');
    // Pre-hydration keyboard reachability.
    const tabIdx = [...html.matchAll(/role="tab"[^>]*tabindex="(-?\d)"/g)].map((m) => m[1]);
    const trigIdx = [...html.matchAll(/ngaccordiontrigger=""[^>]*tabindex="(-?\d)"/g)].map((m) => m[1]);
    console.log(`FINDING server tab tabindex values: ${tabIdx.join(',')}; accordion trigger tabindex values: ${trigIdx.join(',')}`);
    expect(tabIdx.every((t) => t === '-1')).toBe(true);
  });

  test('first paint with JavaScript disabled', async ({ browser }, info) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    const box = async (id: string) => (await content(page, id).boundingBox())?.height ?? -1;
    const h1 = await box('acc1-c1');
    const h2 = await box('acc1-c2');
    console.log(`FINDING [${info.project.name}] no-JS heights: open panel ${h1}px, collapsed panel ${h2}px`);
    expect(h1).toBeGreaterThan(20);
    expect(h2).toBe(0);
    await expect(content(page, 'acc1-c1').getByText('Panel 1 content is projected.')).toBeVisible();
    // Collapsed content is clipped by the 0fr row (overflow: hidden), not display: none,
    // so Playwright's box-based toBeHidden() does not apply; assert the clip and inert.
    await expect(content(page, 'acc1-c2')).toHaveAttribute('inert', 'true');
    const clipped = await content(page, 'acc1-c2').evaluate((el) => {
      const body = el.firstElementChild as HTMLElement;

      return body.getBoundingClientRect().height === 0 && getComputedStyle(body).overflow === 'hidden';
    });
    expect(clipped).toBe(true);
    await expect(page.getByText('Tab panel 1 content, projected.')).toBeVisible();
    await expect(page.getByText('Tab panel 2 content.')).toBeHidden();
    const display = await content(page, 'acc1-c1').evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('grid');
    const snapshot = await page.getByTestId('acc1').ariaSnapshot();
    console.log(`FINDING [${info.project.name}] accordion aria snapshot (no JS):\n${snapshot}`);
    await ctx.close();
  });
});

test.describe('step 2: hydrated behaviour and CSS', () => {
  test('accordion: .is-active, single expand, grid-row animation, Foundation title rules', async ({ page }, info) => {
    const logs = collectLogs(page);
    await page.goto('/');
    await hydrated(page);

    const c2 = content(page, 'acc1-c2');
    // Record grid-template-rows transitions on content 2.
    await c2.evaluate((el) => {
      (window as any).__tr = [];
      for (const t of ['transitionrun', 'transitionend']) {
        el.addEventListener(t, (e) => {
          const te = e as TransitionEvent;
          if (te.target === el) {
            (window as any).__tr.push(`${t}:${te.propertyName}`);
          }
        });
      }
    });
    await page.getByRole('button', { name: 'Section 2' }).click();
    await page.waitForTimeout(80);
    const mid = await c2.evaluate((el) => parseFloat(getComputedStyle(el).gridTemplateRows));
    await page.waitForTimeout(500);
    const end = await c2.evaluate((el) => parseFloat(getComputedStyle(el).gridTemplateRows));
    const events = await page.evaluate(() => (window as any).__tr as string[]);
    console.log(`FINDING [${info.project.name}] grid rows mid=${mid}px end=${end}px events=${events.join(' ')}`);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(end);
    expect(events).toContain('transitionend:grid-template-rows');

    const items = page.getByTestId('acc1').locator('> li');
    await expect(items.nth(1)).toHaveClass(/is-active/);
    await expect(items.nth(0)).not.toHaveClass(/is-active/);
    await expect(content(page, 'acc1-c1')).toHaveAttribute('inert', 'true');
    await expect(page.getByTestId('state')).toHaveText(/a1=false a2=true a3=false/);
    expect(await content(page, 'acc1-c1').evaluate((el) => el.getBoundingClientRect().height)).toBe(0);

    // Foundation's accordion-title mixin re-included under the heading: minus icon and last-item border.
    const before = (name: string) =>
      page.getByRole('button', { name }).evaluate((el) => getComputedStyle(el, '::before').content);
    expect(await before('Section 2')).toBe('"\u2013"'); // en dash, Foundation's $accordion-minus-content
    expect(await before('Section 1')).toBe('"+"');
    const lastBorder = await page
      .getByRole('button', { name: 'Section 3' })
      .evaluate((el) => getComputedStyle(el).borderBottomWidth);
    expect(lastBorder).toBe('1px');
    const titleWidth = await page.getByRole('button', { name: 'Section 3' }).evaluate((el) => el.getBoundingClientRect().width);
    const itemWidth = await items.nth(2).evaluate((el) => el.getBoundingClientRect().width);
    expect(titleWidth).toBe(itemWidth);

    expect(logs.filter((l) => /error|warn/i.test(l))).toEqual([]);
  });

  test('accordion without multiExpand binding keeps Aria default (multi)', async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    await page.getByRole('button', { name: 'Default A' }).click();
    await page.getByRole('button', { name: 'Default B' }).click();
    await expect(page.getByRole('button', { name: 'Default A' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Default B' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('nested accordion: ArrowDown after hydration stays in the inner group (control for step 3)', async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    await page.getByRole('button', { name: /Inner 1$/ }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: /Inner 2$/ })).toBeFocused();
  });

  test('tabs: .is-active on li and panel, arrow keys, two-way selected', async ({ page }) => {
    const logs = collectLogs(page);
    await page.goto('/');
    await hydrated(page);
    const tabs = page.getByTestId('tabs1');
    await tabs.getByRole('tab', { name: 'Tab 2' }).click();
    await expect(tabs.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.locator('li.tabs-title').nth(1)).toHaveClass(/is-active/);
    await expect(tabs.locator('li.tabs-title').nth(0)).not.toHaveClass(/is-active/);
    await expect(page.getByText('Tab panel 2 content.')).toBeVisible();
    await expect(page.getByText('Tab panel 1 content, projected.')).toBeHidden();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'Tab 3' })).toBeFocused();
    await expect(page.getByTestId('state')).toHaveText(/selected=panel3/);
    await expect(page.getByText('Tab panel 3 content.')).toBeVisible();
    // Hydrated: the selected tab is the one tab stop.
    const idx = await tabs.getByRole('tab').evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')));
    expect(idx).toEqual(['-1', '-1', '0']);
    expect(logs.filter((l) => /error|warn/i.test(l))).toEqual([]);
  });
});

test.describe('step 3: replayed events (main bundle held back)', () => {
  const cases = [
    { name: 'ArrowDown on accordion Section 1', role: 'button', label: /Section 1$/, key: 'ArrowDown' },
    { name: 'Enter on accordion Section 2', role: 'button', label: /Section 2$/, key: 'Enter' },
    { name: 'Space on accordion Section 2', role: 'button', label: /Section 2$/, key: ' ' },
    { name: 'ArrowRight on Tab 1', role: 'tab', label: /^Tab 1$/, key: 'ArrowRight' },
    { name: 'click on accordion Section 2 (control)', role: 'button', label: /Section 2$/, key: 'click' },
    { name: 'ArrowDown on nested accordion Inner 1', role: 'button', label: /Inner 1$/, key: 'ArrowDown' },
  ] as const;

  for (const c of cases) {
    test(c.name, async ({ page }, info) => {
      const logs = collectLogs(page);
      let release!: () => void;
      const gate = new Promise<void>((r) => (release = r));
      await page.route(/\/main-[A-Z0-9]+\.js$/, async (route) => {
        await gate;
        await route.continue();
      });
      await page.goto('/', { waitUntil: 'commit' });
      const el = page.getByRole(c.role, { name: c.label });
      await el.waitFor();
      if (c.key === 'click') {
        await el.click();
      } else {
        await el.focus();
        await page.keyboard.press(c.key);
      }
      await page.waitForTimeout(200);
      const before = await page.evaluate(() => document.activeElement?.textContent?.trim());
      release();
      await hydrated(page);
      const after = await page.evaluate(() => document.activeElement?.textContent?.trim());
      const state = await page.getByTestId('state').textContent();
      console.log(
        `FINDING [${info.project.name}] ${c.name}: focus before hydration="${before}" after="${after}" state="${state}"\n  logs:\n    ${logs.join('\n    ') || '(none)'}`,
      );
    });
  }
});
