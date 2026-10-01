// PROTOTYPE 198, point 1: where does proposal A lose a settings edit under the dev server?
// Starts A's dev server, edits the settings, and looks for the new value in the server HTML,
// in the browser chunk that carries the callout CSS, and after a component edit.
import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const dir = 'D:/tmp/nfs-proto-198-192';
const base = 'http://localhost:4823';
const settingsFile = `${dir}/apps/fixture/src/foundation-settings/_settings.scss`;
const componentFile = `${dir}/apps/fixture/src/lib/directives/callout.ts`;
const setRem = (rem) =>
  writeFileSync(settingsFile, readFileSync(settingsFile, 'utf8').replace(/default: [\d.]+rem, large/, `default: ${rem}rem, large`));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
setRem('2.75');

let log = '';
const child = spawn(process.execPath, ['node_modules/nx/dist/bin/nx.js', 'run', 'fixture:serve'], {
  cwd: dir,
  env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true', FORCE_COLOR: '0' },
});
child.stdout.on('data', (d) => (log += d));
child.stderr.on('data', (d) => (log += d));

for (;;) {
  try {
    if ((await fetch(`${base}/client-defer`)).ok) {
      break;
    }
  } catch {
    // not yet
  }

  await sleep(200);
}

// The callout CSS in the server HTML and in the browser JavaScript the dev server serves.
async function look(label) {
  const html = await (await fetch(`${base}/ssr`)).text();
  const ssrStyle = html.match(/<style data-nfs-family="callout"[^>]*>([^<]*)/)?.[1] ?? '';
  // The client-defer page imports only the callout module; find the JS that registers its CSS.
  const page = await (await fetch(`${base}/client-defer`)).text();
  const scripts = [...page.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  const seen = new Set();
  const queue = [...scripts];
  let chunkValue = 'not found';

  while (queue.length && seen.size < 60) {
    const path = queue.shift();

    if (seen.has(path)) {
      continue;
    }

    seen.add(path);
    const js = await (await fetch(new URL(path, base))).text();
    const m = js.match(/\.callout\{[^}]*padding:([\d.]+rem)/);

    if (m) {
      chunkValue = `${m[1]} in ${path}`;
    }

    for (const i of js.matchAll(/(?:import\(|from\s*)["']([^"']+\.js)["']/g)) {
      queue.push(new URL(i[1], new URL(path, base)).pathname);
    }
  }

  const row = {
    label,
    ssr: ssrStyle.match(/\.callout\{[^}]*padding:([\d.]+rem)/)?.[1] ?? 'no callout rule',
    chunk: chunkValue,
    log: [...log.matchAll(/(generation complete\. \[[\d.]+ seconds\]|Page reload sent|Component update sent|Stylesheet update sent|No output file changes)/g)].map((x) => x[1]).slice(-4),
  };
  console.log(JSON.stringify(row));
}

await look('start, 2.75rem');
setRem('3.5');
await sleep(4000);
await look('after settings edit to 3.5rem');
// A touch of the directive module that imports the CSS module.
writeFileSync(componentFile, readFileSync(componentFile, 'utf8') + '\n// touched\n');
await sleep(5000);
await look('after touching the callout directive module');

try {
  execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
} catch {
  // gone
}

setRem('2.75');
writeFileSync(componentFile, readFileSync(componentFile, 'utf8').replace('\n// touched\n', ''));
await sleep(1500);

// Restart the dev server: does a fresh start see the edit?
setRem('3.5');
log = '';
const again = spawn(process.execPath, ['node_modules/nx/dist/bin/nx.js', 'run', 'fixture:serve'], {
  cwd: dir,
  env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true', FORCE_COLOR: '0' },
});
again.stdout.on('data', (d) => (log += d));
again.stderr.on('data', (d) => (log += d));

for (;;) {
  try {
    if ((await fetch(`${base}/client-defer`)).ok) {
      break;
    }
  } catch {
    // not yet
  }

  await sleep(200);
}

await look('fresh start with 3.5rem');

try {
  execSync(`taskkill /PID ${again.pid} /T /F`, { stdio: 'ignore' });
} catch {
  // gone
}

setRem('2.75');
