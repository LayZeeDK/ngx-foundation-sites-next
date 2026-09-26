import { DOCUMENT, Directive, ElementRef, inject } from '@angular/core';
import { inPageFragment } from './in-page-link';

/**
 * Minimal prototype of the Smooth Scroll spec's NfsSmoothScroll (specs/smooth-scroll.md).
 * Placed on a container of in-page links, or on one link (link host, decided from the host
 * tag name). One click listener: resolve the in-page link, scroll it into view, focus it,
 * then call preventDefault() last and only when not already prevented.
 *
 * ponytail: no reducedMotion signal, no dev-mode warnings, no `top`/empty-fragment handling
 * beyond a literal `#` -- none of the three test cases in this prototype exercise them, and
 * the real spec already settles their shape. Kept: the click order the ADR 0017 / building-blocks
 * 1.11 decision 5 replay rule depends on, since that is what this prototype measures.
 */
@Directive({
  selector: '[nfsSmoothScroll]',
  host: {
    '(click)': 'onClick($event)',
  },
})
export class NfsSmoothScroll {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly isLinkHost = this.host.tagName === 'A';

  onClick(event: MouseEvent): void {
    // ponytail: instrumentation-only, kept for the prototype's own diagnosis, not part of the
    // spec's directive. Records every call so the e2e suite can see replay ordering directly
    // instead of inferring it from side effects.
    const log = (window as unknown as { __nfsClicks?: Record<string, unknown>[] }).__nfsClicks;
    const entry: Record<string, unknown> = {
      host: this.isLinkHost ? 'link' : 'container',
      eventPhaseAtEntry: event.eventPhase,
      defaultPreventedAtEntry: event.defaultPrevented,
      outcome: 'entered',
    };
    log?.push(entry);

    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      entry['outcome'] = 'ignored: modified click';
      return;
    }

    const eventTarget = event.target as HTMLElement;
    const link = (
      this.isLinkHost ? this.host : eventTarget.closest('a[href]')
    ) as HTMLAnchorElement | null;

    if (!link || !this.host.contains(link)) {
      entry['outcome'] = 'ignored: no matching link';
      return;
    }

    if (link.hasAttribute('download') || (link.target !== '' && link.target !== '_self')) {
      entry['outcome'] = 'ignored: download/target link';
      return;
    }

    if (!this.isLinkHost && event.defaultPrevented) {
      // Container host yields to a click a link-level listener already cancelled.
      entry['outcome'] = 'ignored: container yields to already-cancelled click';
      return;
    }

    const fragment = inPageFragment(link, this.document);

    if (!fragment) {
      entry['outcome'] = 'ignored: not an in-page link';
      return;
    }

    const target = this.document.getElementById(fragment);

    if (!target) {
      entry['outcome'] = 'ignored: no target element';
      return;
    }

    this.scrollTo(target);
    entry['outcome'] = 'scrolled';

    if (!event.defaultPrevented) {
      entry['outcome'] = 'scrolled, calling preventDefault()';
      event.preventDefault();
      entry['outcome'] = 'scrolled, preventDefault() returned normally';
    } else {
      entry['outcome'] = 'scrolled, skipped preventDefault() (already prevented)';
    }
  }

  scrollTo(target: Element): void {
    const el = target as HTMLElement;
    const needsTabIndex = !this.isFocusable(el);

    if (needsTabIndex) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    el.focus({ preventScroll: true });
  }

  private isFocusable(el: HTMLElement): boolean {
    if (el.tabIndex >= 0) {
      return true;
    }

    return ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
  }
}
