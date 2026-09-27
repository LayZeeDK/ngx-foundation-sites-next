// Prints BCD support for the given keys (read-only use of the dossier's BCD 8.1.3 tarball) and
// web-features status for the given feature ids.
import { readFileSync } from 'node:fs';

const root = 'D:/tmp/nfs-decision-slider-vertical/data/';
const bcd = JSON.parse(readFileSync(root + 'bcd/package/data.json', 'utf8'));
const wf = JSON.parse(readFileSync(root + 'wf/package/data.json', 'utf8'));

function get(path) {
  return path.split('.').reduce((o, k) => o?.[k], bcd);
}

const keys = [
  'css.types.color.light-dark',
  'css.types.round',
  'css.properties.writing-mode.sideways-lr',
  'css.properties.writing-mode.vertical_oriented_form_controls',
  'html.elements.input.type_range.vertical_orientation',
  'css.properties.direction.vertical_slider_direction',
  'css.properties.container-type',
  'css.types.length.cqh',
];

for (const key of keys) {
  const node = get(key);
  const s = node?.__compat?.support ?? {};
  const out = {};

  for (const b of ['chrome', 'edge', 'firefox', 'safari', 'safari_ios', 'chrome_android', 'firefox_android']) {
    const v = Array.isArray(s[b]) ? s[b] : [s[b]];
    out[b] = v
      .filter(Boolean)
      .map((x) => `${x.version_added}${x.version_removed ? '-' + x.version_removed : ''}${x.partial_implementation ? ' partial' : ''}${x.flags ? ' flags' : ''}${x.prefix ? ' prefix ' + x.prefix : ''}${x.alternative_name ? ' alt ' + x.alternative_name : ''}`)
      .join(' | ');
  }

  console.log(key, node ? JSON.stringify(out) : 'MISSING');
}

for (const id of ['light-dark', 'stepped-value-functions', 'writing-mode', 'vertical-form-controls', 'container-queries']) {
  const f = wf.features[id];
  console.log('wf', id, f ? JSON.stringify(f.status) : 'MISSING');
}
