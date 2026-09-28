// Writes the ticket's test cases into ws/src/app/cases, each once with an inline template and once with an
// external templateUrl, plus shared files and expected.json (element-level reports each check should give).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'ws/src/app/cases');
rmSync(dir, { recursive: true, force: true });
mkdirSync(join(dir, 'shared'), { recursive: true });

const ACCORDION = `<div nfsAccordion>
  <div nfsAccordionItem>
    <button nfsAccordionTitle type="button">Section 1</button>
    <div nfsAccordionContent>Panel 1</div>
  </div>
  <div nfsAccordionItem>
    <button nfsAccordionTitle type="button">Section 2</button>
    <div nfsAccordionContent>Panel 2</div>
  </div>
</div>`;

const ACC_IMPORT = `import { NfsAccordion, NfsAccordionContent, NfsAccordionItem, NfsAccordionTitle } from 'ngx-foundation-sites/accordion';`;

const CONTEXTS = `@defer (on idle) {
  <button nfsButton type="button">In defer</button>
} @placeholder {
  <p>Loading</p>
}
@if (show) {
  <button nfsButton type="button">In if</button>
}
@for (item of items; track item) {
  <button nfsButton type="button">In for {{ item }}</button>
}
<ng-template #tpl>
  <button nfsButton type="button">In ng-template</button>
</ng-template>
<ng-container *ngTemplateOutlet="tpl" />
<app-card>
  <button nfsButton type="button">Projected</button>
</app-card>`;

// expected: attribute names each element-level report names, in template order.
const cases = [
  {
    id: 'member',
    what: 'forgotten member of a family (NfsAccordionTitle)',
    head: ACC_IMPORT.replace(', NfsAccordionTitle', ''),
    imports: 'NfsAccordion, NfsAccordionItem, NfsAccordionContent',
    template: ACCORDION,
    expected: ['nfsAccordionTitle', 'nfsAccordionTitle'],
  },
  {
    id: 'family',
    what: 'forgotten whole family',
    head: '',
    imports: '',
    template: ACCORDION,
    expected: ['nfsAccordion', 'nfsAccordionItem', 'nfsAccordionTitle', 'nfsAccordionContent', 'nfsAccordionItem', 'nfsAccordionTitle', 'nfsAccordionContent'],
  },
  {
    id: 'single',
    what: 'forgotten single directive',
    head: '',
    imports: '',
    template: `<button nfsButton type="button" color="primary">Save</button>`,
    expected: ['nfsButton'],
  },
  {
    id: 'correct-classes',
    what: 'every directive imported by class',
    head: `${ACC_IMPORT}\nimport { NfsButton } from 'ngx-foundation-sites/button';`,
    imports: 'NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent, NfsButton',
    template: `${ACCORDION}\n<button nfsButton type="button">Save</button>`,
    expected: [],
  },
  {
    id: 'correct-array',
    what: "the library's import array",
    head: `import { NFS_ACCORDION } from 'ngx-foundation-sites/accordion';\nimport { NfsButton } from 'ngx-foundation-sites/button';`,
    imports: 'NFS_ACCORDION, NfsButton',
    template: `${ACCORDION}\n<button nfsButton type="button">Save</button>`,
    expected: [],
  },
  {
    id: 'correct-local-array',
    what: "a consumer's own array in another file, with a spread",
    head: `import { SHARED_NFS } from './shared/shared-imports';`,
    imports: 'SHARED_NFS',
    template: `${ACCORDION}\n<button nfsButton type="button">Save</button>`,
    expected: [],
  },
  {
    id: 'correct-module',
    what: "a consumer NgModule that re-exports the directives",
    head: `import { SharedUiModule } from './shared/shared-ui.module';`,
    imports: 'SharedUiModule',
    template: `${ACCORDION}\n<button nfsButton type="button">Save</button>`,
    expected: [],
  },
  {
    id: 'css-attr',
    what: 'consumer attributes that start with nfs, written only for CSS',
    head: '',
    imports: '',
    template: `<div nfsHighlight>Highlighted</div>
<p nfs-note>Note</p>
<div nfsButton>Looks like a button attribute on a div</div>
<section class="nfs-card" data-nfs-callout>Card</section>`,
    expected: [],
  },
  {
    id: 'bound-input',
    what: 'a bound input and a static input on the missing directive',
    head: '',
    imports: '',
    template: `<div nfsCallout [color]="tone">Bound</div>
<div nfsCallout color="warning">Static</div>`,
    fields: `  protected readonly tone = 'primary' as const;\n`,
    expected: ['nfsCallout', 'nfsCallout'],
    ngDiagnostics: ['NG8002'],
  },
  {
    id: 'contexts',
    what: 'the markup inside @defer, @if, @for, an ng-template rendered by NgTemplateOutlet, and projected content',
    head: `import { NgTemplateOutlet } from '@angular/common';\nimport { Card } from './shared/card';`,
    imports: 'NgTemplateOutlet, Card',
    template: CONTEXTS,
    fields: `  protected readonly show = true;\n  protected readonly items = ['a'];\n`,
    expected: ['nfsButton', 'nfsButton', 'nfsButton', 'nfsButton', 'nfsButton'],
  },
  {
    id: 'contexts-ok',
    what: 'the same contexts with NfsButton imported (deferred inside @defer)',
    head: `import { NgTemplateOutlet } from '@angular/common';\nimport { NfsButton } from 'ngx-foundation-sites/button';\nimport { Card } from './shared/card';`,
    imports: 'NgTemplateOutlet, Card, NfsButton',
    template: CONTEXTS,
    fields: `  protected readonly show = true;\n  protected readonly items = ['a'];\n`,
    expected: [],
  },
];

const pascal = (s) => s.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const expected = {};

for (const c of cases) {
  for (const kind of ['inline', 'external']) {
    const name = `${c.id}-${kind}`;
    const cls = pascal(name);
    const tpl =
      kind === 'inline' ? `  template: \`\n${c.template.replace(/^/gm, '    ')}\n  \`,` : `  templateUrl: './${name}.html',`;
    const src = `import { ChangeDetectionStrategy, Component } from '@angular/core';
${c.head ? c.head + '\n' : ''}
/** Case: ${c.what} (${kind} template). */
@Component({
  selector: 'app-${name}',
  imports: [${c.imports}],
  changeDetection: ChangeDetectionStrategy.OnPush,
${tpl}
})
export class ${cls} {
${c.fields ?? ''}}
`;
    writeFileSync(join(dir, `${name}.ts`), src);

    if (kind === 'external') {
      writeFileSync(join(dir, `${name}.html`), c.template + '\n');
    }

    expected[`src/app/cases/${name}.${kind === 'inline' ? 'ts' : 'html'}`] = { component: cls, expected: c.expected, ngDiagnostics: c.ngDiagnostics ?? [] };
  }
}

// Three components in one file: a templateUrl one, then two inline ones (the processor numbers inline ones only).
writeFileSync(
  join(dir, 'multi.ts'),
  `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from 'ngx-foundation-sites/button';

@Component({
  selector: 'app-multi-a',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './multi-a.html',
})
export class MultiA {}

/** Forgets NfsButton. */
@Component({
  selector: 'app-multi-b',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<button nfsButton type="button">B</button>\`,
})
export class MultiB {}

@Component({
  selector: 'app-multi-c',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<button nfsButton type="button">C</button>\`,
})
export class MultiC {}
`,
);
writeFileSync(join(dir, 'multi-a.html'), `<button nfsButton type="button">A</button>\n`);
expected['src/app/cases/multi-a.html'] = { component: 'MultiA', expected: [] };
expected['src/app/cases/multi.ts#MultiB'] = { component: 'MultiB', expected: ['nfsButton'] };
expected['src/app/cases/multi.ts#MultiC'] = { component: 'MultiC', expected: [] };

writeFileSync(
  join(dir, 'shared/shared-imports.ts'),
  `import { NFS_ACCORDION } from 'ngx-foundation-sites/accordion';
import { NfsButton } from 'ngx-foundation-sites/button';
import { NfsCallout } from 'ngx-foundation-sites/callout';

/** A consumer's own import array, spreading the library's. */
export const SHARED_NFS = [...NFS_ACCORDION, NfsButton, NfsCallout] as const;
`,
);
writeFileSync(
  join(dir, 'shared/shared-ui.module.ts'),
  `import { NgModule } from '@angular/core';
import { NFS_ACCORDION } from 'ngx-foundation-sites/accordion';
import { NfsButton } from 'ngx-foundation-sites/button';

/** A consumer NgModule that re-exports library directives. */
@NgModule({
  imports: [...NFS_ACCORDION, NfsButton],
  exports: [...NFS_ACCORDION, NfsButton],
})
export class SharedUiModule {}
`,
);
writeFileSync(
  join(dir, 'shared/card.ts'),
  `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from 'ngx-foundation-sites/button';

/** A consumer component that imports NfsButton for its own template and projects content. */
@Component({
  selector: 'app-card',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<div class="card"><ng-content /><button nfsButton type="button">Card action</button></div>\`,
})
export class Card {}
`,
);
expected['src/app/cases/shared/card.ts'] = { component: 'Card', expected: [] };

// Harder cases, where a checker without the compiler's scope can diverge. Expected values are the truth
// (what Angular matches), each case once.
const hardDir = join(dir, 'hard');
mkdirSync(join(hardDir, 'far-templates'), { recursive: true });
const BTN = `import { NfsButton } from 'ngx-foundation-sites/button';`;
const component = (cls, sel, head, imports, tpl, extra = '') => `import { ChangeDetectionStrategy, Component } from '@angular/core';
${head}

@Component({
  selector: '${sel}',${imports === null ? '\n  standalone: false,' : `\n  imports: [${imports}],`}
  changeDetection: ChangeDetectionStrategy.OnPush,
  ${tpl},
})
export class ${cls} {}
${extra}`;
const TWO = '`<button nfsButton type="button">Save</button><div nfsCallout>Note</div>`';
const hard = [
  ['HardFunction', 'hard-function', `${BTN}\n\nexport function buttonImports() {\n  return [NfsButton] as const;\n}`, 'buttonImports()', `template: ${TWO}`, ['nfsCallout'], 'imports built by a function call'],
  ['HardAlias', 'hard-alias', `import { UI_IMPORTS } from '@acme/ui';`, 'UI_IMPORTS', `template: ${TWO}`, ['nfsCallout'], 'an array from a tsconfig path alias, re-exported with export *'],
  ['HardPackage', 'hard-package', `import { DS_IMPORTS } from '@acme/design-system';`, 'DS_IMPORTS', `template: ${TWO}`, [], 'an array from an installed design-system package that re-exports the directives'],
  ['HardFarTemplate', 'hard-far-template', '', '', `templateUrl: './far-templates/hard-far-template.html'`, ['nfsButton'], 'a templateUrl in another folder'],
  ['HardRenamed', 'hard-renamed', `import { NfsButton as Btn } from 'ngx-foundation-sites/button';`, 'Btn', 'template: `<button nfsButton type="button">Save</button>`', [], 'a renamed import'],
  [
    'HardHostDirective',
    'hard-host-directive',
    `import { Directive } from '@angular/core';\n${BTN}\n\n/** A consumer directive that hosts the library's. */\n@Directive({ selector: '[appPrimary]', hostDirectives: [NfsButton] })\nexport class AppPrimary {}`,
    'AppPrimary',
    'template: `<button nfsButton appPrimary type="button">Save</button>`',
    [],
    "a consumer directive that hosts the library's through hostDirectives",
  ],
];

for (const [cls, name, head, imports, tpl, want, what] of hard) {
  writeFileSync(join(hardDir, `${name}.ts`), `// Case: ${what}.\n` + component(cls, `app-${name}`, head, imports, tpl));
  expected[`src/app/cases/hard/${name}.ts`] = { component: cls, expected: want, what };
}

writeFileSync(join(hardDir, 'far-templates/hard-far-template.html'), `<button nfsButton type="button">Save</button>\n`);

// A component declared in an NgModule (standalone: false): its scope is the module's imports.
writeFileSync(
  join(hardDir, 'hard-ngmodule.ts'),
  `// Case: a component declared in an NgModule, which imports NfsButton only.
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
${BTN}

@Component({
  selector: 'app-hard-ngmodule',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ${TWO},
})
export class HardNgModule {}

@NgModule({ declarations: [HardNgModule], imports: [NfsButton] })
export class HardLegacyModule {}
`,
);
expected['src/app/cases/hard/hard-ngmodule.ts'] = { component: 'HardNgModule', expected: ['nfsCallout'], what: 'a component declared in an NgModule' };

// The path-aliased workspace library, and the installed design-system package (in the experiment's own node_modules).
mkdirSync(join(root, 'ws/src/libs/ui/lib'), { recursive: true });
writeFileSync(join(root, 'ws/src/libs/ui/index.ts'), `export * from './lib/ui-imports';\n`);
writeFileSync(join(root, 'ws/src/libs/ui/lib/ui-imports.ts'), `${BTN}\n\nexport const UI_IMPORTS = [NfsButton] as const;\n`);
const ds = join(root, 'node_modules/@acme/design-system');
mkdirSync(ds, { recursive: true });
writeFileSync(join(ds, 'package.json'), JSON.stringify({ name: '@acme/design-system', version: '1.0.0', type: 'module', exports: { '.': { types: './index.d.ts', default: './index.js' } } }, null, 2));
writeFileSync(
  join(ds, 'index.d.ts'),
  `import { NfsButton } from 'ngx-foundation-sites/button';\nimport { NfsCallout } from 'ngx-foundation-sites/callout';\nexport declare const DS_IMPORTS: readonly [typeof NfsButton, typeof NfsCallout];\n`,
);
writeFileSync(
  join(ds, 'index.js'),
  `import { NfsButton } from 'ngx-foundation-sites/button';\nimport { NfsCallout } from 'ngx-foundation-sites/callout';\nexport const DS_IMPORTS = [NfsButton, NfsCallout];\n`,
);

writeFileSync(join(dir, 'expected.json'), JSON.stringify(expected, null, 2) + '\n');
console.log(`cases: ${Object.keys(expected).length} components -> ${dir}`);
