// Declaration-level view of compiled CSS: one entry per declaration, keyed by
// at-rule context + selector + property; value includes !important.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const postcss = require('postcss');

export function decls(css) {
  const out = [];
  const root = postcss.parse(css);
  let ruleIdx = -1;

  root.walkRules((rule) => {
    ruleIdx++;
    const ctx = [];

    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) {
      if (p.type === 'atrule') {
        ctx.unshift(`@${p.name} ${p.params}`);
      }
    }

    const ruleKey = `${ctx.join(' > ')} | ${rule.selector}`;

    rule.each((n) => {
      if (n.type === 'decl') {
        out.push({
          key: `${ruleKey} | ${n.prop}`,
          ruleKey,
          ruleIdx,
          value: n.value + (n.important ? '!important' : ''),
          bytes: Buffer.byteLength(`${n.prop}:${n.value}${n.important ? '!important' : ''};`),
        });
      }
    });
  });

  return out;
}

// Indices of default declarations with no matching (key, value) in the run (multiset match).
export function unmatched(def, run) {
  const pool = new Map();

  for (const d of run) {
    const k = `${d.key}\u0000${d.value}`;
    pool.set(k, (pool.get(k) ?? 0) + 1);
  }

  const miss = [];

  def.forEach((d, i) => {
    const k = `${d.key}\u0000${d.value}`;
    const c = pool.get(k) ?? 0;

    if (c > 0) {
      pool.set(k, c - 1);
    } else {
      miss.push(i);
    }
  });

  return miss;
}

if (process.argv[1]?.endsWith('decls.mjs')) {
  const a = decls('@media print,screen and (min-width:40em){.a,.b{color:red;margin:0 auto!important}}.a{color:red}.a{color:red}');
  const b = decls('.a{color:red}@media print,screen and (min-width:40em){.a,.b{color:blue;margin:0 auto!important}}');
  console.assert(a.length === 4, 'count');
  const miss = unmatched(a, b);
  console.assert(JSON.stringify(miss) === '[0,3]', 'miss ' + JSON.stringify(miss));
  console.log('decls self-check ok', miss);
}
