// PROTOTYPE: rewrites angular.json for proposal A on @angular-builders/custom-esbuild. Run once.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../angular.json', import.meta.url);
const ws = JSON.parse(readFileSync(file, 'utf8'));
const app = ws.projects['nfs-proto-193'].architect;
const settings = ['src/foundation-settings'];
const silence = ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'];

app.build.builder = '@angular-builders/custom-esbuild:application';
Object.assign(app.build.options, {
  plugins: [{ path: 'node_modules/nfs-lib/esbuild/nfs-family-css.mjs', options: { includePaths: settings } }],
  styles: ['node_modules/nfs-lib/scss/global.scss', 'src/styles.scss'],
  stylePreprocessorOptions: { includePaths: settings, sass: { silenceDeprecations: silence } },
});
app.build.configurations.production.budgets = [];
app.serve.builder = '@angular-builders/custom-esbuild:dev-server';
// `ng serve -c development-exclude`: the library is excluded from Vite prebundling.
app.serve.configurations['development-exclude'] = {
  buildTarget: 'nfs-proto-193:build:development',
  prebundle: { exclude: ['nfs-lib'] },
};

writeFileSync(file, JSON.stringify(ws, null, 2) + '\n');
