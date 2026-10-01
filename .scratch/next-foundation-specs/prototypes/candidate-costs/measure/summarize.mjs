// PROTOTYPE 198: one line per result for points 2 and 3, with the engines side by side.
// Usage: node measure-198/summarize.mjs csp|multi
import { existsSync, readFileSync } from 'node:fs';

const OUT = 'D:/tmp/nfs-proto-198-189/out-198';
const engines = ['chromium', 'firefox', 'webkit'];
const load = (name) =>
  Object.fromEntries(
    engines
      .filter((e) => existsSync(`${OUT}/${name}-${e}.json`))
      .map((e) => [e, JSON.parse(readFileSync(`${OUT}/${name}-${e}.json`, 'utf8'))]),
  );
const joinEngines = (values) => (new Set(values).size === 1 ? values[0] : values.join(' / '));

if (process.argv[2] === 'csp') {
  const data = load('csp');
  const rows = data.chromium.map((_, i) => engines.map((e) => data[e]?.[i]).filter(Boolean));
  const ok = (px) => (px === '44px' ? 'styled' : px === '0px' ? 'UNSTYLED' : px);

  for (const perEngine of rows) {
    const r = perEngine[0];
    const viol = (key) =>
      joinEngines(
        perEngine.map((x) =>
          Object.entries(x[key])
            .filter(([k]) => !k.startsWith('img-src'))
            .map(([k, n]) => `${k} x${n}`)
            .join(', ') || '-',
        ),
      );
    console.log(
      [
        r.candidate.padEnd(11),
        r.policy.padEnd(5),
        `serverJsOff=${joinEngines(perEngine.map((x) => ok(x.serverJsOff.callout)))}`,
        `hydrated=${joinEngines(perEngine.map((x) => ok(x.hydrated.callout)))}`,
        `button=${joinEngines(perEngine.map((x) => x.hydrated.button))}`,
        `global=${joinEngines(perEngine.map((x) => x.hydrated.bodyBg))}`,
        `appRuns=${joinEngines(perEngine.map((x) => String(x.appRuns)))}`,
        `clientInsert=${joinEngines(perEngine.map((x) => ok(x.clientInsert.callout)))}`,
        `clientDefer=${joinEngines(perEngine.map((x) => ok(x.clientDefer)))}`,
        `tt=${joinEngines(perEngine.map((x) => String(x.hydrated.trustedTypes)))}`,
        `errors=${joinEngines(perEngine.map((x) => x.ssrErrors.length))}`,
      ].join('  '),
    );
    console.log(`      ssr violations: ${viol('ssrViolations')}`);
    console.log(`      client violations: ${viol('clientViolations')} | defer: ${viol('deferViolations')}`);
  }
} else {
  const data = load('multi');

  data.chromium.forEach((run, i) => {
    console.log(`== ${run.candidate} ${run.kind}`);
    run.steps.forEach((step, j) => {
      const per = engines.map((e) => data[e]?.[i].steps[j]).filter(Boolean);
      const f = (k) => joinEngines(per.map((s) => String(s[k])));
      console.log(
        `  ${step.label.padEnd(34)} A.callout=${f('aCallout')} B.callout=${f('bCallout')} A.button=${f('aButton')} B.button=${f('bButton')} B.menu=${f('bMenu')} | probes ${f('probeCallout')} ${f('probeButton')} ${f('probeMenu')} | elements=${joinEngines(per.map((s) => s.familyElements.join(',') || '-'))} sheets=${f('styleSheets')}`,
      );
    });
    const errors = engines.flatMap((e) => data[e]?.[i].errors ?? []);

    if (errors.length) {
      console.log('  errors:', errors);
    }
  });
}
