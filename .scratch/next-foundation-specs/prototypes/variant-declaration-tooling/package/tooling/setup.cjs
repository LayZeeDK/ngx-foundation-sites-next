'use strict';
// PROTOTYPE (ticket 137): the setup generator ngx-foundation-sites:variant-types, an Nx
// generator that the Angular CLI runs as a schematic through convertNxGenerator.
const path = require('node:path');
const core = require('./core.cjs');

const EXECUTOR = 'ngx-foundation-sites:variant-types';
const SYNC = 'ngx-foundation-sites:variant-types-sync';
const APP_EXECUTORS = [
  '@angular/build:application',
  '@nx/angular:application',
  '@angular-devkit/build-angular:application',
];
const SYNC_EXECUTORS = [
  ...APP_EXECUTORS,
  '@angular/build:dev-server',
  '@nx/angular:dev-server',
  '@angular-devkit/build-angular:dev-server',
  '@angular/build:unit-test',
  '@nx/angular:unit-test',
  '@angular/build:karma',
  '@nx/angular:package',
  '@nx/angular:ng-packagr-lite',
];
const SYNC_TARGET_NAMES = [
  'storybook',
  'build-storybook',
  'test-storybook',
  'typecheck',
];

function requireDevkit() {
  try {
    return require('@nx/devkit');
  } catch {
    throw new Error(
      `${core.PREFIX} the schematic needs nx and @nx/devkit. Install them: npm install --save-dev nx @nx/devkit`,
    );
  }
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '(?:.*/)?');

  return new RegExp(`^${escaped}$`);
}

const NG_PACKAGR_EXECUTORS = [
  '@nx/angular:package',
  '@nx/angular:ng-packagr-lite',
  '@angular/build:ng-packagr',
  '@angular-devkit/build-angular:ng-packagr',
];

/**
 * Step 4 for library builds: ng-packagr sets the program's root names to the entry file
 * (ng-packagr 22.2.0 src/lib/ts/tsconfig.js), so `include` and `files` never reach it.
 * A relative `compilerOptions.types` entry does, and leaves the emitted typings untouched.
 */
function ensureInTypes(devkit, tree, tsconfigPath, file) {
  if (!tree.exists(tsconfigPath)) {
    return null;
  }

  const json = devkit.readJson(tree, tsconfigPath);
  const relative = `./${core.posix(path.posix.relative(path.posix.dirname(tsconfigPath), file))}`;
  const types = json.compilerOptions?.types;

  if (!Array.isArray(types)) {
    return `add "${relative}" to compilerOptions.types of ${tsconfigPath} (it lists no types, so the tooling does not add one and switch off automatic @types)`;
  }

  if (types.includes(relative)) {
    return null;
  }

  json.compilerOptions.types = [...types, relative];
  devkit.writeJson(tree, tsconfigPath, json);

  return `added ${relative} to compilerOptions.types of ${tsconfigPath} (a library build compiles its entry file only)`;
}

/** Step 4: make a tsconfig include the file; returns a report line when it edits one. */
function ensureIncluded(devkit, tree, tsconfigPath, file) {
  if (!tree.exists(tsconfigPath)) {
    return null;
  }

  const json = devkit.readJson(tree, tsconfigPath);
  const relative = core.posix(
    path.posix.relative(path.posix.dirname(tsconfigPath), file),
  );
  const matches = [...(json.files ?? []), ...(json.include ?? [])].some((p) =>
    globToRegExp(core.posix(p).replace(/^\.\//, '')).test(relative),
  );

  if (matches) {
    return null;
  }

  json.include = [...(json.include ?? []), relative];
  devkit.writeJson(tree, tsconfigPath, json);

  return `added ${relative} to the include of ${tsconfigPath}`;
}

async function variantTypesGenerator(tree, schema) {
  const devkit = requireDevkit();
  const isNx = tree.exists('nx.json');
  const workspaceKind = isNx ? 'nx' : 'cli';
  const projects = devkit.getProjects(tree);
  const graph = isNx ? await devkit.createProjectGraphAsync() : null;
  const names = schema.projects?.length
    ? schema.projects
    : [...projects]
        .filter(
          ([, p]) =>
            p.projectType === 'application' &&
            APP_EXECUTORS.includes(p.targets?.build?.executor),
        )
        .map(([n]) => n);

  if (
    (schema.buildTarget || schema.stylesheets?.length) &&
    names.length !== 1
  ) {
    throw new Error(
      `${core.PREFIX} buildTarget and stylesheets need exactly one project.`,
    );
  }

  const summary = [];
  const skipped = [];
  const done = [];

  for (const name of names) {
    const project = projects.get(name);
    const targetOptions = schema.stylesheets?.length
      ? {
          stylesheets: schema.stylesheets,
          ...(schema.includePaths?.length
            ? { includePaths: schema.includePaths }
            : {}),
        }
      : { buildTarget: schema.buildTarget ?? `${name}:build` };
    let sources;
    let warnings = [];

    if (targetOptions.stylesheets) {
      sources = {
        stylesheets: targetOptions.stylesheets.map(core.posix),
        includePaths: targetOptions.includePaths ?? [],
        optimized: true,
      };
    } else {
      const [btProject, btTarget, btConfiguration] =
        targetOptions.buildTarget.split(':');
      const target = projects.get(btProject)?.targets?.[btTarget];

      if (!target) {
        skipped.push(
          `${name}: ${core.PREFIX} ${targetOptions.buildTarget} does not exist.`,
        );
        continue;
      }

      const merged = core.mergeTargetOptions(target, btConfiguration);
      sources = core.sourcesFromBuildOptions(merged.options);
      warnings = core.styleOverrideWarnings(
        target,
        merged.configuration,
        targetOptions.buildTarget,
        core.FILE_NAME,
      );
    }

    const sourceRoot =
      project.sourceRoot ?? path.posix.join(project.root, 'src');
    const file = core.posix(path.posix.join(sourceRoot, core.FILE_NAME));
    let result;

    try {
      result = await core.processProject({
        root: tree.root,
        project: name,
        workspaceKind,
        file,
        sources,
        readFile: (f) => (tree.exists(f) ? tree.read(f, 'utf-8') : null),
      });
    } catch (error) {
      skipped.push(`${name}: ${error.message}`);
      continue;
    }

    done.push(name);
    const lines = [...warnings];
    let changed = false;

    // 2. The nfs-variants target.
    const nfsTarget = {
      [isNx ? 'executor' : 'builder']: EXECUTOR,
      ...(isNx ? { cache: false } : {}),
      options: targetOptions,
      configurations: { check: { check: true } },
    };

    if (isNx) {
      if (!project.targets?.['nfs-variants']) {
        project.targets = { ...project.targets, 'nfs-variants': nfsTarget };
        changed = true;
        lines.push(
          `added the nfs-variants target to ${project.root}/project.json`,
        );
      }
    } else {
      devkit.updateJson(tree, 'angular.json', (json) => {
        const architect = (json.projects[name].architect ??= {});

        if (!architect['nfs-variants']) {
          architect['nfs-variants'] = nfsTarget;
          lines.push('added the nfs-variants target to angular.json');
        }

        return json;
      });
    }

    // 3. The file.
    if (result.status === 'write') {
      tree.write(file, result.content);
      lines.push(`wrote ${file}`);
    } else if (result.status === 'in-step') {
      lines.push(`${file} is in step`);
    } else {
      lines.push(core.failureMessage(result, workspaceKind, name));
    }

    // 4 and 5. TypeScript configurations and sync generator registration.
    const graphTargets =
      graph?.nodes[name]?.data.targets ?? project.targets ?? {};
    const tsconfigs = new Set();

    for (const [targetName, target] of Object.entries(graphTargets)) {
      const covered =
        SYNC_EXECUTORS.includes(target.executor) ||
        SYNC_TARGET_NAMES.includes(targetName);

      if (!covered) {
        continue;
      }

      if (
        target.options?.tsConfig &&
        NG_PACKAGR_EXECUTORS.includes(target.executor)
      ) {
        const edit = ensureInTypes(
          devkit,
          tree,
          core.posix(target.options.tsConfig),
          file,
        );

        if (edit) {
          lines.push(edit);
        }
      } else if (target.options?.tsConfig) {
        tsconfigs.add(core.posix(target.options.tsConfig));
      }

      if (isNx && schema.sync !== false) {
        const own = project.targets?.[targetName] ?? {};
        const listed = own.syncGenerators ?? [];

        if (!listed.includes(SYNC)) {
          changed = true;
          project.targets = {
            ...project.targets,
            [targetName]: {
              ...own,
              syncGenerators: [
                ...(listed.includes('...') ? [] : ['...']),
                ...listed,
                SYNC,
              ],
            },
          };
          lines.push(`registered ${SYNC} on ${name}:${targetName}`);
        }
      }
    }

    for (const candidate of [
      'tsconfig.spec.json',
      '.storybook/tsconfig.json',
    ]) {
      const p = core
        .posix(path.posix.join(project.root || '.', candidate))
        .replace(/^\.\//, '');

      if (tree.exists(p)) {
        tsconfigs.add(p);
      }
    }

    for (const tsconfig of tsconfigs) {
      const edit = ensureIncluded(devkit, tree, tsconfig, file);

      if (edit) {
        lines.push(edit);
      }
    }

    if (isNx && changed) {
      devkit.updateProjectConfiguration(tree, name, project);
    }

    summary.push(`${name}:\n  ${lines.join('\n  ')}`);
  }

  if (!done.length) {
    throw new Error(
      `${core.PREFIX} no project was set up:\n${skipped.join('\n')}`,
    );
  }

  // 6. sync.applyChanges, only on request.
  if (isNx && schema.applyChanges) {
    const nxJson = devkit.readNxJson(tree);
    devkit.updateNxJson(tree, {
      ...nxJson,
      sync: { ...nxJson.sync, applyChanges: true },
    });
    summary.push('set sync.applyChanges to true in nx.json');
  }

  // 7. npm pre scripts, Angular CLI only.
  if (!isNx && schema.npmScripts) {
    const run = done.map((n) => `ng run ${n}:nfs-variants`).join(' && ');

    devkit.updateJson(tree, 'package.json', (json) => {
      json.scripts ??= {};

      for (const script of ['prebuild', 'prestart', 'pretest']) {
        const existing = json.scripts[script];

        if (!existing) {
          json.scripts[script] = run;
        } else if (!existing.includes(run)) {
          json.scripts[script] = `${existing} && ${run}`;
        }
      }

      return json;
    });
    summary.push('added prebuild, prestart, and pretest to package.json');
  }

  // Nx writes JSON unformatted; the Angular CLI formats schematic output with Prettier itself
  // (@angular/cli 22.2.0 src/utilities/prettier.js), so this matters under Nx only.
  if (isNx) {
    await devkit.formatFiles(tree);
  }

  // 8. Summary (M13).
  const step = isNx
    ? 'npx nx sync:check'
    : done.map((n) => `npx ng run ${n}:nfs-variants:check`).join(' && ');
  devkit.logger.info(
    [
      `${core.PREFIX} set up the Variant declaration files.`,
      ...summary,
      ...skipped.map((s) => `skipped ${s}`),
      `Add this step to CI: ${step}.`,
      'After the file changes while a dev server runs, restart the server.',
    ].join('\n'),
  );
}

/** The Angular CLI schematic: the same generator through convertNxGenerator (M9 without nx). */
function variantTypesSchematic(options) {
  let convertNxGenerator;

  try {
    ({ convertNxGenerator } = require('@nx/devkit'));
  } catch {
    throw new Error(
      `${core.PREFIX} the schematic needs nx and @nx/devkit. Install them: npm install --save-dev nx @nx/devkit`,
    );
  }

  return convertNxGenerator(variantTypesGenerator)(options);
}

module.exports = {
  variantTypesGenerator,
  variantTypesSchematic,
  default: variantTypesGenerator,
};
