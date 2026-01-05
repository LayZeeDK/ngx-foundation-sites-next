#!/usr/bin/env node
/**
 * Bundle Dart Sass for Browser Use
 *
 * Creates a pre-bundled, minified version of Dart Sass with Node.js polyfills
 * for use in Web Workers. This eliminates CDN dependency and reduces load time.
 *
 * Output: .storybook/static/sass-browser.mjs
 *
 * Usage:
 *   node tools/bundle-sass-compiler.mjs
 *
 * The bundled module exports:
 *   - compileString(source, options) - Synchronous compilation
 *   - compileStringAsync(source, options) - Async compilation
 *   - SassNumber - Number value class for custom functions
 */

import * as esbuild from 'esbuild';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '.storybook', 'static');
const OUTPUT_FILE = join(OUTPUT_DIR, 'sass-browser.mjs');

async function bundle() {
  console.log('[bundle-sass] Starting Sass browser bundle...');
  const startTime = performance.now();

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    const result = await esbuild.build({
      // Entry point: wrapper that sets up TTY polyfills before importing Sass
      entryPoints: [join(__dirname, 'sass-entry.mjs')],

      // Output configuration
      outfile: OUTPUT_FILE,
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: ['es2024'], // Modern browsers only (Chrome 117+, Firefox 119+, Safari 17+)

      // Minification
      minify: true,
      sourcemap: false,

      // Node.js polyfills for browser
      // NOTE: We disable the process polyfill and provide our own in sass-entry.mjs
      // because the default polyfill has stdout/stderr as undefined, which breaks Dart Sass
      plugins: [
        polyfillNode({
          polyfills: {
            url: true,
            path: true,
            fs: true,
            util: true,
            buffer: true,
            stream: true,
            events: true,
            assert: true,
            process: false, // DISABLED - we provide our own with TTY stubs
          },
        }),
      ],

      // Define globals
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'globalThis',
      },

      // Tree-shaking
      treeShaking: true,

      // Logging
      logLevel: 'info',

      // Metafile for size analysis
      metafile: true,
    });

    const duration = Math.round(performance.now() - startTime);

    // Calculate bundle size from metafile
    const { outputs } = result.metafile;
    // Try both forward and backslash paths for Windows compatibility
    const normalizedPath = OUTPUT_FILE.replace(/\\/g, '/');
    const outputInfo =
      outputs[normalizedPath] ||
      outputs[Object.keys(outputs).find((k) => k.endsWith('sass-browser.mjs'))];
    const sizeKB = outputInfo ? Math.round(outputInfo.bytes / 1024) : 'unknown';

    console.log(`[bundle-sass] ✅ Bundle created: ${OUTPUT_FILE}`);
    console.log(`[bundle-sass] Size: ${sizeKB} KB`);
    console.log(`[bundle-sass] Duration: ${duration}ms`);

    return result;
  } catch (error) {
    console.error('[bundle-sass] ❌ Bundle failed:', error.message);
    process.exit(1);
  }
}

bundle();
