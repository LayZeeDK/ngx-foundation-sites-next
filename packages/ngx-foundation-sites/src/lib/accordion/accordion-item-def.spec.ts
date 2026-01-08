import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NfsAccordionItemDef, NFS_ACCORDION_TIME_PROVIDER } from './accordion-item-def';
import { NfsAccordion } from './accordion';

@Component({
  template: `
    <nfs-accordion #accordion>
      <ng-template nfsAccordionItem panelId="test-panel">
        <div>Test content</div>
      </ng-template>
    </nfs-accordion>
  `,
  standalone: true,
  imports: [NfsAccordion, NfsAccordionItemDef],
})
class TestHost {}

describe('NfsAccordionItemDef toggle queue', () => {
  let fixture: ComponentFixture<TestHost>;
  let mockTime = 0;

  beforeEach(async () => {
    mockTime = 0;
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        provideZonelessChangeDetection(),
        { provide: NFS_ACCORDION_TIME_PROVIDER, useValue: () => mockTime },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    // Get the accordion instance and then the first item def
    const accordionEl = fixture.debugElement.query(By.directive(NfsAccordion));
    const accordion = accordionEl.injector.get(NfsAccordion);
    expect(accordion.itemDefs().length).toBe(1); // Make sure we have an item
  });

  it('should coalesce rapid UI toggles and process queue without throwing', async () => {
    const trigger = fixture.debugElement.query(By.css('button.accordion-title'));
    expect(trigger).toBeTruthy();

    // Get the itemDef for direct testing
    const accordionEl = fixture.debugElement.query(By.directive(NfsAccordion));
    const accordion = accordionEl.injector.get(NfsAccordion);
    const itemDef = accordion.itemDefs()[0];

    // Check initial state
    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('false');

    // First UI toggle should work
    itemDef.requestToggle('ui');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('true');

    // Rapid UI toggles within debounce window should be coalesced
    mockTime = 10;
    itemDef.requestToggle('ui');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('true'); // Still true (coalesced)

    mockTime = 20;
    itemDef.requestToggle('ui');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('true'); // Still true (coalesced)

    // Toggle after debounce window should work
    mockTime = 60;
    itemDef.requestToggle('ui');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('false'); // Toggled back
  });
});
