// Rewrites the generated workspace to the one import style ADR 0046 leaves: every component that imports
// NFS_ACCORDION or the consumer's SHARED_NFS array imports the classes its template uses instead. The markup and
// the ground truth do not change (those components have no forgotten import). Run after tools/gen-workspace.mjs.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'ws/src/app/generated');
const ACCORDION = ['NfsAccordion', 'NfsAccordionItem', 'NfsAccordionTitle', 'NfsAccordionContent'];
let rewritten = 0;

for (const name of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
  const file = join(dir, name);
  let src = readFileSync(file, 'utf8');

  if (!/\b(NFS_ACCORDION|SHARED_NFS)\b/.test(src)) {
    continue;
  }

  const html = file.replace(/\.ts$/, '.html');
  const markup = src + (existsSync(html) ? readFileSync(html, 'utf8') : '');
  const classes = [...(/nfsAccordion\b/.test(markup) ? ACCORDION : []), 'NfsButton', ...(/nfsCallout\b/.test(markup) ? ['NfsCallout'] : [])];
  const lines = [
    ...(classes.includes('NfsAccordion') ? [`import { ${ACCORDION.join(', ')} } from 'ngx-foundation-sites/accordion';`] : []),
    `import { NfsButton } from 'ngx-foundation-sites/button';`,
    ...(classes.includes('NfsCallout') ? [`import { NfsCallout } from 'ngx-foundation-sites/callout';`] : []),
  ];
  src = src
    .replace(/^import \{ (NFS_ACCORDION|NfsButton|NfsCallout|SHARED_NFS) \} from .*\n/gm, '')
    .replace(/^(import \{ ChangeDetectionStrategy.*\n)/m, `$1${lines.join('\n')}\n`)
    .replace(/imports: \[(NFS_ACCORDION, NfsButton, NfsCallout|SHARED_NFS)/, `imports: [${classes.join(', ')}`);
  writeFileSync(file, src);
  rewritten++;
}

console.log(`classes only: rewrote ${rewritten} component(s) in ${dir}`);
