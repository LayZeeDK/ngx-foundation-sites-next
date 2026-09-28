import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsAccordion, NfsAccordionContent, NfsAccordionItem } from '../../nfs/accordion';

/** A forgotten member of a family: NfsAccordionTitle is not imported. */
@Component({
  selector: 'app-member-case',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul nfsAccordion>
      <li nfsAccordionItem>
        <button nfsAccordionTitle>Member missing</button>
        <div nfsAccordionContent>Panel 1</div>
      </li>
    </ul>
  `,
})
export class MemberCase {}
