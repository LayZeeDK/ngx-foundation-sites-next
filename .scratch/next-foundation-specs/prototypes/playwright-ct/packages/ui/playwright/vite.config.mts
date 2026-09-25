// PROTOTYPE candidates 2 and 3: a project-owned Vite gallery page for Playwright's mount() fixture.
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const workspaceRoot = resolve(import.meta.dirname, '../../..');

export default defineConfig({
  root: resolve(import.meta.dirname, 'gallery'),
  // jit: the Storybook Angular renderer reads @Component decorator metadata at runtime (as angular-vite does).
  plugins: [angular({ jit: true, tsconfig: resolve(import.meta.dirname, 'tsconfig.json') })],
  // @storybook/angular-vite's renderer reads this global; its viteFinal defines it, we must too.
  define: { STORYBOOK_ANGULAR_OPTIONS: JSON.stringify({ zoneless: true }) },
  // Pre-bundle what Vite would otherwise discover mid-run: a late discovery reloads the page and kills tests.
  optimizeDeps: { include: ['@angular/compiler', 'tslib'] },
  server: { port: 4411, strictPort: true, fs: { allow: [workspaceRoot] } },
});
