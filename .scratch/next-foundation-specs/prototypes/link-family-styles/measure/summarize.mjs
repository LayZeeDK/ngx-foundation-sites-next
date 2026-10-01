// PROTOTYPE: one line per result, from out/results-<engine>.json.
import { readFileSync, existsSync } from 'node:fs';

for (const e of ['chromium', 'firefox', 'webkit']) {
  const file = new URL(`../out/results-${e}.json`, import.meta.url);

  if (!existsSync(file)) {
    continue;
  }

  const r = JSON.parse(readFileSync(file, 'utf8'))[e];

  if (!r) {
    continue;
  }

  const p = (k, v) => console.log(`${e} | ${k} | ${JSON.stringify(v)}`);
  for (const [k, v] of Object.entries(r.m1)) p(`m1 ${k}`, v.pass);
  for (const k of ['m2', 'm2_single', 'm2_plugin']) p(k, r[k]);
  for (const k of ['ssr', 'ssr_holdOff', 'ssr_noskip', 'ssr_plugin']) {
    const s = { ...r[k], styleMutationsAfterDcl: r[k].styleMutationsAfterDcl.map((m) => `${m.kind}:${m.text}`) };
    p(k, s);
  }
  for (const [k, v] of Object.entries(r.clientDefer)) p(`defer ${k}`, v);
  for (const [k, v] of Object.entries(r.enter)) p(`enter ${k}`, v);
  for (const [k, v] of Object.entries(r.hydrateDefer)) p(`hydrate-defer ${k}`, v);
  for (const [b, o] of Object.entries(r.m4)) for (const [k, v] of Object.entries(o)) p(`m4 ${b} ${k}`, v);
  for (const [k, v] of Object.entries(r.m6)) p(`m6 ${k}`, v);
  for (const [k, v] of Object.entries(r.urls)) p(`url ${k}`, v);
  p('cost', r.cost);
}
