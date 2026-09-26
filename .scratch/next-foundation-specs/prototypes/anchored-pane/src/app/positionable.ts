// PROTOTYPE -- a pure port of Foundation 6.9's Positionable and Box placement rules.
// Sources: foundation-sites v6.9.0 js/foundation.positionable.js (search order, least-overlap
// fallback) and js/foundation.util.box.js (GetExplicitOffsets, OverlapArea, GetDimensions).
// No DOM access here: the callers measure and write.

export type Position = 'top' | 'bottom' | 'left' | 'right';
export type Alignment = 'top' | 'bottom' | 'left' | 'right' | 'center';
export interface Placement {
  position: Position;
  alignment: Alignment;
}
/** Document coordinates (getBoundingClientRect plus page scroll), as Box.GetDimensions returns. */
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
/** Collision bounds as Box.OverlapArea uses them: edges, not a rect. */
export interface Bounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const POSITIONS: Position[] = ['left', 'right', 'top', 'bottom'];
const ALIGNMENTS: Record<Position, Alignment[]> = {
  left: ['top', 'bottom', 'center'],
  right: ['top', 'bottom', 'center'],
  top: ['left', 'right', 'center'],
  bottom: ['left', 'right', 'center'],
};

function nextItem<T>(item: T, array: T[]): T {
  const i = array.indexOf(item);

  return i === array.length - 1 ? array[0] : array[i + 1];
}

/** Box.GetExplicitOffsets (box.js:116-173), isOverflow never passed by Positionable. */
export function explicitOffsets(
  anchor: Rect,
  size: { width: number; height: number },
  { position, alignment }: Placement,
  vOffset: number,
  hOffset: number,
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  switch (position) {
    case 'top': {
      top = anchor.top - (size.height + vOffset);
      break;
    }
    case 'bottom': {
      top = anchor.top + anchor.height + vOffset;
      break;
    }
    case 'left': {
      left = anchor.left - (size.width + hOffset);
      break;
    }
    case 'right': {
      left = anchor.left + anchor.width + hOffset;
      break;
    }
  }

  if (position === 'top' || position === 'bottom') {
    if (alignment === 'left') {
      left = anchor.left + hOffset;
    } else if (alignment === 'right') {
      left = anchor.left - size.width + anchor.width - hOffset;
    } else {
      left = anchor.left + anchor.width / 2 - size.width / 2 + hOffset;
    }
  } else {
    if (alignment === 'bottom') {
      top = anchor.top - vOffset + anchor.height - size.height;
    } else if (alignment === 'top') {
      top = anchor.top + vOffset;
    } else {
      top = anchor.top + vOffset + anchor.height / 2 - size.height / 2;
    }
  }

  return { top, left };
}

/** Box.OverlapArea (box.js:22-54): Euclidean magnitude of the four spill-over distances. */
export function overlapArea(el: Rect, b: Bounds, ignoreBottom: boolean): number {
  const bottomOver = ignoreBottom ? 0 : Math.min(b.bottom - (el.top + el.height), 0);
  const topOver = Math.min(el.top - b.top, 0);
  const leftOver = Math.min(el.left - b.left, 0);
  const rightOver = Math.min(b.right - (el.left + el.width), 0);

  return Math.sqrt(topOver ** 2 + bottomOver ** 2 + leftOver ** 2 + rightOver ** 2);
}

/**
 * Foundation's "window" bound with no parentClass (box.js:84-98, 38-41): the body box height and
 * width at the current scroll offset. Note the asymmetry Foundation has: the right edge is the body
 * width with no scrollX added; the bottom edge is scrollY plus the body height.
 */
export function bodyBounds(body: { width: number; height: number }, scrollX: number, scrollY: number): Bounds {
  return { top: scrollY, left: scrollX, right: body.width, bottom: scrollY + body.height };
}

/** Bounds of a parentClass container (box.js:28-33): its document rect. */
export function rectBounds(r: Rect): Bounds {
  return { top: r.top, left: r.left, right: r.left + r.width, bottom: r.top + r.height };
}

export interface PlaceOptions {
  start: Placement;
  allowOverlap: boolean;
  allowBottomOverlap: boolean;
  /** Per-position offsets: Tooltip adds its pip size to vOffset (top/bottom) or hOffset (left/right). */
  offsets: (position: Position) => { v: number; h: number };
}

/**
 * Positionable._setPosition (positionable.js:118-154) with a fresh tried-set per call.
 * `measure` returns the element's document rect when placed at a candidate (it may move the element
 * and re-measure, as Foundation does, or compute from a fixed size).
 * Deliberate difference: Foundation keeps `triedPositions` across opens (reset only in _init), so
 * after one open that tried every candidate, later opens skip the search. Not ported.
 */
export function place(
  opts: PlaceOptions,
  bounds: Bounds,
  measure: (p: Placement) => Rect,
): Placement & { overlap: number; tried: number } {
  let current: Placement = { ...opts.start };

  if (opts.allowOverlap) {
    return { ...current, overlap: 0, tried: 1 };
  }

  const tried: Partial<Record<Position, Alignment[]>> = {};
  const exhausted = (p: Position) => (tried[p]?.length ?? 0) === ALIGNMENTS[p].length;
  const allExhausted = () => POSITIONS.every(exhausted);
  let min = 100000000;
  let best: Placement = { ...current };
  let count = 0;

  while (!allExhausted()) {
    count++;
    const overlap = overlapArea(measure(current), bounds, opts.allowBottomOverlap);

    if (overlap === 0) {
      return { ...current, overlap, tried: count };
    }

    if (overlap < min) {
      min = overlap;
      best = { ...current };
    }

    // _reposition / _realign (positionable.js:66-86)
    if (exhausted(current.position)) {
      const position = nextItem(current.position, POSITIONS);
      current = { position, alignment: ALIGNMENTS[position][0] };
    } else {
      (tried[current.position] ??= []).push(current.alignment);
      current = { position: current.position, alignment: nextItem(current.alignment, ALIGNMENTS[current.position]) };
    }
  }

  return { ...best, overlap: min, tried: count };
}

/** The distinct candidates in the order Foundation's search visits them, for a CDK position list. */
export function searchOrder(start: Placement): Placement[] {
  const seen: Placement[] = [];
  place({ start, allowOverlap: false, allowBottomOverlap: false, offsets: () => ({ v: 0, h: 0 }) }, { top: 0, left: 0, right: 0, bottom: 0 }, (p) => {
    if (!seen.some((s) => s.position === p.position && s.alignment === p.alignment)) {
      seen.push(p);
    }

    return { top: -1, left: -1, width: 1, height: 1 }; // always collides, so every candidate is visited
  });

  return seen;
}

/** Positionable/Dropdown/Tooltip `auto` defaults (positionable.js:45-58, dropdown.js:88-107, tooltip.js:67-83). */
export function resolveStart(
  kind: 'dropdown' | 'tooltip',
  position: Position | 'auto',
  alignment: Alignment | 'auto',
  rtl: boolean,
): Placement {
  const p: Position = position !== 'auto' ? position : kind === 'tooltip' ? 'top' : 'bottom';

  if (alignment !== 'auto') {
    return { position: p, alignment };
  }

  if (kind === 'tooltip') {
    return { position: p, alignment: 'center' };
  }

  return { position: p, alignment: p === 'top' || p === 'bottom' ? (rtl ? 'right' : 'left') : 'bottom' };
}
