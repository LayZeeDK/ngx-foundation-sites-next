// PROTOTYPE (throwaway) -- stand-in for the Breakpoint service (NfsMediaQuery),
// whose spec is written in parallel. Not an API proposal: just a signal over
// matchMedia with Foundation's default map and a `small` server answer.
import { afterNextRender, Injectable, signal } from '@angular/core';

export type BreakpointName = 'small' | 'medium' | 'large';
type Mode = 'accordion' | 'drilldown' | 'dropdown';

const BREAKPOINTS: [BreakpointName, number][] = [
  ['small', 0],
  ['medium', 640],
  ['large', 1024],
];

@Injectable({ providedIn: 'root' })
export class BreakpointSim {
  /** serverBreakpoint 'small' until the first client render callback. */
  readonly current = signal<BreakpointName>('small');

  constructor() {
    afterNextRender(() => {
      const queries = BREAKPOINTS.map(
        ([name, px]) => [name, matchMedia(`only screen and (min-width: ${px / 16}em)`)] as const,
      );
      const update = () => this.current.set(queries.filter(([, q]) => q.matches).at(-1)?.[0] ?? 'small');
      update();
      queries.forEach(([, q]) => q.addEventListener('change', update));
    });
  }
}

/** Foundation's `data-responsive-menu` syntax: `drilldown medium-dropdown`. */
export function parseRules(rules: string): [BreakpointName, Mode][] {
  return rules
    .trim()
    .split(/\s+/)
    .map((rule) => {
      const [a, b] = rule.split('-');

      return (b ? [a, b] : ['small', a]) as [BreakpointName, Mode];
    });
}

export function resolveMode(rules: [BreakpointName, Mode][], current: BreakpointName): Mode {
  const rank = (bp: BreakpointName) => BREAKPOINTS.findIndex(([name]) => name === bp);
  const matching = rules.filter(([bp]) => rank(bp) <= rank(current));

  return (matching.at(-1) ?? rules[0])[1];
}
