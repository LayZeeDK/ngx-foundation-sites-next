// PROTOTYPE spike: @sand4rt/experimental-ct-angular 1.61.1 (bundles Playwright 1.61.1) on Angular 22.2.
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, devices } from '@sand4rt/experimental-ct-angular';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: 'tests',
  reporter: 'list',
  use: {
    ctPort: 4412,
    ctViteConfig: {
      plugins: [angular({ tsconfig: resolve('./tsconfig.spec.json') }) as any],
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
