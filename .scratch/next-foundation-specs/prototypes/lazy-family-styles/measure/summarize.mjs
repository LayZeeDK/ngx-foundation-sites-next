// PROTOTYPE: prints one line per measurement and engine from out/results.json.
import { readFileSync } from 'node:fs';

const r = JSON.parse(readFileSync(new URL('../out/results.json', import.meta.url), 'utf8'));
console.log('beasties', JSON.stringify(r.beasties.familyStylesEqualCompiledCss), r.beasties.firstStyle.start.slice(0, 60), 'firstBeforeLink', r.beasties.firstStyleBeforeStylesheetLink);

for (const e of ['chromium', 'firefox', 'webkit']) {
  const x = r[e];
  console.log(`\n== ${e}`);
  console.log('m1', x.m1.pass, JSON.stringify(x.m1.got));
  console.log('m2', x.m2.pass, x.m2.steps.map((s) => s.callout).join(''), 'serverHtmlHasCallout', x.m2.serverHtmlHasCalloutRules);

  for (const k of ['m3m7', 'm3m7_holdOff']) {
    const y = x[k];
    console.log(k, 'server', JSON.stringify(y.serverCounts), 'noJs', JSON.stringify(y.noJs), 'after', JSON.stringify(y.afterHydration), 'mutsAfterDcl', y.styleMutationsAfterDcl.length, 'unstyledFrames', y.unstyledFrames, '/', y.framesSampled);
    console.log('   m7', JSON.stringify(y.m7), 'm7b', JSON.stringify(y.m7b));
  }

  for (const [k, v] of Object.entries(x.m3ClientDefer)) {
    console.log('m3 client', k, JSON.stringify(v));
  }

  for (const [b, v] of Object.entries(x.m4)) {
    for (const [k, w] of Object.entries(v)) {
      console.log('m4', b, k, w.display, w.position, w.order, w.framesDisplay ?? '');
    }
  }

  for (const [k, v] of Object.entries(x.m6)) {
    console.log('m6', k, JSON.stringify(v));
  }

  console.log('m10', JSON.stringify(x.m10));
}
