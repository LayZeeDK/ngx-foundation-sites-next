import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

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
      reuseExistingServer: !process.env['CI'],
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx serve-static consumer-test-app',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
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
