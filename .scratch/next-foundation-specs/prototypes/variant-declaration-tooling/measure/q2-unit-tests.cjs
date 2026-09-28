// Q2: do the unit-test builders see the Variant declaration file? For each command: run with the
// file (a declared name must compile and the test pass), then with the file moved away (the
// program must fail closed with TS2322). Usage: node q2-unit-tests.cjs <cli|nx>
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const kind = process.argv[2];
const ws = path.resolve(__dirname, kind === 'cli' ? '../cli-ws' : '../nx-ws');
const runs =
  kind === 'cli'
    ? [
        {
          name: 'ng test (@angular/build:unit-test, Vitest, jsdom)',
          cmd: 'npx ng test --watch=false',
          files: ['src/nfs-variants.d.ts'],
        },
        {
          name: 'ng test --browsers=ChromiumHeadless (Vitest browser mode, Playwright)',
          cmd: 'npx ng test --watch=false --browsers=ChromiumHeadless',
          files: ['src/nfs-variants.d.ts'],
        },
      ]
    : [
        {
          name: 'nx test shop (@angular/build:unit-test, jsdom)',
          cmd: 'npx nx test shop --skip-nx-cache --skip-sync',
          files: ['apps/shop/src/nfs-variants.d.ts'],
        },
        {
          name: 'nx test shop --browsers=ChromiumHeadless (browser mode)',
          cmd: 'npx nx test shop --skip-nx-cache --skip-sync --browsers=ChromiumHeadless',
          files: ['apps/shop/src/nfs-variants.d.ts'],
        },
        {
          name: 'nx test ui (@nx/angular:unit-test, jsdom)',
          cmd: 'npx nx test ui --skip-nx-cache --skip-sync',
          files: ['libs/ui/src/nfs-variants.d.ts'],
        },
        {
          name: 'nx test ui --browsers=ChromiumHeadless (@nx/angular:unit-test, browser mode)',
          cmd: 'npx nx test ui --skip-nx-cache --skip-sync --browsers=ChromiumHeadless',
          files: ['libs/ui/src/nfs-variants.d.ts'],
        },
      ];
const only = process.env.ONLY ? Number(process.env.ONLY) : null;
const env = {
  ...process.env,
  NX_DAEMON: 'false',
  CI: 'true',
  FORCE_COLOR: '0',
  NG_CLI_ANALYTICS: 'false',
};
const results = [];

function run(cmd) {
  const r = spawnSync(cmd, {
    cwd: ws,
    shell: true,
    encoding: 'utf8',
    env,
    timeout: 600000,
  });
  const text = `${r.stdout}${r.stderr}`.replace(/\x1b\[[0-9;]*m/g, '');
  const diag = text
    .split('\n')
    .filter((l) => /TS\d{4}/.test(l))
    .map((l) => l.trim())
    .slice(0, 4);
  const tests = (text.match(/Tests\s+\d+[^\n]*/) ?? [''])[0].trim();

  return {
    exit: r.status,
    diag,
    tests,
    tail: text
      .split('\n')
      .filter((l) => l.trim())
      .slice(-6),
  };
}

for (const [i, r] of runs.entries()) {
  if (only !== null && only !== i) {
    continue;
  }

  const withFile = run(r.cmd);
  const moved = r.files.map((f) => [
    path.join(ws, f),
    path.join(ws, `${f}.moved`),
  ]);
  moved.forEach(([a, b]) => fs.renameSync(a, b));
  let withoutFile;

  try {
    withoutFile = run(r.cmd);
  } finally {
    moved.forEach(([a, b]) => fs.renameSync(b, a));
  }

  const entry = { name: r.name, withFile, withoutFile };
  results.push(entry);
  console.log(`\n## ${r.name}`);
  console.log(
    `with the file: exit ${withFile.exit}; ${withFile.tests || withFile.tail.join(' | ')}; diagnostics: ${withFile.diag.join(' / ') || 'none'}`,
  );
  console.log(
    `without the file: exit ${withoutFile.exit}; ${withoutFile.tests}; diagnostics: ${withoutFile.diag.join(' / ') || 'none'}`,
  );

  if (!withoutFile.diag.length) {
    console.log(`  tail: ${withoutFile.tail.join(' | ')}`);
  }
}

fs.writeFileSync(
  path.resolve(
    __dirname,
    `../logs/q2-unit-tests-${kind}${only !== null ? `-${only}` : ''}.json`,
  ),
  JSON.stringify(results, null, 2) + '\n',
);
