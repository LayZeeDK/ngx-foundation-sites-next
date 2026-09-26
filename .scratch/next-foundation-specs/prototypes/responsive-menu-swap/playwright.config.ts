import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). The SSR server is started by hand on port 4705
// (`bash serve.sh` after `npx ng build`); see the README in the effort directory.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4705' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
