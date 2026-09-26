import { Page } from '@playwright/test';

// PROTOTYPE (throwaway). Firefox formats a console.error(Error) call
// differently from Chromium/WebKit (research/angular-rendering-modes.md's
// sibling prototype found `message.text()` returns just "ERROR Error" in
// Firefox), so this reads each arg's `.message` too, not just `.text()`.
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') {
      return;
    }

    void (async () => {
      const parts = [msg.text()];

      for (const arg of msg.args()) {
        try {
          const value = await arg.evaluate((e: unknown) =>
            e instanceof Error ? e.message : typeof e === 'string' ? e : '',
          );

          if (value) {
            parts.push(value);
          }
        } catch {
          // Some args (DOM nodes, etc.) cannot be evaluated cross-context; ignore.
        }
      }

      errors.push(parts.join(' | '));
    })();
  });

  return errors;
}

export function ng05xxErrors(errors: string[]): string[] {
  return errors.filter((e) => /NG0[5-9]\d\d/.test(e));
}

export interface NfsProbeEntry {
  label: string;
  at: number;
  bodyHtml?: string;
}

export async function readProbe(page: Page): Promise<NfsProbeEntry[]> {
  return page.evaluate(() => (window as unknown as { __nfsProbe?: NfsProbeEntry[] }).__nfsProbe ?? []);
}

export async function readPaintEntries(page: Page): Promise<{ name: string; startTime: number }[]> {
  return page.evaluate(() =>
    performance.getEntriesByType('paint').map((e) => ({ name: e.name, startTime: e.startTime })),
  );
}

export interface NgDevModeHydrationStats {
  hydratedComponents?: number;
  componentsSkippedHydration?: number;
}

export async function waitForHydration(page: Page): Promise<NgDevModeHydrationStats | null> {
  await page
    .waitForFunction(
      () => {
        const nd = (window as unknown as { ngDevMode?: NgDevModeHydrationStats }).ngDevMode;
        return !!nd && typeof nd.hydratedComponents === 'number' && nd.hydratedComponents > 0;
      },
      undefined,
      { timeout: 5000 },
    )
    .catch(() => {
      // Some routes/browsers may not expose ngDevMode at all (production build,
      // or RenderMode.Client which skips hydration entirely) -- the caller checks.
    });

  return page.evaluate(() => (window as unknown as { ngDevMode?: NgDevModeHydrationStats }).ngDevMode ?? null);
}
