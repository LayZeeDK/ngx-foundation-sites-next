import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). The SSR server is started by hand (production build plus the
// Express server), one at a time: PORT=4460 node dist/orbit/server/server.mjs.
// BASE_URL switches to the zone build's server (4461) for the zone spec.
export default defineConfig({
  testDir: process.env['BASE_URL']?.endsWith('4461') ? './e2e-zone' : './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4460',
    viewport: { width: 1000, height: 800 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 800 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1000, height: 800 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1000, height: 800 } } },
  ],
});
