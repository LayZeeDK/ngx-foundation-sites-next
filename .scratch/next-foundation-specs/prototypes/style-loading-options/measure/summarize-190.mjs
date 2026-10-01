// PROTOTYPE (ticket 190): Markdown tables from out/vitals-*.json, out/lighthouse.json, out/a11y-*.json.
// Every cell is "median [min-max]" over the runs; n is printed per table.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { median, spread } from './common.mjs';

const OUT = join(import.meta.dirname, '..', 'out');
const OPTS = ['A', 'B', 'C', 'D', 'E', 'L', 'LP', 'S'];
const COMBOS = [
  ['chromium', 'unthrottled'],
  ['chromium', 'delay300'],
  ['chromium', 'slow4g4x'],
  ['firefox', 'unthrottled'],
  ['firefox', 'delay300'],
  ['webkit', 'unthrottled'],
  ['webkit', 'delay300'],
];
/** Rows: [label, scenario, probe id, which pointerdown (0 or 1), trigger is a scroll]. */
const ROWS = [
  ['S2 route navigation, early', 's2-nav-early', 'dd-sub', 0],
  ['S2 route navigation, late', 's2-nav-late', 'dd-sub', 0],
  ['S3 @defer on interaction, early', 's3-int-early', 'c-int', 0],
  ['S3 @defer on interaction, late', 's3-int-late', 'c-int', 0],
  ['S3 @defer on viewport, early', 's3-view-early', 'dd-sub', null],
  ['S3 @defer on viewport, late', 's3-view-late', 'dd-sub', null],
  ['S4 click opens a pane, early', 's4-pane-early', 'pane', 0],
  ['S4 click opens a pane, late', 's4-pane-late', 'pane', 0],
  ['S5 pane before idle', 's5-pane-early-menu-late', 'pane', 0],
  ['S5 menu after idle', 's5-pane-early-menu-late', 'dd2-sub', 1],
];

const r0 = (x) => (x == null ? '-' : Math.round(x));
const cell = (xs, digits = 0) => {
  const m = median(xs);

  if (m == null) {
    return 'n/a';
  }

  const [lo, hi] = spread(xs);
  const f = (x) => (digits ? x.toFixed(digits) : String(Math.round(x)));

  return lo === hi ? f(m) : `${f(m)} [${f(lo)}-${f(hi)}]`;
};
const load = (f) => (existsSync(join(OUT, f)) ? JSON.parse(readFileSync(join(OUT, f), 'utf8')) : null);
const lines = [];
const table = (head, rows) => {
  lines.push(`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`);

  for (const row of rows) {
    lines.push(`| ${row.join(' | ')} |`);
  }

  lines.push('');
};

/** Per run: the probe's numbers for one row. */
function rowValues(run, [, , probe, pdIndex]) {
  const p = run.probe?.[probe];

  if (!p) {
    return null;
  }

  const pds = run.clicks.filter((c) => c.type === 'pointerdown');
  const trigger = pdIndex == null ? run.meta?.triggerT : pds[pdIndex]?.t;

  return {
    unstyled: p.unstyled,
    toStyled: p.styled != null && trigger != null ? p.styled - trigger : null,
    toFirst: trigger != null ? p.present - trigger : null,
    beforePrefetch:
      run.times?.prefetched != null ? p.present < run.times.prefetched : null,
  };
}

const vitals = Object.fromEntries(
  // Option S was built after the Chromium runs, so its Chromium runs are in `-S` files.
  COMBOS.map(([e, p]) => [`${e}-${p}`, [...(load(`vitals-${e}-${p}.json`) ?? []), ...(load(`vitals-${e}-${p}-S.json`) ?? [])]])
    .filter(([, d]) => d.length),
);

lines.push('# Ticket 190 measurements', '');

for (const [key, data] of Object.entries(vitals)) {
  const ok = data.filter((r) => !r.error);
  const n = Math.max(...OPTS.map((o) => ok.filter((r) => r.option === o && r.scenario === 's1-load').length));
  const errors = data.filter((r) => r.error);
  lines.push(`## ${key} (n = ${n} runs per cell${errors.length ? `, ${errors.length} failed runs` : ''})`, '');

  // S1: load metrics.
  const s1 = (o) => ok.filter((r) => r.option === o && r.scenario === 's1-load');
  const tbt = (r) =>
    r.longtasks.length || r.supported.includes('longtask')
      ? r.longtasks.filter((t) => t.t > (r.wv.FCP?.value ?? 0)).reduce((s, t) => s + Math.max(0, t.d - 50), 0)
      : null;
  table(
    ['S1 landing', ...OPTS],
    [
      ['LCP ms', ...OPTS.map((o) => cell(s1(o).map((r) => r.wv.LCP?.value)))],
      ['FCP ms', ...OPTS.map((o) => cell(s1(o).map((r) => r.wv.FCP?.value)))],
      ['CLS', ...OPTS.map((o) => cell(s1(o).map((r) => (r.supported.includes('layout-shift') ? r.wv.CLS?.value ?? 0 : null)), 3))],
      ['blocking time after FCP, ms (long tasks)', ...OPTS.map((o) => cell(s1(o).map(tbt)))],
      ['page hydrated, ms', ...OPTS.map((o) => cell(s1(o).map((r) => r.times.hydrated)))],
      ['app stable, ms', ...OPTS.map((o) => cell(s1(o).map((r) => r.times.stable)))],
      ['D: prefetch done, ms', ...OPTS.map((o) => cell(s1(o).map((r) => r.times.prefetched)))],
      ['family style requests', ...OPTS.map((o) => cell(s1(o).map((r) => r.carrierRequests.length)))],
      ['unstyled frames (callout)', ...OPTS.map((o) => cell(s1(o).map((r) => r.probe.hero?.unstyled)))],
    ],
  );

  const metric = (title, pick, digits = 0) => {
    table(
      [title, ...OPTS],
      ROWS.map((row) => [
        row[0],
        ...OPTS.map((o) =>
          cell(
            ok
              .filter((r) => r.option === o && r.scenario === row[1])
              .map((r) => rowValues(r, row))
              .filter(Boolean)
              .map(pick),
            digits,
          ),
        ),
      ]),
    );
  };
  metric('Unstyled painted frames', (v) => v.unstyled);
  metric('Trigger to styled frame, ms', (v) => v.toStyled);
  // INP per scenario (the page's worst interaction so far).
  table(
    ['INP ms [input delay / processing / presentation, medians]', ...OPTS],
    ROWS.filter((r) => r[3] != null).map((row) => [
      row[0],
      ...OPTS.map((o) => {
        const runs = ok.filter((r) => r.option === o && r.scenario === row[1] && r.wv.INP);

        if (!runs.length) {
          return 'n/a';
        }

        const a = (k) => r0(median(runs.map((r) => r.wv.INP.attribution[k])));

        return `${cell(runs.map((r) => r.wv.INP.value))} (${a('inputDelay')}/${a('processing')}/${a('presentation')})`;
      }),
    ]),
  );

  if (key.startsWith('chromium')) {
    table(
      ['CLS (web-vitals; shifts within 500 ms of input excluded)', ...OPTS],
      ROWS.map((row) => [
        row[0],
        ...OPTS.map((o) => cell(ok.filter((r) => r.option === o && r.scenario === row[1]).map((r) => r.wv.CLS?.value ?? 0), 3)),
      ]),
    );
    table(
      ['Layout shift incl. input-excluded shifts', ...OPTS],
      ROWS.map((row) => [
        row[0],
        ...OPTS.map((o) =>
          cell(
            ok.filter((r) => r.option === o && r.scenario === row[1]).map((r) => r.shifts.reduce((s, x) => s + x.v, 0)),
            3,
          ),
        ),
      ]),
    );
  }

  table(
    ['D: first use before its prefetch was done (runs)', 'D'],
    ROWS.map((row) => {
      const v = ok.filter((r) => r.option === 'D' && r.scenario === row[1]).map((r) => rowValues(r, row)).filter(Boolean);

      return [row[0], `${v.filter((x) => x.beforePrefetch).length} of ${v.length}`];
    }),
  );
  lines.push(`Idle API: ${[...new Set(ok.map((r) => r.ric))].join(', ')}. Entry types: ${[...new Set(ok.map((r) => r.supported.join(' ')))].join(' / ')}`, '');
}

// Lighthouse.
const lh = load('lighthouse.json');

if (lh) {
  const n = lh.filter((r) => r.option === 'A' && r.method === 'simulate').length;
  lines.push(`## Lighthouse 13.5.0 mobile, landing page (n = ${n} runs per cell)`, '');

  for (const method of ['simulate', 'devtools', 'provided']) {
    const g = (o) => lh.filter((r) => !r.error && r.option === o && r.method === method);

    if (!g('A').length) {
      continue;
    }

    table(
      [`Lighthouse, throttling ${method}`, ...OPTS],
      [
        ['performance score', ...OPTS.map((o) => cell(g(o).map((r) => r.performance * 100)))],
        ['FCP ms', ...OPTS.map((o) => cell(g(o).map((r) => r.fcp)))],
        ['LCP ms', ...OPTS.map((o) => cell(g(o).map((r) => r.lcp)))],
        ['TBT ms', ...OPTS.map((o) => cell(g(o).map((r) => r.tbt)))],
        ['CLS', ...OPTS.map((o) => cell(g(o).map((r) => r.cls), 3))],
        ['Speed Index ms', ...OPTS.map((o) => cell(g(o).map((r) => r.si)))],
        ['accessibility score', ...OPTS.map((o) => cell(g(o).map((r) => r.accessibility * 100)))],
        ['transfer, bytes', ...OPTS.map((o) => cell(g(o).map((r) => r.bytes)))],
        ['JS transfer, bytes', ...OPTS.map((o) => cell(g(o).map((r) => r.requests.filter((q) => q.type === 'Script').reduce((s, q) => s + q.transfer, 0))))],
        ['family style requests', ...OPTS.map((o) => cell(g(o).map((r) => r.requests.filter((q) => /^nfs-|^chunk-/.test(q.url) && q.transfer < 3000).length)))],
        ['render-blocking family CSS, est. ms saved', ...OPTS.map((o) => cell(g(o).map((r) => r.renderBlocking.filter((b) => /^nfs-/.test(b.url)).reduce((s, b) => s + (b.wasted ?? 0), 0))))],
        ['script parse+compile ms (all scripts)', ...OPTS.map((o) => cell(g(o).map((r) => r.bootup.reduce((s, b) => s + (b.parse ?? 0), 0))))],
        ['main-thread work ms', ...OPTS.map((o) => cell(g(o).map((r) => r.mainThread)))],
      ],
    );
  }
}

writeFileSync(join(OUT, 'summary-190.md'), lines.join('\n'));
console.log(lines.join('\n'));
