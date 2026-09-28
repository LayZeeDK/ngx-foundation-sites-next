'use strict';
// PROTOTYPE (ticket 137): the Nx task sync generator ngx-foundation-sites:variant-types-sync.
// Nx calls it with the tree alone; it reads the project graph and covers every project
// with an nfs-variants target (executor ngx-foundation-sites:variant-types).
const path = require('node:path');
const core = require('./core.cjs');

const EXECUTOR = 'ngx-foundation-sites:variant-types';

function sourcesForProject(graph, projectName, options) {
  if (options.stylesheets?.length) {
    return {
      sources: {
        stylesheets: options.stylesheets.map(core.posix),
        includePaths: options.includePaths ?? [],
        optimized: true,
      },
      warnings: [],
    };
  }

  const [btProject, btTarget, btConfiguration] = (
    options.buildTarget ?? `${projectName}:build`
  ).split(':');
  const target = graph.nodes[btProject]?.data.targets?.[btTarget];

  if (!target) {
    throw new Error(
      `${core.PREFIX} ${options.buildTarget ?? `${projectName}:build`} does not exist.`,
    );
  }

  const merged = core.mergeTargetOptions(target, btConfiguration);

  return {
    sources: core.sourcesFromBuildOptions(merged.options),
    warnings: core.styleOverrideWarnings(
      target,
      merged.configuration,
      options.buildTarget ?? `${projectName}:build`,
      core.FILE_NAME,
    ),
  };
}

async function variantTypesSyncGenerator(tree) {
  let devkit;

  try {
    devkit = require('@nx/devkit');
  } catch {
    throw new Error(
      `${core.PREFIX} the sync generator needs @nx/devkit. Install it: npm install --save-dev nx @nx/devkit`,
    );
  }

  const graph = await devkit.createProjectGraphAsync();
  const details = [];
  const failures = [];

  for (const [name, node] of Object.entries(graph.nodes)) {
    const entry = Object.values(node.data.targets ?? {}).find(
      (t) => t.executor === EXECUTOR,
    );

    if (!entry) {
      continue;
    }

    try {
      const { sources, warnings } = sourcesForProject(
        graph,
        name,
        entry.options ?? {},
      );
      const sourceRoot =
        node.data.sourceRoot ?? path.posix.join(node.data.root, 'src');
      const file = core.posix(path.posix.join(sourceRoot, core.FILE_NAME));
      const result = await core.processProject({
        root: tree.root,
        project: name,
        workspaceKind: 'nx',
        file,
        sources,
        readFile: (f) => (tree.exists(f) ? tree.read(f, 'utf-8') : null),
      });

      warnings.forEach((w) => devkit.logger.warn(w));

      if (process.env.NFS_TIMING) {
        devkit.logger.info(`${core.PREFIX} ${name}: ${result.timing}`);
      }

      if (result.status === 'write') {
        tree.write(file, result.content);
        details.push(
          `${file} (${name}, from ${result.sourceList.join(', ')}): ${core.driftSummary(result.drift)}`,
        );
      } else if (result.status !== 'in-step') {
        failures.push(`${name}: ${core.failureMessage(result, 'nx', name)}`);
      }
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  }

  if (failures.length) {
    throw new Error(
      `${core.PREFIX} could not keep the Variant declaration files in step for ${failures.length} project(s):\n${failures.join('\n')}`,
    );
  }

  if (!details.length) {
    return;
  }

  return {
    outOfSyncMessage: `${core.PREFIX} the Variant declaration files no longer match the Sass they are generated from.`,
    outOfSyncDetails: details,
  };
}

module.exports = {
  variantTypesSyncGenerator,
  default: variantTypesSyncGenerator,
};
