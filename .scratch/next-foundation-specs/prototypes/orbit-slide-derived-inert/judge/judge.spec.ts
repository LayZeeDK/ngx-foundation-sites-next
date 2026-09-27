// JUDGE PROBE (throwaway) for the Decide the @angular/aria fallback confirmation ticket.
// Question: with the slide hosting Aria's TabPanel and the derived `inert` override, what does
// the client do with `inert` before the Orbit is live? On the client, Aria's `inert` arrives in
// a later hydration pass (the bullets register after the slides bind), and the override removes
// it in the same host-binding run. This wraps Element.prototype.setAttribute/removeAttribute
// from document start and logs every `inert` write on a slide in call order, with the focused
// element read synchronously after the call (reading activeElement flushes no style), plus
// every focusout with the call count at dispatch.
import { expect, test } from '@playwright/test';
import { hydrated, record, settled } from './helpers';

const initScript = () => {
  const w = window as unknown as { __judge: unknown[]; __calls: number };
  w.__judge = [];
  w.__calls = 0;
  const idx = (el: Element | null) =>
    el instanceof HTMLElement ? (el.dataset['index'] ?? el.tagName) : String(el);
  const isSlide = (el: Element) => el.classList?.contains('orbit-slide');
  const origSet = Element.prototype.setAttribute;
  const origRemove = Element.prototype.removeAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    origSet.call(this, name, value);

    if (name === 'inert' && isSlide(this)) {
      w.__judge.push({ n: ++w.__calls, op: 'set', slide: idx(this), active: idx(document.activeElement) });
    }
  };
  Element.prototype.removeAttribute = function (name: string) {
    const had = this.hasAttribute(name);
    origRemove.call(this, name);

    if (name === 'inert' && isSlide(this) && had) {
      w.__judge.push({ n: ++w.__calls, op: 'remove', slide: idx(this), active: idx(document.activeElement) });
    }
  };
  document.addEventListener(
    'focusout',
    (e) => {
      const el = e.target as HTMLElement;
      w.__judge.push({ n: w.__calls, op: 'focusout', slide: idx(el), inertAtDispatch: el.hasAttribute?.('inert') ?? null });
    },
    true,
  );
};

type Entry = { n: number; op: string; slide: string; active?: string };

/** Pairs of set immediately followed by remove on the same slide: the hydration transient. */
function transientPairs(log: Entry[]) {
  const calls = log.filter((e) => e.op !== 'focusout');
  const pairs: string[] = [];

  for (let i = 0; i + 1 < calls.length; i++) {
    if (calls[i].op === 'set' && calls[i + 1].op === 'remove' && calls[i].slide === calls[i + 1].slide) {
      pairs.push(calls[i].slide);
    }
  }

  return pairs;
}

test('judge: inert writes during hydration, in call order', async ({ page }, info) => {
  await page.addInitScript(initScript);
  await page.goto('/?autoplay=false');
  await hydrated(page);
  const s = await settled(page);
  const log = (await page.evaluate(() => (window as unknown as { __judge: unknown[] }).__judge)) as Entry[];
  record(info, { afterInert: s.inert, transientPairs: transientPairs(log), log });
  expect(s.inert).toBe('0111');
});

test('judge: a slide focused before hydration keeps focus through the hydration transient', async ({ page }, info) => {
  await page.addInitScript(initScript);
  await page.route(/main-[A-Z0-9]+\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, 2500));
    await route.continue();
  });
  await page.goto('/?autoplay=false&selected=1', { waitUntil: 'commit' });
  await page.waitForFunction(() => {
    const el = document.querySelectorAll<HTMLElement>('.orbit-slide')[3];

    if (!el || el.getBoundingClientRect().width === 0) {
      return false;
    }

    el.focus({ preventScroll: true });

    return document.activeElement === el;
  });
  const activeBefore = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset['index'] ?? null);
  await hydrated(page);
  const s = await settled(page);
  const log = (await page.evaluate(() => (window as unknown as { __judge: unknown[] }).__judge)) as Entry[];
  record(info, { activeBefore, afterInert: s.inert, transientPairs: transientPairs(log), log });
  expect(activeBefore).toBe('3');
  // Focus is still on slide 3 right after every inert write of the transient (set then remove).
  const calls = log.filter((e) => e.op !== 'focusout');
  const pairs = transientPairs(log);
  expect(pairs).toContain('3');
  const firstPersistentSet = calls.findIndex(
    (e, i) => e.op === 'set' && !(calls[i + 1]?.op === 'remove' && calls[i + 1]?.slide === e.slide),
  );
  const transientCalls = calls.slice(0, firstPersistentSet);
  expect(transientCalls.every((e) => e.active === '3')).toBe(true);
  // No focusout of slide 3 while only the transient had run.
  const focusouts = log.filter((e) => e.op === 'focusout' && e.slide === '3');
  const lastTransientN = transientCalls.at(-1)?.n ?? 0;
  expect(focusouts.every((e) => e.n > lastTransientN)).toBe(true);
});
