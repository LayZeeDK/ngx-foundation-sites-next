import { defineConfig, devices } from '@playwright/test';

// Port range reserved for this session's prototypes: 4470-4479. Not started
// through webServer here because reduced-motion needs a per-project context
// option (see e2e/animate-enter.spec.ts); the static server is started by
// hand, see prototypes/motion-ui-animate-enter/README.md.
const baseURL = 'http://localhost:4472';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Kept low on purpose: this machine runs several other agents' prototypes
  // at the same time, and full default parallelism (6 projects x workers)
  // produced one flaky timing assertion under CPU contention (still resolved
  // by the timeout, just slower than expected) that a single-worker rerun
  // did not reproduce. 2 workers is fast enough and reliable here.
  workers: 2,
  use: {
    baseURL,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'chromium-reduced-motion',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
    {
      name: 'firefox-reduced-motion',
      use: { ...devices['Desktop Firefox'], reducedMotion: 'reduce' },
    },
    {
      name: 'webkit-reduced-motion',
      use: { ...devices['Desktop Safari'], reducedMotion: 'reduce' },
    },
  ],
});
