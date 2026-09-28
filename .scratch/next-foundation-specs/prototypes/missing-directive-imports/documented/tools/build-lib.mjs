// Builds the stand-in library into node_modules/ngx-foundation-sites with ngc in partial mode, then writes the
// selector manifest. The static prototype's build (static/tools/build-lib.mjs, gen-manifest.mjs) with three more
// entry points (tooltip, toggler, show-for) for the bound and structural cases. ngc is the static experiment's
// install, run read-only; the check itself never loads it.
// Usage: node tools/build-lib.mjs [path to @angular/compiler-cli]
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const compilerCli = process.argv[2] ?? 'D:/tmp/nfs-145-static/node_modules/@angular/compiler-cli';
const out = join(root, 'node_modules', 'ngx-foundation-sites');
const entryPoints = ['button', 'accordion', 'callout', 'tooltip', 'toggler', 'show-for'];
mkdirSync(out, { recursive: true });

execFileSync(process.execPath, [join(compilerCli, 'bundles/src/bin/ngc.js'), '-p', join(root, 'lib/tsconfig.json')], { stdio: 'inherit' });

const exportsMap = { './package.json': './package.json' };

for (const ep of entryPoints) {
  exportsMap[`./${ep}`] = { types: `./${ep}/index.d.ts`, default: `./${ep}/index.js` };
}

writeFileSync(
  join(out, 'package.json'),
  JSON.stringify({ name: 'ngx-foundation-sites', version: '0.0.0-proto.149', type: 'module', sideEffects: false, exports: exportsMap }, null, 2),
);

// The manifest, as static/tools/gen-manifest.mjs writes it: every exported directive with its selector and entry
// point, and every exported array with its members (the documented check ignores arrays).
const manifest = { version: 1, package: 'ngx-foundation-sites', directives: [], arrays: [] };

for (const ep of entryPoints) {
  const file = join(root, 'lib', ep, 'index.ts');
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const entryPoint = `ngx-foundation-sites/${ep}`;

  for (const stmt of sf.statements) {
    if (!ts.getModifiers(stmt)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      continue;
    }

    if (ts.isClassDeclaration(stmt) && stmt.name) {
      for (const dec of ts.getDecorators(stmt) ?? []) {
        const call = dec.expression;

        if (!ts.isCallExpression(call) || !['Directive', 'Component'].includes(call.expression.getText())) {
          continue;
        }

        const prop = (n) => call.arguments[0].properties.find((p) => p.name?.getText() === n)?.initializer;
        const exportAs = prop('exportAs');
        manifest.directives.push({ name: stmt.name.text, entryPoint, selector: prop('selector').text, ...(exportAs ? { exportAs: exportAs.text } : {}) });
      }
    }

    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        let init = decl.initializer;

        if (init && ts.isAsExpression(init)) {
          init = init.expression;
        }

        if (init && ts.isArrayLiteralExpression(init)) {
          manifest.arrays.push({ name: decl.name.getText(), entryPoint, members: init.elements.map((e) => e.getText()) });
        }
      }
    }
  }
}

writeFileSync(join(out, 'nfs-selectors.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest: ${manifest.directives.length} directives, ${manifest.arrays.length} arrays -> ${out}`);
