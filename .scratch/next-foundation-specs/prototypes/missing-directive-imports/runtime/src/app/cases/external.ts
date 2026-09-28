import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsAccordion, NfsAccordionContent, NfsAccordionItem } from '../../nfs/accordion';

/** The member case again, from an external templateUrl. */
@Component({
  selector: 'app-external-case',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './external.html',
})
export class ExternalCase {}
