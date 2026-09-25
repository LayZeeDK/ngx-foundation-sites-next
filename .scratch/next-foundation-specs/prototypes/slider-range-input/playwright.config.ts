// PROTOTYPE -- runs the production SSR build (node server on port 4450) in three engines.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 3,
  reporter: [['list']],
  // Tall viewport: the whole page fits, so no scrolling moves coordinates between measurements.
  use: { baseURL: 'http://localhost:4450', viewport: { width: 1000, height: 2600 } },
  webServer: {
    command: 'node dist/slider-proto/server/server.mjs',
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
