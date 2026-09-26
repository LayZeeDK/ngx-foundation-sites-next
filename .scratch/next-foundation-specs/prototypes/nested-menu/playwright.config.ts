import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). The SSR server is started by hand (production build,
// then `PORT=4500 node dist/app/server/server.mjs`); see README "How to run".
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4500' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
