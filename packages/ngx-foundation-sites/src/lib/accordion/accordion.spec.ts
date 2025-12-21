import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NfsAccordion } from './accordion';
import { NfsAccordionItem } from './accordion-item';
import { NfsAccordionTitleDef } from './accordion-title';
import { NfsAccordionContentDef } from './accordion-content';
import { AccordionDeepLinkService } from './accordion-deep-link.service';

/**
 * Test host component for accordion tests
 */
@Component({
  template: `
    <nfs-accordion
      [multiExpandable]="multiExpandable()"
      [disabled]="disabled()"
      [wrap]="wrap()"
      [slideSpeed]="slideSpeed()"
      [deepLink]="deepLink()"
      [deepLinkSmudge]="deepLinkSmudge()"
      [deepLinkSmudgeDelay]="deepLinkSmudgeDelay()"
      [updateHistory]="updateHistory()"
      [allowAllClosed]="allowAllClosed()"
    >
      <nfs-accordion-item
        panelId="panel-1"
        [disabled]="item1Disabled()"
        [expanded]="item1Expanded()"
      >
        <span *nfsAccordionTitle>Item 1 Title</span>
        <p *nfsAccordionContent>Item 1 Content</p>
      </nfs-accordion-item>
      <nfs-accordion-item
        panelId="panel-2"
        [disabled]="item2Disabled()"
        [expanded]="item2Expanded()"
      >
        <span *nfsAccordionTitle>Item 2 Title</span>
        <p *nfsAccordionContent>Item 2 Content</p>
      </nfs-accordion-item>
      <nfs-accordion-item
        panelId="panel-3"
        [disabled]="item3Disabled()"
        [expanded]="item3Expanded()"
      >
        <span *nfsAccordionTitle>Item 3 Title</span>
        <p *nfsAccordionContent>Item 3 Content</p>
      </nfs-accordion-item>
    </nfs-accordion>
  `,
  imports: [
    NfsAccordion,
    NfsAccordionItem,
    NfsAccordionTitleDef,
    NfsAccordionContentDef,
  ],
})
class TestHostComponent {
  multiExpandable = signal(false);
  disabled = signal(false);
  wrap = signal(false);
  slideSpeed = signal(250);
  deepLink = signal(false);
  deepLinkSmudge = signal(false);
  deepLinkSmudgeDelay = signal(300);
  updateHistory = signal(false);
  allowAllClosed = signal(true);

  item1Disabled = signal(false);
  item1Expanded = signal(false);
  item2Disabled = signal(false);
  item2Expanded = signal(false);
  item3Disabled = signal(false);
  item3Expanded = signal(false);
}

describe('NfsAccordion', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let mockDeepLinkService: {
    getHashPanelId: ReturnType<typeof vi.fn>;
    updateHash: ReturnType<typeof vi.fn>;
    clearHash: ReturnType<typeof vi.fn>;
    scrollToPanel: ReturnType<typeof vi.fn>;
    onHashChange: ReturnType<typeof vi.fn>;
  };

  function getTriggers(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button.accordion-title'),
    );
  }

  function getPanels(): HTMLDivElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('div.accordion-content'),
    );
  }

  async function clickTrigger(index: number): Promise<void> {
    const triggers = getTriggers();
    const trigger = triggers[index];

    // Focus and use keyboard Enter, which is more reliable for Angular ARIA
    trigger.focus();
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );

    await fixture.whenStable();
    fixture.detectChanges();
  }

  function isExpanded(index: number): boolean {
    const triggers = getTriggers();
    return triggers[index].getAttribute('aria-expanded') === 'true';
  }

  function isDisabled(index: number): boolean {
    const triggers = getTriggers();
    return triggers[index].getAttribute('aria-disabled') === 'true';
  }

  beforeEach(async () => {
    mockDeepLinkService = {
      getHashPanelId: vi.fn().mockReturnValue(null),
      updateHash: vi.fn(),
      clearHash: vi.fn(),
      scrollToPanel: vi.fn(),
      onHashChange: vi.fn().mockReturnValue(() => undefined),
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AccordionDeepLinkService, useValue: mockDeepLinkService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic rendering', () => {
    it('should render accordion with three items', () => {
      const triggers = getTriggers();
      const panels = getPanels();

      expect(triggers).toHaveLength(3);
      expect(panels).toHaveLength(3);
    });

    it('should render title content in triggers', () => {
      const triggers = getTriggers();

      expect(triggers[0].textContent).toContain('Item 1 Title');
      expect(triggers[1].textContent).toContain('Item 2 Title');
      expect(triggers[2].textContent).toContain('Item 3 Title');
    });

    it('should have proper ARIA attributes on triggers', () => {
      const triggers = getTriggers();
      const panels = getPanels();

      triggers.forEach((trigger, index) => {
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.getAttribute('aria-controls')).toBe(
          panels[index].getAttribute('id'),
        );
      });
    });

    it('should set panel IDs correctly', () => {
      const panels = getPanels();

      expect(panels[0].id).toBe('panel-1');
      expect(panels[1].id).toBe('panel-2');
      expect(panels[2].id).toBe('panel-3');
    });
  });

  describe('single expand mode (multiExpandable=false)', () => {
    beforeEach(() => {
      host.multiExpandable.set(false);
      fixture.detectChanges();
    });

    it('should expand panel when trigger is clicked', async () => {
      await clickTrigger(0);

      expect(isExpanded(0)).toBe(true);
    });

    it('should close previous panel when new panel is expanded', async () => {
      await clickTrigger(0);
      expect(isExpanded(0)).toBe(true);
      expect(isExpanded(1)).toBe(false);

      await clickTrigger(1);

      expect(isExpanded(0)).toBe(false);
      expect(isExpanded(1)).toBe(true);
    });

    it('should only have one panel expanded at a time', async () => {
      await clickTrigger(0);
      await clickTrigger(1);
      await clickTrigger(2);

      const expandedCount = getTriggers().filter(
        (t) => t.getAttribute('aria-expanded') === 'true',
      ).length;
      expect(expandedCount).toBe(1);
      expect(isExpanded(2)).toBe(true);
    });
  });

  describe('multi-expand mode (multiExpandable=true)', () => {
    beforeEach(() => {
      host.multiExpandable.set(true);
      fixture.detectChanges();
    });

    it('should keep multiple panels open', async () => {
      await clickTrigger(0);

      expect(isExpanded(0)).toBe(true);

      await clickTrigger(1);

      expect(isExpanded(0)).toBe(true);
      expect(isExpanded(1)).toBe(true);
    });

    it('should allow closing individual panels', async () => {
      await clickTrigger(0);
      await clickTrigger(1);

      expect(isExpanded(0)).toBe(true);
      expect(isExpanded(1)).toBe(true);

      await clickTrigger(0);

      expect(isExpanded(0)).toBe(false);
      expect(isExpanded(1)).toBe(true);
    });
  });

  describe('disabled state', () => {
    describe('accordion-level disabled', () => {
      beforeEach(() => {
        host.disabled.set(true);
        fixture.detectChanges();
      });

      it('should mark all triggers as disabled', () => {
        const triggers = getTriggers();

        triggers.forEach((trigger) => {
          expect(trigger.getAttribute('aria-disabled')).toBe('true');
        });
      });

      it('should not expand panels when accordion is disabled', async () => {
        await clickTrigger(0);

        expect(isExpanded(0)).toBe(false);
      });
    });

    describe('item-level disabled', () => {
      beforeEach(() => {
        host.item2Disabled.set(true);
        fixture.detectChanges();
      });

      it('should mark specific item as disabled', () => {
        expect(isDisabled(0)).toBe(false);
        expect(isDisabled(1)).toBe(true);
        expect(isDisabled(2)).toBe(false);
      });

      it('should not expand disabled item', async () => {
        await clickTrigger(1);

        expect(isExpanded(1)).toBe(false);
      });

      it('should still allow expanding enabled items', async () => {
        await clickTrigger(0);

        expect(isExpanded(0)).toBe(true);
      });
    });
  });

  describe('initially expanded panels', () => {
    it('should render panel as expanded when expanded=true', () => {
      host.item1Expanded.set(true);
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(true);
    });

    it('should render content when panel is initially expanded', () => {
      host.item2Expanded.set(true);
      fixture.detectChanges();

      const panels = getPanels();
      expect(panels[1].textContent).toContain('Item 2 Content');
    });

    it('should support multiple initially expanded panels in multi-expand mode', () => {
      host.multiExpandable.set(true);
      host.item1Expanded.set(true);
      host.item2Expanded.set(true);
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(true);
      expect(isExpanded(1)).toBe(true);
      expect(isExpanded(2)).toBe(false);
    });
  });

  describe('allowAllClosed enforcement', () => {
    beforeEach(() => {
      host.allowAllClosed.set(false);
      host.item1Expanded.set(true);
      fixture.detectChanges();
    });

    it('should reopen panel when trying to close the last open panel', async () => {
      expect(isExpanded(0)).toBe(true);

      await clickTrigger(0);

      // Panel should reopen since allowAllClosed=false
      expect(isExpanded(0)).toBe(true);
    });

    it('should allow closing all panels when allowAllClosed=true', async () => {
      host.allowAllClosed.set(true);
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(true);

      await clickTrigger(0);

      expect(isExpanded(0)).toBe(false);
    });

    it('should skip enforcement when accordion is disabled', () => {
      host.disabled.set(true);
      host.allowAllClosed.set(false);
      fixture.detectChanges();

      // Disabled accordion shouldn't enforce allowAllClosed
      // The panel can't be toggled anyway, but the enforcement logic should be skipped
      expect(isDisabled(0)).toBe(true);
    });
  });

  describe('slideSpeed CSS custom property', () => {
    it('should set default slide speed', () => {
      const accordion = fixture.nativeElement.querySelector('nfs-accordion');

      expect(
        accordion.style.getPropertyValue('--nfs-accordion-slide-speed'),
      ).toBe('250ms');
    });

    it('should update slide speed when input changes', () => {
      host.slideSpeed.set(500);
      fixture.detectChanges();

      const accordion = fixture.nativeElement.querySelector('nfs-accordion');
      expect(
        accordion.style.getPropertyValue('--nfs-accordion-slide-speed'),
      ).toBe('500ms');
    });

    it('should handle zero slide speed', () => {
      host.slideSpeed.set(0);
      fixture.detectChanges();

      const accordion = fixture.nativeElement.querySelector('nfs-accordion');
      expect(
        accordion.style.getPropertyValue('--nfs-accordion-slide-speed'),
      ).toBe('0ms');
    });
  });

  describe('ARIA attributes', () => {
    it('should set role="presentation" on the list', () => {
      const ul = fixture.nativeElement.querySelector('ul.accordion');
      expect(ul.getAttribute('role')).toBe('presentation');
    });

    it('should set type="button" on triggers', () => {
      const triggers = getTriggers();

      triggers.forEach((trigger) => {
        expect(trigger.getAttribute('type')).toBe('button');
      });
    });

    it('should update aria-expanded when panel expands', async () => {
      const trigger = getTriggers()[0];

      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      await clickTrigger(0);

      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('deep linking', () => {
    it('should not call deep link service when deepLink=false', async () => {
      host.deepLink.set(false);
      fixture.detectChanges();

      await clickTrigger(0);

      expect(mockDeepLinkService.updateHash).not.toHaveBeenCalled();
    });

    it('should expand panel matching initial hash', async () => {
      mockDeepLinkService.getHashPanelId.mockReturnValue('panel-2');

      // Recreate fixture to trigger initial hash handling
      vi.clearAllMocks();
      mockDeepLinkService.getHashPanelId.mockReturnValue('panel-2');
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          provideZonelessChangeDetection(),
          { provide: AccordionDeepLinkService, useValue: mockDeepLinkService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(TestHostComponent);
      newFixture.componentInstance.deepLink.set(true);
      newFixture.detectChanges();
      await newFixture.whenStable();
      newFixture.detectChanges();

      const triggers = Array.from(
        newFixture.nativeElement.querySelectorAll('button.accordion-title'),
      ) as HTMLButtonElement[];

      expect(triggers[1].getAttribute('aria-expanded')).toBe('true');

      newFixture.destroy();
    });

    it('should update hash when panel is expanded and deepLink=true', async () => {
      host.deepLink.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      await clickTrigger(0);

      expect(mockDeepLinkService.updateHash).toHaveBeenCalledWith(
        'panel-1',
        false,
      );
    });

    it('should use pushState when updateHistory=true', async () => {
      host.deepLink.set(true);
      host.updateHistory.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      await clickTrigger(0);

      expect(mockDeepLinkService.updateHash).toHaveBeenCalledWith(
        'panel-1',
        true,
      );
    });

    it('should call scrollToPanel when deepLinkSmudge=true', async () => {
      host.deepLink.set(true);
      host.deepLinkSmudge.set(true);
      host.deepLinkSmudgeDelay.set(200);
      fixture.detectChanges();
      await fixture.whenStable();

      await clickTrigger(0);

      expect(mockDeepLinkService.scrollToPanel).toHaveBeenCalledWith(
        'panel-1',
        200,
      );
    });

    it('should setup hash change listener when deepLink=true', async () => {
      // Need to create a new fixture with deepLink=true before first render
      // because afterNextRender only runs once
      vi.clearAllMocks();
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          provideZonelessChangeDetection(),
          { provide: AccordionDeepLinkService, useValue: mockDeepLinkService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(TestHostComponent);
      newFixture.componentInstance.deepLink.set(true);
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(mockDeepLinkService.onHashChange).toHaveBeenCalled();

      newFixture.destroy();
    });

    it('should clear hash when all panels closed and allowAllClosed=true', async () => {
      host.deepLink.set(true);
      host.allowAllClosed.set(true);
      host.multiExpandable.set(true);
      host.item1Expanded.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      mockDeepLinkService.clearHash.mockClear();

      await clickTrigger(0);

      expect(mockDeepLinkService.clearHash).toHaveBeenCalledWith(false);
    });
  });

  describe('keyboard navigation', () => {
    function pressKey(key: string, element?: HTMLElement): void {
      const target = element ?? document.activeElement ?? getTriggers()[0];
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          code: key,
          bubbles: true,
          cancelable: true,
        }),
      );
    }

    function getFocusedTriggerIndex(): number {
      const triggers = getTriggers();
      return triggers.findIndex((t) => t === document.activeElement);
    }

    it('should move focus to next trigger with ArrowDown', async () => {
      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      pressKey('ArrowDown');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(1);
    });

    it('should move focus to previous trigger with ArrowUp', async () => {
      const triggers = getTriggers();
      triggers[1].focus();
      fixture.detectChanges();

      pressKey('ArrowUp');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(0);
    });

    it('should move focus to first trigger with Home', async () => {
      const triggers = getTriggers();
      triggers[2].focus();
      fixture.detectChanges();

      pressKey('Home');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(0);
    });

    it('should move focus to last trigger with End', async () => {
      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      pressKey('End');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(2);
    });

    it('should toggle expansion with Enter key', async () => {
      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(false);

      pressKey('Enter');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(true);
    });

    it('should toggle expansion with Space key', async () => {
      const triggers = getTriggers();
      triggers[1].focus();
      fixture.detectChanges();

      expect(isExpanded(1)).toBe(false);

      pressKey(' ');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(isExpanded(1)).toBe(true);
    });

    it('should wrap focus when wrap=true and at last item', async () => {
      host.wrap.set(true);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[2].focus();
      fixture.detectChanges();

      pressKey('ArrowDown');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(0);
    });

    it('should wrap focus when wrap=true and at first item', async () => {
      host.wrap.set(true);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      pressKey('ArrowUp');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(2);
    });

    it('should not wrap focus when wrap=false and at last item', async () => {
      host.wrap.set(false);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[2].focus();
      fixture.detectChanges();

      pressKey('ArrowDown');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(2);
    });

    it('should not wrap focus when wrap=false and at first item', async () => {
      host.wrap.set(false);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      pressKey('ArrowUp');
      await fixture.whenStable();

      expect(getFocusedTriggerIndex()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should render empty accordion without error', async () => {
      // Create a separate test host with no items
      @Component({
        template: `<nfs-accordion></nfs-accordion>`,
        imports: [NfsAccordion],
      })
      class EmptyAccordionHost {}

      vi.clearAllMocks();
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [EmptyAccordionHost],
        providers: [
          provideZonelessChangeDetection(),
          { provide: AccordionDeepLinkService, useValue: mockDeepLinkService },
        ],
      }).compileComponents();

      const emptyFixture = TestBed.createComponent(EmptyAccordionHost);
      emptyFixture.detectChanges();

      const ul = emptyFixture.nativeElement.querySelector('ul.accordion');
      expect(ul).toBeTruthy();
      expect(ul.children).toHaveLength(0);

      emptyFixture.destroy();
    });

    it('should not allow any panel to open when all items are disabled', async () => {
      host.item1Disabled.set(true);
      host.item2Disabled.set(true);
      host.item3Disabled.set(true);
      fixture.detectChanges();

      await clickTrigger(0);
      await clickTrigger(1);
      await clickTrigger(2);

      expect(isExpanded(0)).toBe(false);
      expect(isExpanded(1)).toBe(false);
      expect(isExpanded(2)).toBe(false);
    });

    it('should ignore invalid panel ID in URL hash', async () => {
      mockDeepLinkService.getHashPanelId.mockReturnValue('non-existent-panel');

      vi.clearAllMocks();
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          provideZonelessChangeDetection(),
          { provide: AccordionDeepLinkService, useValue: mockDeepLinkService },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(TestHostComponent);
      newFixture.componentInstance.deepLink.set(true);
      newFixture.detectChanges();
      await newFixture.whenStable();

      const triggers = Array.from(
        newFixture.nativeElement.querySelectorAll('button.accordion-title'),
      ) as HTMLButtonElement[];

      // No panel should be expanded since hash doesn't match any panel
      expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
      expect(triggers[1].getAttribute('aria-expanded')).toBe('false');
      expect(triggers[2].getAttribute('aria-expanded')).toBe('false');

      newFixture.destroy();
    });

    it('should handle rapid clicks correctly', async () => {
      // Rapidly click all three triggers without waiting
      const trigger0 = getTriggers()[0];
      const trigger1 = getTriggers()[1];
      const trigger2 = getTriggers()[2];

      trigger0.focus();
      trigger0.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      trigger1.focus();
      trigger1.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      trigger2.focus();
      trigger2.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );

      await fixture.whenStable();
      fixture.detectChanges();

      // In single-expand mode, only the last clicked should be expanded
      const expandedCount = getTriggers().filter(
        (t) => t.getAttribute('aria-expanded') === 'true',
      ).length;
      expect(expandedCount).toBe(1);
      expect(isExpanded(2)).toBe(true);
    });
  });
});
