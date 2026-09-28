// Q5: which targetDefaults survive per-project syncGenerators, and what an executor-keyed
// entry for the sync generator does. Run from the nx-ws root; restores nx.json and project.json.
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const SYNC = 'ngx-foundation-sites:variant-types-sync';
const nxJsonText = fs.readFileSync('nx.json', 'utf8');
const projectText = fs.readFileSync('apps/shop/project.json', 'utf8');
const nxJson = JSON.parse(nxJsonText);
const perProject = JSON.parse(projectText);
const withoutSync = JSON.parse(projectText);
for (const t of Object.values(withoutSync.targets)) delete t.syncGenerators;
const noSpread = JSON.parse(projectText);
for (const t of Object.values(noSpread.targets))
  if (t.syncGenerators) t.syncGenerators = [SYNC];

const NAME_MARK = '{workspaceRoot}/marker-name-key';
const EXEC_MARK = '{workspaceRoot}/marker-executor-key';
const nameKeyed = {
  build: {
    cache: true,
    dependsOn: ['^build'],
    inputs: ['production', '^production', NAME_MARK],
  },
  serve: { dependsOn: ['^build'] },
  test: { cache: true, inputs: ['default', '^production', NAME_MARK] },
};
const presetExec = {
  '@angular/build:application': {
    cache: true,
    dependsOn: ['^build'],
    inputs: ['production', '^production', EXEC_MARK],
  },
};
const syncExec = {
  '@angular/build:application': { syncGenerators: [SYNC] },
  '@angular/build:dev-server': { syncGenerators: [SYNC] },
  '@angular/build:unit-test': { syncGenerators: [SYNC] },
};

const variants = {
  'A preset executor-keyed defaults + per-project spread': {
    td: presetExec,
    project: perProject,
  },
  'B name-keyed defaults + per-project spread': {
    td: nameKeyed,
    project: perProject,
  },
  'C name-keyed defaults + executor-keyed entries for the sync generator (no per-project)':
    { td: { ...nameKeyed, ...syncExec }, project: withoutSync },
  'D preset executor-keyed defaults with syncGenerators merged into that entry (no per-project)':
    {
      td: {
        '@angular/build:application': {
          ...presetExec['@angular/build:application'],
          syncGenerators: [SYNC],
        },
        '@angular/build:dev-server': { syncGenerators: [SYNC] },
        '@angular/build:unit-test': { syncGenerators: [SYNC] },
      },
      project: withoutSync,
    },
  'E name-keyed and preset executor-keyed defaults together + per-project spread':
    { td: { ...nameKeyed, ...presetExec }, project: perProject },
  'F executor-keyed syncGenerators from another tool + per-project spread': {
    td: {
      '@angular/build:application': {
        ...presetExec['@angular/build:application'],
        syncGenerators: ['@nx/js:typescript-sync'],
      },
    },
    project: perProject,
  },
  'G executor-keyed syncGenerators from another tool + per-project without the spread':
    {
      td: {
        '@angular/build:application': {
          ...presetExec['@angular/build:application'],
          syncGenerators: ['@nx/js:typescript-sync'],
        },
      },
      project: noSpread,
    },
};

const results = {};
const warnings = {};

try {
  for (const [name, v] of Object.entries(variants)) {
    fs.writeFileSync(
      'nx.json',
      JSON.stringify({ ...nxJson, targetDefaults: v.td }, null, 2),
    );
    fs.writeFileSync(
      'apps/shop/project.json',
      JSON.stringify(v.project, null, 2),
    );
    const run = spawnSync('npx nx show project shop --json', {
      shell: true,
      env: { ...process.env, NX_DAEMON: 'false' },
      encoding: 'utf8',
    });
    const shown = JSON.parse(run.stdout);
    warnings[name] = run.stderr
      .replace(/\x1b\[[0-9;]*m/g, '')
      .split('\n')
      .filter((l) => l.trim());
    results[name] = Object.fromEntries(
      ['build', 'serve', 'test'].map((t) => {
        const target = shown.targets[t] ?? {};

        return [
          t,
          {
            cache: target.cache,
            dependsOn: target.dependsOn,
            inputs: target.inputs,
            syncGenerators: target.syncGenerators,
          },
        ];
      }),
    );
  }
} finally {
  fs.writeFileSync('nx.json', nxJsonText);
  fs.writeFileSync('apps/shop/project.json', projectText);
}

fs.writeFileSync(
  '../logs/q5-target-defaults.json',
  JSON.stringify({ results, warnings }, null, 2) + '\n',
);

for (const [name, targets] of Object.entries(results)) {
  console.log(`\n${name}`);

  for (const [t, v] of Object.entries(targets)) {
    console.log(
      `  ${t}: cache=${v.cache} dependsOn=${JSON.stringify(v.dependsOn)} inputs=${JSON.stringify(v.inputs)} syncGenerators=${JSON.stringify(v.syncGenerators)}`,
    );
  }

  if (warnings[name].length) {
    console.log(`  Nx warned: ${warnings[name].join(' ')}`);
  }
}
