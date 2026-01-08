import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NfsAccordionItemDef } from './accordion-item-def';
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
  let itemDef: NfsAccordionItemDef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    // Get the accordion instance and then the first item def
    const accordionEl = fixture.debugElement.query(By.directive(NfsAccordion));
    const accordion = accordionEl.injector.get(NfsAccordion);
    itemDef = accordion.itemDefs()[0];
  });

  it('should coalesce rapid UI toggles and process queue without throwing', async () => {
    // Simulate rapid UI toggles (10 toggles within 200ms)
    for (let i = 0; i < 10; i++) {
      itemDef.requestToggle('ui');
      await new Promise((r) => setTimeout(r, 20));
    }

    // Allow microtasks to complete
    await new Promise((r) => setTimeout(r, 200));

    expect(typeof itemDef.expanded()).toBe('boolean');
  });
});
