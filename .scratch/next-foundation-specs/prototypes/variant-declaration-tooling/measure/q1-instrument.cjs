// Q1: add NFS_TRACE logging to the application builder's AOT compilation in a scratch
// workspace's own node_modules (created by this prototype). `node q1-instrument.cjs <ws> [--restore]`.
const fs = require('node:fs');
const path = require('node:path');

const ws = path.resolve(process.argv[2]);
const file = path.join(
  ws,
  'node_modules/@angular/build/src/tools/angular/compilation/aot-compilation.js',
);
const backup = `${file}.nfs-orig`;

if (process.argv.includes('--restore')) {
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, file);
    fs.rmSync(backup);
  }

  console.log('restored', file);
  process.exit(0);
}

if (!fs.existsSync(backup)) {
  fs.copyFileSync(file, backup);
}

let src = fs.readFileSync(backup, 'utf8');
const trace = `const __nfsTrace = (...a) => { if (process.env.NFS_TRACE) console.error('[nfs-trace]', ...a); };
const __nfsBase = (f) => require('node:path').basename(typeof f === 'string' ? f : f.fileName);
`;
src = src.replace('"use strict";', `"use strict";\n${trace}`);

// 1. Per rebuild: modified files, ngtsc fresh or incremental, TS build info, affected files.
src = src.replace(
  '        const componentResourcesDependencies = new Map();',
  `        __nfsTrace('rebuild', 'modified=[' + [...(hostOptions.modifiedFiles ?? [])].map(__nfsBase).join(',') + ']',
          'usingBuildInfo=' + usingBuildInfo,
          'ngtsc=' + (angularCompiler.incrementalCompilation && angularCompiler.incrementalCompilation.step === null ? 'fresh' : 'incremental'),
          'affected=[' + [...affectedFiles].map(__nfsBase).join(',') + ']');
        const componentResourcesDependencies = new Map();`,
);

// 1b. The app component's TTC shim as the builder program sees it, against the previous one.
src = src.replace(
  '        const typeScriptProgram = typescript_1.default.createEmitAndSemanticDiagnosticsBuilderProgram(',
  `        if (process.env.NFS_TRACE) {
          for (const sf of angularTypeScriptProgram.getSourceFiles()) {
            if (!sf.fileName.endsWith('app.ngtypecheck.ts')) continue;
            let old;
            try { old = oldProgram && oldProgram.getSourceFile(sf.fileName); } catch { old = undefined; }
            __nfsTrace('shim', __nfsBase(sf), 'len=' + sf.text.length, 'version=' + String(sf.version).slice(0, 8),
              'oldLen=' + (old ? old.text.length : 'none'), 'oldVersion=' + (old ? String(old.version).slice(0, 8) : 'none'),
              'text=' + JSON.stringify(sf.text.slice(0, 160)));
            if (process.env.NFS_TRACE_DIR) {
              const n = (globalThis.__nfsShimCount = (globalThis.__nfsShimCount ?? 0) + 1);
              require('node:fs').writeFileSync(require('node:path').join(process.env.NFS_TRACE_DIR, n + '-app.ngtypecheck.ts.txt'), sf.text);
            }
          }
        }
        const typeScriptProgram = typescript_1.default.createEmitAndSemanticDiagnosticsBuilderProgram(`,
);

// 2. Which TTC shims TypeScript's builder reported as affected.
src = src.replace(
  "            if (ignoreForDiagnostics.has(sourceFile) && sourceFile.fileName.endsWith('.ngtypecheck.ts')) {\n                // This file name conversion relies on internal compiler logic and should be converted\n                // to an official method when available. 15 is length of `.ngtypecheck.ts`\n                const originalFilename = sourceFile.fileName.slice(0, -15) + '.ts';\n                const originalSourceFile = builder.getSourceFile(originalFilename);\n                if (originalSourceFile) {\n                    affectedFiles.add(originalSourceFile);\n                }\n                return true;",
  "            if (ignoreForDiagnostics.has(sourceFile) && sourceFile.fileName.endsWith('.ngtypecheck.ts')) {\n                __nfsTrace('ttc shim affected', __nfsBase(sourceFile));\n                const originalFilename = sourceFile.fileName.slice(0, -15) + '.ts';\n                const originalSourceFile = builder.getSourceFile(originalFilename);\n                if (originalSourceFile) {\n                    affectedFiles.add(originalSourceFile);\n                }\n                return true;",
);

// 3. Template diagnostics: computed or served from the diagnostic cache.
src = src.replace(
  '                diagnosticCache.set(sourceFile, angularDiagnostics);',
  "                diagnosticCache.set(sourceFile, angularDiagnostics);\n                if (!sourceFile.fileName.includes('node_modules')) __nfsTrace('template diagnostics computed', __nfsBase(sourceFile), angularDiagnostics.length);",
);
src = src.replace(
  '                const angularDiagnostics = diagnosticCache.get(sourceFile);\n                if (angularDiagnostics) {',
  "                const angularDiagnostics = diagnosticCache.get(sourceFile);\n                if (!sourceFile.fileName.includes('node_modules')) __nfsTrace('template diagnostics from cache', __nfsBase(sourceFile), angularDiagnostics ? angularDiagnostics.length : 'none');\n                if (angularDiagnostics) {",
);

const hits = (src.match(/__nfsTrace\(/g) ?? []).length;
fs.writeFileSync(file, src);
console.log(`instrumented ${file} (${hits} trace calls)`);
