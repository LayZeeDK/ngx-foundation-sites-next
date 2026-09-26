// Pins the workspace to the map's target versions (Angular 22.2.0, Vitest 4.1.11, Playwright 1.63.0).
import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

for (const section of ['dependencies', 'devDependencies']) {
  for (const name of Object.keys(pkg[section])) {
    if (name.startsWith('@angular/') || name.startsWith('@angular-devkit/') || name === '@schematics/angular') {
      pkg[section][name] = '22.2.0';
    }
  }
}

Object.assign(pkg.devDependencies, {
  '@playwright/test': '1.63.0',
  playwright: '1.63.0',
  vitest: '4.1.11',
  '@vitest/browser': '4.1.11',
  '@vitest/browser-playwright': '4.1.11',
  jsdom: '^27.1.0',
  'ng-packagr': '22.2.0',
});

writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
