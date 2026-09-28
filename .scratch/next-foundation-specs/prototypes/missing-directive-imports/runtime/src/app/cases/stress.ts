import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  NfsAccordion,
  NfsAccordionContent,
  NfsAccordionItem,
  NfsAccordionTitle,
} from '../../nfs/accordion';
import { NfsButton } from '../../nfs/button';

const count =
  typeof location === 'undefined' ? 500 : Number(new URLSearchParams(location.search).get('n') ?? 500);

/** Scan cost: `n` accordion items (3 library elements each) and `n` buttons, all imported,
 * plus `n` plain paragraphs; a click re-renders one counter to time a warm scan. */
@Component({
  selector: 'app-stress-case',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent, NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="ticks.set(ticks() + 1)">Tick {{ ticks() }}</button>
    <ul nfsAccordion>
      @for (i of rows; track i) {
        <li nfsAccordionItem>
          <button nfsAccordionTitle>Title {{ i }}</button>
          <div nfsAccordionContent>
            <p>Plain {{ i }}</p>
            <button nfsButton>Button {{ i }}</button>
          </div>
        </li>
      }
    </ul>
  `,
})
export class StressCase {
  protected readonly rows = Array.from({ length: count }, (_, i) => i);
  protected readonly ticks = signal(0);
}
