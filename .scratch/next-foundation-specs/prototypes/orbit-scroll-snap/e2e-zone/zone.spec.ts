// PROTOTYPE (throwaway): the zone-based build (ng build --configuration zone) served on
// 4461. Does an autoplay timer outside the zone let the app reach stability and replay a
// pre-hydration click, and does the same timer inside the zone block both?
import { expect, test, type TestInfo } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';

mkdirSync('results', { recursive: true });

function record(info: TestInfo, data: Record<string, unknown>) {
  appendFileSync(`results/zone-${info.project.name}.jsonl`, JSON.stringify({ case: info.title, ...data }) + '\n');
}

for (const inside of [false, true]) {
  test(`zone build, autoplay timer ${inside ? 'inside' : 'outside'} the zone: stability and replay`, async ({ page }, info) => {
    await page.route(/main-[A-Z0-9]+\.js$/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });
    await page.goto(`/?delay=700${inside ? '&inside=1' : ''}`, { waitUntil: 'commit' });
    await page.locator('.orbit-next').waitFor();
    // Before the bundle arrives. The next arrow via dispatchEvent: no focus, so the replayed
    // event does not stop autoplay (a bullet click would: Aria focuses the clicked tab, and
    // focus entering the carousel stops rotation), which would confound the inside case.
    await page.locator('.orbit-next').dispatchEvent('click');
    await page.mouse.move(5, 790); // hover must not pause autoplay here
    await page.waitForTimeout(2000 + 3500);
    const m = await page.evaluate(() => ({
      stableAt: (window as unknown as { __stableAt?: number }).__stableAt ?? null,
      log: (window as unknown as { __orbitLog?: { i: number; cause: string }[] }).__orbitLog ?? [],
      active: [...document.querySelectorAll('.orbit-slide')].findIndex((s) => s.classList.contains('is-active')),
    }));
    const replayed = m.log.some((e) => e.cause === 'user' && e.i === 1);
    record(info, { inside, ...m, replayed });

    if (inside) {
      // Never stable, so the queued pre-hydration click is never replayed.
      expect(m.stableAt).toBeNull();
      expect(replayed).toBe(false);
    } else {
      expect(m.stableAt).not.toBeNull();
      expect(replayed).toBe(true);
    }
  });
}
