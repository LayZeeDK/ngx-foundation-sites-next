// Does Dart Sass rewrite round(1px, 1px) inside an @supports condition?
import { createRequire } from 'node:module';

const require = createRequire('D:/tmp/nfs-proto-slider-range-input/slider-proto/package.json');
const sass = require('sass');
const src = '@supports (width: round(1px, 1px)) and (color: light-dark(red, red)) { a { color: red; } }';
console.log(sass.info);
console.log(sass.compileString(src).css);
