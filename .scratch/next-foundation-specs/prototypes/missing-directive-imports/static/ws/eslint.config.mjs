// Flat config as a consumer would write it: angular-eslint's parsers and inline-template processor, plus the
// prototype rule. NFS_RULE=off keeps parsers and processor but turns the rule off (the timing baseline).
import templatePlugin from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import tseslint from 'typescript-eslint';
import nfs from '../eslint-plugin/index.cjs';

const level = process.env.NFS_RULE ?? 'error';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: templatePlugin.processors['extract-inline-html'],
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: templateParser },
    plugins: { nfs },
    rules: { 'nfs/missing-directive-import': [level, { reportUnresolved: process.env.NFS_UNRESOLVED === '1' }] },
  },
];
