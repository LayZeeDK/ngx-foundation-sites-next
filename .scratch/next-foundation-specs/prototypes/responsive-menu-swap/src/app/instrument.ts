// PROTOTYPE (throwaway) instrumentation, read back by the Playwright tests.
// - nfsLog(): timestamped entries on window.__nfsLog (service live, first-render flag,
//   swap plan and commit, refocus, completion outputs, passes).
// - PassRecorder: a MutationObserver on the document, drained at the start of every
//   after-render hook batch (the first earlyRead callback registered in the app), so each
//   'pass' entry holds the menu attribute changes one change-detection pass made and a
//   snapshot of what that pass left on the page (root mode class, open submenus).
// - protoSwitches: query-parameter switches for the controls (the Nested menu spec as
//   written, the Breakpoint service handoff as the start, the drilldown keep rule).
import { EnvironmentInjector, Injectable, InjectionToken, afterEveryRender, inject } from '@angular/core';

type Entry = Record<string, unknown> & { kind: string };

export function nfsLog(entry: Entry): void {
  if (typeof window === 'undefined') {
    return; // server: never record
  }

  const w = window as unknown as { __nfsLog?: Entry[] };
  (w.__nfsLog ??= []).push({ t: Math.round(performance.now() * 100) / 100, ...entry });
}

export function describe(el: Element | null | undefined): string {
  if (!el || el === el.ownerDocument?.body) {
    return 'body';
  }

  return `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().replace(/\s+/g, ' ')}"`;
}

export function submenuLabel(ul: Element): string {
  const toggle = ul.parentElement?.querySelector(':scope > button[nfssubmenutoggle]');

  return (toggle?.textContent ?? '?').trim().replace(/\s+/g, ' ');
}

const MODE_CLASS: Record<string, string> = { 'accordion-menu': 'accordion', drilldown: 'drilldown', dropdown: 'dropdown' };

/** What the page shows for one menu root: its mode class(es) and the submenus that are open (not inert). */
export function menuSnapshot(root: Element) {
  const mode =
    Object.keys(MODE_CLASS)
      .filter((c) => root.classList.contains(c))
      .map((c) => MODE_CLASS[c])
      .join('+') || 'none';
  const subs = Array.from(root.querySelectorAll('ul[nfssubmenu]'));

  return {
    mode,
    open: subs.filter((u) => !u.hasAttribute('inert')).map(submenuLabel),
    expanded: Array.from(root.querySelectorAll('button[nfssubmenutoggle][aria-expanded="true"]')).map((b) =>
      (b.textContent ?? '').trim().replace(/\s+/g, ' '),
    ),
    rootInvisible: root.classList.contains('invisible'),
  };
}

export interface ProtoSwitches {
  /** 'amended' = ADR 0035 (displayed mode set in the swap callback); 'old' = the Nested menu spec as written. */
  commit: 'amended' | 'old';
  /** 'server' = every instance starts from the Server breakpoint's mode; 'current' = ADR 0014 fallback. */
  start: 'server' | 'current';
  /** 'spec' = the published keep rule; 'row' = entering drilldown also closes a submenu whose own row holds focus. */
  rule: 'spec' | 'row';
}

export const protoSwitches = new InjectionToken<ProtoSwitches>('protoSwitches', {
  providedIn: 'root',
  factory: () => {
    const q = typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);

    return {
      commit: q.get('commit') === 'old' ? 'old' : 'amended',
      start: q.get('start') === 'current' ? 'current' : 'server',
      rule: q.get('rule') === 'row' ? 'row' : 'spec',
    };
  },
});

@Injectable({ providedIn: 'root' })
export class PassRecorder {
  #pass = 0;

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const mo = new MutationObserver(() => undefined);
    mo.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class', 'inert', 'hidden', 'aria-expanded'],
    });
    // ?force=1: this first earlyRead callback also forces a style and layout update,
    // as any library earlyRead measurement would, to see whether an engine moves focus
    // off a control the pass just hid before a later callback can read it.
    const force = new URLSearchParams(location.search).get('force') === '1';
    // Root injector, no view: added to the render hook manager now, before any view-bound
    // sequence, so it is the first earlyRead callback of every batch.
    afterEveryRender({ earlyRead: () => this.#flush(mo, force) }, { injector: inject(EnvironmentInjector) });
  }

  #flush(mo: MutationObserver, force: boolean): void {
    this.#pass++;
    const records = mo.takeRecords().filter((r) => (r.target as Element).closest?.('[data-testid="menu-nav"]'));
    const root = document.querySelector('[data-testid="menu"]');

    if (records.length > 0 && root) {
      nfsLog({
        kind: 'pass',
        pass: this.#pass,
        ...menuSnapshot(root),
        focus: describe(document.activeElement),
        changes: records.length,
        rootChanged: records.some((r) => r.target === root && r.attributeName === 'class'),
      });
    }

    if (force && root) {
      root.getBoundingClientRect();
      getComputedStyle(document.activeElement ?? root).visibility;
      nfsLog({ kind: 'forced', pass: this.#pass, focus: describe(document.activeElement) });
    }
  }
}
