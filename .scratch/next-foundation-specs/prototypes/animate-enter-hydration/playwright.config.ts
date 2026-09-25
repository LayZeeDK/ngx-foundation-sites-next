import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). Server is started manually (production build + the
// SSR express server on port 4521); see README.md "How to run". Not using
// Playwright's webServer option because the map's practical constraints ask
// for one server at a time, started deliberately by the agent, not auto-spawned.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4521',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
