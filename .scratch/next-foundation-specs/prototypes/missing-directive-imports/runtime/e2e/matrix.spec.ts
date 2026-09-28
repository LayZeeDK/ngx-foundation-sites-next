import { Page, expect, test } from '@playwright/test';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';

// Runs every case under every approach against the SSR dev server and writes
// results/matrix.json; the findings file's table is read from it.

interface Finding {
  check: string;
  directive: string | null;
  attribute: string;
  owner: string | null;
  wrongElement: boolean;
  text: string;
}

interface Snapshot {
  started: boolean;
  scans: number;
  warnings: number;
  findings: Finding[];
}

// HOOK=every runs the matrix with a full document scan after every render.
const hookParam = process.env['HOOK'] ? `&hook=${process.env['HOOK']}` : '';
const resultsFile = process.env['HOOK'] ? `results/matrix-${process.env['HOOK']}.jsonl` : 'results/matrix.jsonl';
const approaches = ['registry', 'debug', 'debug-name', 'class', 'hybrid'] as const;
mkdirSync('results', { recursive: true });
const results = {
  push(row: Record<string, unknown>): void {
    appendFileSync(resultsFile, `${JSON.stringify(row)}\n`);
  },
};

async function snapshot(page: Page, settleMs = 900): Promise<Snapshot> {
  await page.waitForTimeout(settleMs);

  return page.evaluate(() => {
    const stats = (globalThis as { __nfsImportCheck?: { scans: number; warnings: string[]; findings: Finding[] } })
      .__nfsImportCheck;

    return stats === undefined
      ? { started: false, scans: 0, warnings: 0, findings: [] }
      : { started: true, scans: stats.scans, warnings: stats.warnings.length, findings: [...stats.findings] };
  });
}

function short(s: Snapshot): string {
  if (!s.started) {
    return 'not started';
  }

  return s.findings.length === 0
    ? 'no report'
    : s.findings.map((f) => `${f.directive ?? f.attribute}${f.wrongElement ? '(wrong element)' : ''} "${f.text}" owner=${f.owner}`).join('; ');
}

function record(caseName: string, approach: string, phase: string, s: Snapshot, extra: Record<string, unknown> = {}): void {
  results.push({ case: caseName, approach, phase, summary: short(s), ...s, ...extra });
}

const simpleCases = ['ok', 'member', 'family', 'single', 'none', 'copied', 'css-attr', 'external', 'defer', 'outlet', 'projection', 'twins'];

for (const approach of approaches) {
  test.describe(approach, () => {
    for (const name of simpleCases) {
      test(`${name}`, async ({ page }) => {
        await page.goto(`/${name}?approach=${approach}${hookParam}`);
        record(name, approach, 'load', await snapshot(page, name === 'defer' ? 1500 : 900));
      });
    }

    test('none, started from the provider', async ({ page }) => {
      await page.goto(`/none?approach=${approach}${hookParam}&start=provider`);
      record('none', approach, 'provider start', await snapshot(page));
    });

    test('css-attr, provider start with the typo check', async ({ page }) => {
      await page.goto(`/css-attr?approach=${approach}${hookParam}&start=provider&typos=1`);
      record('css-attr', approach, 'typos on', await snapshot(page));
    });

    test('member, opted out', async ({ page }) => {
      await page.goto(`/member?approach=${approach}${hookParam}&checks=off`);
      record('member', approach, 'checks off', await snapshot(page));
    });

    test('member, client-side navigation', async ({ page }) => {
      await page.goto(`/ok?approach=${approach}${hookParam}`);
      await snapshot(page, 500);
      await page.getByRole('link', { name: 'member', exact: true }).click();
      record('member', approach, 'client navigation', await snapshot(page));
    });

    test('if', async ({ page }) => {
      await page.goto(`/if?approach=${approach}${hookParam}`);
      record('if', approach, 'before click', await snapshot(page));
      await page.getByRole('button', { name: 'Show' }).click();
      record('if', approach, 'after click', await snapshot(page));
    });

    test('for', async ({ page }) => {
      await page.goto(`/for?approach=${approach}${hookParam}`);
      record('for', approach, '1 row', await snapshot(page));
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      record('for', approach, '3 rows', await snapshot(page));
    });

    test('hydrate', async ({ page }) => {
      await page.goto(`/hydrate?approach=${approach}${hookParam}`);
      record('hydrate', approach, 'before interaction', await snapshot(page));
      await page.getByRole('button', { name: 'Hydrate missing' }).click();
      await page.getByRole('button', { name: 'Hydrate imported' }).click();
      record('hydrate', approach, 'after interaction', await snapshot(page, 1500));
    });

    test('hydrate, client-side navigation', async ({ page }) => {
      await page.goto(`/ok?approach=${approach}${hookParam}`);
      await snapshot(page, 500);
      await page.getByRole('link', { name: 'hydrate', exact: true }).click();
      record('hydrate', approach, 'client navigation', await snapshot(page, 1500));
    });
  });
}

test('twins: class names Angular reports in the dev build', async ({ page }) => {
  await page.goto('/twins?approach=debug');
  await snapshot(page, 500);
  const names = await page.evaluate(() => {
    const ng = (globalThis as unknown as { ng: { getDirectives(n: Node): object[] } }).ng;

    return [...document.querySelectorAll('[nfscolumn], [nfsColumn]')].map((el) =>
      ng.getDirectives(el).map((d) => d.constructor.name),
    );
  });
  results.push({ case: 'twins', approach: 'debug', phase: 'constructor names', names });
});

test('outlet: getOwningComponent for a template rendered elsewhere', async ({ page }) => {
  await page.goto('/outlet?approach=debug');
  await snapshot(page, 500);
  const owners = await page.evaluate(() => {
    const ng = (globalThis as unknown as { ng: { getOwningComponent(e: Element): object | null } }).ng;

    return [...document.querySelectorAll('button[nfsbutton]')].map((el) => ({
      text: el.textContent?.trim(),
      owner: ng.getOwningComponent(el)?.constructor.name ?? null,
    }));
  });
  results.push({ case: 'outlet', approach: 'debug', phase: 'owners', owners });
});

for (const approach of ['registry', 'debug', 'class', 'hybrid']) {
  for (const n of [500, 2000]) {
    for (const hook of ['every', 'mutations']) {
    test(`stress ${approach} n=${n} hook=${hook}`, async ({ page }) => {
      await page.goto(`/stress?approach=${approach}${hookParam}&n=${n}&hook=${hook}`);
      await page.waitForFunction(() => ((globalThis as { __nfsImportCheck?: { scans: number } }).__nfsImportCheck?.scans ?? 0) > 0);
      await page.waitForTimeout(500);
      const cold = await page.evaluate(() => {
        const s = (globalThis as unknown as { __nfsImportCheck: { maxMs: number; scans: number; lastMatched: number; findings: unknown[] } }).__nfsImportCheck;

        return { maxMs: s.maxMs, scans: s.scans, matched: s.lastMatched, findings: s.findings.length };
      });
      const tick = page.getByRole('button', { name: /^Tick/ });

      for (let i = 0; i < 10; i++) {
        await tick.click();
      }

      await page.waitForTimeout(300);
      const warm = await page.evaluate(() => {
        const s = (globalThis as unknown as { __nfsImportCheck: { lastMs: number; totalMs: number; scans: number } }).__nfsImportCheck;

        return { lastMs: s.lastMs, totalMs: s.totalMs, scans: s.scans };
      });
      results.push({ case: 'stress', approach, n, hook, cold, warm });
    });
    }
  }
}

test('attribute case in the DOM @engines', async ({ page, browserName }) => {
  await page.goto('/member?approach=class');
  await snapshot(page, 500);
  const facts = await page.evaluate(() => {
    const title = document.querySelector('button[nfsAccordionTitle]');

    return {
      camelSelectorMatches: title !== null,
      attributeNames: title?.getAttributeNames() ?? [],
      hasAttributeCamel: title?.hasAttribute('nfsAccordionTitle') ?? false,
      warnings: (globalThis as { __nfsImportCheck?: { warnings: string[] } }).__nfsImportCheck?.warnings ?? [],
    };
  });
  expect(facts.camelSelectorMatches).toBe(true);
  expect(facts.warnings.length).toBe(1);
  mkdirSync('results', { recursive: true });
  writeFileSync(`results/engines-${browserName}.json`, JSON.stringify(facts, null, 2));
});

