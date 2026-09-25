// PROTOTYPE: wall-clock timing of the three test paths on the same stories (Nx cache off).
import { spawnSync } from 'node:child_process';

const runs = [
  ['addon-vitest (nx test-storybook)', 'npx nx test-storybook ui --skip-nx-cache'],
  ['Vitest Browser, Angular builder (nx test)', 'npx nx test ui --browsers=chromiumHeadless --skip-nx-cache'],
  ['Playwright CT candidate 1, Chromium (nx e2e ui-ct)', 'npx nx e2e ui-ct --skip-nx-cache -- --project=components --project=stories-play'],
  ['Playwright CT candidates 2+3 (nx e2e ui-ct-gallery)', 'npx nx e2e ui-ct-gallery --skip-nx-cache'],
];

for (const [label, command] of runs) {
  const start = performance.now();
  const result = spawnSync(command, { shell: true, encoding: 'utf8' });
  const seconds = ((performance.now() - start) / 1000).toFixed(1);
  const out = (result.stdout + result.stderr).replace(/\x1b\[[0-9;]*m/g, '');
  const summary = out.match(/Tests\s+.*\(\d+\)|\d+ passed \([\d.]+m?s\)|\d+ failed/g) ?? [];
  const duration = out.match(/Duration\s+[\d.]+s|Run duration:\s+\S+/g) ?? [];
  console.log(`${label} | exit ${result.status} | wall ${seconds}s | ${summary.join(', ')} | ${duration.join(', ')}`);
}
