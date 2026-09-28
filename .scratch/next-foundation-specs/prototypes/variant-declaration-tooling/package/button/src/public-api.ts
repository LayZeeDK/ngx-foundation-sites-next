import { computed, Directive, input } from '@angular/core';
import type {
  NfsButtonPaletteOverrides,
  NfsClassBreakpointQuery,
  NfsFoundationPaletteColor,
  NfsOverridableStringUnion,
} from 'ngx-foundation-sites';

/** `$button-palette`, chained on `$foundation-palette`. Shape: name. */
export type NfsButtonColor = NfsOverridableStringUnion<
  NfsFoundationPaletteColor,
  NfsButtonPaletteOverrides
>;
/** `.expanded` and its responsive forms. Shape: query. */
export type NfsButtonExpanded = NfsClassBreakpointQuery<'only' | 'down'>;

/** PROTOTYPE stand-in for Foundation's Button (name and query shapes). */
@Directive({
  selector: '[nfsButton]',
  host: { class: 'button', '[class]': 'classes()' },
})
export class NfsButton {
  /** A `$button-palette` name. */
  readonly color = input<NfsButtonColor | undefined>(undefined);
  /** `expanded`, as a Breakpoint query over Class breakpoints. */
  readonly expanded = input<NfsButtonExpanded | undefined>(undefined);

  protected readonly classes = computed(() => {
    const expanded = this.expanded();
    const [bp, modifier] = (expanded ?? '').split(' ');
    const expandedClass = !expanded
      ? ''
      : modifier
        ? `${bp}-${modifier}-expanded`
        : `${bp}-expanded`;

    return [this.color() ?? '', expandedClass].filter(Boolean).join(' ');
  });
}
