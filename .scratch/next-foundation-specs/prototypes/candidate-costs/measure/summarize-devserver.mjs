// PROTOTYPE 198: point 1 table, median (min-max).
import { existsSync, readFileSync } from 'node:fs';

const OUT = 'D:/tmp/nfs-proto-198-189/out-198';
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;

  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const fmt = (xs, d = 0) => (xs.length ? `${median(xs).toFixed(d)} (${Math.min(...xs).toFixed(d)}-${Math.max(...xs).toFixed(d)})` : '-');

console.log('| Candidate | Cold start to first SSR response, ms | Warm start, ms | First bundle, s (cold) | Settings edit: shown / reload / ms (Chromium) | Settings rebuild, s | Component edit: reload / ms (Chromium) | Component rebuild, s | Firefox, WebKit |');
console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');

for (const name of ['baseline', 'own', 'link', 'chunk']) {
  if (!existsSync(`${OUT}/devserver-${name}.json`)) {
    continue;
  }

  const r = JSON.parse(readFileSync(`${OUT}/devserver-${name}.json`, 'utf8'));
  const edits = r.edits.filter((e) => e.edit);
  const of = (engine, edit) => edits.filter((e) => e.engine === engine && e.edit === edit);
  const s = of('chromium', 'settings');
  const c = of('chromium', 'component');
  const shown = `${s.filter((e) => e.shown).length}/${s.length}`;
  const reload = `${s.filter((e) => e.reloaded).length}/${s.length}`;
  const others = ['firefox', 'webkit']
    .map((e) => {
      const se = of(e, 'settings')[0];
      const co = of(e, 'component')[0];

      return `${e}: settings ${se.shown ? (se.reloaded ? 'reload' : 'HMR') : 'not shown'} ${se.ms ?? '-'} ms, component ${co.reloaded ? 'reload' : 'HMR'} ${co.ms} ms`;
    })
    .join('; ');
  console.log(
    `| ${name} | ${fmt(r.cold.map((x) => x.readyMs))} | ${fmt(r.warm.map((x) => x.readyMs))} | ${fmt(r.cold.map((x) => x.bundleSeconds[0]), 2)} | ${shown} / ${reload} / ${fmt(s.filter((e) => e.shown && e.ms > 50).map((e) => e.ms))} | ${fmt(s.flatMap((e) => e.rebuildSeconds), 2)} | ${c.filter((e) => e.reloaded).length}/${c.length} / ${fmt(c.map((e) => e.ms))} | ${fmt(c.flatMap((e) => e.rebuildSeconds), 2)} | ${others} |`,
  );
}
