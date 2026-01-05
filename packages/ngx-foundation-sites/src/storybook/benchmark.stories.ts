/**
 * Sass Compilation Benchmark Stories
 *
 * Provides a visual interface for running and comparing Sass compilation benchmarks.
 * Used to measure and validate performance optimizations.
 */

import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import {
  runBenchmark,
  formatBenchmarkResults,
  exportBenchmarkJson,
  compareBenchmarks,
  type BenchmarkResult,
} from './sass-benchmark';

// ═══════════════════════════════════════════════════════════════════════════════
// Benchmark Component
// ═══════════════════════════════════════════════════════════════════════════════

@Component({
  selector: 'nfs-benchmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="benchmark-container">
      <header class="benchmark-header">
        <h1>Sass Compilation Benchmark</h1>
        <p class="text-secondary">
          Measures browser-based Sass compilation performance for runtime
          theming.
        </p>
      </header>

      <section class="benchmark-controls margin-bottom-2">
        <h3>Settings</h3>
        <div class="grid-x grid-margin-x">
          <div class="cell small-6 medium-3">
            <label>
              Iterations
              <input
                type="number"
                [value]="iterations()"
                (input)="setIterations($event)"
                min="1"
                max="20"
              />
            </label>
          </div>
          <div class="cell small-6 medium-3 align-self-bottom">
            <button
              class="button primary"
              [disabled]="running()"
              (click)="runBenchmark()"
            >
              @if (running()) {
                Running...
              } @else {
                Run Benchmark
              }
            </button>
          </div>
        </div>
      </section>

      @if (progress()) {
        <section class="benchmark-progress margin-bottom-2">
          <div class="progress-bar">
            <div
              class="progress-fill"
              [style.width.%]="progressPercent()"
            ></div>
          </div>
          <p class="text-secondary">{{ progress() }}</p>
        </section>
      }

      @if (results()) {
        <section class="benchmark-results margin-bottom-2">
          <h3>Results</h3>

          <!-- Summary Cards -->
          <div class="grid-x grid-margin-x margin-bottom-2">
            <div class="cell small-6 medium-3">
              <div class="stat-card">
                <div class="stat-value">{{ results()!.workerInitTime }}ms</div>
                <div class="stat-label">Worker Init</div>
                <div class="stat-note">One-time cost</div>
              </div>
            </div>
            <div class="cell small-6 medium-3">
              <div class="stat-card primary">
                <div class="stat-value">
                  {{ results()!.totalCompileTime.avg }}ms
                </div>
                <div class="stat-label">Total Compile</div>
                <div class="stat-note">
                  ± {{ results()!.totalCompileTime.stdDev }}ms
                </div>
              </div>
            </div>
            <div class="cell small-6 medium-3">
              <div class="stat-card success">
                <div class="stat-value">
                  {{ results()!.cacheHitTime.avg }}ms
                </div>
                <div class="stat-label">Cache Hit</div>
                <div class="stat-note">Instant from cache</div>
              </div>
            </div>
            <div class="cell small-6 medium-3">
              <div class="stat-card">
                <div class="stat-value">{{ results()!.components.length }}</div>
                <div class="stat-label">Components</div>
                <div class="stat-note">
                  {{ results()!.components.join(', ') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Timing Table -->
          <h4>Total Compilation Timing</h4>
          <table class="hover">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Average</td>
                <td>{{ results()!.totalCompileTime.avg }}ms</td>
              </tr>
              <tr>
                <td>Minimum</td>
                <td>{{ results()!.totalCompileTime.min }}ms</td>
              </tr>
              <tr>
                <td>Maximum</td>
                <td>{{ results()!.totalCompileTime.max }}ms</td>
              </tr>
              <tr>
                <td>Std Deviation</td>
                <td>{{ results()!.totalCompileTime.stdDev }}ms</td>
              </tr>
              <tr>
                <td>Samples</td>
                <td>{{ results()!.totalCompileTime.samples.join(', ') }}ms</td>
              </tr>
            </tbody>
          </table>

          <!-- Export Actions -->
          <div class="margin-top-2">
            <button class="button secondary small" (click)="copyJson()">
              Copy JSON
            </button>
            <button
              class="button secondary small margin-left-1"
              (click)="copyFormatted()"
            >
              Copy Formatted
            </button>
            @if (previousResults()) {
              <button
                class="button secondary small margin-left-1"
                (click)="showComparison()"
              >
                Compare to Previous
              </button>
            }
          </div>
        </section>
      }

      @if (comparison()) {
        <section class="benchmark-comparison margin-bottom-2">
          <h3>Comparison</h3>
          <pre class="comparison-output">{{ comparison() }}</pre>
        </section>
      }

      @if (consoleOutput()) {
        <section class="benchmark-console">
          <h3>Console Output</h3>
          <pre class="console-output">{{ consoleOutput() }}</pre>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .benchmark-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }

      .benchmark-header h1 {
        margin-bottom: 0.5rem;
      }

      .progress-bar {
        height: 8px;
        background: #e8e8e8;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background: #1779ba;
        transition: width 0.3s ease;
      }

      .stat-card {
        background: #fefefe;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        padding: 1rem;
        text-align: center;
      }

      .stat-card.primary {
        border-color: #1779ba;
        background: #f0f7fb;
      }

      .stat-card.success {
        border-color: #3adb76;
        background: #f0fbf4;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0a0a0a;
      }

      .stat-label {
        font-size: 0.9rem;
        color: #767676;
        margin-top: 0.25rem;
      }

      .stat-note {
        font-size: 0.75rem;
        color: #999;
        margin-top: 0.25rem;
      }

      .console-output,
      .comparison-output {
        background: #2d2d2d;
        color: #f8f8f2;
        padding: 1rem;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.85rem;
        overflow-x: auto;
        white-space: pre-wrap;
      }

      table {
        width: 100%;
      }
    `,
  ],
})
class BenchmarkComponent {
  readonly iterations = signal(5);
  readonly running = signal(false);
  readonly progress = signal<string | null>(null);
  readonly progressPercent = signal(0);
  readonly results = signal<BenchmarkResult | null>(null);
  readonly previousResults = signal<BenchmarkResult | null>(null);
  readonly consoleOutput = signal<string | null>(null);
  readonly comparison = signal<string | null>(null);

  setIterations(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      this.iterations.set(value);
    }
  }

  async runBenchmark(): Promise<void> {
    this.running.set(true);
    this.progress.set('Starting benchmark...');
    this.progressPercent.set(0);
    this.comparison.set(null);

    // Save previous results for comparison
    const prev = this.results();
    if (prev) {
      this.previousResults.set(prev);
    }

    try {
      const results = await runBenchmark({
        iterations: this.iterations(),
        onProgress: (message, percent) => {
          this.progress.set(message);
          this.progressPercent.set(percent);
        },
      });

      this.results.set(results);
      this.consoleOutput.set(formatBenchmarkResults(results));
      this.progress.set(null);
    } catch (error) {
      this.progress.set(`Error: ${error}`);
      console.error('[benchmark] Error:', error);
    } finally {
      this.running.set(false);
    }
  }

  copyJson(): void {
    const results = this.results();
    if (results) {
      navigator.clipboard.writeText(exportBenchmarkJson(results));
    }
  }

  copyFormatted(): void {
    const output = this.consoleOutput();
    if (output) {
      navigator.clipboard.writeText(output);
    }
  }

  showComparison(): void {
    const prev = this.previousResults();
    const curr = this.results();
    if (prev && curr) {
      const { summary } = compareBenchmarks(prev, curr);
      this.comparison.set(summary);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Story Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const meta: Meta<BenchmarkComponent> = {
  title: 'Dev Tools/Sass Benchmark',
  component: BenchmarkComponent,
  parameters: {
    // Disable theme panel for benchmark tool
    themePanelDisabled: true,
    docs: {
      description: {
        component: `
# Sass Compilation Benchmark

This tool measures the performance of browser-based Sass compilation
used by the runtime theming system.

## Metrics

- **Worker Init**: Time to initialize the Web Worker and load Dart Sass from CDN
- **Total Compile**: Time to compile all components with a given theme state
- **Cache Hit**: Time to retrieve a cached compilation result

## Usage

1. Set the number of iterations (more = more accurate, but slower)
2. Click "Run Benchmark" to start
3. Results will display with statistical analysis
4. Use "Copy JSON" to export for comparison

## When to Use

- Before and after implementing optimizations
- To establish baseline performance metrics
- To validate that changes improve compilation time
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<BenchmarkComponent>;

/**
 * Interactive benchmark tool for measuring Sass compilation performance.
 */
export const Default: Story = {};
