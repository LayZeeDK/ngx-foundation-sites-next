#!/usr/bin/env node
/**
 * Sass Source Bundler for Browser Compilation
 *
 * Bundles all necessary Sass files (Foundation + library) into a TypeScript module
 * that can be used by the browser Sass compiler for runtime theming.
 *
 * Output: src/storybook/generated/sass-bundle.ts
 *
 * Usage:
 *   node packages/ngx-foundation-sites/tools/bundle-sass-sources.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const FOUNDATION_SCSS = resolve(
  PACKAGE_ROOT,
  '../../node_modules/foundation-sites/scss',
);
const LIB_SCSS = resolve(PACKAGE_ROOT, 'src/lib/scss');
const OUTPUT_DIR = resolve(PACKAGE_ROOT, 'src/storybook/generated');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'sass-bundle.ts');

/**
 * Files to bundle, organized by their canonical import paths.
 *
 * The keys are how files will be imported in Sass:
 * - Without leading underscore (Sass convention)
 * - With appropriate path prefixes
 */
const FILES_TO_BUNDLE = {
  // ─────────────────────────────────────────────────────────────────────────
  // Library files
  // ─────────────────────────────────────────────────────────────────────────
  'nfs-settings': resolve(LIB_SCSS, 'defaults/_nfs-settings.scss'),
  accordion: resolve(LIB_SCSS, 'accordion.scss'),
  button: resolve(LIB_SCSS, 'button.scss'),

  // ─────────────────────────────────────────────────────────────────────────
  // Foundation Utilities (foundation-sites/scss/util/*)
  // ─────────────────────────────────────────────────────────────────────────
  'foundation-sites/scss/util/util': resolve(
    FOUNDATION_SCSS,
    'util/_util.scss',
  ),
  'foundation-sites/scss/util/math': resolve(
    FOUNDATION_SCSS,
    'util/_math.scss',
  ),
  'foundation-sites/scss/util/unit': resolve(
    FOUNDATION_SCSS,
    'util/_unit.scss',
  ),
  'foundation-sites/scss/util/value': resolve(
    FOUNDATION_SCSS,
    'util/_value.scss',
  ),
  'foundation-sites/scss/util/direction': resolve(
    FOUNDATION_SCSS,
    'util/_direction.scss',
  ),
  'foundation-sites/scss/util/color': resolve(
    FOUNDATION_SCSS,
    'util/_color.scss',
  ),
  'foundation-sites/scss/util/selector': resolve(
    FOUNDATION_SCSS,
    'util/_selector.scss',
  ),
  'foundation-sites/scss/util/flex': resolve(
    FOUNDATION_SCSS,
    'util/_flex.scss',
  ),
  'foundation-sites/scss/util/breakpoint': resolve(
    FOUNDATION_SCSS,
    'util/_breakpoint.scss',
  ),
  'foundation-sites/scss/util/mixins': resolve(
    FOUNDATION_SCSS,
    'util/_mixins.scss',
  ),
  'foundation-sites/scss/util/typography': resolve(
    FOUNDATION_SCSS,
    'util/_typography.scss',
  ),

  // ─────────────────────────────────────────────────────────────────────────
  // Foundation Global
  // ─────────────────────────────────────────────────────────────────────────
  'foundation-sites/scss/global': resolve(FOUNDATION_SCSS, '_global.scss'),

  // ─────────────────────────────────────────────────────────────────────────
  // Foundation Vendor
  // ─────────────────────────────────────────────────────────────────────────
  'foundation-sites/scss/vendor/normalize': resolve(
    FOUNDATION_SCSS,
    'vendor/normalize.scss',
  ),

  // ─────────────────────────────────────────────────────────────────────────
  // Foundation Components
  // ─────────────────────────────────────────────────────────────────────────
  'foundation-sites/scss/components/accordion': resolve(
    FOUNDATION_SCSS,
    'components/_accordion.scss',
  ),
  'foundation-sites/scss/components/button': resolve(
    FOUNDATION_SCSS,
    'components/_button.scss',
  ),
  'foundation-sites/scss/components/visibility': resolve(
    FOUNDATION_SCSS,
    'components/_visibility.scss',
  ),
};

/**
 * Transforms Sass code to use compatible module syntax for global functions.
 *
 * The JSPM CDN's Sass build has removed deprecated global functions:
 * - Math: round, ceil, floor, abs, percentage, min, max
 * - Color: red, green, blue, alpha, opacity
 *
 * Additionally, Foundation's newer code uses `color.channel()` which is only
 * available in Dart Sass 1.57.0+. JSPM CDN may serve an older version, so we
 * also transform `color.channel($color, "red", $space: rgb)` → `color.red($color)`.
 *
 * @param {string} content - Sass source content
 * @param {string} canonicalPath - The canonical import path (for logging)
 * @returns {string} Transformed content
 */
function transformSassForModernSyntax(content, canonicalPath) {
  // Only transform Foundation files that use global functions
  if (!canonicalPath.includes('foundation-sites')) {
    return content;
  }

  let transformed = content;
  let needsMathImport = false;
  let needsColorImport = false;

  // ─────────────────────────────────────────────────────────────────────────────
  // Transform color.channel() to older color.red/green/blue functions
  // color.channel($color, "red", $space: rgb) → color.red($color)
  // ─────────────────────────────────────────────────────────────────────────────
  const channelColors = ['red', 'green', 'blue'];
  for (const colorName of channelColors) {
    // Match: color.channel($anything, "red", $space: rgb)
    // Replace with: color.red($anything)
    const channelRegex = new RegExp(
      `color\\.channel\\(([^,]+),\\s*["']${colorName}["'],\\s*\\$space:\\s*rgb\\)`,
      'g',
    );
    if (channelRegex.test(transformed)) {
      transformed = transformed.replace(
        new RegExp(
          `color\\.channel\\(([^,]+),\\s*["']${colorName}["'],\\s*\\$space:\\s*rgb\\)`,
          'g',
        ),
        `color.${colorName}($1)`,
      );
      console.log(
        `  [transform] Replaced color.channel → color.${colorName} in ${canonicalPath}`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Transform global functions to module syntax
  // ─────────────────────────────────────────────────────────────────────────────
  // Module configurations: { namespace: [functions] }
  const moduleConfigs = {
    math: ['round', 'ceil', 'floor', 'abs', 'percentage', 'min', 'max'],
    color: ['red', 'green', 'blue', 'alpha', 'opacity'],
  };

  for (const [namespace, functions] of Object.entries(moduleConfigs)) {
    for (const fn of functions) {
      // Match function calls that:
      // - Aren't already namespaced (not preceded by a dot: math.round, color.red)
      // - Aren't part of a hyphenated name (not preceded by hyphen: ratio-to-percentage)
      // - Aren't a Sass variable (not preceded by $: $red-value)
      // Use word boundary to avoid matching partial names
      const testRegex = new RegExp(`(?<![.\\-$])\\b${fn}\\s*\\(`, 'g');
      if (testRegex.test(transformed)) {
        if (namespace === 'math') needsMathImport = true;
        if (namespace === 'color') needsColorImport = true;

        // Replace function calls, excluding @function declarations
        transformed = transformed.replace(
          new RegExp(
            `(?<!@function\\s+[\\w-]*)(?<![.\\-$])\\b${fn}\\s*\\(`,
            'g',
          ),
          `${namespace}.${fn}(`,
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Add @use statements if needed
  // ─────────────────────────────────────────────────────────────────────────────
  const useStatements = [];
  if (needsMathImport && !transformed.includes('@use "sass:math"')) {
    useStatements.push('@use "sass:math";');
    console.log(`  [transform] Added sass:math to ${canonicalPath}`);
  }
  if (needsColorImport && !transformed.includes('@use "sass:color"')) {
    useStatements.push('@use "sass:color";');
    console.log(`  [transform] Added sass:color to ${canonicalPath}`);
  }

  // Insert @use statements if needed
  if (useStatements.length > 0) {
    const useBlock = useStatements.join('\n') + '\n';

    if (transformed.includes('@use ')) {
      // Find the last @use statement and insert after it
      const useRegex = /@use\s+["'][^"']+["'];?\s*\n/g;
      let lastMatch = null;
      let match;
      while ((match = useRegex.exec(transformed)) !== null) {
        lastMatch = match;
      }
      if (lastMatch) {
        const insertPos = lastMatch.index + lastMatch[0].length;
        transformed =
          transformed.slice(0, insertPos) +
          useBlock +
          transformed.slice(insertPos);
      }
    } else {
      // No @use statements, add at the beginning (after any initial comments)
      const commentEndRegex = /^(\/\/.*\n|\/\*[\s\S]*?\*\/\s*\n)*/;
      const commentMatch = transformed.match(commentEndRegex);
      const insertPos = commentMatch ? commentMatch[0].length : 0;
      transformed =
        transformed.slice(0, insertPos) +
        useBlock +
        transformed.slice(insertPos);
    }
  }

  return transformed;
}

/**
 * Escapes special characters for embedding in a template literal.
 * @param {string} content - Raw file content
 * @returns {string} Escaped content safe for template literals
 */
function escapeForTemplateLiteral(content) {
  return content
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/`/g, '\\`') // Escape backticks
    .replace(/\$\{/g, '\\${'); // Escape template interpolation
}

/**
 * Reads and validates all source files.
 * Applies transformations to modernize legacy Sass syntax.
 * @returns {Map<string, string>} Map of canonical path to file content
 */
function readSourceFiles() {
  const sources = new Map();
  const errors = [];

  for (const [canonicalPath, filePath] of Object.entries(FILES_TO_BUNDLE)) {
    if (!existsSync(filePath)) {
      errors.push(`  Missing: ${canonicalPath} -> ${filePath}`);
      continue;
    }

    try {
      let content = readFileSync(filePath, 'utf8');
      // Transform Foundation files to use modern sass:math syntax
      content = transformSassForModernSyntax(content, canonicalPath);
      sources.set(canonicalPath, content);
    } catch (error) {
      errors.push(`  Error reading ${filePath}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error('Errors reading source files:');
    errors.forEach((e) => console.error(e));
    process.exit(1);
  }

  return sources;
}

/**
 * Generates the TypeScript module content.
 * @param {Map<string, string>} sources - Map of canonical path to file content
 * @returns {string} Generated TypeScript code
 */
function generateTypeScript(sources) {
  const entries = [];

  for (const [canonicalPath, content] of sources) {
    const escaped = escapeForTemplateLiteral(content);
    entries.push(`  '${canonicalPath}': \`${escaped}\``);
  }

  const timestamp = new Date().toISOString();

  return `/**
 * Bundled Sass Sources for Browser Compilation
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated: ${timestamp}
 *
 * This module contains all Sass source files needed for runtime theming.
 * The browser Sass compiler uses this bundle with a custom importer.
 */

/**
 * Map of canonical import paths to Sass source content.
 *
 * Keys are import paths as they appear in @import statements:
 * - 'nfs-settings' -> library settings
 * - 'accordion' -> library accordion component
 * - 'foundation-sites/scss/util/util' -> Foundation utilities
 * - 'foundation-sites/scss/global' -> Foundation globals
 * - 'foundation-sites/scss/components/accordion' -> Foundation accordion
 */
export const SASS_SOURCES: Record<string, string> = {
${entries.join(',\n')}
};

/**
 * List of available component names for runtime compilation.
 */
export const AVAILABLE_COMPONENTS = ['accordion', 'button'] as const;

/**
 * Type for available component names.
 */
export type AvailableComponent = (typeof AVAILABLE_COMPONENTS)[number];
`;
}

/**
 * Main entry point.
 */
function main() {
  console.log('Bundling Sass sources for browser compilation...');
  console.log('');

  // Read all source files
  console.log('Reading source files...');
  const sources = readSourceFiles();
  console.log(`  Found ${sources.size} files`);
  console.log('');

  // List files being bundled
  console.log('Files included:');
  for (const canonicalPath of sources.keys()) {
    console.log(`  ${canonicalPath}`);
  }
  console.log('');

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate and write TypeScript module
  console.log('Generating TypeScript module...');
  const tsContent = generateTypeScript(sources);
  writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`  Output: ${OUTPUT_FILE}`);
  console.log('');

  // Calculate bundle size
  const bundleSize = Buffer.byteLength(tsContent, 'utf8');
  const bundleSizeKB = (bundleSize / 1024).toFixed(1);
  console.log(`Bundle size: ${bundleSizeKB} KB`);
  console.log('');

  console.log('Done!');
}

main();
