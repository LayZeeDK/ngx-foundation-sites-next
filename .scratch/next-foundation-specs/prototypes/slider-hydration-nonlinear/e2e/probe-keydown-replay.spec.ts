// PROTOTYPE -- root-cause probe: does the replayed `keydown` even reach
// NfsSliderHandle.onKeydown() in Firefox? Instruments via console output,
// since production output is minified.
import { expect, test } from '@playwright/test';

test('probe: does a replayed keydown fire onKeydown in this engine', async ({ page, browserName }) => {
  const logs: string[] = [];
  page.on('console', (m) => logs.push(`[console:${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.name}: ${e.message}\n${e.stack ?? ''}`));
  await page.addInitScript(() => {
    // Patch addEventListener so we see every keydown LISTENER INVOCATION,
    // replay included (dispatchEvent is native-called internally by jsaction's
    // replay dispatcher, which does not go through EventTarget.dispatchEvent).
    const orig = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, listener: any, opts?: any) {
      if (type === 'keydown' && typeof listener === 'function') {
        const wrapped = function (this: unknown, ev: Event) {
          console.log(
            'KEYDOWN LISTENER before eventPhase=' + (ev as any).eventPhase + ' key=' + (ev as any).key + ' target=' + ((ev.target as HTMLElement)?.id ?? '?'),
          );
          try {
            const result = listener.call(this, ev);

            console.log('KEYDOWN LISTENER returned normally, defaultPrevented=' + (ev as any).defaultPrevented);

            return result;
          } catch (err: any) {
            console.log('KEYDOWN LISTENER threw: ' + (err?.name ?? '?') + ': ' + (err?.message ?? String(err)));
            throw err;
          }
        };

        return orig.call(this, type, wrapped, opts);
      }

      return orig.call(this, type, listener, opts);
    };
  });
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/main-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await page.locator('#nl-log').focus();
  await page.keyboard.press('ArrowRight');
  release();
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
  await page.waitForTimeout(500);
  const finalNative = await page.locator('#nl-log').inputValue();
  const finalModel = (await page.locator('[data-case="nl-log"] [data-state]').textContent())!.trim();
  test.info().annotations.push({
    type: `dispatch log ${browserName}`,
    description: `final: native=${finalNative} model=${finalModel} || ` + (logs.join(' || ') || '(none)'),
  });
  expect(true).toBe(true);
});
