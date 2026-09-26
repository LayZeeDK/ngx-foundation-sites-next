import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). Server is started by hand (development build + the
// SSR Express server on PORT=4602); see README.md "How to run". No webServer
// option -- one server at a time, started deliberately, per the map's
// practical constraints on this shared machine.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4602',
    viewport: { width: 1300, height: 900 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
