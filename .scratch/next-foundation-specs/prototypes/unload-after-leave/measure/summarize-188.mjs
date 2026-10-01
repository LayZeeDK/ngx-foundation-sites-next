// PROTOTYPE (ticket 188): one line per mode and engine from out/results-188-*.json.
import { readFileSync } from 'node:fs';

for (const engine of ['chromium', 'firefox', 'webkit']) {
  const r = JSON.parse(readFileSync(new URL(`../out/results-188-${engine}.json`, import.meta.url)));
  console.log(`\n## ${engine} ${r.version}`);

  for (const [mode, m] of Object.entries(r.modes)) {
    const leak = (x) => (x.unloaded ? 'ok' : 'LEAK') + (x.recheck.includes('stays') ? '/recheck-LEAK' : '');
    console.log(
      [
        mode.padEnd(16),
        `L1 ${leak(m.L1)} unstyled ${m.L1.unstyledDuringLeave}/${m.L1.framesWithLeavingCallout} leave ${m.L1.leaveMs}ms +${m.L1.unloadAfterHostGoneMs}ms`,
        `L2 ${leak(m.L2)} +${m.L2.unloadAfterDestroyMs}ms`,
        `L3 present ${m.L3.unloadedWhileListenerPresent ? 'ok' : 'held'} left ${m.L3.unloadedAfterListenerLeft ? 'ok' : 'LEAK'}${m.L3.recheck.includes('stays') ? '/recheck-LEAK' : ''} retries ${m.L3.retries}`,
        `client ${m.clientFirstRender.unstyledFrames}/${m.clientFirstRender.of}`,
        `ssr html ${JSON.stringify(m.ssrFull.serverHtml)} nojs ${m.ssrFull.noJsPadding} muts ${m.ssrFull.styleMutationsAfterDcl} unstyled ${m.ssrFull.unstyledFrames}/${m.ssrFull.framesSampled} copies ${m.ssrFull.copiesAfterHydration.total} unload ${m.ssrFull.unloadedAfterRemove}`,
        `incr ${m.ssrIncremental.dehydratedPadding}/${m.ssrIncremental.paddingWhileOnlyDehydratedRemains} boot-muts ${m.ssrIncremental.mutationsAtBootstrap} hyd-muts ${m.ssrIncremental.mutationsAtIncrementalHydration} copies ${m.ssrIncremental.copiesAfterHydration.total} after ${m.ssrIncremental.probeAfterLastDestroyed}`,
      ].join(' | '),
    );
  }
}
