/**
 * Sass Compilation Benchmark Tool
 *
 * Provides performance measurement utilities for browser-based Sass compilation.
 * Used to establish baselines and validate optimization improvements.
 *
 * Architecture:
 * - Runs benchmarks in the browser context (Storybook environment)
 * - Measures both individual component compilation and total theme compilation
 * - Supports multiple iterations for statistical accuracy
 * - Clears cache between iterations for accurate measurements
 *
 * @example
 * ```typescript
 * import { runBenchmark, formatBenchmarkResults } from './sass-benchmark';
 *
 * const results = await runBenchmark({ iterations: 5 });
 * console.log(formatBenchmarkResults(results));
 * ```
 */

import { compileWithWorker, preloadWorker } from './sass-compiler';
import { clearThemeCache } from './runtime-theme-injector';
import { getDefaultThemeState } from './theme-defaults';
import { AVAILABLE_COMPONENTS } from './generated/sass-bundle';
import type { ThemeState } from '../../.storybook/addons/theme-panel/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Statistical summary of timing measurements.
 */
export interface TimingStats {
  /** Average time in milliseconds */
  avg: number;
  /** Minimum time in milliseconds */
  min: number;
  /** Maximum time in milliseconds */
  max: number;
  /** Standard deviation in milliseconds */
  stdDev: number;
  /** Individual measurements */
  samples: number[];
}

/**
 * Per-component timing breakdown.
 */
export type ComponentTiming = Record<string, TimingStats>;

/**
 * Complete benchmark results.
 */
export interface BenchmarkResult {
  /** Timestamp when benchmark was run */
  timestamp: string;
  /** Number of iterations performed */
  iterations: number;
  /** Time to initialize Sass worker (first call) */
  workerInitTime: number;
  /** Per-component compilation times */
  componentTimes: ComponentTiming;
  /** Total compilation time for all components */
  totalCompileTime: TimingStats;
  /** Time for cache hits (should be ~0ms) */
  cacheHitTime: TimingStats;
  /** List of components benchmarked */
  components: string[];
}

/**
 * Options for running benchmarks.
 */
export interface BenchmarkOptions {
  /** Number of iterations per measurement (default: 5) */
  iterations?: number;
  /** Custom theme state to use (default: Foundation defaults) */
  themeState?: ThemeState;
  /** Callback for progress updates */
  onProgress?: (message: string, percent: number) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Statistical Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculates statistical summary from an array of measurements.
 */
function calculateStats(samples: number[]): TimingStats {
  if (samples.length === 0) {
    return { avg: 0, min: 0, max: 0, stdDev: 0, samples: [] };
  }

  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const min = Math.min(...samples);
  const max = Math.max(...samples);

  // Calculate standard deviation
  const squaredDiffs = samples.map((x) => Math.pow(x - avg, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    avg: Math.round(avg * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    samples: samples.map((s) => Math.round(s * 10) / 10),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Benchmark Implementation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Runs a comprehensive Sass compilation benchmark.
 *
 * Measures:
 * 1. Worker initialization time (one-time cost)
 * 2. Per-component compilation times
 * 3. Total compilation time for all components
 * 4. Cache hit performance
 *
 * @param options - Benchmark configuration
 * @returns Complete benchmark results
 */
export async function runBenchmark(
  options: BenchmarkOptions = {},
): Promise<BenchmarkResult> {
  const {
    iterations = 5,
    themeState = getDefaultThemeState(),
    onProgress,
  } = options;

  const components = [...AVAILABLE_COMPONENTS];
  const totalSteps = iterations + 2; // init + iterations + cache test
  let currentStep = 0;

  const reportProgress = (message: string): void => {
    currentStep++;
    onProgress?.(message, (currentStep / totalSteps) * 100);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 1: Measure worker initialization
  // ─────────────────────────────────────────────────────────────────────────────
  reportProgress('Initializing Sass worker...');
  clearThemeCache();

  const initStart = performance.now();
  await preloadWorker();
  const workerInitTime = Math.round((performance.now() - initStart) * 10) / 10;

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 2: Run compilation iterations
  // ─────────────────────────────────────────────────────────────────────────────
  const totalSamples: number[] = [];

  // We'll collect per-component times if we extend the worker to report them
  // For now, we measure total compilation time per iteration
  for (let i = 0; i < iterations; i++) {
    reportProgress(`Running iteration ${i + 1}/${iterations}...`);

    // Clear cache to ensure fresh compilation
    clearThemeCache();

    // Measure total compilation
    const iterStart = performance.now();
    await compileWithWorker(themeState);
    const iterTime = performance.now() - iterStart;
    totalSamples.push(iterTime);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 3: Measure cache hit performance
  // ─────────────────────────────────────────────────────────────────────────────
  reportProgress('Measuring cache performance...');
  const cacheHitSamples: number[] = [];

  // Theme state is already cached from last iteration
  for (let i = 0; i < 3; i++) {
    const cacheStart = performance.now();
    await compileWithWorker(themeState);
    cacheHitSamples.push(performance.now() - cacheStart);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Build results
  // ─────────────────────────────────────────────────────────────────────────────

  // Note: Per-component timing would require worker-level instrumentation
  // For now, we provide total compilation stats
  const componentTimes: ComponentTiming = {};
  for (const component of components) {
    // Estimate per-component time as total / component count
    // This is an approximation until we add worker-level timing
    const estimatedPerComponent = totalSamples.map(
      (t) => t / components.length,
    );
    componentTimes[component] = calculateStats(estimatedPerComponent);
  }

  return {
    timestamp: new Date().toISOString(),
    iterations,
    workerInitTime,
    componentTimes,
    totalCompileTime: calculateStats(totalSamples),
    cacheHitTime: calculateStats(cacheHitSamples),
    components,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Formatting Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formats benchmark results as a human-readable string.
 */
export function formatBenchmarkResults(results: BenchmarkResult): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════════════════════',
    '  SASS COMPILATION BENCHMARK RESULTS',
    '═══════════════════════════════════════════════════════════════════════════════',
    '',
    `  Date:       ${results.timestamp}`,
    `  Iterations: ${results.iterations}`,
    `  Components: ${results.components.join(', ')}`,
    '',
    '───────────────────────────────────────────────────────────────────────────────',
    '  TIMING SUMMARY',
    '───────────────────────────────────────────────────────────────────────────────',
    '',
    `  Worker Init:    ${results.workerInitTime}ms (one-time cost)`,
    '',
    '  Total Compilation:',
    `    Average:      ${results.totalCompileTime.avg}ms`,
    `    Min:          ${results.totalCompileTime.min}ms`,
    `    Max:          ${results.totalCompileTime.max}ms`,
    `    Std Dev:      ${results.totalCompileTime.stdDev}ms`,
    '',
    '  Cache Hit:',
    `    Average:      ${results.cacheHitTime.avg}ms`,
    `    Min:          ${results.cacheHitTime.min}ms`,
    `    Max:          ${results.cacheHitTime.max}ms`,
    '',
  ];

  // Add per-component breakdown
  lines.push(
    '───────────────────────────────────────────────────────────────────────────────',
  );
  lines.push('  PER-COMPONENT TIMING (estimated)');
  lines.push(
    '───────────────────────────────────────────────────────────────────────────────',
  );
  lines.push('');

  for (const [component, stats] of Object.entries(results.componentTimes)) {
    lines.push(
      `  ${component.padEnd(15)} avg: ${stats.avg.toString().padStart(6)}ms  ` +
        `min: ${stats.min.toString().padStart(6)}ms  ` +
        `max: ${stats.max.toString().padStart(6)}ms`,
    );
  }

  lines.push('');
  lines.push(
    '═══════════════════════════════════════════════════════════════════════════════',
  );

  return lines.join('\n');
}

/**
 * Exports benchmark results as JSON for comparison.
 */
export function exportBenchmarkJson(results: BenchmarkResult): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Compares two benchmark results and returns improvement percentages.
 */
export function compareBenchmarks(
  before: BenchmarkResult,
  after: BenchmarkResult,
): {
  totalImprovement: number;
  cacheImprovement: number;
  summary: string;
} {
  const totalImprovement =
    ((before.totalCompileTime.avg - after.totalCompileTime.avg) /
      before.totalCompileTime.avg) *
    100;
  const cacheImprovement =
    ((before.cacheHitTime.avg - after.cacheHitTime.avg) /
      before.cacheHitTime.avg) *
    100;

  const summary = [
    'BENCHMARK COMPARISON',
    '────────────────────',
    '',
    `Total Compilation: ${before.totalCompileTime.avg}ms → ${after.totalCompileTime.avg}ms (${totalImprovement >= 0 ? '+' : ''}${totalImprovement.toFixed(1)}%)`,
    `Cache Hit:         ${before.cacheHitTime.avg}ms → ${after.cacheHitTime.avg}ms (${cacheImprovement >= 0 ? '+' : ''}${cacheImprovement.toFixed(1)}%)`,
  ].join('\n');

  return { totalImprovement, cacheImprovement, summary };
}
