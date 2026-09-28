import { defineConfig, devices } from '@playwright/test';

// Start the SSR dev server first: `npm start` (port 5470). Chromium runs the matrix; Firefox and
// WebKit run only the attribute-case test (@engines).
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5470' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /@engines/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grep: /@engines/ },
  ],
});
