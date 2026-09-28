import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from '../../nfs/button';

/** A forgotten whole family: no accordion directive imported; another library directive is.
 * Also a class-less behaviour directive (NfsSmoothScroll) written without its import. */
@Component({
  selector: 'app-family-case',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul nfsAccordion>
      <li nfsAccordionItem>
        <button nfsAccordionTitle>Family missing</button>
        <div nfsAccordionContent>Panel 1</div>
      </li>
    </ul>
    <button nfsButton>Imported button</button>
    <a nfsSmoothScroll href="#top">Behaviour missing</a>
  `,
})
export class FamilyCase {}
