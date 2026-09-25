import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// PROTOTYPE candidate 1: Playwright's built-in mount() fixture over the static Storybook iframe.
// The gallery (window.mount / window.unmount) lives in packages/ui/.storybook/playwright-gallery.ts.
const storybook = process.env['STORYBOOK_URL'] || 'http://localhost:4410';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  use: {
    trace: 'on-first-retry',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npx nx run ui:static-storybook',
    url: `${storybook}/iframe.html`,
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    // embed=true turns off Storybook's play-function autoplay: the Playwright test owns the interaction.
    {
      name: 'components',
      testMatch: /\.ct\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: `${storybook}/iframe.html?embed=true` },
    },
    // Without embed, Storybook runs the story's own play function; mount() resolves after it.
    {
      name: 'stories-play',
      testMatch: /\.play\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: `${storybook}/iframe.html` },
    },
    {
      name: 'components-firefox',
      testMatch: /\.ct\.spec\.ts$/,
      use: { ...devices['Desktop Firefox'], baseURL: `${storybook}/iframe.html?embed=true` },
    },
    {
      name: 'components-webkit',
      testMatch: /\.ct\.spec\.ts$/,
      use: { ...devices['Desktop Safari'], baseURL: `${storybook}/iframe.html?embed=true` },
    },
  ],
});
