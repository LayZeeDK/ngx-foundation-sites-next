// PROTOTYPE page (ticket 195): every first-milestone family's Foundation doc examples on one page.
import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { useNfsFamilyStyles } from '../lib/family-styles';
import { carriers } from '../nfs-families/carriers';
import { markup } from './markup';

const FAMILIES = Object.keys(markup).filter((k) => k !== 'kitchen-sink');

@Component({
  selector: 'nfs-families-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p data-probe="tailwind" class="p-[13px] text-emerald-700 underline decoration-wavy">Tailwind v4 probe</p>
    <main id="families">
      @for (s of sections; track s.name) {
        <section [attr.data-family]="s.name" [innerHTML]="s.html"></section>
      }
    </main>
  `,
})
export class FamiliesPage {
  readonly #sanitizer = inject(DomSanitizer);
  protected readonly sections: { name: string; html: SafeHtml }[] = Object.entries(markup).map(([name, html]) => ({
    name,
    html: this.#sanitizer.bypassSecurityTrustHtml(html),
  }));

  constructor() {
    // PROTOTYPE switch `?families=reverse`: load the families in reverse of Foundation's order.
    const reverse = inject(DOCUMENT).location.search.includes('families=reverse');

    if (Object.keys(carriers).length > 0) {
      useNfsFamilyStyles(...(reverse ? [...FAMILIES].reverse() : FAMILIES));
    }
  }
}
