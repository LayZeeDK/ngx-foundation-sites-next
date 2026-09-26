// PROTOTYPE (throwaway). Records a small timeline of (label, performance.now(),
// body.innerHTML snapshot) on `window.__nfsProbe` so Playwright can read back,
// after the fact, what the DOM looked like at each point without racing the
// synchronous render/switch itself. Server-side (no window) this is a no-op.

export interface NfsProbeEntry {
  label: string;
  at: number;
  bodyHtml?: string;
}

declare global {
  interface Window {
    __nfsProbe?: NfsProbeEntry[];
  }
}

export function nfsProbeInit(document: Document): NfsProbeEntry[] {
  const win = document.defaultView as (Window & typeof globalThis) | null;

  if (!win) {
    return [];
  }

  win.__nfsProbe ??= [];

  return win.__nfsProbe;
}

export function nfsProbeRecord(document: Document, log: NfsProbeEntry[], label: string): void {
  if (typeof performance === 'undefined') {
    return;
  }

  log.push({ label, at: performance.now(), bodyHtml: document.body.innerHTML });
}

/** Timestamp-only mark, no DOM snapshot (used by NfsMediaQuery itself). */
export function nfsProbeMark(log: NfsProbeEntry[], label: string): void {
  if (typeof performance === 'undefined') {
    return;
  }

  log.push({ label, at: performance.now() });
}
