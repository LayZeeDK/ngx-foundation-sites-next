// PROTOTYPE -- runs the production SSR build (node server on port 4861) in three engines.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4861;

export default defineConfig({
  testDir: './e2e',
  workers: 3,
  reporter: [['list']],
  // Tall viewport: the whole page fits, so no scrolling moves coordinates between measurements.
  use: { baseURL: `http://localhost:${PORT}`, viewport: { width: 1000, height: 1600 } },
  webServer: {
    command: 'node dist/slider-proto/server/server.mjs',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 1600 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1000, height: 1600 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1000, height: 1600 } } },
  ],
});
