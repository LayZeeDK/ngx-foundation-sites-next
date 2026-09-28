// Approach (b): a Node check over the Angular compiler's own program and template type checker.
// For every component, it walks the parsed template (every block, ng-template, and projected child), matches
// each element against the library's selector manifest with Angular's own SelectorMatcher, and reports each
// library directive whose selector matches the element but which the compiler did not match there, that is,
// which the component's scope (its imports, or its NgModule's) does not bring in.
//
// CLI: node ngtsc-check/check.mjs <tsconfig> [--manifest <file>] [--json <out>] [--timing]
// API: checkMissingImports(tsconfig, manifestPath?) -> { findings, components, ms }; used by builder.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { CssSelector, SelectorMatcher, TmplAstRecursiveVisitor, createCssSelectorFromNode, tmplAstVisitAll } from '@angular/compiler';
import {
  NgCompiler,
  NgTscPlugin,
  OptimizeFor,
  TrackedIncrementalBuildStrategy,
  freshCompilationTicket,
  readConfiguration,
} from '@angular/compiler-cli';
import ts from 'typescript';

export async function checkMissingImports(tsconfigArg, manifestArg) {
  const tsconfig = resolve(tsconfigArg);
  const t0 = performance.now();

  // 1. The selector manifest the library ships, read from its install location unless given.
  const manifestPath = manifestArg ?? createRequire(tsconfig).resolve('ngx-foundation-sites/package.json').replace(/package\.json$/, 'nfs-selectors.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const matcher = new SelectorMatcher();
  const arrayOf = new Map(manifest.arrays.flatMap((a) => a.members.map((m) => [m, a.name])));

  for (const dir of manifest.directives) {
    matcher.addSelectables(CssSelector.parse(dir.selector), dir);
  }

  // 2. The consumer's program, analysed as the build analyses it.
  const config = readConfiguration(tsconfig);

  if (config.errors.length) {
    throw new Error(ts.formatDiagnostics(config.errors, ts.createCompilerHost({})));
  }

  // NgtscProgram and NgTscPlugin both create their compiler with the template type checker off (only the
  // language service turns it on). NgTscPlugin hands out the wrapped host and, after setupCompilation, a
  // compiler whose program driver and perf recorder are public, so a second NgCompiler with the checker on is
  // made over the same ts.Program from exported names only (none of them documented public API).
  const plugin = new NgTscPlugin({});
  const host = plugin.wrapHost(ts.createCompilerHost(config.options, true), config.rootNames, config.options);
  const tsProgram = ts.createProgram(host.inputFiles, config.options, host);
  plugin.setupCompilation(tsProgram);
  const ticket = freshCompilationTicket(
    tsProgram,
    config.options,
    new TrackedIncrementalBuildStrategy(),
    plugin.compiler.programDriver,
    plugin.compiler.perfRecorder,
    /* enableTemplateTypeChecker */ true,
    /* usePoisonedData */ false,
  );
  const compiler = NgCompiler.fromTicket(ticket, host);
  await compiler.analyzeAsync();
  const tAnalysed = performance.now();
  const ttc = compiler.getTemplateTypeChecker();

  // 3. Walk every component's template.
  const findings = [];
  let components = 0;
  let firstTemplate = true;

  class Walker extends TmplAstRecursiveVisitor {
    constructor(cls) {
      super();
      this.cls = cls;
    }

    visitElement(node) {
      this.check(node);
      super.visitElement(node);
    }

    visitTemplate(node) {
      this.check(node);
      super.visitTemplate(node);
    }

    check(node) {
      const candidates = [];
      matcher.match(createCssSelectorFromNode(node), (_selector, dir) => candidates.push(dir));

      if (!candidates.length) {
        return;
      }

      // The directives Angular matched on this element, host directives included.
      const inScope = ttc.getDirectivesOfNode(this.cls, node) ?? [];

      for (const dir of candidates) {
        if (inScope.some((d) => d.name === dir.name && d.selector === dir.selector)) {
          continue;
        }

        const attr = CssSelector.parse(dir.selector)
          .flatMap((s) => s.attrs.filter((_, i) => i % 2 === 0))
          .find((a) => [...node.attributes, ...node.inputs, ...(node.templateAttrs ?? [])].some((x) => x.name === a));
        const start = node.startSourceSpan.start;
        findings.push({
          file: relative(dirname(tsconfig), start.file.url).replaceAll('\\', '/'),
          line: start.line + 1,
          col: start.col + 1,
          component: this.cls.name.text,
          attr,
          directive: dir.name,
          entryPoint: dir.entryPoint,
          array: arrayOf.get(dir.name),
        });
      }
    }
  }

  for (const sf of tsProgram.getSourceFiles()) {
    if (sf.isDeclarationFile || sf.fileName.includes('/node_modules/')) {
      continue;
    }

    const visit = (node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        // WholeProgram on the first call builds every type-check shim in one program update.
        const nodes = ttc.getTemplate(node, firstTemplate ? OptimizeFor.WholeProgram : OptimizeFor.SingleFile);
        firstTemplate = false;

        if (nodes) {
          components++;
          tmplAstVisitAll(new Walker(node), nodes);
        }
      }

      ts.forEachChild(node, visit);
    };
    visit(sf);
  }

  const tDone = performance.now();

  return { findings, components, ms: { analyse: tAnalysed - t0, check: tDone - tAnalysed, total: tDone - t0 } };
}

export function formatFinding(f) {
  const fix = f.array ? `import ${f.directive} or ${f.array} from '${f.entryPoint}'` : `import ${f.directive} from '${f.entryPoint}'`;

  return `${f.file}:${f.line}:${f.col} - NFS9001: ${f.attr} matches ${f.directive}, which ${f.component}'s imports do not include; ${fix}.`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  // No top-level await: Architect loads builder.mjs with require(), which rejects an ESM graph that has one.
  checkMissingImports(args[0], opt('--manifest')).then((res) => {
    res.findings.forEach((f) => console.log(formatFinding(f)));
    console.log(`${res.findings.length} finding(s) in ${res.components} component(s).`);

    if (args.includes('--timing')) {
      console.log(`timing: analyse ${res.ms.analyse.toFixed(0)} ms, templates and check ${res.ms.check.toFixed(0)} ms, total ${res.ms.total.toFixed(0)} ms`);
    }

    if (opt('--json')) {
      writeFileSync(opt('--json'), JSON.stringify({ tool: 'ngtsc', ...res }, null, 2));
    }

    process.exitCode = res.findings.length ? 1 : 0;
  });
}
