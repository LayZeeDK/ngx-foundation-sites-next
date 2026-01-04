#!/usr/bin/env node
/**
 * Component CSS Build Script
 *
 * Compiles component SCSS files to CSS with Foundation defaults.
 * Generates both LTR (default) and RTL versions for the library package.
 *
 * Output (flat naming convention for Angular bundleName compatibility):
 *   packages/ngx-foundation-sites/dist-css/
 *   ├── nfs-accordion.css        (LTR)
 *   ├── nfs-accordion-rtl.css    (RTL)
 *   ├── nfs-button.css
 *   └── nfs-button-rtl.css
 *
 * The `nfs-` prefix allows consumers to use `bundleName: "nfs-accordion"`
 * which complies with Angular's bundleName validation pattern.
 *
 * Usage:
 *   node packages/ngx-foundation-sites/tools/build-component-css.mjs
 */

import { compileString } from 'sass';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const SRC_SCSS_DIR = resolve(PACKAGE_ROOT, 'src/lib/scss');
const OUTPUT_DIR = resolve(PACKAGE_ROOT, 'dist-css');

// Include paths for Sass compilation
const LOAD_PATHS = [
  resolve(SRC_SCSS_DIR, 'defaults'), // Library defaults (contains _nfs-settings.scss)
  SRC_SCSS_DIR, // Library's SCSS folder (component partials)
  resolve(PACKAGE_ROOT, '../../node_modules'), // Workspace node_modules
  resolve(PACKAGE_ROOT, '../../node_modules/foundation-sites/scss'), // Foundation internal imports
];

/**
 * Discovers component SCSS files by looking for non-partial files.
 * Partials (files starting with _) are excluded.
 *
 * @returns {string[]} Array of component names (e.g., ['accordion', 'button'])
 */
function discoverComponents() {
  const files = readdirSync(SRC_SCSS_DIR);
  return files
    .filter((file) => file.endsWith('.scss') && !file.startsWith('_'))
    .map((file) => basename(file, '.scss'));
}

/**
 * Compiles a component's SCSS with the specified text direction.
 *
 * @param {string} componentName - Component name (e.g., 'accordion')
 * @param {'ltr' | 'rtl'} direction - Text direction
 * @returns {string} Compiled CSS
 */
function compileComponent(componentName, direction) {
  const scssPath = resolve(SRC_SCSS_DIR, `${componentName}.scss`);
  const scssContent = readFileSync(scssPath, 'utf8');

  // Prepend direction variable so it's set BEFORE nfs-settings imports Foundation
  const source = `$global-text-direction: ${direction};\n${scssContent}`;

  const result = compileString(source, {
    loadPaths: LOAD_PATHS,
    silenceDeprecations: ['import', 'global-builtin'],
    style: 'compressed',
  });

  return result.css;
}

/**
 * Builds CSS for all components in both directions.
 */
function main() {
  console.log('Building component CSS...');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Discover components
  const components = discoverComponents();
  console.log(`Found components: ${components.join(', ')}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const component of components) {
    for (const direction of /** @type {const} */ (['ltr', 'rtl'])) {
      const filename =
        direction === 'ltr'
          ? `nfs-${component}.css`
          : `nfs-${component}-rtl.css`;
      const outputPath = resolve(OUTPUT_DIR, filename);

      try {
        process.stdout.write(`  Compiling ${filename}...`);
        const css = compileComponent(component, direction);
        writeFileSync(outputPath, css);
        console.log(' done');
        successCount++;
      } catch (error) {
        console.log(' FAILED');
        console.error(`    Error: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('');
  console.log(
    `Build complete: ${successCount} files generated, ${errorCount} errors`,
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
