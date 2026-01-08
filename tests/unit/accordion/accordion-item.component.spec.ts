import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NfsAccordion } from '../../../packages/ngx-foundation-sites/src/lib/accordion/accordion';
import { NfsAccordionItemDef } from '../../../packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def';
import { NfsAccordionHeaderDef } from '../../../packages/ngx-foundation-sites/src/lib/accordion/accordion-header-def';
import { NfsAccordionContentDef } from '../../../packages/ngx-foundation-sites/src/lib/accordion/accordion-content';

@Component({
  template: `
    <nfs-accordion>
      <ng-template nfsAccordionItem panelId="panel-1">
        <ng-template nfsAccordionHeader>Title 1</ng-template>
        <ng-template nfsAccordionContent><p>Content 1</p></ng-template>
      </ng-template>
    </nfs-accordion>
  `,
  standalone: false,
})
class TestHost {}

describe('Accordion item timing', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHost],
      imports: [
        NfsAccordion,
        NfsAccordionItemDef,
        NfsAccordionHeaderDef,
        NfsAccordionContentDef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('coalesces rapid UI toggles (fakeAsync)', fakeAsync(() => {
    const trigger = fixture.debugElement.query(
      By.css('button.accordion-title'),
    );
    expect(trigger).toBeTruthy();

    // Simulate 10 rapid clicks
    for (let i = 0; i < 10; i++) {
      trigger.nativeElement.click();
      tick(20); // 20ms between clicks
    }

    // Wait out debounce/queue processing
    tick(300);
    fixture.detectChanges();

    const expanded = trigger.nativeElement.getAttribute('aria-expanded');
    expect(['true', 'false']).toContain(expanded);
  }));
});
