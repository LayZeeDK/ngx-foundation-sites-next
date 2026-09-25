// PROTOTYPE -- same spec on Playwright 1.40 engines (Chromium 120, Firefox 119, WebKit 17.4), nearest to the browser target.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 3,
  reporter: [['list']],
  // Tall viewport: the whole page fits, so no scrolling moves coordinates between measurements.
  use: { baseURL: 'http://localhost:4450', viewport: { width: 1000, height: 2600 } },
  webServer: {
    command: 'node ../slider-proto/dist/slider-proto/server/server.mjs',
    env: { PORT: '4450' },
    url: 'http://localhost:4450/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 2600 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1000, height: 2600 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1000, height: 2600 } } },
  ],
});
