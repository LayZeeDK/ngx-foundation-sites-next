// THROWAWAY measurement for [Decide: the server state of an open-by-default non-modal Reveal's Trigger].
// Every test logs a RESULT line (JSON) and asserts only what the decision depends on.
import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const settle = (page: Page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)))));
const result = (name: string, engine: string, value: unknown) => console.log(`RESULT ${engine} ${name} ${JSON.stringify(value)}`);
const logOf = (page: Page) => page.evaluate(() => (window as unknown as { __log: string[] }).__log.slice());

async function hydrated(page: Page) {
  await page.waitForSelector('body[data-hydrated]', { state: 'attached' });
  await settle(page);
}

function collectConsole(page: Page): string[] {
  const out: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      out.push(`${m.type()}: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => out.push(`pageerror: ${e.message}`));

  return out;
}

/** Holds main.js back so clicks land before hydration. */
async function holdBundle(context: BrowserContext, ms: number) {
  await context.route('**/main.js', async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.continue();
  });
}

const state = (page: Page) =>
  page.evaluate(() => {
    const d = document.getElementById('note') as HTMLDialogElement;
    const t = document.getElementById('trigger')!;

    return {
      open: d.open,
      modal: d.matches(':modal'),
      display: getComputedStyle(d).display,
      triggerExpanded: t.getAttribute('aria-expanded'),
      active: document.activeElement?.id || document.activeElement?.tagName,
    };
  });

test.describe('platform: a dialog parsed with open', () => {
  test('P1 show() returns without effect', async ({ page }, info) => {
    await page.goto('/platform.html');
    const r = await page.evaluate(() => (window as any).probe.a());
    result('P1', info.project.name, r);
    expect(r.error).toBeNull();
    expect(r.events).toEqual([]);
    expect(r.after.open).toBe(true);
    expect(r.after.modal).toBe(false);
    expect(r.after.active).toBe('BODY');
  });

  test('P2 showModal() throws InvalidStateError', async ({ page }, info) => {
    await page.goto('/platform.html');
    const r = await page.evaluate(() => (window as any).probe.b());
    result('P2', info.project.name, r);
    expect(r.error).toBe('InvalidStateError');
  });

  test('P3 setAttribute same value, then close(), then show()', async ({ page }, info) => {
    await page.goto('/platform.html');
    const r = await page.evaluate(() => (window as any).probe.c());
    result('P3', info.project.name, r);
    expect(r.afterSet.events).toEqual([]);
    expect(r.afterSet.state.open).toBe(true);
    expect(r.afterClose.state.open).toBe(false);
    expect(r.afterClose.events).toContain('close:c');
    expect(r.afterClose.returnValue).toBe('x');
    expect(r.afterShow.state.open).toBe(true);
    expect(r.afterClose2.events).toContain('close:c');
  });

  test('P4 removeAttribute fires no close event; show() works afterwards', async ({ page }, info) => {
    await page.goto('/platform.html');
    const r = await page.evaluate(() => (window as any).probe.d());
    result('P4', info.project.name, r);
    expect(r.afterRemove.events).not.toContain('close:d');
    expect(r.afterRemove.state.display).toBe('none');
    expect(r.afterShow.error).toBeNull();
    expect(r.afterShow.state.open).toBe(true);
    expect(r.afterClose.events).toContain('close:d');
  });

  test('P5 a static autofocus attribute on a dialog parsed open', async ({ page }, info) => {
    await page.goto('/autofocus.html');
    await settle(page);
    const active = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    result('P5', info.project.name, { active });
  });

  test('P6 accessibility: expanded Trigger beside an open and a closed dialog', async ({ page }, info) => {
    await page.goto('/ax.html');
    await settle(page);
    const snapshot = await page.locator('body').ariaSnapshot();
    let chromium: unknown = null;

    if (info.project.name === 'chromium') {
      const cdp = await page.context().newCDPSession(page);
      const { nodes } = (await cdp.send('Accessibility.getFullAXTree')) as { nodes: any[] };
      chromium = nodes
        .filter((n) => ['dialog', 'button'].includes(n.role?.value))
        .map((n) => ({
          role: n.role.value,
          name: n.name?.value,
          ignored: n.ignored,
          expanded: n.properties?.find((p: any) => p.name === 'expanded')?.value?.value,
        }));
    }

    result('P6', info.project.name, { snapshot, chromium });
    expect(snapshot).toContain('dialog "Dialog F"');
    expect(snapshot).not.toContain('Dialog G');
  });
});

test.describe('Angular: server HTML and hydration', () => {
  test('A1 server HTML per variant', async ({ request }, info) => {
    const pick = async (q: string) => {
      const html = await (await request.get(`/?${q}`)).text();

      return {
        trigger: html.match(/<button[^>]*id="trigger"[^>]*>/)?.[0],
        dialog: html.match(/<dialog[^>]*>/)?.[0],
      };
    };
    const r = {
      candidate: await pick('variant=candidate'),
      spec: await pick('variant=spec'),
      diverge: await pick('variant=candidate&diverge=1'),
      modal: await pick('variant=candidate&modal=1'),
    };
    result('A1', info.project.name, r);
    expect(r.candidate.dialog).toContain('open=""');
    expect(r.spec.dialog).not.toContain('open');
    expect(r.modal.dialog).not.toContain(' open');
  });

  test('A2 JavaScript disabled', async ({ browser }, info) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const r: Record<string, unknown> = {};

    for (const variant of ['candidate', 'spec']) {
      await page.goto(`/?variant=${variant}`);
      r[variant] = {
        dialogVisible: await page.locator('#note').isVisible(),
        triggerExpanded: await page.locator('#trigger').getAttribute('aria-expanded'),
      };
    }

    await page.goto('/?variant=candidate');
    await page.locator('#note-form-close').click();
    r['candidateAfterFormClose'] = { dialogVisible: await page.locator('#note').isVisible() };
    result('A2', info.project.name, r);
    await context.close();
    expect((r['candidate'] as any).dialogVisible).toBe(true);
    expect((r['spec'] as any).dialogVisible).toBe(false);
    expect((r['candidateAfterFormClose'] as any).dialogVisible).toBe(false);
  });

  test('A3 hydration keeps the server-rendered open dialog and fires nothing; focus from body goes inside', async ({ page }, info) => {
    const errors = collectConsole(page);
    await page.goto('/?variant=candidate');
    await hydrated(page);
    const r = {
      state: await state(page),
      log: await logOf(page),
      ngDevMode: await page.evaluate(() => {
        const d = (window as any).ngDevMode;

        return d ? { hydratedComponents: d.hydratedComponents, hydratedNodes: d.hydratedNodes, skipped: d.componentsSkippedHydration } : null;
      }),
      jsaction: await page.evaluate(() => document.querySelectorAll('[jsaction]').length),
      errors,
    };
    result('A3', info.project.name, r);
    expect(r.state.open).toBe(true);
    expect(r.state.modal).toBe(false);
    expect(r.state.triggerExpanded).toBe('true');
    expect(r.log.filter((l) => l.startsWith('event:'))).toEqual([]);
    expect(r.state.active).toBe('note-close');
    expect(errors.filter((e) => /NG0/.test(e))).toEqual([]);
  });

  test('A9 focus the user placed before hydration stays there', async ({ browser }, info) => {
    const context = await browser.newContext();
    await holdBundle(context, 2000);
    const page = await context.newPage();
    await page.goto('/?variant=candidate', { waitUntil: 'commit' });
    await page.waitForSelector('#search');
    await page.locator('#search').click();
    await page.keyboard.type('abc');
    const atType = { hydrated: await page.locator('body[data-hydrated]').count(), dialogVisible: await page.locator('#note').isVisible() };
    await hydrated(page);
    const r = { atType, final: await state(page), value: await page.locator('#search').inputValue(), log: await logOf(page) };
    result('A9', info.project.name, r);
    await context.close();
    expect(atType.hydrated).toBe(0);
    expect(r.final.active).toBe('search');
    expect(r.final.open).toBe(true);
  });

  test('A10 a static autofocus attribute focuses the dialog at load; hydration corrects it', async ({ browser }, info) => {
    const context = await browser.newContext();
    await holdBundle(context, 2000);
    const page = await context.newPage();
    await page.goto('/af', { waitUntil: 'commit' });
    await page.waitForSelector('#note');
    await page.waitForTimeout(300);
    const beforeHydration = {
      hydrated: await page.locator('body[data-hydrated]').count(),
      active: await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName),
    };
    await hydrated(page);
    const r = {
      beforeHydration,
      afterHydration: await page.evaluate(() => ({
        active: document.activeElement?.id || document.activeElement?.tagName,
        autofocusAttr: document.getElementById('note')!.getAttribute('autofocus'),
        open: (document.getElementById('note') as HTMLDialogElement).open,
      })),
      log: await logOf(page),
    };
    result('A10', info.project.name, r);
    await context.close();
    expect(beforeHydration.hydrated).toBe(0);
    expect(r.afterHydration.active).toBe('note-close');
    expect(r.afterHydration.autofocusAttr).toBeNull();
  });

  test('A4 a later close is final, no change detection writes open back, reopen uses show()', async ({ page }, info) => {
    await page.goto('/?variant=candidate');
    await hydrated(page);
    await page.locator('#note-close').click();
    await settle(page);
    const afterClose = await state(page);
    await page.locator('#bump').click();
    await page.locator('#bump').click();
    await settle(page);
    const afterBump = { ...(await state(page)), attr: await page.locator('#note').getAttribute('open') };
    await page.locator('#trigger').click();
    await settle(page);
    const afterReopen = await state(page);
    await page.locator('#bump').click();
    await settle(page);
    const afterReopenBump = await state(page);
    const r = { afterClose, afterBump, afterReopen, afterReopenBump, log: await logOf(page) };
    result('A4', info.project.name, r);
    expect(afterClose.open).toBe(false);
    expect(afterClose.triggerExpanded).toBe('false');
    expect(afterBump.attr).toBeNull();
    expect(afterReopen.open).toBe(true);
    expect(afterReopen.triggerExpanded).toBe('true');
    expect(afterReopenBump.open).toBe(true);
  });

  for (const variant of ['candidate', 'spec']) {
    test(`A5 pre-hydration Trigger click (${variant})`, async ({ browser }, info) => {
      const context = await browser.newContext();
      await holdBundle(context, 2000);
      const page = await context.newPage();
      const errors = collectConsole(page);
      await page.goto(`/?variant=${variant}`, { waitUntil: 'commit' });
      await page.waitForSelector('#trigger');
      const atClick = {
        dialogVisible: await page.locator('#note').isVisible(),
        triggerExpanded: await page.locator('#trigger').getAttribute('aria-expanded'),
        hydrated: await page.locator('body[data-hydrated]').count(),
      };
      await page.locator('#trigger').click();
      await hydrated(page);
      const r = { atClick, final: await state(page), log: await logOf(page), errors };
      result(`A5-${variant}`, info.project.name, r);
      await context.close();
      expect(atClick.hydrated).toBe(0);
      expect(r.final.open).toBe(false);
    });
  }

  test('A6 client state differs from the server: hydration removes open without a close event', async ({ page }, info) => {
    await page.goto('/?variant=candidate&diverge=1');
    await hydrated(page);
    const afterHydration = await state(page);
    const log1 = await logOf(page);
    await page.locator('#trigger').click();
    await settle(page);
    const afterOpen = await state(page);
    const r = { afterHydration, afterOpen, log: log1, logAfterOpen: await logOf(page) };
    result('A6', info.project.name, r);
    expect(afterHydration.open).toBe(false);
    expect(afterHydration.triggerExpanded).toBe('false');
    expect(log1.filter((l) => l.startsWith('event:close'))).toEqual([]);
    expect(afterOpen.open).toBe(true);
  });

  for (const adopt of ['1', '0']) {
    test(`A7 pre-hydration <form method="dialog"> close (adopt=${adopt})`, async ({ browser }, info) => {
      const context = await browser.newContext();
      await holdBundle(context, 2000);
      const page = await context.newPage();
      const errors = collectConsole(page);
      await page.goto(`/?variant=candidate&adopt=${adopt}`, { waitUntil: 'commit' });
      await page.waitForSelector('#note-form-close');
      await page.locator('#note-form-close').click();
      const atClick = {
        dialogOpenAfterClick: await page.evaluate(() => (document.getElementById('note') as HTMLDialogElement).open),
        hydrated: await page.locator('body[data-hydrated]').count(),
      };
      await hydrated(page);
      const r = { atClick, final: await state(page), log: await logOf(page), errors };
      result(`A7-adopt${adopt}`, info.project.name, r);
      await context.close();
      expect(atClick.hydrated).toBe(0);
      expect(atClick.dialogOpenAfterClick).toBe(false);
    });
  }

  test('A8 modal open-by-default is unchanged: closed on the server, modal after hydration', async ({ page }, info) => {
    await page.goto('/?variant=candidate&modal=1');
    await hydrated(page);
    const r = { state: await state(page), log: await logOf(page) };
    result('A8', info.project.name, r);
    expect(r.state.modal).toBe(true);
  });
});
