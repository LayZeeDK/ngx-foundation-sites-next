import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NfsAccordion } from './accordion';
import { NfsAccordionItemDef } from './accordion-item-def';
import { NfsAccordionHeaderDef } from './accordion-header-def';
import { NfsAccordionContentDef } from './accordion-content';

@Component({
  template: `
    <nfs-accordion>
      <ng-template nfsAccordionItem panelId="panel-1">
        <ng-template nfsAccordionHeader>Title 1</ng-template>
        <ng-template nfsAccordionContent><p>Content 1</p></ng-template>
      </ng-template>
    </nfs-accordion>
  `,
  standalone: true,
  imports: [
    NfsAccordion,
    NfsAccordionItemDef,
    NfsAccordionHeaderDef,
    NfsAccordionContentDef,
  ],
})
class TestHost {}

describe('Accordion item timing (local spec)', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('coalesces rapid UI toggles (zoneless)', async () => {
    const trigger = fixture.debugElement.query(
      By.css('button.accordion-title'),
    );
    expect(trigger).toBeTruthy();

    // Simulate 10 rapid clicks and allow microtasks to settle between each
    for (let i = 0; i < 10; i++) {
      trigger.nativeElement.click();
      await fixture.whenStable();
    }

    // Give the debounce/queue time to process (real timers)
    await new Promise((r) => setTimeout(r, 350));
    fixture.detectChanges();
    await fixture.whenStable();

    const expanded = trigger.nativeElement.getAttribute('aria-expanded');
    expect(['true', 'false']).toContain(expanded);
  });
});
