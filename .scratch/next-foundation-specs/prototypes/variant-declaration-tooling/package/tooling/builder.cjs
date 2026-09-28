'use strict';
// PROTOTYPE (ticket 137): the Architect builder ngx-foundation-sites:variant-types behind
// each project's nfs-variants target. Write mode rewrites a generated or missing file;
// the check configuration only compares. Imports neither nx nor @nx/devkit.
const fs = require('node:fs');
const path = require('node:path');
const {
  createBuilder,
  targetFromTargetString,
} = require('@angular-devkit/architect');
const core = require('./core.cjs');

module.exports = createBuilder(async (options, context) => {
  const project = context.target.project;
  const root = context.workspaceRoot;
  const workspaceKind = fs.existsSync(path.join(root, 'nx.json'))
    ? 'nx'
    : 'cli';

  try {
    const metadata = await context.getProjectMetadata(project);
    const sourceRoot =
      metadata.sourceRoot ?? path.posix.join(metadata.root ?? '', 'src');
    const file = core.posix(
      path.posix.join(core.posix(sourceRoot), core.FILE_NAME),
    );
    let sources;

    if (options.stylesheets?.length) {
      sources = {
        stylesheets: options.stylesheets.map(core.posix),
        includePaths: options.includePaths ?? [],
        optimized: true,
      };
    } else {
      // getTargetOptions applies the configuration the string names, else the target's
      // defaultConfiguration (Architect's getOptionsForTarget).
      const target = targetFromTargetString(
        options.buildTarget ?? `${project}:build`,
      );
      const buildOptions = await context.getTargetOptions(target);
      sources = core.sourcesFromBuildOptions(buildOptions);
    }

    const result = await core.processProject({
      root,
      project,
      workspaceKind,
      file,
      sources,
      readFile: (f) =>
        fs.existsSync(path.join(root, f))
          ? fs.readFileSync(path.join(root, f), 'utf-8')
          : null,
    });

    if (process.env.NFS_TIMING) {
      context.logger.info(`${core.PREFIX} ${result.timing}`);
    }

    if (result.status === 'in-step') {
      return { success: true };
    }

    if (options.check || result.status !== 'write') {
      context.logger.error(core.failureMessage(result, workspaceKind, project));

      return { success: false };
    }

    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), result.content);
    context.logger.info(
      `${core.PREFIX} wrote ${file} (${core.driftSummary(result.drift)}).`,
    );

    return { success: true };
  } catch (error) {
    context.logger.error(error.message);

    return { success: false };
  }
});
