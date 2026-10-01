// PROTOTYPE: measurement 9. Does layering keep Foundation's look?
// Compares every computed property of every element of the /ssr page between Foundation's own
// unlayered cascade (reference) and three layered arrangements, in all three engines.
import { chromium, firefox, webkit } from 'playwright';
import * as sass from 'sass';
import { writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const loadPaths = [
  new URL('apps/fixture/src/foundation-settings-unlayered/', root),
  new URL('node_modules/', root),
].map((u) => u.pathname.replace(/^\/([A-Z]:)/, '$1'));
const compile = (body) =>
  sass.compileString(`@import 'settings';@import 'foundation-sites/scss/foundation';${body}`, {
    loadPaths,
    style: 'compressed',
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
  }).css;
const families = ['button', 'callout', 'menu', 'dropdown-menu'];
const layer = (name, mixin) => `@layer nfs.${name}{@include ${mixin};}`;
const familyLayers = families.map((f) => layer(f, `foundation-${f}`)).join('');
const variants = {
  reference: compile(
    ['global-styles', 'forms', ...families].map((m) => `@include foundation-${m};`).join(''),
  ),
  'families layered, global and forms unlayered': compile(
    `@layer ${families.map((f) => `nfs.${f}`).join(',')};` +
      '@include foundation-global-styles;@include foundation-forms;' +
      familyLayers,
  ),
  'global and forms in the first layers (the app)': compile(
    `@layer nfs.global,nfs.forms,${families.map((f) => `nfs.${f}`).join(',')};` +
      layer('global', 'foundation-global-styles') +
      layer('forms', 'foundation-forms') +
      familyLayers,
  ),
};

const html = await (await fetch('http://localhost:4611/ssr')).text();
const markup = html.match(/<nfs-ssr-page[\s\S]*<\/nfs-ssr-page>/)[0];

function snapshot() {
  const els = [...document.querySelector('nfs-ssr-page').querySelectorAll('*')];

  return els.map((el) => {
    const cs = getComputedStyle(el);
    const o = { el: el.id || el.tagName.toLowerCase() };

    for (let i = 0; i < cs.length; i++) {
      o[cs[i]] = cs.getPropertyValue(cs[i]);
    }

    return o;
  });
}

function diff(a, b) {
  const out = [];
  a.forEach((row, i) => {
    for (const k of Object.keys(row)) {
      if (k !== 'el' && row[k] !== b[i][k]) {
        out.push(`${row.el} ${k}: ${row[k]} -> ${b[i][k]}`);
      }
    }
  });

  return out;
}

const results = {};

for (const [name, type] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await type.launch();
  const page = await browser.newPage();
  const snaps = {};

  for (const [v, css] of Object.entries(variants)) {
    await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body>${markup}</body></html>`);
    snaps[v] = await page.evaluate(snapshot);
  }

  await page.goto('http://localhost:4611/ssr');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  snaps['the running app (lazy carriers, SSR + hydration)'] = await page.evaluate(snapshot);
  await browser.close();
  results[name] = {};

  for (const v of Object.keys(snaps).filter((k) => k !== 'reference')) {
    const d = diff(snaps.reference, snaps[v]);
    results[name][v] = {
      differences: d.length,
      elements: [...new Set(d.map((x) => x.split(' ')[0]))],
      properties: [...new Set(d.map((x) => x.split(' ')[1].replace(':', '')))].length,
      examples: d.filter((x) => !/block-|inline-|border-(bottom|top|left|right)-(color|style|width)/.test(x)).slice(0, 12),
    };
  }
}

writeFileSync(new URL('out/look.json', root), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
