import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';
import { NfsAccordionItem } from './accordion-item';

@Component({
  selector: 'nfs-accordion',
  template: `
    <ul
      ngAccordionGroup
      class="accordion"
      role="presentation"
      [multiExpandable]="multiExpandable()"
      [disabled]="disabled()"
      [wrap]="wrap()"
    >
      @for (item of items(); track item.panelId()) {
        <li class="accordion-item">
          <button
            ngAccordionTrigger
            type="button"
            class="accordion-title"
            [panelId]="item.panelId()"
            [disabled]="item.disabled()"
            [(expanded)]="item.expanded"
          >
            @if (item.titleDef(); as titleDef) {
              <ng-container *ngTemplateOutlet="titleDef.templateRef" />
            }
          </button>
          <div
            ngAccordionPanel
            class="accordion-content"
            [panelId]="item.panelId()"
          >
            <ng-template ngAccordionContent>
              @if (item.contentDef(); as contentDef) {
                <ng-container *ngTemplateOutlet="contentDef.templateRef" />
              }
            </ng-template>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    /* Override Foundation's .is-active requirement with aria-expanded */
    .accordion-item:has(button[aria-expanded='true']) > .accordion-content {
      display: block;
    }
  `,
  host: {
    style: 'display: block',
  },
  imports: [
    AccordionGroup,
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion {
  /** Allow multiple panels to be expanded simultaneously */
  readonly multiExpandable = input(false);

  /** Disable all accordion interactions */
  readonly disabled = input(false);

  /** Whether keyboard navigation wraps from last to first item */
  readonly wrap = input(false);

  /** Collected accordion items */
  protected readonly items = contentChildren(NfsAccordionItem);
}
