#!/usr/bin/env node
/**
 * Sass Compilation Benchmark Script
 *
 * Measures compilation time for ngx-foundation-sites component stylesheets.
 * Used to compare before/after optimization of Foundation imports.
 *
 * Usage:
 *   node tools/benchmark-sass.mjs
 *   node tools/benchmark-sass.mjs --iterations 20
 */

import { compileString } from 'sass';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const iterationsIndex = args.indexOf('--iterations');
const ITERATIONS =
  iterationsIndex !== -1 ? parseInt(args[iterationsIndex + 1], 10) : 10;

// Files to benchmark
const BENCHMARK_FILES = [
  'packages/ngx-foundation-sites/src/lib/scss/accordion.scss',
  'packages/ngx-foundation-sites/src/lib/scss/button.scss',
  'packages/ngx-foundation-sites/src/storybook/all-components-ltr.scss',
];

// Include paths for Sass compilation (matches angular.json configuration)
const LOAD_PATHS = [
  resolve(ROOT_DIR, 'node_modules'),
  resolve(ROOT_DIR, 'packages/ngx-foundation-sites/src/storybook'),
];

/**
 * Compiles a Sass file and returns the compilation time in milliseconds.
 */
function compileSassFile(filePath) {
  const absolutePath = resolve(ROOT_DIR, filePath);
  const source = readFileSync(absolutePath, 'utf8');

  const start = performance.now();
  compileString(source, {
    loadPaths: LOAD_PATHS,
    silenceDeprecations: ['import', 'global-builtin'],
    style: 'compressed',
  });
  const end = performance.now();

  return end - start;
}

/**
 * Runs benchmarks for a single file.
 */
function benchmarkFile(filePath) {
  const times = [];

  // Warm-up run (not counted)
  try {
    compileSassFile(filePath);
  } catch (error) {
    console.error(`\n❌ Failed to compile: ${filePath}`);
    console.error(error.message);
    return null;
  }

  // Timed runs
  for (let i = 0; i < ITERATIONS; i++) {
    times.push(compileSassFile(filePath));
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return { avg, min, max, times };
}

/**
 * Formats milliseconds with appropriate precision.
 */
function formatMs(ms) {
  return ms.toFixed(1) + 'ms';
}

/**
 * Main benchmark runner.
 */
function main() {
  console.log(
    '═══════════════════════════════════════════════════════════════════════════════',
  );
  console.log(' Sass Compilation Benchmark');
  console.log(
    '═══════════════════════════════════════════════════════════════════════════════',
  );
  console.log(`Iterations per file: ${ITERATIONS}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');

  const results = [];

  for (const file of BENCHMARK_FILES) {
    process.stdout.write(`Benchmarking: ${file}...`);
    const result = benchmarkFile(file);

    if (result) {
      results.push({ file, ...result });
      console.log(` ${formatMs(result.avg)} (avg)`);
    } else {
      console.log(' FAILED');
    }
  }

  console.log('');
  console.log(
    '─────────────────────────────────────────────────────────────────────────────────',
  );
  console.log(' Results Summary');
  console.log(
    '─────────────────────────────────────────────────────────────────────────────────',
  );
  console.log('');
  console.log('| File | Avg | Min | Max |');
  console.log('|------|-----|-----|-----|');

  for (const result of results) {
    const shortName = result.file.split('/').pop();
    console.log(
      `| ${shortName} | ${formatMs(result.avg)} | ${formatMs(result.min)} | ${formatMs(result.max)} |`,
    );
  }

  console.log('');

  // Calculate total
  const totalAvg = results.reduce((sum, r) => sum + r.avg, 0);
  console.log(`Total average compilation time: ${formatMs(totalAvg)}`);
  console.log('');

  // Output JSON for easy comparison
  console.log(
    '─────────────────────────────────────────────────────────────────────────────────',
  );
  console.log(' JSON Output (for comparison)');
  console.log(
    '─────────────────────────────────────────────────────────────────────────────────',
  );
  console.log(
    JSON.stringify(
      {
        date: new Date().toISOString(),
        iterations: ITERATIONS,
        results: results.map((r) => ({
          file: r.file.split('/').pop(),
          avg: Math.round(r.avg * 10) / 10,
          min: Math.round(r.min * 10) / 10,
          max: Math.round(r.max * 10) / 10,
        })),
        totalAvg: Math.round(totalAvg * 10) / 10,
      },
      null,
      2,
    ),
  );
}

main();
