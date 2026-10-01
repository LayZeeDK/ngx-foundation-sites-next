// PROTOTYPE generator (ticket 195). Writes, from 191's measurement and Foundation's own Sass:
//  - tools/nfs-invariant.json: per family, the invariant declaration keys in the form the consumer's
//    Angular build hands to PostCSS (Dart Sass `expanded`, @angular/build sass-language.js:162);
//  - libs/structure/: the "library" (ng-packagr source) with one component per family whose styles are
//    191's invariant sheet in `@layer nfs.<f>.structure`;
//  - apps/fixture/src/nfs-families/: the consumer's carriers, each family in `@layer nfs.<f>.theme`;
//  - apps/fixture/src/styles*.scss: split, reference (Foundation's single compile), badorder;
//  - apps/fixture/src/app/markup.ts: every html example of the families' Foundation doc pages.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { decls } from './decls.mjs';

const require = createRequire(import.meta.url);
const sass = require('sass');
const WS = 'D:/tmp/nfs-proto-195';
const FDN = `${WS}/node_modules/foundation-sites/scss`;
const F191 = 'D:/tmp/f191';
const DOCS = 'd:/projects/github/foundation/foundation-sites/docs/pages';
const APP = `${WS}/apps/fixture/src`;

// Foundation's order: forms first (as in foundation-everything), the three form elements that
// foundation-everything leaves out right after it, then foundation-everything's component order.
export const FAMILIES = [
  'forms', 'range-input', 'progress-element', 'meter-element',
  'button', 'button-group', 'close-button', 'label', 'progress-bar', 'slider', 'switch', 'table',
  'badge', 'breadcrumbs', 'callout', 'card', 'dropdown', 'pagination', 'tooltip',
  'accordion', 'media-object', 'orbit', 'responsive-embed', 'tabs', 'thumbnail',
  'menu', 'menu-icon', 'accordion-menu', 'drilldown-menu', 'dropdown-menu',
  'off-canvas', 'reveal', 'sticky', 'title-bar', 'top-bar',
];

const SILENCE = ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function', 'mixed-decls'];

function compile(src, style) {
  return sass.compileString(src, {
    loadPaths: [FDN],
    style,
    silenceDeprecations: SILENCE,
    logger: { warn() {}, debug() {} },
  }).css;
}

// 1. Invariant keys, mapped by index from 191's compressed default compile to the expanded one.
const summary = JSON.parse(fs.readFileSync(`${F191}/summary.json`, 'utf8'));
const invariant = {};
let total = 0;

for (const f of FAMILIES) {
  const m = `foundation-${f}`;
  const src = `@import 'settings/settings';\n@import 'foundation';\n@include ${m};\n`;
  const compressed = compile(src, 'compressed').replace(/^\uFEFF/, '');
  const ref191 = fs.readFileSync(`${F191}/out-default/${m}.css`, 'utf8').replace(/^\uFEFF/, '');

  if (compressed !== ref191) {
    throw new Error(`${m}: standalone compressed compile differs from 191's default output`);
  }

  const c = decls(compressed);
  const e = decls(compile(src, 'expanded'));

  if (c.length !== e.length || c.some((d, i) => d.key.split(' | ').pop() !== e[i].key.split(' | ').pop())) {
    throw new Error(`${m}: expanded and compressed declarations do not line up`);
  }

  const dep = new Set(summary.rows.find((r) => r.mixin === m).depIdx);
  invariant[f] = e.filter((_, i) => !dep.has(i)).map((d) => `${d.key}\u0000${d.value}`);
  total += invariant[f].length;
}

if (total !== 623) {
  throw new Error(`expected 623 invariant declarations, got ${total}`);
}

fs.writeFileSync(`${WS}/tools/nfs-invariant.json`, JSON.stringify(invariant));

// 2. The library: one None-encapsulated component per family carrying 191's invariant sheet.
// `libs/structure` puts it in `@layer nfs.<f>.structure`; `libs/structure-same` (a variant) in the
// consumer's own `@layer nfs.<f>.theme`, so specificity and insertion order decide between the two sheets.
const pascal = (f) => f.replace(/(^|-)(\w)/g, (_, __, ch) => ch.toUpperCase());
const LIBS = [
  ['structure', 'structure', '@nfs-proto/structure'],
  ['structure-same', 'theme', '@nfs-proto/structure-same'],
];

for (const [dir, sub, pkg] of LIBS) {
  const LIB = `${WS}/libs/${dir}`;
  fs.mkdirSync(`${LIB}/src/lib`, { recursive: true });

  for (const f of FAMILIES) {
    const css = fs.readFileSync(`${F191}/invariant/foundation-${f}.css`, 'utf8').replace(/^﻿/, '');
    fs.writeFileSync(`${LIB}/src/lib/${f}.css`, `@layer nfs.${f}.${sub}{${css}}\n`);
    fs.writeFileSync(
      `${LIB}/src/lib/${f}.ts`,
      [
        `import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';`,
        ``,
        `/** Library-owned structure sheet of ${f}: Foundation's default compile, only the invariant declarations. */`,
        `@Component({`,
        `  selector: 'nfs-${f}-structure',`,
        `  template: '',`,
        `  styleUrl: './${f}.css',`,
        `  encapsulation: ViewEncapsulation.None,`,
        `  changeDetection: ChangeDetectionStrategy.OnPush,`,
        `})`,
        `export class Nfs${pascal(f)}Structure {}`,
        ``,
      ].join('\n'),
    );
  }

  fs.writeFileSync(
    `${LIB}/src/public-api.ts`,
    [
      `import { Type } from '@angular/core';`,
      ...FAMILIES.map((f) => `import { Nfs${pascal(f)}Structure } from './lib/${f}';`),
      ``,
      `/** Family name -> library-owned structure carrier. */`,
      `export const nfsStructureCarriers: Readonly<Record<string, Type<unknown>>> = {`,
      ...FAMILIES.map((f) => `  '${f}': Nfs${pascal(f)}Structure,`),
      `};`,
      ``,
    ].join('\n'),
  );

  if (dir !== 'structure') {
    for (const file of ['ng-package.json', 'package.json', 'tsconfig.lib.json']) {
      const text = fs.readFileSync(`${WS}/libs/structure/${file}`, 'utf8');
      fs.writeFileSync(`${LIB}/${file}`, text.replace('dist/libs/structure', `dist/libs/${dir}`).replace('@nfs-proto/structure', pkg));
    }
  }
}

// 3. Consumer carriers (a generator could write them), in the family's theme sublayer.
fs.mkdirSync(`${APP}/nfs-families`, { recursive: true });

for (const f of FAMILIES) {
  fs.writeFileSync(
    `${APP}/nfs-families/${f}.scss`,
    `// CONSUMER FILE (a generator could write it). Compiled by the consumer's build with their settings.
@import 'settings';
@import 'foundation-sites/scss/foundation';
@layer nfs.${f}.theme {
  @include foundation-${f};
}
`,
  );
  fs.writeFileSync(
    `${APP}/nfs-families/${f}.ts`,
    `// CONSUMER FILE (a generator could write it): the hidden carrier of one family's theme part.
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'nfs-${f}-styles',
  template: '',
  styleUrl: './${f}.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Styles {}
`,
  );
}

fs.writeFileSync(
  `${APP}/nfs-families/carriers.ts`,
  `// CONSUMER FILE (a generator could write it): family name -> lazily loaded carrier.
import { NfsFamilyCarriers } from '../lib/family-styles';

export const carriers: NfsFamilyCarriers = {
${FAMILIES.map((f) => `  '${f}': () => import('./${f}'),`).join('\n')}
};
`,
);
fs.writeFileSync(
  `${APP}/nfs-families/carriers.reference.ts`,
  `// PROTOTYPE: the reference build loads no carriers; styles.reference.scss has Foundation's single compile.
import { NfsFamilyCarriers } from '../lib/family-styles';

export const carriers: NfsFamilyCarriers = {};
`,
);

// 4. Global stylesheets.
const order = (first, second) =>
  `@layer nfs.global, ${FAMILIES.map((f) => `nfs.${f}.${first}, nfs.${f}.${second}`).join(', ')};`;
const head = `@import 'settings';\n`;
fs.writeFileSync(
  `${APP}/styles.scss`,
  `// CONSUMER FILE. The layer order first (theme before structure in each family, 191 section 5),
// then Foundation's global styles in the first layer. Every family comes from its carrier.
${head}${order('theme', 'structure')}
@import 'foundation-sites/scss/foundation';
@layer nfs.global {
  @include foundation-global-styles;
}
`,
);
fs.writeFileSync(
  `${APP}/styles.badorder.scss`,
  `// PROTOTYPE negative control: structure before theme in every family.
${head}${order('structure', 'theme')}
@import 'foundation-sites/scss/foundation';
@layer nfs.global {
  @include foundation-global-styles;
}
`,
);
fs.writeFileSync(
  `${APP}/styles.reference.scss`,
  `// PROTOTYPE reference: Foundation's single compile of every first-milestone family, unlayered,
// with the consumer's settings. No PostCSS plugin matches it (it has no nfs.<family>.theme layer).
${head}@import 'foundation-sites/scss/foundation';
@include foundation-global-styles;
${FAMILIES.map((f) => `@include foundation-${f};`).join('\n')}
`,
);

// 5. Markup: every html example of each family's doc page, plus the kitchen sink and 191's button matrix.
const PAGES = {
  forms: ['forms'], 'range-input': ['slider'], 'progress-element': ['progress-bar'], 'meter-element': [],
  'menu-icon': ['responsive-navigation'], 'title-bar': [],
};
const markup = {};

const clean = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\{\{[\s\S]*?\}\}/g, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '<div class="iframe-stub"></div>')
    .replace(/\s(src|srcset|poster)="[^"]*"/gi, ' $1="data:image/gif;base64,R0lGODlhAQABAAAAACw="');

function examples(page) {
  const text = fs.readFileSync(path.join(DOCS, `${page}.md`), 'utf8');

  return [...text.matchAll(/^```html(?:_example)?\s*\n([\s\S]*?)^```/gm)].map((m) => clean(m[1]));
}

for (const f of FAMILIES) {
  const pages = PAGES[f] ?? [f];
  markup[f] = pages.flatMap(examples).join('\n');
}

const buttons = [];

for (const color of ['', 'primary', 'secondary', 'success', 'warning', 'alert']) {
  for (const fill of ['', 'hollow', 'clear']) {
    for (const dis of ['', 'class', 'attr']) {
      const cls = ['button', color, fill, dis === 'class' ? 'disabled' : ''].filter(Boolean).join(' ');
      buttons.push(`<button class="${cls}"${dis === 'attr' ? ' disabled' : ''}>B</button>`);
    }
  }
}

markup['button'] += '\n' + buttons.join('') + '<a class="button dropdown">D</a><a class="button small expanded">E</a>';
markup['meter-element'] = '<meter value="0.3">30%</meter><meter low="0.33" high="0.66" optimum="0.5" value="0.8">80%</meter>';
markup['kitchen-sink'] = examples('kitchen-sink').join('\n');

fs.writeFileSync(
  `${APP}/app/markup.ts`,
  `// GENERATED by tools/gen.mjs from Foundation 6.9.0's docs pages.\nexport const markup: Record<string, string> = ${JSON.stringify(markup, null, 1)};\n`,
);

console.log('invariant declarations', total, '| markup bytes', JSON.stringify(markup).length);
console.log(Object.entries(markup).map(([k, v]) => `${k}:${v.length}`).join(' '));
