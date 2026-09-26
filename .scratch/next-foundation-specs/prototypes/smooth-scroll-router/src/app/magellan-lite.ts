import { DOCUMENT, Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';
import { inPageFragment } from './in-page-link';
import { NfsSmoothScroll } from './smooth-scroll';

/**
 * Minimal prototype of the Magellan spec's deep-linking subsection (specs/magellan.md):
 * composes NfsSmoothScroll through hostDirectives (so its click listener scrolls and focuses
 * first), then this directive's own click listener writes the URL: replaceState by default
 * (deepLinking), or pushState when updateHistory is set, passing history.state through.
 *
 * ponytail: no IntersectionObserver section tracking, no .is-active/aria-current marker, no
 * Activation-line math. Case 3 is about the history entries Back/Forward walk, not about which
 * section the reader is reading, so the full scroll-spy machinery would be effort spent on a
 * question this ticket does not ask. The real Magellan spec already settles that shape.
 */
@Directive({
  selector: '[nfsMagellanLite]',
  hostDirectives: [NfsSmoothScroll],
  host: {
    '(click)': 'onClick($event)',
  },
})
export class NfsMagellanLite {
  readonly updateHistory = input(false, { transform: booleanAttribute });

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly document = inject(DOCUMENT);

  onClick(event: MouseEvent): void {
    const eventTarget = event.target as HTMLElement;
    const link = eventTarget.closest('a[href]') as HTMLAnchorElement | null;

    if (!link || !this.host.contains(link)) {
      return;
    }

    const fragment = inPageFragment(link, this.document);

    if (!fragment) {
      return;
    }

    const location = this.document.location;
    const url = location.pathname + location.search + '#' + fragment;

    if (this.updateHistory()) {
      history.pushState(history.state, '', url);
    } else {
      history.replaceState(history.state, '', url);
    }
  }
}
