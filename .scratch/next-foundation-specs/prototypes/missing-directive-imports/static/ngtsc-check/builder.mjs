// The check as an Architect builder, the shape of the Variant tooling builder: options name a build target,
// whose tsConfig it reads through Architect, or a tsConfig directly. Fails when a finding is reported.
import { createBuilder } from '@angular-devkit/architect';
import { join } from 'node:path';
import { checkMissingImports, formatFinding } from './check.mjs';

export default createBuilder(async (options, context) => {
  let tsConfig = options.tsConfig;

  if (!tsConfig) {
    const target = options.buildTarget ?? `${context.target.project}:build`;
    const [project, name, configuration] = target.split(':');
    tsConfig = (await context.getTargetOptions({ project, target: name, configuration })).tsConfig;
  }

  const res = await checkMissingImports(join(context.workspaceRoot, tsConfig));
  res.findings.forEach((f) => context.logger.error(formatFinding(f)));
  context.logger.info(`${res.findings.length} finding(s) in ${res.components} component(s), ${res.ms.total.toFixed(0)} ms.`);

  return { success: res.findings.length === 0 };
});
