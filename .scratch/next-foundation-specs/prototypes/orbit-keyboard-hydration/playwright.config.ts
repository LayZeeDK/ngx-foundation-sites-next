import { defineConfig, devices } from '@playwright/test';

// PROTOTYPE (throwaway). The SSR server is started by hand, one at a time:
//   PORT=4650 node dist/orbit/server/server.mjs                (production build, e2e/)
//   PORT=4651 node dist/orbit-dev/server/server.mjs            (development build, e2e-hydration/)
// BASE_URL selects the testDir: 4651 runs the hydration/defer suite (it needs ngDevMode).
const viewport = { width: 1000, height: 800 };
const onDevServer = process.env['BASE_URL']?.endsWith('4651') ?? false;

export default defineConfig({
  testDir: onDevServer ? './e2e-hydration' : './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 30000,
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4650',
    viewport,
  },
  projects: onDevServer
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport } },
        { name: 'webkit', use: { ...devices['Desktop Safari'], viewport } },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport }, testIgnore: /scrollbar\.spec/ },
        { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport }, testIgnore: /scrollbar\.spec/ },
        { name: 'webkit', use: { ...devices['Desktop Safari'], viewport }, testIgnore: /scrollbar\.spec/ },
        {
          name: 'chromium-headed',
          use: { ...devices['Desktop Chrome'], viewport, headless: false },
          testMatch: /scrollbar\.spec/,
        },
        {
          name: 'firefox-headed',
          use: { ...devices['Desktop Firefox'], viewport, headless: false },
          testMatch: /scrollbar\.spec/,
        },
        {
          name: 'webkit-headed',
          use: { ...devices['Desktop Safari'], viewport, headless: false },
          testMatch: /scrollbar\.spec/,
        },
      ],
});
