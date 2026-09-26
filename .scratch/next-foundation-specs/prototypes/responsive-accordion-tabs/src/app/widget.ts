// PROTOTYPE (throwaway): the consumer's use of the component.
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NFS_RESPONSIVE_ACCORDION_TABS } from './nfs/responsive-accordion-tabs';
import { NfsMediaQuery } from './nfs/media-query';

@Component({
  selector: 'app-widget',
  imports: [NFS_RESPONSIVE_ACCORDION_TABS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p data-testid="state">selected={{ selected() }} breakpoint={{ mq.current() }}</p>
    <nfs-responsive-accordion-tabs
      rules="accordion medium-tabs"
      label="Product details"
      [(selected)]="selected"
      data-testid="rat"
    >
      <ng-template nfsResponsiveAccordionTabsPanel title="Overview" value="overview">
        <p>Overview content, projected from the consumer's template.</p>
        <p><a href="#overview-more" data-testid="overview-link">A link inside the Overview panel</a></p>
      </ng-template>
      <ng-template nfsResponsiveAccordionTabsPanel title="Specs" value="specs">
        <p>Specs content.</p>
        <label>Note <input type="text" data-testid="specs-input" /></label>
      </ng-template>
      <ng-template nfsResponsiveAccordionTabsPanel title="Reviews" value="reviews">
        <p>Reviews content.</p>
      </ng-template>
    </nfs-responsive-accordion-tabs>
  `,
})
export class Widget {
  protected readonly mq = inject(NfsMediaQuery);
  protected readonly selected = signal<string | undefined>(undefined);
}
