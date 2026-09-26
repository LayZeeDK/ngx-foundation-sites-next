// A minimal, independent stand-in for NfsMediaQuery (specs/breakpoint-service.md), built only to
// answer case 4: does the CSS stickyOn gate (Foundation's own breakpoint() mixin, in styles.scss)
// switch at exactly the widths this independently-computed matchMedia query does? Foundation's
// default $breakpoints (research/foundation-utilities-conventions.md; nfsDefaultBreakpointMap in
// specs/breakpoint-service.md).

export const NFS_BREAKPOINTS: Record<string, number> = {
  small: 0,
  medium: 640,
  large: 1024,
  xlarge: 1200,
  xxlarge: 1440,
};

const ORDER = Object.keys(NFS_BREAKPOINTS).sort((a, b) => NFS_BREAKPOINTS[a] - NFS_BREAKPOINTS[b]);

function toEm(px: number): number {
  return px / 16;
}

function nextPx(name: string): number | undefined {
  const idx = ORDER.indexOf(name);
  const nextName = ORDER[idx + 1];

  return nextName === undefined ? undefined : NFS_BREAKPOINTS[nextName];
}

// Mirrors foundation-sites/scss/util/_breakpoint.scss `breakpoint()`: 'up' (bare) is min-width
// only; 'only' is min-width plus max-width at the next breakpoint minus 0.00125em; 'down' is
// max-width only, at the same next-breakpoint bound. Returns null when the query is always true
// (an unbounded 'only'/'down' at the last breakpoint, or an unknown name).
export function buildNfsMediaQuery(canonical: string): string | null {
  if (canonical === 'all') {
    return null;
  }

  const [name, modifier] = canonical.split(' ');

  if (!(name in NFS_BREAKPOINTS)) {
    return null;
  }

  const px = NFS_BREAKPOINTS[name];
  const next = nextPx(name);
  const maxEm = next === undefined ? undefined : toEm(next) - 0.00125;

  if (!modifier) {
    return `(min-width: ${toEm(px)}em)`;
  }

  if (modifier === 'only') {
    return maxEm === undefined
      ? `(min-width: ${toEm(px)}em)`
      : `(min-width: ${toEm(px)}em) and (max-width: ${maxEm}em)`;
  }

  if (modifier === 'down') {
    return maxEm === undefined ? null : `(max-width: ${maxEm}em)`;
  }

  return null;
}

export function nfsMediaQueryIs(canonical: string): boolean {
  const query = buildNfsMediaQuery(canonical);

  return query === null ? true : window.matchMedia(query).matches;
}
