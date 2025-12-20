import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccordionGroup } from '@angular/aria/accordion';

@Component({
  selector: 'nfs-accordion',
  hostDirectives: [
    {
      directive: AccordionGroup,
      inputs: ['multiExpandable', 'disabled', 'wrap'],
    },
  ],
  template: `
    <ul class="accordion" role="presentation">
      <ng-content />
    </ul>
  `,
  host: {
    style: 'display: block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion {}
