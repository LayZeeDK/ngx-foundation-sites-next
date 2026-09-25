// PROTOTYPE spike: @jscutlery/playwright-ct-angular 0.10.10 (bundles Playwright 1.47.1) on Angular 22.2.
import { defineConfig, devices } from '@jscutlery/playwright-ct-angular';
import { swcAngularUnpluginOptions } from '@jscutlery/swc-angular';
import swc from 'unplugin-swc';

export default defineConfig({
  testDir: 'src',
  testMatch: /pw\.ts$/,
  reporter: 'list',
  use: {
    ctPort: 4414,
    ctViteConfig: { plugins: [swc.vite(swcAngularUnpluginOptions())] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
