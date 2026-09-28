import { test } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';

// Feasibility probe of a fifth idea, not built as a check: read the compiled component
// definition (the private static field, theta-prefixed `cmp`) of each rendered component,
// whose `consts` hold the static attributes of every element in its template, rendered or
// not, and whose `directiveDefs` list what the component imports.
mkdirSync('results', { recursive: true });

for (const path of ['/if', '/defer', '/member']) {
  test(`compiled definition of ${path}`, async ({ page }) => {
    await page.goto(`${path}?approach=class`);
    await page.waitForTimeout(500);
    const rows = await page.evaluate(() => {
      type Def = {
        consts: unknown;
        directiveDefs: (() => { selectors: unknown; type: { name: string } }[]) | null;
      };
      const ng = (globalThis as unknown as { ng: { getComponent(e: Element): object | null } }).ng;
      const out: unknown[] = [];

      for (const el of document.querySelectorAll('*')) {
        const component = ng.getComponent(el);

        if (component === null || !el.localName.endsWith('-case') && !el.localName.startsWith('app-defer')) {
          continue;
        }

        const def = (component.constructor as unknown as Record<string, Def>)['\u0275cmp'];
        const consts = typeof def.consts === 'function' ? (def.consts as () => unknown)() : def.consts;
        const attrs = JSON.stringify(consts).match(/"nfs[A-Za-z]+"/g) ?? [];
        const imported = (def.directiveDefs?.() ?? []).map((d) => d.type.name);
        out.push({ component: el.localName, staticNfsAttributes: attrs, directiveDefs: imported });
      }

      return out;
    });
    appendFileSync('results/cmp-probe.jsonl', `${JSON.stringify({ path, rows })}\n`);
  });
}
