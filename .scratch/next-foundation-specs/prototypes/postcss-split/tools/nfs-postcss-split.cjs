// PROTOTYPE of a library-shipped PostCSS plugin (ticket 195), loaded by @angular/build from postcss.config.json.
// For every `@layer nfs.<family>.theme { ... }` block in a stylesheet, it removes the declarations that the
// library's structure sheet already carries (191's invariant list: same at-rule context, selector, property,
// value, counted as a multiset). Stylesheets without such a layer pass through untouched, so the consumer's
// own sheets, Tailwind's, and the reference build's single compile are not changed.
//
// Option `adoptUnlayered` (default true): rules Sass placed outside the family layer in a family sheet
// (Foundation's `%reveal-centered` placeholder is extended at import time, so Sass writes the extended rule
// before the layer) are moved to the start of the family's theme layer, where Foundation's source order has them.
//
// Prototype switches (environment): NFS_SPLIT=off passes everything through; NFS_SPLIT_ADOPT=off turns
// adoption off; NFS_SPLIT_LOG=<file> appends one JSON line per family sheet with what was removed;
// NFS_SPLIT_DUMP=<dir> writes each family sheet as the plugin received it.
const fs = require('node:fs');
const path = require('node:path');

// Sass's `expanded` output breaks and indents selector lists by nesting depth (the family layer adds a level),
// so keys are compared with whitespace collapsed on both sides.
const norm = (k) => k.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',');

const plugin = (opts = {}) => {
  const listFile = path.resolve(opts.invariant ?? path.join(__dirname, 'nfs-invariant.json'));
  const invariant = JSON.parse(fs.readFileSync(listFile, 'utf8'));
  const off = process.env.NFS_SPLIT === 'off';
  const adopt = process.env.NFS_SPLIT_ADOPT === 'off' ? false : opts.adoptUnlayered !== false;
  const log = process.env.NFS_SPLIT_LOG;

  return {
    postcssPlugin: 'nfs-split',
    Once(root, { result }) {
      if (off) {
        return;
      }

      const layers = [];

      root.walkAtRules('layer', (a) => {
        const m = /^nfs\.([\w-]+)\.theme$/.exec(a.params.trim());

        if (m && a.nodes) {
          layers.push([m[1], a]);
        }
      });

      if (process.env.NFS_SPLIT_DUMP) {
        fs.writeFileSync(path.join(process.env.NFS_SPLIT_DUMP, `${layers[0][0]}.css`), root.toString());
      }

      for (const [family, layer] of layers) {
        const keys = invariant[family];

        if (!keys) {
          result.warn(`nfs-split: no invariant list for family "${family}"`, { node: layer });
          continue;
        }

        let adopted = 0;

        if (adopt && layer.parent === root) {
          const outside = root.nodes.filter(
            (n) => n !== layer && (n.type === 'rule' || (n.type === 'atrule' && n.nodes && n.name !== 'layer')),
          );

          for (const n of outside.reverse()) {
            layer.prepend(n);
            adopted++;
          }
        }

        const pool = new Map();

        for (const k of keys) {
          pool.set(norm(k), (pool.get(norm(k)) ?? 0) + 1);
        }

        const before = layer.toString().length;
        let removed = 0;

        layer.walkRules((rule) => {
          const ctx = [];

          for (let p = rule.parent; p && p !== layer; p = p.parent) {
            if (p.type === 'atrule') {
              ctx.unshift(`@${p.name} ${p.params}`);
            }
          }

          rule.each((n) => {
            if (n.type !== 'decl') {
              return;
            }

            const k = norm(`${ctx.join(' > ')} | ${rule.selector} | ${n.prop}\u0000${n.value}${n.important ? '!important' : ''}`);

            if (pool.get(k) > 0) {
              pool.set(k, pool.get(k) - 1);
              n.remove();
              removed++;
            }
          });

          if (!rule.nodes.some((n) => n.type === 'decl')) {
            rule.remove();
          }
        });

        layer.walkAtRules((a) => {
          if (a.nodes && !a.nodes.some((n) => n.type !== 'comment')) {
            a.remove();
          }
        });

        if (log) {
          fs.appendFileSync(
            log,
            JSON.stringify({
              file: root.source?.input.file,
              family,
              expected: keys.length,
              removed,
              adopted,
              bytesBefore: before,
              bytesAfter: layer.toString().length,
              unmatched: [...pool].filter(([, c]) => c > 0).map(([k]) => k.replace('\u0000', ' = ')),
            }) + '\n',
          );
        }
      }
    },
  };
};

plugin.postcss = true;
module.exports = plugin;
