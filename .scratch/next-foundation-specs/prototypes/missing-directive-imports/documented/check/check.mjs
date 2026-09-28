// The static import check on documented APIs only: TypeScript's compiler API for scope, angular-html-parser
// for templates, and a selector matcher of its own over the library's manifest. No @angular/compiler, no
// @angular/compiler-cli, no private Angular symbol.
//
// For every standalone component it resolves each identifier in `imports` to its class, parses the template,
// and reports each element that matches a library directive's selector when neither an imported library
// class nor a host directive of an imported workspace directive that matches the same element brings it in.
// A component whose scope it cannot resolve is skipped with a one-line notice.
//
// CLI: node check/check.mjs <tsconfig> [--manifest <file>] [--json <out>] [--timing]
// API: checkMissingImports(tsconfig, manifestPath?) -> { findings, skipped, components, ms }; used by builder.mjs.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { parse } from 'angular-html-parser';
import ts from 'typescript';

// ---- Selectors: Angular's CssSelector.parse and SelectorMatcher semantics (compiler/src/directive_matching.ts).

const SELECTOR_RE = /(:not\()|(([.#]?)[-\w]+)|(?:\[([-.\w*\\$]+)(?:=(["']?)([^\]"']*)\5)?\])|(\))|(\s*,\s*)/g;

/** A selector list as simple selectors: { element, classes, attrs: [name, value][], nots }. */
export function parseSelector(text) {
  const simple = () => ({ element: null, classes: [], attrs: [], nots: [] });
  const list = [];
  let top = simple();
  let current = top;
  const close = (s) => {
    if (s.nots.length && !s.element && !s.classes.length && !s.attrs.length) {
      s.element = '*';
    }

    list.push(s);
  };

  for (const m of text.matchAll(SELECTOR_RE)) {
    if (m[1]) {
      current = simple();
      top.nots.push(current);
    }

    if (m[2]) {
      if (m[3] === '#') {
        current.attrs.push(['id', m[2].slice(1).toLowerCase()]);
      } else if (m[3] === '.') {
        current.classes.push(m[2].slice(1).toLowerCase());
      } else {
        current.element = m[2];
      }
    }

    if (m[4]) {
      current.attrs.push([m[4].replaceAll('\\', ''), (m[6] ?? '').toLowerCase()]);
    }

    if (m[7]) {
      current = top;
    }

    if (m[8]) {
      close(top);
      top = current = simple();
    }
  }

  close(top);

  return list;
}

/** Whether a simple selector matches an element descriptor { element, attrs: Map, classes: Set }. */
function matches(s, node) {
  if (s.element && s.element !== '*' && s.element !== node.element) {
    return false;
  }

  for (const c of s.classes) {
    if (!node.classes.has(c)) {
      return false;
    }
  }

  for (const [name, value] of s.attrs) {
    if (!node.attrs.has(name) || (value && node.attrs.get(name) !== value)) {
      return false;
    }
  }

  return !s.nots.some((n) => matches(n, node));
}

const matchesAny = (selectors, node) => selectors.some((s) => matches(s, node));

// ---- Templates: the attribute names Angular matches directives against (compiler/src/render3/view/util.ts
// getAttrsForDirectiveMatching and createCssSelectorFromNode; the binding syntax of r3_template_transform.ts and
// template_parser/binding_parser.ts).

const BIND_NAME = /^(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*)$/;
const DELIMS = [
  ['[(', ')]', 'twoWay'],
  ['[', ']', 'property'],
  ['(', ')', 'event'],
];
const noNs = (name) => (name.startsWith(':') ? name.slice(name.indexOf(':', 1) + 1) : name);
// attr., class., style., animate. bindings and legacy animations are not property bindings, so they match nothing.
const isPropertyName = (n) => !n.startsWith('@') && !n.startsWith('animate-') && !/^(attr|class|style|animate)\./.test(n);
const eventName = (n) => (n.includes(':') ? n.slice(n.indexOf(':') + 1) : n);

/** The descriptors to match for one element: its implicit `*` template first, if any, then the element. */
function descriptors(el) {
  const text = new Map();
  const inputs = [];
  const outputs = [];
  let templateKey = null;

  for (const { name, value } of el.attrs) {
    if (name.startsWith('*')) {
      templateKey = name.slice(1);
      continue;
    }

    const kw = BIND_NAME.exec(name);

    if (kw) {
      if (kw[1]) {
        inputs.push(kw[7]);
      } else if (kw[4]) {
        outputs.push(eventName(kw[7]));
      } else if (kw[5]) {
        inputs.push(kw[7]);
        outputs.push(`${kw[7]}Change`);
      }

      // let-, ref- and #, and @ (a legacy animation) match nothing.
      continue;
    }

    const delim = DELIMS.find(([s, e]) => name.startsWith(s) && name.endsWith(e) && name.length > s.length + e.length);

    if (delim) {
      const id = name.slice(delim[0].length, name.length - delim[1].length);

      if (delim[2] === 'event') {
        outputs.push(eventName(id));
      } else {
        inputs.push(id);

        if (delim[2] === 'twoWay') {
          outputs.push(`${id}Change`);
        }
      }

      continue;
    }

    if (/\{\{[\s\S]*?\}\}/.test(value)) {
      inputs.push(name); // an interpolated attribute is a property binding
    } else if (name !== 'i18n' && !name.startsWith('i18n-')) {
      text.set(name, value);
    }
  }

  const named = new Map(text);
  inputs.filter(isPropertyName).forEach((n) => named.set(n, ''));
  outputs.forEach((n) => named.set(n, ''));
  const toNode = (element, entries) => {
    const attrs = new Map();
    const classes = new Set();

    for (const [name, value] of entries) {
      attrs.set(noNs(name), value.toLowerCase());

      if (name.toLowerCase() === 'class') {
        value.trim().split(/\s+/).forEach((c) => classes.add(c.toLowerCase()));
      }
    }

    return { element, attrs, classes };
  };
  const out = [];

  if (templateKey !== null) {
    // Only the microsyntax key: `*x="..."` gives the template the attribute x (secondary keys such as xOf are not derived).
    out.push(toNode('ng-template', [[templateKey, '']]));
  }

  out.push(toNode(noNs(el.name), named));

  return out;
}

const SKIPPED_ELEMENTS = new Set(['script', ':svg:script', ':math:script', 'style']);

/** Every element Angular matches directives on: all blocks' children; not ICU cases, ngNonBindable content, or ng-content. */
function walk(nodes, visit) {
  for (const n of nodes) {
    if (n.kind === 'element') {
      const lower = n.name.toLowerCase();

      if (SKIPPED_ELEMENTS.has(lower) || (lower === 'link' && n.attrs.some((a) => a.name.toLowerCase() === 'rel' && a.value === 'stylesheet'))) {
        continue;
      }

      if (noNs(lower) !== 'ng-content') {
        visit(n);
      }

      if (!n.attrs.some((a) => a.name === 'ngNonBindable')) {
        walk(n.children, visit);
      }
    } else if (n.kind === 'block') {
      walk(n.children, visit);
    }
  }
}

// ---- Scope: standalone imports, NgModule exports, and host directives, with TypeScript's type checker
// (compiler-cli/src/ngtsc/scope/src/standalone.ts, local.ts, metadata/src/host_directives_resolver.ts, inheritance.ts).

class Skip extends Error {}

export function checkMissingImports(tsconfigArg, manifestArg) {
  const tsconfig = resolve(tsconfigArg);
  const t0 = performance.now();
  const manifestPath = manifestArg ?? createRequire(tsconfig).resolve('ngx-foundation-sites/package.json').replace(/package\.json$/, 'nfs-selectors.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const dirs = manifest.directives.map((d) => ({ ...d, selectors: parseSelector(d.selector) }));

  const { config, error } = ts.readConfigFile(tsconfig, ts.sys.readFile);

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  }

  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, dirname(tsconfig), undefined, tsconfig);

  if (parsed.errors.length) {
    throw new Error(parsed.errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  }

  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const tProgram = performance.now();

  // Each manifest directive's class declaration, found through its entry point's exports.
  const libByDecl = new Map();

  for (const dir of dirs) {
    const mod = ts.resolveModuleName(dir.entryPoint, join(dirname(tsconfig), 'index.ts'), parsed.options, ts.sys).resolvedModule;
    const sf = mod && program.getSourceFile(mod.resolvedFileName);
    const modSym = sf && checker.getSymbolAtLocation(sf);
    const exp = modSym && checker.getExportsOfModule(modSym).find((s) => s.name === dir.name);
    const decl = exp && aliased(exp).declarations?.find(ts.isClassDeclaration);

    if (decl) {
      libByDecl.set(decl, dir);
    }
  }

  function aliased(sym) {
    return sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
  }

  const text = (node) => node.getText().replace(/\s+/g, ' ');

  function resolveClass(expr) {
    if (!ts.isIdentifier(expr) && !ts.isPropertyAccessExpression(expr)) {
      throw new Skip(`\`${text(expr)}\` is not an identifier`);
    }

    const sym = checker.getSymbolAtLocation(expr);
    const decl = sym && aliased(sym).declarations?.find(ts.isClassDeclaration);

    if (!decl) {
      throw new Skip(`\`${text(expr)}\` is not a class`);
    }

    return decl;
  }

  const metaCache = new Map();

  /** The Angular decorator of a class: { kind: 'Component' | 'Directive' | 'NgModule' | 'Pipe', args }, or null. */
  function angularMeta(cls) {
    if (!metaCache.has(cls)) {
      let meta = null;

      for (const dec of ts.canHaveDecorators(cls) ? (ts.getDecorators(cls) ?? []) : []) {
        const call = dec.expression;
        const sym = ts.isCallExpression(call) && checker.getSymbolAtLocation(ts.isPropertyAccessExpression(call.expression) ? call.expression.name : call.expression);
        const target = sym && aliased(sym);
        const file = target?.declarations?.[0]?.getSourceFile().fileName ?? '';

        if (target && ['Component', 'Directive', 'NgModule', 'Pipe'].includes(target.name) && /[/\\]@angular[/\\]core[/\\]/.test(file)) {
          const args = call.arguments[0];
          // `@Directive()` has no arguments; `@Component(config)` has arguments the check cannot read.
          meta = { kind: target.name, args: args && (ts.isObjectLiteralExpression(args) ? args : false) };
        }
      }

      metaCache.set(cls, meta);
    }

    return metaCache.get(cls);
  }

  function prop(args, name) {
    if (args === undefined) {
      return undefined;
    }

    if (args === false || args.properties.some(ts.isSpreadAssignment)) {
      throw new Skip('a decorator argument is not a plain object literal');
    }

    const p = args.properties.find((x) => x.name && (ts.isIdentifier(x.name) || ts.isStringLiteral(x.name)) && x.name.text === name);

    return p && (ts.isShorthandPropertyAssignment(p) ? p.name : p.initializer);
  }

  function arrayProp(args, name) {
    const v = prop(args, name);

    if (v && !ts.isArrayLiteralExpression(v)) {
      throw new Skip(`its \`${name}\` is \`${text(v)}\`, not an array literal`);
    }

    return v ? [...v.elements] : [];
  }

  const hostedCache = new Map();

  /** The library directives a workspace directive brings through hostDirectives, transitively and from base classes. */
  function hostedLib(cls) {
    if (!hostedCache.has(cls)) {
      hostedCache.set(cls, new Set()); // cycle guard
      const out = new Set();
      const meta = angularMeta(cls);

      if (meta && (meta.kind === 'Directive' || meta.kind === 'Component')) {
        for (const el of arrayProp(meta.args, 'hostDirectives')) {
          const target = resolveClass(ts.isObjectLiteralExpression(el) ? prop(el, 'directive') : el);
          const lib = libByDecl.get(target);

          if (lib) {
            out.add(lib);
          } else if (!target.getSourceFile().isDeclarationFile) {
            hostedLib(target).forEach((d) => out.add(d));
          }
        }
      }

      const base = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression;
      const baseSym = base && checker.getSymbolAtLocation(base);
      const baseDecl = baseSym && aliased(baseSym).declarations?.find(ts.isClassDeclaration);

      if (baseDecl && !baseDecl.getSourceFile().isDeclarationFile) {
        hostedLib(baseDecl).forEach((d) => out.add(d));
      }

      hostedCache.set(cls, out);
    }

    return hostedCache.get(cls);
  }

  /** Adds what one class in `imports` (or an NgModule's `exports`) brings into a component's scope. */
  function addToScope(cls, scope, seen = new Set()) {
    if (seen.has(cls)) {
      return;
    }

    seen.add(cls);
    const lib = libByDecl.get(cls);

    if (lib) {
      scope.lib.add(lib);

      return;
    }

    if (cls.getSourceFile().isDeclarationFile) {
      return; // another package's class: it brings no library directive the check can see (out of scope)
    }

    const meta = angularMeta(cls);

    if (meta?.kind === 'NgModule') {
      arrayProp(meta.args, 'exports').forEach((el) => addToScope(resolveClass(el), scope, seen));
    } else if (meta?.kind === 'Directive' || meta?.kind === 'Component') {
      const hosted = hostedLib(cls);
      const selector = hosted.size ? prop(meta.args, 'selector') : null;

      if (selector && !ts.isStringLiteralLike(selector)) {
        throw new Skip(`the selector of ${cls.name?.text} is not a string literal`);
      }

      if (selector) {
        scope.hosts.push({ selectors: parseSelector(selector.text), lib: hosted });
      }
    }
  }

  const rel = (file) => relative(dirname(tsconfig), file).replaceAll('\\', '/');
  const findings = [];
  const skipped = [];
  let components = 0;

  function checkComponent(cls, meta, sf) {
    const standalone = prop(meta.args, 'standalone');

    if (standalone && standalone.kind === ts.SyntaxKind.FalseKeyword) {
      throw new Skip('it is declared in an NgModule (standalone: false)');
    }

    if (standalone && standalone.kind !== ts.SyntaxKind.TrueKeyword) {
      throw new Skip(`its \`standalone\` is \`${text(standalone)}\``);
    }

    // A standalone component has itself in scope, then everything its imports and deferredImports bring.
    const scope = { lib: new Set(), hosts: [] };
    addToScope(cls, scope);

    for (const el of [...arrayProp(meta.args, 'imports'), ...arrayProp(meta.args, 'deferredImports')]) {
      addToScope(resolveClass(el), scope);
    }

    const inline = prop(meta.args, 'template');
    const url = prop(meta.args, 'templateUrl');
    let template;
    let file;
    let base = { line: 0, character: 0 };

    if (inline) {
      if (!ts.isStringLiteralLike(inline)) {
        throw new Skip('its template is not a string literal');
      }

      template = inline.text;
      file = sf.fileName;
      base = sf.getLineAndCharacterOfPosition(inline.getStart() + 1);
    } else if (url && ts.isStringLiteralLike(url)) {
      file = resolve(dirname(sf.fileName), url.text);

      if (!existsSync(file)) {
        throw new Skip(`its templateUrl ${url.text} does not exist`);
      }

      template = readFileSync(file, 'utf8');
    } else {
      throw new Skip('it has no template the check can read');
    }

    const { rootNodes, errors } = parse(template, { tokenizeAngularBlocks: true, tokenizeAngularLetDeclaration: true });

    if (errors.length) {
      throw new Skip(`its template does not parse: ${errors[0].msg}`);
    }

    components++;
    walk(rootNodes, (el) => {
      for (const node of descriptors(el)) {
        for (const dir of dirs) {
          if (!matchesAny(dir.selectors, node) || scope.lib.has(dir) || scope.hosts.some((h) => h.lib.has(dir) && matchesAny(h.selectors, node))) {
            continue;
          }

          const { line, col } = el.startSourceSpan.start;
          findings.push({
            file: rel(file),
            line: base.line + line + 1,
            col: (line === 0 ? base.character : 0) + col + 1,
            component: cls.name.text,
            attr: dir.selectors.flatMap((s) => s.attrs.map(([name]) => name)).find((a) => node.attrs.has(a)),
            directive: dir.name,
            entryPoint: dir.entryPoint,
          });
        }
      }
    });
  }

  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile || sf.fileName.includes('/node_modules/')) {
      continue;
    }

    const visit = (node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        const meta = angularMeta(node);

        if (meta?.kind === 'Component') {
          try {
            checkComponent(node, meta, sf);
          } catch (e) {
            if (!(e instanceof Skip)) {
              throw e;
            }

            const { line, character } = sf.getLineAndCharacterOfPosition(node.name.getStart());
            skipped.push({ file: rel(sf.fileName), line: line + 1, col: character + 1, component: node.name.text, reason: e.message });
          }
        }
      }

      ts.forEachChild(node, visit);
    };
    visit(sf);
  }

  const tDone = performance.now();

  return { findings, skipped, components, ms: { program: tProgram - t0, check: tDone - tProgram, total: tDone - t0 } };
}

export function formatFinding(f) {
  return `${f.file}:${f.line}:${f.col} - NFS9001: ${f.attr} matches ${f.directive}, which ${f.component}'s imports do not include; import ${f.directive} from '${f.entryPoint}'.`;
}

export function formatSkipped(s) {
  return `${s.file}:${s.line}:${s.col} - NFS9002: ${s.component} not checked: ${s.reason}.`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const res = checkMissingImports(args[0], opt('--manifest'));
  res.skipped.forEach((s) => console.log(formatSkipped(s)));
  res.findings.forEach((f) => console.log(formatFinding(f)));
  console.log(`${res.findings.length} finding(s) in ${res.components} component(s); ${res.skipped.length} skipped.`);

  if (args.includes('--timing')) {
    console.log(`timing: program ${res.ms.program.toFixed(0)} ms, scope, templates and matching ${res.ms.check.toFixed(0)} ms, total ${res.ms.total.toFixed(0)} ms`);
  }

  if (opt('--json')) {
    writeFileSync(opt('--json'), JSON.stringify({ tool: 'documented', ...res }, null, 2));
  }

  process.exitCode = res.findings.length || !res.components ? 1 : 0;
}
