// PROTOTYPE (ticket 190): one line per engine, option, scenario, and motion setting, over the runs.
import { existsSync, readFileSync } from 'node:fs';
for (const e of ['chromium', 'firefox', 'webkit']) {
  const f = `out/a11y-${e}.json`;
  if (!existsSync(f)) continue;
  const g = {};
  for (const r of JSON.parse(readFileSync(f, 'utf8'))) {
    if (r.error) { console.log(e, r.option, r.scenario, 'ERROR', r.error.slice(0, 80)); continue; }
    const small = (s) => s.controls.filter((c) => c.visible && (c.w < 24 || c.h < 24)).length;
    const hiddenTabs = (s) => s.tab.filter((t) => /Closed|closed pane/.test(t.text)).length;
    const k = `${e} ${r.option} ${r.scenario} ${r.reducedMotion}`;
    (g[k] ??= []).push(JSON.stringify({
      flashStyled: r.flash.styled, hiddenInAria: r.flash.hiddenInAria.length, hiddenTabStops: hiddenTabs(r.flash), styledHiddenTabStops: hiddenTabs(r.styled),
      axeFlash: r.flash.axe.map((v) => v.id), axeStyled: r.styled.axe.map((v) => v.id), smallFlash: small(r.flash), smallStyled: small(r.styled),
      outlineFlash: [...new Set(r.flash.tab.map((t) => t.outline))], outlineStyled: [...new Set(r.styled.tab.map((t) => t.outline))],
      afterMove: (r.flash.after?.top ?? 0) - (r.styled.after?.top ?? 0), transitions: r.arrivalTransitions,
    }));
  }
  for (const [k, v] of Object.entries(g)) console.log(k, new Set(v).size === 1 ? `(same in ${v.length})` : '(DIFFER)', v[0]);
}
