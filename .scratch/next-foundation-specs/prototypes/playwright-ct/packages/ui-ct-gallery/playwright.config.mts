import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// PROTOTYPE candidates 2 and 3: Playwright's built-in mount() over a project-owned Vite gallery
// (packages/ui/playwright/gallery), not the Storybook build.
const gallery = 'http://localhost:4411/index.html';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  use: { trace: 'on-first-retry', serviceWorkers: 'block' },
  webServer: {
    command: 'npx vite --config packages/ui/playwright/vite.config.mts',
    url: gallery,
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    { name: 'angular-native', testMatch: /component\.ct\.spec\.ts$/, use: { ...devices['Desktop Chrome'], baseURL: gallery } },
    { name: 'portable-stories', testMatch: /portable\.ct\.spec\.ts$/, use: { ...devices['Desktop Chrome'], baseURL: gallery } },
    { name: 'portable-stories-play', testMatch: /portable\.play\.spec\.ts$/, use: { ...devices['Desktop Chrome'], baseURL: `${gallery}?play` } },
  ],
});
