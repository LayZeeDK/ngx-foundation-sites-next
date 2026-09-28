// The documented check as an Architect builder, in the Variant tooling builder's shape: options name a build
// target, whose tsConfig it reads through Architect, or a tsConfig directly. Fails when a finding is reported,
// and when no component was checked (a changed parser or a wrong tsconfig must not pass silently).
import { createBuilder } from '@angular-devkit/architect';
import { join } from 'node:path';
import { checkMissingImports, formatFinding, formatSkipped } from './check.mjs';

export default createBuilder(async (options, context) => {
  let tsConfig = options.tsConfig;

  if (!tsConfig) {
    const target = options.buildTarget ?? `${context.target.project}:build`;
    const [project, name, configuration] = target.split(':');
    tsConfig = (await context.getTargetOptions({ project, target: name, configuration })).tsConfig;
  }

  const res = checkMissingImports(join(context.workspaceRoot, tsConfig));
  res.skipped.forEach((s) => context.logger.warn(formatSkipped(s)));
  res.findings.forEach((f) => context.logger.error(formatFinding(f)));
  context.logger.info(`${res.findings.length} finding(s) in ${res.components} component(s), ${res.skipped.length} skipped, ${res.ms.total.toFixed(0)} ms.`);

  if (!res.components) {
    context.logger.error(`No component was checked in ${tsConfig}.`);
  }

  return { success: res.findings.length === 0 && res.components > 0 };
});
