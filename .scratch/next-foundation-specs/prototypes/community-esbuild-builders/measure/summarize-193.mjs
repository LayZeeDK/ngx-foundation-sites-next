// PROTOTYPE 193: one line per scenario and engine from results/measure-193-<engine>.json.
import { readFileSync, existsSync } from 'node:fs';

for (const e of ['chromium', 'firefox', 'webkit']) {
  const file = `results/measure-193-${e}.json`;

  if (!existsSync(file)) {
    continue;
  }

  const r = JSON.parse(readFileSync(file, 'utf8'));
  const line = (k, v) => console.log(`${e.padEnd(8)} ${k.padEnd(42)} ${v}`);

  for (const p of ['ssr', 'prerendered']) {
    const s = r[p];
    line(`${p}: server styles / settings`, `${s.serverStyles.join(',')} / ${s.settingsPass ? 'pass' : JSON.stringify(s.settings)}`);
    line(`${p}: hydration`, `unstyled ${s.unstyledFrames}/${s.framesSampled}, mutations after DCL ${s.styleMutationsAfterDcl.length}, families ${s.incremental.families.length}`);
    line(`${p}: incremental hydration`, `hydrated ${s.incremental.deferredHydrated}, mutations ${s.incremental.styleMutationsAfterDcl}`);
    line(`${p}: after last callout`, `${s.afterLastInstance.families.join(',')}; new div.callout ${s.afterLastInstance.plainCalloutPadding}`);
  }

  const h = r.hydrateDefer;
  line('hydrate-defer', `unstyled ${h.unstyledFrames}/${h.framesSampled}, mutations ${h.styleMutationsAfterDcl}, hydrated vp ${h.viewportBlockHydrated} int ${h.interactionBlockHydrated}`);

  for (const [k, c] of Object.entries(r.clientDefer)) {
    line(`client-defer, ${k}`, `unstyled ${c.unstyledFrames}/${c.framesWithElement}, first ${c.firstValues}, chunks ${c.requestsAfterClick.join(' ')}`);
  }

  for (const [k, c] of Object.entries(r.enter)) {
    line(`enter, ${k}`, `${c.verdict} (start ${c.animationStartMs} ms), unstyled ${c.unstyledFrames}`);
  }

  const l = r.leave;
  const l1 = l['L1 callout inside leaving element'];
  line('L1', `unstyled ${l1.unstyledFramesWhileLeaving}/${l1.framesWhileLeaving} during ${l1.leaveMs} ms leave, removed +${l1.styleRemovedMsAfterHostLeft} ms after host left, after ${l1.afterLeave}, recheck ${l1.afterRecheck}`);
  const l2 = l['L2 unrelated leave running'];
  line('L2', `after ${l2.afterLeave}, recheck ${l2.afterRecheck}`);
  const l3 = l['L3 (animate.leave) listener on the page'];
  line('L3', `while listener present ${l3.whileListenerPresent}, after ${l3.afterListenerLeft}, recheck ${l3.afterRecheck}`);
}
