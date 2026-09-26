import { nfsProbeMark, NfsProbeEntry } from './render-probe';

// PROTOTYPE (throwaway, re-run of ticket 67). Runs synchronously inside a
// `(replaced)` handler and records what the DOM shows at that instant:
// - dom-check: the rule template's static wrapper exists (creation pass).
// - inner-check: the `@if` link with its bound attribute exists (update pass
//   of the new view, which is what a real template with bindings needs).
// - focus: the data-testid of document.activeElement (does the focus move
//   happen before the emission?).
export function recordReplacedChecks(
  document: Document,
  probe: NfsProbeEntry[],
  prefix: string,
  rule: string | undefined,
): void {
  const name = `${prefix}${rule ?? "none"}`;
  const shown = rule
    ? document.querySelector(`[data-testid=${prefix}interchange-${rule}]`) !== null
    : document.querySelector(`[data-testid=${prefix}interchange-small], [data-testid=${prefix}interchange-large]`) === null;
  const innerShown = rule
    ? document.querySelector(`[data-testid=${prefix}${rule}-link][data-bound=${rule}-bound]`) !== null
    : shown;
  const active = document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.nodeName ?? 'null';

  nfsProbeMark(probe, `replaced-dom-check:${name}:${shown ? 'shown' : 'NOT-SHOWN'}`);
  nfsProbeMark(probe, `replaced-inner-check:${name}:${innerShown ? 'shown' : 'NOT-SHOWN'}`);
  nfsProbeMark(probe, `replaced-focus:${name}:${active}`);
}
