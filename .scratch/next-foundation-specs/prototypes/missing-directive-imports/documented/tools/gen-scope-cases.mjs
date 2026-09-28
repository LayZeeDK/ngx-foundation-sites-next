// Writes the in-scope cases the static prototype's set does not exercise into ws/src/app/scope, with
// expected.json (element-level reports, the truth being what Angular matches): bound and structural attribute
// names, @switch and ng-container, classes re-exported through a path alias (renamed too), a namespace import,
// a workspace NgModule that exports classes, and host directives through a chain, an object entry, and a base
// class. Run after tools/gen-cases.mjs, which writes ws/src/libs/ui.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'ws/src/app/scope');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const pascal = (s) => s.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const expected = {};

const BOUND = `<button type="button" [nfsTooltip]="tip">Bound</button>
<button type="button" bind-nfsTooltip="tip">Bind prefix</button>
<button type="button" nfsTooltip="Static">Static</button>
<div [(nfsToggler)]="open">Two-way</div>
<p *nfsShowFor="'medium'">Structural</p>
<div (nfsCallout)="noop()">Event with the selector's name</div>
<button type="button" nfsTooltip="{{ tip }}">Interpolated</button>
<div [attr.nfsCallout]="tip" [class.nfsCallout]="open">Attribute and class bindings match no selector</div>`;
const BOUND_FIELDS = `  protected readonly tip = 'Tip';\n  protected open = false;\n\n  protected noop(): void {}\n`;
const SWITCH = `@switch (mode) {
  @case ('a') {
    <button nfsButton type="button">Case</button>
  }
  @default {
    <button nfsButton type="button">Default</button>
  }
}
<ng-container *nfsShowFor="'large'">
  <button nfsButton type="button">In a container</button>
</ng-container>
<ng-template [nfsShowFor]="'medium'">
  <span>Explicit template</span>
</ng-template>`;
const SWITCH_FIELDS = `  protected readonly mode: string = 'a';\n`;

const pairs = [
  {
    id: 'bound-names',
    what: 'bound, two-way, structural, event, and interpolated attribute names',
    head: '',
    imports: '',
    template: BOUND,
    fields: BOUND_FIELDS,
    expected: ['nfsTooltip', 'nfsTooltip', 'nfsTooltip', 'nfsToggler', 'nfsShowFor', 'nfsCallout', 'nfsTooltip'],
  },
  {
    id: 'bound-names-ok',
    what: 'the same names with every directive imported',
    head: `import { NfsCallout } from 'ngx-foundation-sites/callout';\nimport { NfsShowFor } from 'ngx-foundation-sites/show-for';\nimport { NfsToggler } from 'ngx-foundation-sites/toggler';\nimport { NfsTooltip } from 'ngx-foundation-sites/tooltip';`,
    imports: 'NfsTooltip, NfsToggler, NfsShowFor, NfsCallout',
    template: BOUND,
    fields: BOUND_FIELDS,
    expected: [],
  },
  {
    id: 'switch-container',
    what: '@switch cases, ng-container with a structural directive, and ng-template with a bound one',
    head: '',
    imports: '',
    template: SWITCH,
    fields: SWITCH_FIELDS,
    expected: ['nfsButton', 'nfsButton', 'nfsShowFor', 'nfsButton', 'nfsShowFor'],
  },
  {
    id: 'switch-container-ok',
    what: 'the same with NfsButton and NfsShowFor imported',
    head: `import { NfsButton } from 'ngx-foundation-sites/button';\nimport { NfsShowFor } from 'ngx-foundation-sites/show-for';`,
    imports: 'NfsButton, NfsShowFor',
    template: SWITCH,
    fields: SWITCH_FIELDS,
    expected: [],
  },
];

for (const c of pairs) {
  for (const kind of ['inline', 'external']) {
    const name = `${c.id}-${kind}`;
    const cls = pascal(name);
    const tpl = kind === 'inline' ? `  template: \`\n${c.template.replace(/^/gm, '    ')}\n  \`,` : `  templateUrl: './${name}.html',`;
    writeFileSync(
      join(dir, `${name}.ts`),
      `import { ChangeDetectionStrategy, Component } from '@angular/core';
${c.head ? c.head + '\n' : ''}
/** Case: ${c.what} (${kind} template). */
@Component({
  selector: 'app-${name}',
  imports: [${c.imports}],
  changeDetection: ChangeDetectionStrategy.OnPush,
${tpl}
})
export class ${cls} {
${c.fields}}
`,
    );

    if (kind === 'external') {
      writeFileSync(join(dir, `${name}.html`), c.template + '\n');
    }

    expected[`src/app/scope/${name}.${kind === 'inline' ? 'ts' : 'html'}`] = { component: cls, expected: c.expected, what: c.what };
  }
}

// Scope cases, each once, inline.
const TWO = '`<button nfsButton type="button">Save</button><div nfsCallout>Note</div>`';
const component = (cls, sel, head, imports, tpl, extra = '') => `import { ChangeDetectionStrategy, Component } from '@angular/core';
${head}

@Component({
  selector: '${sel}',
  imports: [${imports}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ${tpl},
})
export class ${cls} {}
${extra}`;
const scope = [
  ['AliasClasses', 'alias-classes', `import { NfsButton } from '@acme/ui';`, 'NfsButton', TWO, ['nfsCallout'], 'a class through a tsconfig path alias, export * and a named re-export'],
  ['AliasRenamed', 'alias-renamed', `import { NfsButton, UiCallout } from '@acme/ui';`, 'NfsButton, UiCallout', TWO, [], 'a class re-exported under another name through the alias'],
  ['NamespaceImport', 'namespace-import', `import * as button from 'ngx-foundation-sites/button';`, 'button.NfsButton', TWO, ['nfsCallout'], 'a namespace import'],
  [
    'ModuleClasses',
    'module-classes',
    `import { SharedClassesModule } from './shared-classes.module';`,
    'SharedClassesModule',
    '`<button nfsButton type="button">Save</button><div nfsCallout>Note</div><div nfsAccordion></div>`',
    ['nfsAccordion'],
    'a workspace NgModule that exports classes and another NgModule',
  ],
  [
    'HostChain',
    'host-chain',
    `import { AppDerived, AppOuter } from './host-directives';`,
    'AppOuter, AppDerived',
    '`<button nfsButton appOuter type="button">Hosted through a chain</button><button nfsButton type="button">Not hosted</button><div nfsCallout appDerived>Hosted through a base class</div>`',
    ['nfsButton'],
    'host directives through a chain with an object entry, and through a base class; not on an element the host does not match',
  ],
];

for (const [cls, name, head, imports, tpl, want, what] of scope) {
  writeFileSync(join(dir, `${name}.ts`), `// Case: ${what}.\n` + component(cls, `app-${name}`, head, imports, tpl));
  expected[`src/app/scope/${name}.ts`] = { component: cls, expected: want, what };
}

writeFileSync(
  join(dir, 'shared-classes.module.ts'),
  `import { NgModule } from '@angular/core';
import { NfsButton } from 'ngx-foundation-sites/button';
import { NfsCallout } from 'ngx-foundation-sites/callout';

@NgModule({ imports: [NfsButton], exports: [NfsButton] })
export class ButtonOnlyModule {}

/** A workspace NgModule that exports a class and, transitively, another module's. */
@NgModule({ imports: [ButtonOnlyModule, NfsCallout], exports: [ButtonOnlyModule, NfsCallout] })
export class SharedClassesModule {}
`,
);
writeFileSync(
  join(dir, 'host-directives.ts'),
  `import { Directive } from '@angular/core';
import { NfsButton } from 'ngx-foundation-sites/button';
import { NfsCallout } from 'ngx-foundation-sites/callout';

@Directive({ hostDirectives: [{ directive: NfsButton, inputs: ['color'] }] })
export class AppInner {}

@Directive({ selector: '[appOuter]', hostDirectives: [AppInner] })
export class AppOuter {}

@Directive({ hostDirectives: [NfsCallout] })
export abstract class AppBase {}

@Directive({ selector: '[appDerived]' })
export class AppDerived extends AppBase {}
`,
);

// Template syntax the check has to read as Angular does. With the library's manifest the truth is one report
// (ng-content fallback content is matched); the ICU cases and the ngNonBindable content are never matched by
// Angular at run time. tools/synthetic-manifest.json matches the rest of this markup.
writeFileSync(
  join(dir, 'syntax.ts'),
  `// Case: template syntax, from namespaces and ICU to animations and microsyntax.
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-syntax',
  imports: [NgIf, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './syntax.html',
})
export class Syntax {
  protected readonly count = 1;
  protected readonly label = 'Label';
  protected readonly on = true;
  protected value = 'v';

  protected noop(): void {}
}
`,
);
writeFileSync(
  join(dir, 'syntax.html'),
  `<svg viewBox="0 0 10 10"><use xlink:href="#icon" /></svg>
<div ngNonBindable title="Kept"><button nfsButton type="button">Not bound {{ label }}</button></div>
<p i18n>Hello {count, plural, =0 {<button nfsButton type="button">none</button>} other {many}}</p>
<p>{count, plural, =0 {<button nfsButton type="button">none</button>} other {many}}</p>
<ng-content select="[slot]"><button nfsButton type="button">Fallback</button></ng-content>
@let total = count + 1;
<form class="grid-x  Menu" id="main">
  <label for="n" i18n-title title="Name">Name {{ total }}</label>
  <input type="checkbox" name="agree" [attr.aria-label]="label" [class.active]="on" [style.width.px]="10" />
  <input type="email" name="email" (keydown.enter)="noop()" />
</form>
<a href="#top" title="Top" (window:resize)="noop()" #anchor>Top</a>
<ng-template let-item [ngIf]="on"><span title="{{ label }}">T</span></ng-template>
<div *ngIf="on as flag; else other" data-nfs-callout>Shown</div>
<ng-template #other><em>Other</em></ng-template>
<ng-container *ngTemplateOutlet="other"></ng-container>
<div animate.enter="fade-in" [animate.leave]="'fade-out'" (animate.leave)="noop()">Animated</div>
<span nfsTone="Muted" bindon-value="value" on-focus="noop()">Tone</span>
<style>.x { color: red; }</style>
`,
);
expected['src/app/scope/syntax.html'] = { component: 'Syntax', expected: ['nfsButton'], what: 'template syntax' };

// The path alias re-exports classes beside gen-cases' array.
writeFileSync(join(root, 'ws/src/libs/ui/index.ts'), `export * from './lib/ui-imports';\nexport * from './lib/ui-classes';\n`);
writeFileSync(
  join(root, 'ws/src/libs/ui/lib/ui-classes.ts'),
  `export { NfsButton } from 'ngx-foundation-sites/button';\nexport { NfsCallout as UiCallout } from 'ngx-foundation-sites/callout';\n`,
);

writeFileSync(join(dir, 'expected.json'), JSON.stringify(expected, null, 2) + '\n');
console.log(`scope cases: ${Object.keys(expected).length} components -> ${dir}`);
