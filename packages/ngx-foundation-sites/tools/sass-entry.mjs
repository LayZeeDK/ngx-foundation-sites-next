/**
 * Sass Browser Entry Point
 *
 * This wrapper provides a complete process polyfill with TTY stubs before
 * importing Sass. The polyfill plugin's default process lacks stdout/stderr
 * objects, which Dart Sass requires for TTY detection.
 *
 * IMPORTANT: This file disables the polyfill plugin's process polyfill
 * (see bundle-sass-compiler.mjs) and provides our own complete implementation.
 */

// Create TTY stub for stdout/stderr
const createTTYStub = () => ({
  isTTY: false,
  write: () => true,
  read: () => null,
  on: () => {},
  once: () => {},
  off: () => {},
  emit: () => false,
  end: () => {},
  destroy: () => {},
  pipe: () => {},
  unpipe: () => {},
  setEncoding: () => {},
  pause: () => {},
  resume: () => {},
  columns: 80,
  rows: 24,
  getWindowSize: () => [80, 24],
  hasColors: () => false,
  getColorDepth: () => 1,
  clearLine: () => true,
  clearScreenDown: () => true,
  cursorTo: () => true,
  moveCursor: () => true,
});

// Minimal process polyfill for browser (compatible with Dart Sass)
const browserProcess = {
  // Core properties
  title: 'browser',
  browser: true,
  env: {
    NODE_ENV: 'production',
    PATH: '/usr/bin',
    LANG:
      typeof navigator !== 'undefined'
        ? navigator.language + '.UTF-8'
        : 'en-US.UTF-8',
    PWD: '/',
    HOME: '/home',
    TMP: '/tmp',
  },
  argv: ['/usr/bin/node'],
  execArgv: [],
  version: 'v18.0.0',
  versions: {},

  // TTY streams (required by Dart Sass)
  stdout: createTTYStub(),
  stderr: createTTYStub(),
  stdin: createTTYStub(),

  // Platform info
  arch: 'x64',
  platform: 'browser',
  pid: 1,
  ppid: 0,
  execPath: '/usr/bin/node',

  // Methods
  cwd: () => '/',
  chdir: () => {},
  exit: () => {},
  kill: () => {},
  umask: () => 0,
  uptime: () => 0,

  // Memory/resource stubs
  memoryUsage: () => ({
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0,
  }),
  cpuUsage: () => ({ user: 0, system: 0 }),
  resourceUsage: () => ({}),

  // Event emitter stubs
  on: () => browserProcess,
  once: () => browserProcess,
  off: () => browserProcess,
  addListener: () => browserProcess,
  removeListener: () => browserProcess,
  removeAllListeners: () => browserProcess,
  emit: () => false,
  prependListener: () => browserProcess,
  prependOnceListener: () => browserProcess,
  listeners: () => [],
  listenerCount: () => 0,
  eventNames: () => [],

  // nextTick implementation
  nextTick: (callback, ...args) => {
    queueMicrotask(() => callback(...args));
  },

  // hrtime implementation
  hrtime: (previousTimestamp) => {
    const clocktime = performance.now() * 1e-3;
    let seconds = Math.floor(clocktime);
    let nanoseconds = Math.floor((clocktime % 1) * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds, nanoseconds];
  },

  // Stubs for features we don't support
  binding: () => {
    throw new Error('process.binding is not supported');
  },
  _linkedBinding: () => {
    throw new Error('process._linkedBinding is not supported');
  },
  dlopen: () => {
    throw new Error('process.dlopen is not supported');
  },
  abort: () => {},
  emitWarning: (msg) => console.warn(msg),
  assert: (condition, message) => {
    if (!condition) throw new Error(message);
  },

  // Features
  features: {
    inspector: false,
    debug: false,
    uv: false,
    ipv6: false,
    tls_alpn: false,
    tls_sni: false,
    tls_ocsp: false,
    tls: false,
  },

  // Release info
  release: {
    name: 'node',
    sourceUrl: '',
    headersUrl: '',
    libUrl: '',
  },

  // Internal stubs
  _getActiveRequests: () => [],
  _getActiveHandles: () => [],
  reallyExit: () => {},
  _kill: () => {},
  _debugProcess: () => {},
  _debugEnd: () => {},
  _startProfilerIdleNotifier: () => {},
  _stopProfilerIdleNotifier: () => {},
  _tickCallback: () => {},
  _fatalExceptions: () => {},
  setUncaughtExceptionCaptureCallback: () => {},
  hasUncaughtExceptionCaptureCallback: () => false,
  domain: null,
  _exiting: false,
  config: {},
  moduleLoadList: [],
  allowedNodeEnvironmentFlags: {},
  debugPort: 9229,
  _preload_modules: [],
  setSourceMapsEnabled: () => {},
};

// Add bigint support to hrtime
browserProcess.hrtime.bigint = () => {
  const [seconds, nanoseconds] = browserProcess.hrtime();
  return BigInt(seconds) * BigInt(1e9) + BigInt(nanoseconds);
};

// Install as global
globalThis.process = browserProcess;

// Now import and re-export Sass (process polyfill is ready)
export * from 'sass';
