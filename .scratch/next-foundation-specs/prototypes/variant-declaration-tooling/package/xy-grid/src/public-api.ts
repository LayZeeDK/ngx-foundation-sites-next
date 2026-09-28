import { computed, Directive, input } from '@angular/core';
import type {
  NfsClassBreakpointRules,
  NfsGridColumnsOverrides,
  NfsOverridableCount,
} from 'ngx-foundation-sites';

/** 1..$grid-columns. Shape: count. */
export type NfsCellSizeCount = NfsOverridableCount<12, NfsGridColumnsOverrides>;
export type NfsCellSizeValue =
  | NfsCellSizeCount
  | `${NfsCellSizeCount}`
  | 'auto'
  | 'shrink';
/** A size, or Breakpoint rules of sizes. Shapes: count and rules. */
export type NfsCellSize =
  | NfsCellSizeValue
  | NfsClassBreakpointRules<NfsCellSizeValue>;

/** PROTOTYPE stand-in for the XY Grid cell (count and rules shapes). */
@Directive({
  selector: '[nfsCell]',
  host: { class: 'cell', '[class]': 'classes()' },
})
export class NfsCell {
  /** `small-<n>` and the other breakpoints' sizes. */
  readonly size = input<NfsCellSize | undefined>(undefined);

  protected readonly classes = computed(() => {
    const size = this.size();

    if (size === undefined) {
      return '';
    }

    if (typeof size === 'object') {
      return Object.entries(size)
        .map(([bp, value]) => `${bp}-${value}`)
        .join(' ');
    }

    return `small-${size}`;
  });
}
