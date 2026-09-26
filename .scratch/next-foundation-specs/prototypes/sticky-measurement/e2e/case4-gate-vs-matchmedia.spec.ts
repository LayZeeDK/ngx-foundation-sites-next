// Case 4: the CSS stickyOn gate (built with Foundation's own breakpoint() mixin in
// styles.scss) switches at exactly the widths an independently computed matchMedia query does
// (src/app/sticky/breakpoints.ts, exposed on window as nfsGateMatches by the app for this test
// only -- same module the directive itself uses for its JS-side gate, not a reimplementation).
import { expect, test } from '@playwright/test';

const widths = [639, 640, 1023, 1024, 1199, 1200, 1439, 1440];
const targets = [
  { testId: 'case4-medium', stickyOn: 'medium' },
  { testId: 'case4-large-only', stickyOn: 'large only' },
  { testId: 'case4-medium-down', stickyOn: 'medium down' },
];

for (const width of widths) {
  for (const { testId, stickyOn } of targets) {
    test(`case 4: stickyOn="${stickyOn}" at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const result = await page.evaluate(
        ({ testId, stickyOn }) => {
          const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
          const cssSticky = getComputedStyle(el).position === 'sticky';
          const jsMatches = (window as unknown as { nfsGateMatches: (raw: string) => boolean }).nfsGateMatches(
            stickyOn,
          );

          return { cssSticky, jsMatches };
        },
        { testId, stickyOn },
      );

      expect(result.cssSticky).toBe(result.jsMatches);
    });
  }
}
