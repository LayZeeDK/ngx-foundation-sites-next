import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// RTL tests use port 4211 to avoid conflicts
const baseURL = process.env['BASE_URL'] || 'http://localhost:4211';

/**
 * RTL-specific Playwright configuration.
 *
 * This config serves the RTL build of consumer-test-app on port 4211
 * and runs only the RTL-specific test files.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  // Only run RTL-specific tests
  testMatch: '**/rtl-*.spec.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx nx run consumer-test-app:serve:rtl --port=4211',
    url: 'http://localhost:4211',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
