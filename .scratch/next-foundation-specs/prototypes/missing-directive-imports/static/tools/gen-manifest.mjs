// Generates the selector manifest from the library source: every exported directive with its selector and
// entry point, and every exported import array with its members. The library build would run this; the
// static checks read the JSON from the installed package.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entryPoints = ['button', 'accordion', 'callout'];
const manifest = { version: 1, package: 'ngx-foundation-sites', directives: [], arrays: [] };

for (const ep of entryPoints) {
  const file = join(root, 'lib', ep, 'index.ts');
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const entryPoint = `ngx-foundation-sites/${ep}`;

  for (const stmt of sf.statements) {
    const exported = ts.getModifiers(stmt)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

    if (!exported) {
      continue;
    }

    if (ts.isClassDeclaration(stmt) && stmt.name) {
      for (const dec of ts.getDecorators(stmt) ?? []) {
        const call = dec.expression;

        if (!ts.isCallExpression(call) || !['Directive', 'Component'].includes(call.expression.getText())) {
          continue;
        }

        const meta = call.arguments[0];
        const prop = (n) => meta.properties.find((p) => p.name?.getText() === n)?.initializer;
        const selector = prop('selector');
        const exportAs = prop('exportAs');
        manifest.directives.push({
          name: stmt.name.text,
          entryPoint,
          selector: selector.text,
          ...(exportAs ? { exportAs: exportAs.text } : {}),
        });
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

const out = join(root, 'node_modules', 'ngx-foundation-sites', 'nfs-selectors.json');
writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest: ${manifest.directives.length} directives, ${manifest.arrays.length} arrays -> ${out}`);
