import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  NfsAccordion,
  NfsAccordionContent,
  NfsAccordionItem,
  NfsAccordionTitle,
} from '../../nfs/accordion';
import { NfsButton } from '../../nfs/button';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** Every directive imported: no report expected. */
@Component({
  selector: 'app-ok-case',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent, NfsButton, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul nfsAccordion>
      <li nfsAccordionItem>
        <button nfsAccordionTitle>Section 1</button>
        <div nfsAccordionContent>Panel 1</div>
      </li>
    </ul>
    <button nfsButton size="small">Save</button>
    <a nfsSmoothScroll href="#top">Top</a>
  `,
})
export class OkCase {}
