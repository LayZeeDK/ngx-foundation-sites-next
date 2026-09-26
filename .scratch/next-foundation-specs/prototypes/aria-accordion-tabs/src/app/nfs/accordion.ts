// PROTOTYPE (throwaway): host-directive wrappers of @angular/aria/accordion on
// Foundation accordion markup. Answers ticket "Prototype: @angular/aria Accordion
// and Tabs under Foundation markup". Not library code.
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  contentChild,
  inject,
} from '@angular/core';
import { AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';

/** `ul.accordion` -- hosts Aria's AccordionGroup. */
@Directive({
  selector: '[nfsAccordion]',
  exportAs: 'nfsAccordion',
  host: { '(keydown)': 'onKeydown($event)', '(click)': 'trace($event)' },
  hostDirectives: [
    {
      directive: AccordionGroup,
      // Foundation `data-multi-expand` -> `multiExpand`. The wrapper cannot change
      // Aria's default (`true`) because it cannot write Aria's input from code.
      inputs: ['multiExpandable: multiExpand', 'disabled', 'wrap'],
    },
  ],
})
export class NfsAccordion {
  readonly group = inject(AccordionGroup);

  // PROTOTYPE instrumentation: which events reach the group, and whether replayed
  // (eventPhase 101). Does not call preventDefault.
  protected trace(e: Event) {
    const k = e instanceof KeyboardEvent ? ` key=${JSON.stringify(e.key)}` : '';
    console.info(`[trace] ${e.type}${k} eventPhase=${e.eventPhase} expanded=${this.group._collection.orderedItems().map((t) => t.expanded()).join(',')}`);
  }

  // Replay guard (tested mitigation). Aria's KeyboardEventManager calls
  // preventDefault() and then stopPropagation(); on a replayed event the first
  // throws, so the second never runs and the replayed key bubbles on to an outer
  // accordion, which handles it again. A same-element listener still runs after
  // Aria's throw (Angular catches per listener), so it re-applies the stop.
  // stopPropagation() is emulated, not thrown, during replay.
  protected onKeydown(e: KeyboardEvent) {
    this.trace(e);
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'Enter'].includes(e.key)) {
      e.stopPropagation();
    }
  }
}

/** `button.accordion-title` (inside the item's heading) -- hosts Aria's AccordionTrigger. */
@Directive({
  selector: '[nfsAccordionTitle]',
  exportAs: 'nfsAccordionTitle',
  hostDirectives: [
    {
      directive: AccordionTrigger,
      // `panel` is `input.required` in Aria. NG2019 forces the wrapper to expose it,
      // and NG8008 then forces the consumer to bind it.
      inputs: ['panel', 'expanded', 'disabled', 'id'],
      outputs: ['expandedChange'],
    },
  ],
})
export class NfsAccordionTitle {
  readonly trigger = inject(AccordionTrigger);
}

/** `li.accordion-item` -- binds Foundation's `.is-active` from its title's state. */
@Directive({
  selector: '[nfsAccordionItem]',
  host: {
    '[class.is-active]': 'title()?.trigger.expanded() === true',
  },
})
export class NfsAccordionItem {
  protected readonly title = contentChild(NfsAccordionTitle);
}

/**
 * `div.accordion-content` -- attribute-selector wrapper component. Hosts Aria's
 * AccordionPanel; projects the content (no Aria `ng-template`) so an open panel
 * is present in server HTML; adds the single wrapper child the grid-row height
 * animation needs.
 */
@Component({
  selector: '[nfsAccordionContent]',
  exportAs: 'nfsAccordionContent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: AccordionPanel, inputs: ['id'] }],
  template: `<div class="nfs-accordion-content-body"><ng-content /></div>`,
})
export class NfsAccordionContent {
  readonly panel = inject(AccordionPanel);
  readonly element = inject(ElementRef).nativeElement as HTMLElement;
}

export const NFS_ACCORDION = [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent];
