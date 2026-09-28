// Adds Foundation's scss folder as a Sass load path to each application's build target.
const fs = require('fs');
for (const app of process.argv.slice(2)) {
  const file = `apps/${app}/project.json`;
  const p = JSON.parse(fs.readFileSync(file, 'utf8'));
  p.targets.build.options.stylePreprocessorOptions = {
    includePaths: ['node_modules/foundation-sites/scss'],
  };
  fs.writeFileSync(file, JSON.stringify(p, null, 2) + '\n');
}
