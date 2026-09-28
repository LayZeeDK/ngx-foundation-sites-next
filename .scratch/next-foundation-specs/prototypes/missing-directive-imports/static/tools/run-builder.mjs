// Runs `shop:nfs-imports` through Architect's Node API, as `ng run shop:nfs-imports` would, without
// installing @angular/cli. Usage: node tools/run-builder.mjs
import { Architect } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node/index.js';
import { json, logging, workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node/index.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'ws');
const { workspace } = await workspaces.readWorkspace(wsRoot, workspaces.createWorkspaceHost(new NodeJsSyncHost()));
const registry = new json.schema.CoreSchemaRegistry();
registry.addPostTransform(json.schema.transforms.addUndefinedDefaults);
const architect = new Architect(new WorkspaceNodeModulesArchitectHost(workspace, wsRoot), registry);
const logger = new logging.Logger('nfs');
logger.subscribe((e) => console.log(`[${e.level}] ${e.message}`));
const run = await architect.scheduleTarget({ project: 'shop', target: 'nfs-imports' }, {}, { logger });
const result = await run.result;
await run.stop();
console.log(`builder success: ${result.success}`);
process.exitCode = result.success ? 0 : 1;
