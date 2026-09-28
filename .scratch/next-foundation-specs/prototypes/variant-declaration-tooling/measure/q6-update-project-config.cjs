// Q6 side check: what does @nx/devkit's updateProjectConfiguration do to a project that
// lives in angular.json? An in-memory FsTree over cli-ws; nothing is flushed to disk.
const path = require('node:path');
const nxWs = path.resolve(__dirname, '../nx-ws');
const { FsTree } = require(
  require.resolve('nx/src/generators/tree', { paths: [nxWs] }),
);
const devkit = require(require.resolve('@nx/devkit', { paths: [nxWs] }));

const tree = new FsTree(path.resolve(__dirname, '../cli-ws'), false);
const project = devkit.readProjectConfiguration(tree, 'cli-ws');
console.log('read from angular.json:', Object.keys(project.targets).join(', '));
project.targets['probe'] = { executor: 'ngx-foundation-sites:variant-types' };

try {
  devkit.updateProjectConfiguration(tree, 'cli-ws', project);
} catch (e) {
  console.log('threw:', e.message);
}

for (const change of tree.listChanges()) {
  const text = change.content ? change.content.toString() : '';
  console.log(
    `${change.type} ${change.path}: ${text.includes('"nx"') ? 'adds an "nx" field' : ''}${text.includes('probe') ? ' (contains the probe target)' : ''}`,
  );
}
