import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
              <div
                class="accordion-content-inner"
                animate.enter="nfs-accordion-enter"
                animate.leave="nfs-accordion-leave"
              >
                @if (item.contentDef(); as contentDef) {
                  <ng-container *ngTemplateOutlet="contentDef.templateRef" />
                }
              </div>
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

    /*
     * CSS Grid animation for smooth expand/collapse using @starting-style
     * Uses grid-template-rows transition from 0fr to 1fr
     */
    .accordion-content {
      display: grid !important;
      grid-template-rows: 0fr;
      padding: 0;
      border: 0;

      /* Inner wrapper to contain content */
      > * {
        overflow: hidden;
      }
    }

    .accordion-item:has(button[aria-expanded='true']) > .accordion-content {
      grid-template-rows: 1fr;
      /* Restore Foundation padding when expanded */
      padding: 1rem;
      border: 1px solid #e6e6e6;
      border-top: 0;
    }

    /*
     * Native CSS animations using Angular's animate.enter/animate.leave
     * with @starting-style for enter animations
     */
    .nfs-accordion-enter {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows var(--nfs-accordion-slide-speed, 250ms)
        var(--nfs-accordion-slide-easing, ease-out);

      @starting-style {
        grid-template-rows: 0fr;
      }

      > * {
        overflow: hidden;
      }
    }

    .nfs-accordion-leave {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--nfs-accordion-slide-speed, 250ms)
        var(--nfs-accordion-slide-easing, ease-out);

      > * {
        overflow: hidden;
      }
    }
  `,
  host: {
    '[style.--nfs-accordion-slide-speed]': 'slideSpeedCss()',
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

  /** Animation duration in milliseconds for expand/collapse transitions */
  readonly slideSpeed = input(250);

  /** Computed CSS value for slide speed */
  protected readonly slideSpeedCss = computed(() => `${this.slideSpeed()}ms`);

  /** Collected accordion items */
  protected readonly items = contentChildren(NfsAccordionItem);
}
