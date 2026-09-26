import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). The SSR server is started by hand on port 4430
// (production build + dist/app/server/server.mjs); see README.md.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4430' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
