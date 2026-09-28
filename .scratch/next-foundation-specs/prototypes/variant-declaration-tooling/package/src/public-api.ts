// PROTOTYPE stand-in for the ngx-foundation-sites primary entry point (ticket 137).
// The types follow the Variant declaration tooling spec, "API: the primary entry point",
// reduced to five of the 26 registries.

type NfsOverwrite<T, U> = Omit<T, keyof U> & U;
type NfsTrueKeys<T> = Extract<
  { [K in keyof T]: true extends T[K] ? K : never }[keyof T],
  string
>;

/** Foundation's default names T with the registry U applied: `name: true` adds, `name: false` removes. */
export type NfsOverridableStringUnion<T extends string, U = {}> = NfsTrueKeys<
  NfsOverwrite<Record<T, true>, U>
>;

type NfsBelow<
  N extends number,
  Acc extends number[] = [],
> = Acc['length'] extends N
  ? Acc[number]
  : NfsBelow<N, [...Acc, Acc['length']]>;

/** The integers Start..End. */
export type NfsRange<Start extends number, End extends number> = Exclude<
  NfsBelow<End> | End,
  NfsBelow<Start>
>;

/** A count registry's `count` member, else the library default D. */
export type NfsOverridableCountValue<D extends number, R> = R extends {
  count: infer N extends number;
}
  ? N
  : D;

/** The range Start..count of a count registry (Start is 1 unless given). */
export type NfsOverridableCount<
  D extends number,
  R,
  Start extends number = 1,
> = NfsRange<Start, NfsOverridableCountValue<D, R>>;

/** `$foundation-palette` (`--nfs-foundation-palette`). */
export interface NfsFoundationPaletteOverrides {}
/** `$button-palette` (`--nfs-button-palette`), based on `$foundation-palette`. */
export interface NfsButtonPaletteOverrides {}
/** `$breakpoint-classes` (`--nfs-breakpoint-classes`). */
export interface NfsBreakpointClassesOverrides {}
/** `$grid-columns` (`--nfs-grid-columns`). */
export interface NfsGridColumnsOverrides {}
/** `$prototype-sizes` (`--nfs-prototype-sizes`). */
export interface NfsPrototypeSizesOverrides {}

export type NfsFoundationPaletteColor = NfsOverridableStringUnion<
  'primary' | 'secondary' | 'success' | 'warning' | 'alert',
  NfsFoundationPaletteOverrides
>;
export type NfsClassBreakpoint = NfsOverridableStringUnion<
  'small' | 'medium' | 'large',
  NfsBreakpointClassesOverrides
>;
export type NfsClassBreakpointQuery<M extends 'up' | 'only' | 'down'> =
  | NfsClassBreakpoint
  | `${NfsClassBreakpoint} ${M}`;
export type NfsClassBreakpointRules<V> = {
  readonly [K in NfsClassBreakpoint]?: V;
};

export type NfsVariantBoolean =
  | boolean
  | ''
  | 'true'
  | 'false'
  | null
  | undefined;

export function nfsVariantBoolean(value: NfsVariantBoolean): boolean {
  return value === true || value === '' || value === 'true';
}
