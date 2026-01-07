import { defineConfig, devices } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';

/**
 * E2E Test Configuration
 *
 * Two test targets:
 * 1. Storybook (port 4400) - Component stories and interaction tests
 * 2. Consumer Test App (port 4200) - Consumer Sass theming verification
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npx nx static-storybook ngx-foundation-sites',
      url: 'http://localhost:4400',
      // Reuse servers to avoid flakiness from port churn (start/stop races can cause
      // transient ERR_CONNECTION_REFUSED during page.goto), especially when Nx runs
      // multiple targets in one CI process.
      reuseExistingServer: true,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx serve-static consumer-test-app',
      url: 'http://localhost:4200',
      // Same rationale as Storybook: prefer a stable long-lived server over
      // repeatedly restarting between suites.
      reuseExistingServer: true,
      cwd: workspaceRoot,
    },
  ],
  projects: [
    {
      name: 'storybook',
      testMatch: /(?<!consumer-theming)\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4400',
      },
    },
    {
      name: 'consumer-app',
      testMatch: /consumer-theming\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200',
      },
    },
  ],
});
