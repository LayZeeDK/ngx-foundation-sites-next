// PROTOTYPE 197: prints medians and ranges from out/probe-{d,e,g}-<engine>.json.
// Usage: [OUT=out/seq] node measure/summarize.mjs > results/summary.txt
import { existsSync, readFileSync } from 'node:fs';

const engines = ['chromium', 'firefox', 'webkit'];
const DIR = process.env.OUT ?? 'out';
const load = (p, e) => (existsSync(`${DIR}/probe-${p}-${e}.json`) ? JSON.parse(readFileSync(`${DIR}/probe-${p}-${e}.json`, 'utf8')) : null);
const med = (xs) => {
  const v = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b);

  if (!v.length) {
    return 'n/a';
  }

  const m = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;

  return `${+m.toFixed(2)} [${+v[0].toFixed(2)}-${+v.at(-1).toFixed(2)}]`;
};
const uniq = (xs) => [...new Set(xs.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))))].join(' | ');

console.log('# D: client-only @defer, family CSS delayed 300 ms. median [min-max] over runs');

for (const e of engines) {
  const d = load('d', e);

  if (!d) {
    continue;
  }

  console.log(`\n## ${e} (${d.runs} runs)`);

  for (const [label, rs] of Object.entries(d.clientDefer)) {
    console.log(
      `${label.padEnd(12)} visible unstyled frames ${med(rs.map((r) => r.visibleUnstyledFrames))}; invisible frames ${med(rs.map((r) => r.invisibleFrames))};` +
        ` ms to first styled visible frame ${med(rs.map((r) => r.msToFirstStyledVisibleFrame))}; #after top ${uniq(rs.map((r) => r.afterTop))};` +
        ` #after moves while present ${uniq(rs.map((r) => r.afterMovesWhileElementPresent))};` +
        ` layout shift ${rs[0].layoutShift ? `${med(rs.map((r) => r.layoutShift.afterClickTotal))} (counted towards CLS ${med(rs.map((r) => r.layoutShift.countedTowardsCls))})` : 'API n/a'};` +
        ` focus() at insertion -> ${uniq(rs.map((r) => r.focus.atInsert))}, after load -> ${uniq(rs.map((r) => r.focus.activeAfterLoad))}`,
    );
  }

  console.log('enter:');

  for (const [label, rs] of Object.entries(d.enter)) {
    console.log(
      `  ${label.padEnd(20)} ${uniq(rs.map((r) => r.verdict))}; animation starts ms ${med(rs.map((r) => r.animationStartMs))}; styled ms ${med(rs.map((r) => r.styledAfterMs))};` +
        ` animated frames ${med(rs.map((r) => r.animatedFrames))}; visible unstyled ${med(rs.map((r) => r.visibleUnstyledFrames))}; invisible ${med(rs.map((r) => r.invisibleFrames))};` +
        ` styled frames before the animation ${uniq(rs.map((r) => r.styledFramesBeforeAnimation))}`,
    );
  }

  for (const [label, a] of Object.entries(d.a11y)) {
    console.log(
      `a11y ${label}: gap state ${a.gap.stateBefore} -> ${a.gap.stateAfterChecks}; axe during gap: ${a.gap.axeViolations}; after load (${a.loaded.state}): ${a.loaded.axeViolations}`,
    );
    console.log(`  tree during gap: ${a.gap.tree.replace(/\n/g, ' / ')}`);
    console.log(`  tree after load: ${a.loaded.tree.replace(/\n/g, ' / ')}`);
  }
}

console.log('\n# E: file-loader <link>');

for (const e of engines) {
  const x = load('e', e);

  if (!x) {
    continue;
  }

  console.log(`\n## ${e}`);

  for (const [b, u] of Object.entries(x.urls)) {
    console.log(
      `${b.padEnd(10)} settings ${x.settings[b].pass ? 'pass' : 'FAIL'}; server hrefs ${u.serverHrefs}; client-inserted ${u.clientHref} (${u.clientInsertedPadding}); failed ${u.failed.length ? u.failed.join(', ') : 'none'}`,
    );
    console.log(`           ssr responses: ${u.ssrCssResponses.join(' ; ')}`);
  }

  console.log(`cache bust: ${JSON.stringify(x.cacheBust)}`);

  for (const k of ['file', 'link']) {
    const s = x.ssr[k];
    console.log(
      `${k}: lifecycle ${x.lifecycle[k].counts} (${x.lifecycle[k].pass ? 'pass' : 'FAIL'}); ssr elements ${s.serverElements}; inlined family rules ${s.inlinedCriticalHasFamilyRules};` +
        ` noJs ${JSON.stringify(s.noJs)}; mutations after DCL ${s.styleMutationsAfterDcl.length}; unstyled ${s.unstyledFrames}/${s.framesSampled}; m7 ${JSON.stringify(s.m7)}`,
    );
    console.log(`  hydrate-defer ${JSON.stringify(x.hydrateDefer[k])}`);
    console.log(`  leave ${JSON.stringify(x.leave[k])}`);
  }
}

console.log('\n# G: churn, 20 cycles of 100 ms shown / 100 ms hidden over 3,000 elements. median [min-max]');

for (const e of engines) {
  const g = load('g', e);

  if (!g) {
    continue;
  }

  console.log(`\n## ${e} (${g.runs} runs)`);

  for (const [label, rs] of Object.entries(g.results)) {
    console.log(
      `${label.padEnd(30)} inserts ${med(rs.map((r) => r.headInserts))}, removes ${med(rs.map((r) => r.headRemoves))}, disabled toggles ${med(rs.map((r) => r.disabledToggles))},` +
        ` sheet loads ${med(rs.map((r) => r.sheetLoadEvents))}, css requests ${med(rs.map((r) => r.cssRequests))}; forced flush ms ${med(rs.map((r) => r.forcedFlushMs))};` +
        (rs[0].chromium ? ` recalc ms ${med(rs.map((r) => r.chromium.recalcStyleMs))} (count ${med(rs.map((r) => r.chromium.recalcStyleCount))}), layout ms ${med(rs.map((r) => r.chromium.layoutMs))};` : '') +
        ` unstyled frames ${uniq(rs.map((r) => r.unstyledFrames))}; just after last ${uniq(rs.map((r) => r.justAfterLast))}; after 1.5 s ${uniq(rs.map((r) => r.after1500ms))}; re-acquired ${uniq(rs.map((r) => r.reacquiredPadding))}`,
    );
  }
}
