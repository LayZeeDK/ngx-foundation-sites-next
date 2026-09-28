'use strict';

module.exports = {
  meta: { name: 'eslint-plugin-nfs-proto', version: '0.0.0' },
  rules: { 'missing-directive-import': require('./missing-directive-import.cjs') },
};
