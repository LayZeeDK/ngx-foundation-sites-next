// PROTOTYPE spike: @playwright-labs/selectors-angular 1.1.1 on Playwright 1.63 (installed with --legacy-peer-deps),
// against Storybook dev (development mode, port 4415) and the static build (production mode, port 4410).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  reporter: 'list',
  projects: [
    { name: 'storybook-dev', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4415/iframe.html?embed=true' } },
    { name: 'storybook-static', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4410/iframe.html?embed=true' } },
  ],
});
