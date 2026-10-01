// PROTOTYPE 198: point 4 tables (median and range over the reps), engines side by side.
// Usage: node measure-198/summarize-bench.mjs
import { existsSync, readFileSync } from 'node:fs';

const OUT = 'D:/tmp/nfs-proto-198-189/out-198';
const engines = ['chromium', 'firefox', 'webkit'].filter((e) => existsSync(`${OUT}/bench-${e}.json`));
const rows = engines.flatMap((e) => JSON.parse(readFileSync(`${OUT}/bench-${e}.json`, 'utf8')));
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;

  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const fmt = (xs, digits = 0) => {
  const v = xs.filter((x) => typeof x === 'number' && !Number.isNaN(x));

  if (v.length === 0) {
    return '-';
  }

  return `${median(v).toFixed(digits)} (${Math.min(...v).toFixed(digits)}-${Math.max(...v).toFixed(digits)})`;
};
const pick = (engine, candidate, n, mode) =>
  rows.filter((r) => r.engine === engine && r.candidate === candidate && r.n === n && r.mode === mode);
const candidates = ['own', 'link', 'chunk'];
const modes = ['none', 'warm', 'cold', 'leave-none', 'leave'];

for (const n of [1000, 5000]) {
  console.log(`\n### ${n} hosts: insert and remove, ms, median (min-max) of ${pick('chromium', 'own', n, 'none').length}`);
  console.log('\n| Candidate | Mode | Engine | Insert (2 frames) | Styled | Remove (2 frames) | Left / unloaded | Longest frame, insert / remove |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- |');

  for (const c of candidates) {
    for (const m of modes) {
      for (const e of engines) {
        const r = pick(e, c, n, m);

        if (!r.length) {
          continue;
        }

        const left = r[0].leftMs !== undefined || r[0].unloadedMs !== undefined
          ? `${fmt(r.map((x) => x.leftMs))} / ${fmt(r.map((x) => x.unloadedMs))}`
          : '-';
        console.log(
          `| ${c} | ${m} | ${e} | ${fmt(r.map((x) => x.insertMs))} | ${fmt(r.map((x) => x.styledMs))} | ${fmt(r.map((x) => x.removeMs))} | ${left} | ${fmt(r.map((x) => x.insertMaxFrameMs))} / ${fmt(r.map((x) => x.removeMaxFrameMs))} |`,
        );
      }
    }
  }

  console.log(`\n### ${n} hosts: the library's own work during the remove, ms, all engines`);
  console.log('\n| Candidate | Mode | Engine | release() total | frame checks (calls, total) | MutationObserver (calls, total, max) | acquire() total at insert |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');

  for (const c of candidates) {
    for (const m of modes.filter((x) => !x.includes('none'))) {
      for (const e of engines) {
        const r = pick(e, c, n, m);
        const s = (k) => r.map((x) => x.removeStats[k] ?? 0);
        console.log(
          `| ${c} | ${m} | ${e} | ${fmt(s('releaseMs'))} | ${fmt(s('frameCheckCalls'))}, ${fmt(s('frameCheckMs'))} | ${fmt(s('moCalls'))}, ${fmt(s('moMs'), 1)}, ${fmt(s('moMaxMs'), 1)} | ${fmt(r.map((x) => x.insertStats.acquireMs ?? 0), 1)} |`,
        );
      }
    }
  }

  if (engines.includes('chromium')) {
    console.log(`\n### ${n} hosts: Chromium only (CDP), median (min-max)`);
    console.log('\n| Candidate | Mode | Style recalc, insert / remove (ms) | Recalc count, insert / remove | Heap with hosts, KB over before | Heap after remove, KB over before | Long tasks, insert / remove (ms each, median of the longest) |');
    console.log('| --- | --- | --- | --- | --- | --- | --- |');

    for (const c of candidates) {
      for (const m of modes) {
        const r = pick('chromium', c, n, m);
        const longest = (k) => r.map((x) => Math.max(0, ...(x[k] ?? [])));
        console.log(
          `| ${c} | ${m} | ${fmt(r.map((x) => x.insertCdp.RecalcStyleDuration * 1000), 1)} / ${fmt(r.map((x) => x.removeCdp.RecalcStyleDuration * 1000), 1)} | ${fmt(r.map((x) => x.insertCdp.RecalcStyleCount))} / ${fmt(r.map((x) => x.removeCdp.RecalcStyleCount))} | ${fmt(r.map((x) => (x.heapWith - x.heapBefore) / 1024))} | ${fmt(r.map((x) => (x.heapAfter - x.heapBefore) / 1024))} | ${fmt(longest('insertLongTasks'))} / ${fmt(longest('removeLongTasks'))} |`,
        );
      }
    }
  }

  console.log(`\n### ${n} hosts: server-rendered hosts, hold scan at hydration (ms) and server response`);
  console.log('\n| Candidate | Server renders | Engine | Hold scan | Hosts scanned | TTFB | load | HTML bytes |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- |');

  for (const c of candidates) {
    for (const m of ['ssr-plain', 'ssr-loader']) {
      for (const e of engines) {
        const r = pick(e, c, n, m);
        console.log(
          `| ${c} | ${m.slice(4)} | ${e} | ${fmt(r.map((x) => x.holdMs), 1)} | ${r[0]?.holdHosts} | ${fmt(r.map((x) => x.ttfb))} | ${fmt(r.map((x) => x.load))} | ${r[0]?.htmlBytes} |`,
        );
      }
    }
  }
}
