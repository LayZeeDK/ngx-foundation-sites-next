import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import {
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

@Component({
  selector: 'nfs-accordion-item',
  imports: [AccordionTrigger, AccordionPanel, AccordionContent],
  template: `
    <li class="accordion-item" [class.is-active]="expanded()">
      <button
        type="button"
        class="accordion-title"
        ngAccordionTrigger
        [panelId]="panelId()"
        [disabled]="disabled()"
        [(expanded)]="expanded"
      >
        <ng-content select="[nfsAccordionTitle]" />
      </button>
      <div ngAccordionPanel [panelId]="panelId()" class="accordion-content">
        <ng-template ngAccordionContent>
          <ng-content />
        </ng-template>
      </div>
    </li>
  `,
  host: {
    style: 'display: contents',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordionItem {
  readonly panelId = input.required<string>();
  readonly disabled = input(false);
  readonly expanded = model(false);
}
