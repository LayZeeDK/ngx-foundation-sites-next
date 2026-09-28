const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const sec of ['dependencies', 'devDependencies']) {
  for (const k of Object.keys(p[sec])) {
    if (
      k.startsWith('@angular/') ||
      k === '@angular-devkit/core' ||
      k === '@angular-devkit/schematics' ||
      k === '@schematics/angular'
    )
      p[sec][k] = '22.2.0';
  }
}
Object.assign(p.devDependencies, {
  '@angular-devkit/architect': '0.2202.0',
  'foundation-sites': '6.9.0',
  typescript: '6.0.3',
  prettier: '3.6.2',
});
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
