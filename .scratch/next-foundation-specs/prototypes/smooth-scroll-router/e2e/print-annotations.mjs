import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'e2e-results.json';
const data = JSON.parse(readFileSync(path, 'utf8'));

function walk(suite, prefix = '') {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        const title = `${prefix}${spec.title} [${test.projectName}]`;
        const status = result.status;
        const annotations = (result.annotations ?? [])
          .map((a) => `${a.type}=${a.description}`)
          .join(' | ');
        console.log(`${status.toUpperCase()}  ${title}`);
        if (annotations) {
          console.log(`  ${annotations}`);
        }
        if (result.errors?.length) {
          for (const err of result.errors) {
            console.log(`  ERROR: ${err.message ?? JSON.stringify(err)}`);
          }
        }
      }
    }
  }
  for (const child of suite.suites ?? []) {
    walk(child, prefix);
  }
}

for (const suite of data.suites ?? []) {
  walk(suite);
}
