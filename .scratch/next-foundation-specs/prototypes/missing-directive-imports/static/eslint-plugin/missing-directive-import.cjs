// Approach (a): an ESLint rule on @angular-eslint's template parser.
//
// A template rule sees only the template. To learn the component's imports it must find the owning
// component and read its `imports` itself:
// - inline template: the extract-inline-html processor names the virtual file
//   `<component>.ts/inline-template-<basename>-<n>.component.html`; the rule re-parses the physical .ts file
//   and takes the n-th component with an inline template, counted as the processor counts them;
// - external template: the rule scans the .ts files of the template's own directory for a component whose
//   templateUrl resolves to the file (Angular's one-folder convention; anything else is "no owner");
// - imports: resolved syntactically with TypeScript's parser, no type checker: library names through the
//   selector manifest (which lists the import arrays' members), local consts, relative or tsconfig-path
//   imports followed into workspace files (consts, spreads, NgModule `exports`, re-exports). Anything it
//   cannot follow makes the component "unresolved", and the rule reports nothing for it (fail open), unless
//   the `reportUnresolved` option is on.
'use strict';

const { existsSync, readFileSync, readdirSync, statSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const { CssSelector, SelectorMatcher } = require('@angular-eslint/bundled-angular-compiler');

const LIB = 'ngx-foundation-sites';
const manifests = new Map();
const sourceFiles = new Map();
const ownersBySource = new WeakMap(); // per parsed source file
const tsconfigs = new Map();

function loadManifest(cwd, file) {
  const key = file ?? cwd;

  if (!manifests.has(key)) {
    const p = file ?? createRequire(path.join(cwd, 'x.js')).resolve(`${LIB}/package.json`).replace(/package\.json$/, 'nfs-selectors.json');
    const m = JSON.parse(readFileSync(p, 'utf8'));
    const matcher = new SelectorMatcher();

    for (const d of m.directives) {
      matcher.addSelectables(CssSelector.parse(d.selector), d);
    }

    manifests.set(key, {
      matcher,
      directives: m.directives,
      arrays: m.arrays,
      arrayOf: new Map(m.arrays.flatMap((a) => a.members.map((n) => [n, a.name]))),
    });
  }

  return manifests.get(key);
}

// Keyed on mtime: an editor's ESLint server is one long-lived process, and the component file can change
// while the template does not.
function parse(file) {
  const mtime = existsSync(file) ? statSync(file).mtimeMs : -1;
  const hit = sourceFiles.get(file);

  if (!hit || hit.mtime !== mtime) {
    sourceFiles.set(file, { mtime, sf: mtime < 0 ? null : ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true) });
  }

  return sourceFiles.get(file).sf;
}

const prop = (obj, name) => obj.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === name);

function decoratorMeta(cls, name) {
  for (const dec of ts.getDecorators(cls) ?? []) {
    const call = dec.expression;

    if (ts.isCallExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === name && call.arguments.length === 1 && ts.isObjectLiteralExpression(call.arguments[0])) {
      return call.arguments[0];
    }
  }

  return null;
}

function classes(sf) {
  const out = [];
  const visit = (n) => {
    if (ts.isClassDeclaration(n)) {
      out.push(n);

      return;
    }

    ts.forEachChild(n, visit);
  };
  visit(sf);

  return out;
}

// The owning component of a template file.
function inlineOwner(tsFile, virtualName) {
  const m = /-(\d+)\.component\.html$/.exec(virtualName);
  const sf = parse(tsFile);

  if (!m || !sf) {
    return null;
  }

  let n = 0;

  for (const cls of classes(sf)) {
    const meta = decoratorMeta(cls, 'Component');

    if (!meta || prop(meta, 'templateUrl') || !prop(meta, 'template')) {
      continue;
    }

    if (++n === Number(m[1])) {
      return [{ file: tsFile, cls, meta }];
    }
  }

  return null;
}

// The component beside the template with the same base name (`x.html` -> `x.ts`, the Angular CLI's layout)
// first; only when it does not name the template, every .ts file of the folder (one stat each).
function externalOwners(htmlFile) {
  const dir = path.dirname(htmlFile);
  const wanted = path.resolve(htmlFile);
  const sibling = wanted.replace(/\.html$/, '.ts');
  const fromSibling = existsSync(sibling) ? ownersIn(sibling, dir, wanted) : [];

  if (fromSibling.length) {
    return fromSibling;
  }

  const owners = [];

  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.ts') || f.endsWith('.spec.ts') || f.endsWith('.d.ts')) {
      continue;
    }

    owners.push(...ownersIn(path.join(dir, f), dir, wanted));
  }

  return owners.length ? owners : null;
}

function ownersIn(file, dir, wanted) {
  const sf = parse(file);

  if (!ownersBySource.has(sf)) {
    const found = [];

    for (const cls of classes(sf)) {
      const meta = decoratorMeta(cls, 'Component');
      const url = meta && prop(meta, 'templateUrl');

      if (url && ts.isStringLiteralLike(url.initializer)) {
        found.push({ target: path.resolve(dir, url.initializer.text), file, cls, meta });
      }
    }

    ownersBySource.set(sf, found);
  }

  return ownersBySource.get(sf).filter((o) => o.target === wanted);
}

// Module resolution: relative files, and tsconfig paths through TypeScript's resolver.
function nearestTsconfig(dir) {
  if (!tsconfigs.has(dir)) {
    const file = ts.findConfigFile(dir, ts.sys.fileExists);
    let options = {};

    if (file) {
      const cfg = ts.readConfigFile(file, ts.sys.readFile);
      options = ts.parseJsonConfigFileContent(cfg.config, ts.sys, path.dirname(file)).options;
    }

    tsconfigs.set(dir, options);
  }

  return tsconfigs.get(dir);
}

function resolveModule(spec, fromFile) {
  const r = ts.resolveModuleName(spec, fromFile, nearestTsconfig(path.dirname(fromFile)), ts.sys).resolvedModule;

  return r ? r.resolvedFileName : null;
}

// Resolves an expression of an `imports` (or NgModule `exports`) array to library directive names.
// Returns false when it cannot follow the expression.
function collect(expr, sf, lib, out, depth = 0) {
  if (depth > 8) {
    return false;
  }

  if (ts.isArrayLiteralExpression(expr)) {
    return expr.elements.every((e) => collect(e, sf, lib, out, depth + 1));
  }

  if (ts.isSpreadElement(expr) || ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr) || ts.isSatisfiesExpression?.(expr)) {
    return collect(expr.expression, sf, lib, out, depth + 1);
  }

  if (ts.isCallExpression(expr) && expr.expression.getText(sf) === 'forwardRef' && expr.arguments[0] && ts.isArrowFunction(expr.arguments[0])) {
    return collect(expr.arguments[0].body, sf, lib, out, depth + 1);
  }

  if (ts.isIdentifier(expr)) {
    return collectName(expr.text, sf, lib, out, depth);
  }

  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) {
    // namespace import: nfs.NfsButton
    const ns = findImport(expr.expression.text, sf);

    if (ns && ns.namespace) {
      return collectExport(expr.name.text, ns.spec, sf, lib, out, depth);
    }
  }

  return false;
}

function findImport(name, sf) {
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) {
      continue;
    }

    const spec = st.moduleSpecifier.text;
    const b = st.importClause.namedBindings;

    if (b && ts.isNamespaceImport(b) && b.name.text === name) {
      return { spec, namespace: true };
    }

    if (b && ts.isNamedImports(b)) {
      for (const el of b.elements) {
        if (el.name.text === name) {
          return { spec, imported: (el.propertyName ?? el.name).text };
        }
      }
    }
  }

  return null;
}

function collectName(name, sf, lib, out, depth) {
  const imp = findImport(name, sf);

  if (imp) {
    return collectExport(imp.imported, imp.spec, sf, lib, out, depth);
  }

  return collectLocal(name, sf, lib, out, depth);
}

function collectExport(name, spec, sf, lib, out, depth) {
  if (spec === LIB || spec.startsWith(`${LIB}/`)) {
    const dir = lib.directives.find((d) => d.name === name && d.entryPoint === spec);
    const arr = lib.arrays.find((a) => a.name === name && a.entryPoint === spec);

    if (dir) {
      out.add(dir.name);
    }

    if (arr) {
      arr.members.forEach((m) => out.add(m));
    }

    return Boolean(dir || arr);
  }

  const file = resolveModule(spec, sf.fileName);

  if (!file) {
    return false;
  }

  if (file.includes(`${path.sep}node_modules${path.sep}`) || file.includes('/node_modules/')) {
    // ponytail: assumes no other package re-exports this library's directives.
    return true;
  }

  const target = parse(file);

  return target ? collectLocal(name, target, lib, out, depth + 1, true) : false;
}

function collectLocal(name, sf, lib, out, depth, exportedOnly = false) {
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (d.name.getText(sf) === name && d.initializer) {
          return collect(d.initializer, sf, lib, out, depth + 1);
        }
      }
    }

    if (ts.isClassDeclaration(st) && st.name?.text === name) {
      const ngModule = decoratorMeta(st, 'NgModule');
      const exp = ngModule && prop(ngModule, 'exports');

      if (exp) {
        return collect(exp.initializer, sf, lib, out, depth + 1);
      }

      // a consumer component, directive, or pipe: provides no library directive
      return true;
    }

    if (ts.isExportDeclaration(st) && st.moduleSpecifier) {
      const spec = st.moduleSpecifier.text;

      if (!st.exportClause) {
        // export * from './x'
        const inner = new Set();

        if (collectExport(name, spec, sf, lib, inner, depth + 1) && inner.size) {
          inner.forEach((n) => out.add(n));

          return true;
        }
      } else if (ts.isNamedExports(st.exportClause)) {
        const el = st.exportClause.elements.find((e) => e.name.text === name);

        if (el) {
          return collectExport((el.propertyName ?? el.name).text, spec, sf, lib, out, depth + 1);
        }
      }
    }
  }

  const imp = exportedOnly ? findImport(name, sf) : null;

  if (imp) {
    return collectExport(imp.imported, imp.spec, sf, lib, out, depth + 1);
  }

  return false;
}

// Mirrors Angular's getAttrsForDirectiveMatching; the template parser overwrites a binding's numeric
// `type` with its class name and keeps the number in `__originalType`.
function selectorOf(node) {
  const s = new CssSelector();
  const isTemplate = node.type === 'Template';
  s.setElement(isTemplate ? 'ng-template' : node.name.replace(/^:[^:]+:/, ''));
  const add = (name, value = '') => {
    s.addAttribute(name.replace(/^:[^:]+:/, ''), value);

    if (name.toLowerCase() === 'class') {
      value.trim().split(/\s+/).filter(Boolean).forEach((c) => s.addClassName(c));
    }
  };

  if (isTemplate && node.tagName !== 'ng-template') {
    node.templateAttrs.forEach((a) => add(a.name));
  } else {
    node.attributes.forEach((a) => {
      if (!a.name.startsWith('i18n')) {
        add(a.name, a.value);
      }
    });
    node.inputs.forEach((i) => {
      const t = i.__originalType ?? i.type;

      if (t === 0 || t === 5) {
        // BindingType.Property and BindingType.TwoWay
        add(i.name);
      }
    });
    node.outputs.forEach((o) => add(o.name));
  }

  return s;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Reports an element that matches a library directive the component does not import' },
    schema: [
      {
        type: 'object',
        properties: { manifest: { type: 'string' }, reportUnresolved: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      missing: '`{{attr}}` matches {{directive}} ({{entryPoint}}), which {{component}} does not import; {{fix}}.',
      unresolved: '{{component}}: cannot resolve its imports statically, so this template is not checked.',
      noOwner: 'No component in this folder names this template in templateUrl, so it is not checked.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const lib = loadManifest(context.cwd, options.manifest);
    const services = context.sourceCode.parserServices;
    const filename = context.filename;
    const physical = context.physicalFilename;
    const owners = filename !== physical ? inlineOwner(physical, filename) : externalOwners(filename);

    if (!owners) {
      if (options.reportUnresolved) {
        return { Program: (node) => context.report({ loc: { line: 1, column: 0 }, messageId: 'noOwner' }) };
      }

      return {};
    }

    const scopes = [];

    for (const o of owners) {
      const importsProp = prop(o.meta, 'imports');
      const names = new Set();
      const ok = !importsProp || collect(importsProp.initializer, o.cls.getSourceFile(), lib, names);
      scopes.push({ component: o.cls.name?.text ?? '(anonymous)', names, ok });
    }

    const reported = new Set();

    return {
      Program() {
        if (options.reportUnresolved) {
          for (const s of scopes.filter((x) => !x.ok)) {
            context.report({ loc: { line: 1, column: 0 }, messageId: 'unresolved', data: { component: s.component } });
          }
        }
      },
      'Element, Template'(node) {
        const candidates = [];
        lib.matcher.match(selectorOf(node), (_s, d) => candidates.push(d));

        for (const d of candidates) {
          for (const s of scopes) {
            if (!s.ok || s.names.has(d.name)) {
              continue;
            }

            const attr =
              CssSelector.parse(d.selector)
                .flatMap((c) => c.attrs.filter((_, i) => i % 2 === 0))
                .find((a) => [...node.attributes, ...node.inputs].some((x) => x.name === a)) ?? d.selector;
            const key = `${node.startSourceSpan.start.offset}:${d.name}:${s.component}`;

            if (reported.has(key)) {
              continue;
            }

            reported.add(key);
            const arr = lib.arrayOf.get(d.name);
            context.report({
              loc: services.convertNodeSourceSpanToLoc(node.startSourceSpan),
              messageId: 'missing',
              data: {
                attr,
                directive: d.name,
                entryPoint: d.entryPoint,
                component: s.component,
                fix: arr ? `add ${d.name} or ${arr} to its imports` : `add ${d.name} to its imports`,
              },
            });
          }
        }
      },
    };
  },
};
