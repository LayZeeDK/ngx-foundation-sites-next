import { defineConfig, devices } from '@playwright/test';

// The SSR server is started by hand:
// PORT=4661 NG_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/app/server/server.mjs
export default defineConfig({
  testDir: './e2e',
  workers: 2,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4661' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
