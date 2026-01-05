/**
 * Sass Browser Entry Point
 *
 * This wrapper sets up required polyfills before importing Sass,
 * ensuring process.stdout/stderr exist when Sass initializes.
 *
 * Dart Sass (compiled via Dart2JS) checks process.stdout.isTTY for
 * colored terminal output, which doesn't exist in browsers.
 */

// Set up TTY polyfill BEFORE importing Sass
// This must happen synchronously at module evaluation time
const ttyStub = {
  isTTY: false,
  write: () => true,
  on: () => {},
  once: () => {},
  emit: () => false,
  end: () => {},
  columns: 80,
  rows: 24,
};

// Ensure process exists
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: { NODE_ENV: 'production' },
    cwd: () => '/',
    platform: 'browser',
  };
}

// Use Object.defineProperty to override potentially read-only properties
// The polyfill plugin may create getters that prevent direct assignment
Object.defineProperty(globalThis.process, 'stdout', {
  value: ttyStub,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis.process, 'stderr', {
  value: { ...ttyStub },
  writable: true,
  configurable: true,
});

// Now import and re-export Sass (polyfills are ready)
export * from 'sass';
