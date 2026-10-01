// PROTOTYPE (ticket 190): the compact tables in the README, from the same raw files as
// summarize-190.mjs. Cells are medians; "a/b/c" cells are Chromium/Firefox/WebKit.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { median, spread } from './common.mjs';

const OUT = join(import.meta.dirname, '..', 'out');
const OPTS = ['A', 'B', 'C', 'D', 'E', 'L', 'LP', 'S'];
const load = (f) => (existsSync(join(OUT, f)) ? JSON.parse(readFileSync(join(OUT, f), 'utf8')) : []);
const data = (e, p) => [...load(`vitals-${e}-${p}.json`), ...load(`vitals-${e}-${p}-S.json`)].filter((r) => !r.error);
const ROWS = [
  ['S2 navigation, early', 's2-nav-early', 'dd-sub', 0],
  ['S2 navigation, late', 's2-nav-late', 'dd-sub', 0],
  ['S3 `on interaction`, early', 's3-int-early', 'c-int', 0],
  ['S3 `on interaction`, late', 's3-int-late', 'c-int', 0],
  ['S3 `on viewport`, early', 's3-view-early', 'dd-sub', null],
  ['S3 `on viewport`, late', 's3-view-late', 'dd-sub', null],
  ['S4 pane click, early', 's4-pane-early', 'pane', 0],
  ['S4 pane click, late', 's4-pane-late', 'pane', 0],
  ['S5 pane, before idle', 's5-pane-early-menu-late', 'pane', 0],
  ['S5 menu, after idle', 's5-pane-early-menu-late', 'dd2-sub', 1],
];
const m = (xs) => {
  const v = median(xs);

  return v == null ? '-' : String(Math.round(v));
};
const ms = (xs) => {
  const v = median(xs);

  if (v == null) {
    return '-';
  }

  const [lo, hi] = spread(xs);

  return `${Math.round(v)} [${Math.round(lo)}-${Math.round(hi)}]`;
};
const values = (runs, [, scenario, probe, pd], opt, pick) =>
  runs
    .filter((r) => r.option === opt && r.scenario === scenario && r.probe?.[probe])
    .map((r) => {
      const p = r.probe[probe];
      const pds = r.clicks.filter((c) => c.type === 'pointerdown');
      const t = pd == null ? r.meta?.triggerT : pds[pd]?.t;

      return pick({ unstyled: p.unstyled, toStyled: p.styled != null && t != null ? p.styled - t : null, run: r });
    });
const lines = [];
const table = (head, rows) => {
  lines.push(`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`), '');
};
const engines3 = ['chromium', 'firefox', 'webkit'];

for (const profile of ['unthrottled', 'delay300']) {
  lines.push(`### Unstyled painted frames, ${profile} (Chromium/Firefox/WebKit, median of 5)`, '');
  const sets = engines3.map((e) => data(e, profile));
  table(['Scenario', ...OPTS], ROWS.map((row) => [row[0], ...OPTS.map((o) => sets.map((s) => m(values(s, row, o, (v) => v.unstyled)))).map((c) => c.join('/'))]));
}

lines.push('### Unstyled painted frames; trigger to styled frame, slow4g4x (Chromium, medians of 5)', '');
const slow = data('chromium', 'slow4g4x');
table(['Scenario', ...OPTS], ROWS.map((row) => [row[0], ...OPTS.map((o) => `${m(values(slow, row, o, (v) => v.unstyled))}; ${m(values(slow, row, o, (v) => v.toStyled))} ms`)]));

for (const profile of ['unthrottled', 'delay300']) {
  lines.push(`### Trigger to styled frame, ms, ${profile} (Chromium/Firefox/WebKit, median of 5)`, '');
  const sets = engines3.map((e) => data(e, profile));
  table(['Scenario', ...OPTS], ROWS.map((row) => [row[0], ...OPTS.map((o) => sets.map((s) => m(values(s, row, o, (v) => v.toStyled)))).map((c) => c.join('/'))]));
}

lines.push("### Option D's window: page hydrated, app stable, prefetch done (landing page, ms, median [min-max] of 5)", '');
table(
  ['Engine, profile', 'hydrated', 'stable', 'idle callback', 'prefetch done', 'window (done - hydrated)'],
  [...engines3.flatMap((e) => ['unthrottled', 'delay300'].map((p) => [e, p])), ['chromium', 'slow4g4x']].map(([e, p]) => {
    const s1 = data(e, p).filter((r) => r.option === 'D' && r.scenario === 's1-load');

    return [`${e}, ${p}`, ms(s1.map((r) => r.times.hydrated)), ms(s1.map((r) => r.times.stable)), ms(s1.map((r) => r.times.idle)), ms(s1.map((r) => r.times.prefetched)), ms(s1.map((r) => r.times.prefetched - r.times.hydrated))];
  }),
);

lines.push('### S1 landing page: LCP, ms, median [min-max] of 5 (equal to FCP in Chromium and Firefox, where the callout text is the LCP element)', '');
table(
  ['Engine, profile', ...OPTS],
  [...engines3.flatMap((e) => ['unthrottled', 'delay300'].map((p) => [e, p])), ['chromium', 'slow4g4x']].map(([e, p]) => {
    const d = data(e, p);

    return [`${e}, ${p}`, ...OPTS.map((o) => ms(d.filter((r) => r.option === o && r.scenario === 's1-load').map((r) => r.wv.LCP?.value)))];
  }),
);

lines.push('### CLS by scenario (Chromium, web-vitals, median of 5; shifts within 500 ms of an input do not count)', '');
for (const p of ['delay300', 'slow4g4x']) {
  const d = data('chromium', p);
  table([`Scenario, ${p}`, ...OPTS], ROWS.filter((r, i) => i % 2 === 0 || r[1].startsWith('s3-view')).map((row) => [row[0], ...OPTS.map((o) => {
    const v = median(d.filter((r) => r.option === o && r.scenario === row[1]).map((r) => r.wv.CLS?.value ?? 0));

    return v == null ? '-' : v.toFixed(3);
  })]));
}

lines.push('### INP, ms, the page after its interactions (Chromium/Firefox/WebKit at delay300; Chromium at slow4g4x; median of 5)', '');
table(
  ['Scenario', ...OPTS],
  ROWS.filter((r) => r[3] != null && !r[0].startsWith('S5 menu')).map((row) => [
    row[0].replace('S5 pane, before idle', 'S5 (both clicks)'),
    ...OPTS.map((o) => {
      const at = (e, p) => m(data(e, p).filter((r) => r.option === o && r.scenario === row[1]).map((r) => r.wv.INP?.value));

      return `${engines3.map((e) => at(e, 'delay300')).join('/')}; ${at('chromium', 'slow4g4x')}`;
    }),
  ]),
);

const lh = load('lighthouse.json');

if (lh.length) {
  lines.push('### Lighthouse 13.5.0 mobile, landing page (median [min-max] of 5)', '');
  const g = (o, method) => lh.filter((r) => r.option === o && r.method === method);
  const row = (label, method, pick, digits = 0) => [label, ...OPTS.map((o) => {
    const xs = g(o, method).filter((r) => !r.error).map(pick);
    const v = median(xs);

    if (v == null) {
      return '-';
    }

    const [lo, hi] = spread(xs);
    const f = (x) => (digits ? x.toFixed(digits) : String(Math.round(x)));

    return lo === hi ? f(v) : `${f(v)} [${f(lo)}-${f(hi)}]`;
  })];
  table(['Metric', ...OPTS], [
    row('Performance score, simulate', 'simulate', (r) => r.performance * 100),
    row('FCP ms, simulate', 'simulate', (r) => r.fcp),
    row('LCP ms, simulate', 'simulate', (r) => r.lcp),
    row('TBT ms, simulate', 'simulate', (r) => r.tbt),
    row('CLS, simulate', 'simulate', (r) => r.cls, 3),
    row('Performance score, devtools', 'devtools', (r) => r.performance * 100),
    row('LCP ms, devtools', 'devtools', (r) => r.lcp),
    row('TBT ms, devtools', 'devtools', (r) => r.tbt),
    row('Performance score, provided', 'provided', (r) => r.performance * 100),
    row('LCP ms, provided', 'provided', (r) => r.lcp),
    row('Accessibility score', 'simulate', (r) => r.accessibility * 100),
    row('Transfer, bytes', 'simulate', (r) => r.bytes),
    row('Script transfer, bytes', 'simulate', (r) => r.requests.filter((q) => q.type === 'Script').reduce((s, q) => s + q.transfer, 0)),
    row('Requests', 'simulate', (r) => r.requests.length),
    row('Script parse and compile, ms, devtools', 'devtools', (r) => r.bootup.reduce((s, b) => s + (b.parse ?? 0), 0)),
    row('Main-thread work, ms, devtools', 'devtools', (r) => r.mainThread),
  ]);
}

writeFileSync(join(OUT, 'readme-tables.md'), lines.join('\n'));
console.log(lines.join('\n'));
