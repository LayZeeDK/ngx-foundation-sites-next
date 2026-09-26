// Pure, DOM-free state derivation for the nfsSticky measurement prototype (ticket 63).
// Mirrors specs/sticky.md "How the class contract is measured", step 2: one pure function
// of the host rectangle, the scroll container rectangle, the inset in px, stickTo, and the
// gate (canStick). No sentinel geometry, no container padding dependency.

export type NfsStickyEdge = 'top' | 'bottom';

export interface StickyRect {
  top: number;
  bottom: number;
}

export interface StickyMeasurement {
  hostRect: StickyRect;
  containerRect: StickyRect;
  scrollContainerRect: StickyRect;
  insetPx: number;
  stickTo: NfsStickyEdge;
  canStick: boolean;
}

export interface StickyState {
  isStuck: boolean;
  edge: NfsStickyEdge;
}

const TOLERANCE_PX = 1;

export function computeStickyState(m: StickyMeasurement): StickyState {
  if (!m.canStick) {
    return { isStuck: false, edge: 'top' };
  }

  const withinRange =
    m.hostRect.top >= m.containerRect.top - TOLERANCE_PX &&
    m.hostRect.bottom <= m.containerRect.bottom + TOLERANCE_PX;

  if (m.stickTo === 'top') {
    const line = m.scrollContainerRect.top + m.insetPx;

    if (withinRange && Math.abs(m.hostRect.top - line) <= TOLERANCE_PX) {
      return { isStuck: true, edge: 'top' };
    }

    return { isStuck: false, edge: m.hostRect.top > line ? 'top' : 'bottom' };
  }

  const line = m.scrollContainerRect.bottom - m.insetPx;

  if (withinRange && Math.abs(m.hostRect.bottom - line) <= TOLERANCE_PX) {
    return { isStuck: true, edge: 'bottom' };
  }

  return { isStuck: false, edge: m.hostRect.bottom < line ? 'bottom' : 'top' };
}

// specs/sticky.md API section: "the canonical gate value bound to data-nfs-sticky-on".
export function canonicalizeStickyOn(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ');

  if (trimmed === '' || trimmed === 'all') {
    return 'all';
  }

  const upMatch = /^(.+) up$/.exec(trimmed);

  if (upMatch) {
    return upMatch[1];
  }

  return trimmed;
}
