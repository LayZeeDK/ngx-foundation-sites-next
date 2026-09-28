// Generates N consumer components (default 240) into ws/src/app/generated: half inline, half external
// templates, realistic filler markup, control flow, child components, three import styles, and injected
// forgotten imports on every tenth component, with the ground truth in generated/expected.json.
// Usage: node tools/gen-workspace.mjs [count]
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const count = Number(process.argv[2] ?? 240);
const dir = join(root, 'ws/src/app/generated');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

let seed = 145;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pad = (i) => String(i).padStart(3, '0');
const expected = {};
const FAULTS = ['member', 'family', 'single'];

for (let i = 0; i < count; i++) {
  const id = `gen-${pad(i)}`;
  const cls = `Gen${pad(i)}`;
  const external = i % 2 === 1;
  const style = ['classes', 'array', 'shared'][i % 3];
  const fault = i % 10 === 3 ? FAULTS[Math.floor(i / 10) % 3] : null;
  const useAccordion = fault === 'member' || fault === 'family' || rand() < 0.6;
  const useCallout = rand() < 0.5;
  const useFor = rand() < 0.4;
  const useDefer = useCallout && rand() < 0.4;
  const cssAttr = rand() < 0.2;
  const children = [i - 1, i - 7].filter((c) => c >= 0);
  const report = [];
  // which library directives the component imports ('classes' style only can forget one)
  const forgot = new Set(
    fault === 'member' ? ['NfsAccordionTitle'] : fault === 'family' ? ['NfsAccordion', 'NfsAccordionItem', 'NfsAccordionTitle', 'NfsAccordionContent'] : fault === 'single' ? ['NfsButton'] : [],
  );
  const effectiveStyle = fault ? 'classes' : style;
  const t = [];
  const mark = (attr, cls) => {
    if (forgot.has(cls)) {
      report.push(attr);
    }
  };

  t.push(`<header class="grid-x">`, `  <h2>{{ title }} ${i}</h2>`, `  <p class="lead">Generated component ${i} of ${count}.</p>`, `</header>`);
  t.push(`<nav>`, `  <ul class="menu">`, `    <li><a href="#one">One</a></li>`, `    <li><a href="#two">Two</a></li>`, `  </ul>`, `</nav>`);
  t.push(`<section>`, `  <button nfsButton type="button" color="primary" (click)="save()">Save</button>`);
  mark('nfsButton', 'NfsButton');
  t.push(`  <a nfsButton href="#cancel">Cancel</a>`);
  mark('nfsButton', 'NfsButton');

  if (cssAttr) {
    t.push(`  <span nfsTone="muted">Styled by the consumer's own CSS</span>`);
  }

  t.push(`</section>`);

  if (useAccordion) {
    t.push(`@if (open()) {`, `  <div nfsAccordion>`);
    mark('nfsAccordion', 'NfsAccordion');
    const n = 2 + Math.floor(rand() * 2);

    for (let k = 0; k < n; k++) {
      t.push(`    <div nfsAccordionItem>`, `      <button nfsAccordionTitle type="button">Section ${k + 1}</button>`, `      <div nfsAccordionContent>`, `        <p>Panel ${k + 1} of component ${i}.</p>`, `      </div>`, `    </div>`);
      mark('nfsAccordionItem', 'NfsAccordionItem');
      mark('nfsAccordionTitle', 'NfsAccordionTitle');
      mark('nfsAccordionContent', 'NfsAccordionContent');
    }

    t.push(`  </div>`, `}`);
  }

  if (useFor) {
    t.push(`<ul class="no-bullet">`, `  @for (item of items(); track item.id) {`, `    <li><button nfsButton type="button" (click)="pick(item.id)">{{ item.label }}</button></li>`, `  } @empty {`, `    <li>No items</li>`, `  }`, `</ul>`);
    mark('nfsButton', 'NfsButton');
  }

  if (useCallout) {
    const callout = [`<div nfsCallout color="success">`, `  <h5>Heads up</h5>`, `  <p>{{ message() }}</p>`, `</div>`];

    if (useDefer) {
      t.push(`@defer (on viewport) {`, ...callout.map((l) => '  ' + l), `} @placeholder {`, `  <p>Loading</p>`, `}`);
    } else {
      t.push(...callout);
    }
  }

  t.push(`<form class="grid-container">`, `  <label>Name <input type="text" name="name" /></label>`, `  <label>Email <input type="email" name="email" /></label>`, `  <fieldset><legend>Choose</legend><input type="checkbox" id="c${i}" /><label for="c${i}">Agree</label></fieldset>`, `</form>`);

  for (const c of children) {
    t.push(`<app-gen-${pad(c)} />`);
  }

  t.push(`<footer><small>Footer of ${i}</small></footer>`);

  // imports
  const tsImports = [`import { ChangeDetectionStrategy, Component, signal } from '@angular/core';`];
  const decoImports = [];

  if (effectiveStyle === 'classes') {
    const acc = ['NfsAccordion', 'NfsAccordionItem', 'NfsAccordionTitle', 'NfsAccordionContent'].filter((n) => !forgot.has(n));

    if (useAccordion && acc.length) {
      tsImports.push(`import { ${acc.join(', ')} } from 'ngx-foundation-sites/accordion';`);
      decoImports.push(...acc);
    }

    if (!forgot.has('NfsButton')) {
      tsImports.push(`import { NfsButton } from 'ngx-foundation-sites/button';`);
      decoImports.push('NfsButton');
    }

    if (useCallout) {
      tsImports.push(`import { NfsCallout } from 'ngx-foundation-sites/callout';`);
      decoImports.push('NfsCallout');
    }
  } else if (effectiveStyle === 'array') {
    tsImports.push(`import { NFS_ACCORDION } from 'ngx-foundation-sites/accordion';`, `import { NfsButton } from 'ngx-foundation-sites/button';`, `import { NfsCallout } from 'ngx-foundation-sites/callout';`);
    decoImports.push('NFS_ACCORDION', 'NfsButton', 'NfsCallout');
  } else {
    tsImports.push(`import { SHARED_NFS } from '../cases/shared/shared-imports';`);
    decoImports.push('SHARED_NFS');
  }

  for (const c of children) {
    tsImports.push(`import { Gen${pad(c)} } from './gen-${pad(c)}';`);
    decoImports.push(`Gen${pad(c)}`);
  }

  const template = t.join('\n');
  const tpl = external ? `  templateUrl: './${id}.html',` : `  template: \`\n${template.replace(/^/gm, '    ')}\n  \`,`;
  const src = `${tsImports.join('\n')}

interface Item {
  readonly id: number;
  readonly label: string;
}

@Component({
  selector: 'app-${id}',
  imports: [${decoImports.join(', ')}],
  changeDetection: ChangeDetectionStrategy.OnPush,
${tpl}
})
export class ${cls} {
  protected readonly title = 'Component';
  protected readonly open = signal(true);
  protected readonly message = signal('Saved');
  protected readonly items = signal<readonly Item[]>([
    { id: 1, label: 'First' },
    { id: 2, label: 'Second' },
  ]);

  protected save(): void {
    this.message.set('Saved at ' + ${i});
  }

  protected pick(id: number): void {
    this.message.set('Picked ' + id);
  }
}
`;
  writeFileSync(join(dir, `${id}.ts`), src);

  if (external) {
    writeFileSync(join(dir, `${id}.html`), template + '\n');
  }

  expected[`src/app/generated/${id}.${external ? 'html' : 'ts'}`] = { component: cls, expected: report, fault };
}

writeFileSync(join(dir, 'expected.json'), JSON.stringify(expected, null, 2) + '\n');
const faulty = Object.values(expected).filter((e) => e.expected.length).length;
const reports = Object.values(expected).reduce((n, e) => n + e.expected.length, 0);
console.log(`generated: ${count} components (${faulty} with a forgotten import, ${reports} expected element reports) -> ${dir}`);
