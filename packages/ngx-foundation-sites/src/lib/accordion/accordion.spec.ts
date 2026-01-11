import {
  Component,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NfsAccordion } from './accordion';
import { NfsAccordionItemDef } from './accordion-item-def';
import { NfsAccordionHeaderDef } from './accordion-header-def';
import { NfsAccordionContentDef } from './accordion-content';
import { AccordionDeepLinkService } from './accordion-deep-link.service';

/**
 * Test host component for accordion tests (Option B API)
 */
@Component({
  template: `
    <nfs-accordion
      #accordion
      [multiExpand]="multiExpand()"
      [disabled]="disabled()"
      [softDisabled]="softDisabled()"
      [wrap]="wrap()"
      [deepLink]="deepLink()"
      [deepLinkSmudge]="deepLinkSmudge()"
      [deepLinkSmudgeDelay]="deepLinkSmudgeDelay()"
      [updateHistory]="updateHistory()"
      [allowAllClosed]="allowAllClosed()"
    >
      <ng-template
        nfsAccordionItem
        panelId="panel-1"
        [disabled]="item1Disabled()"
        [expanded]="item1Expanded()"
      >
        <ng-template nfsAccordionHeader>Item 1 Title</ng-template>
        <ng-template nfsAccordionContent>Item 1 Content</ng-template>
      </ng-template>
      <ng-template
        nfsAccordionItem
        panelId="panel-2"
        [disabled]="item2Disabled()"
        [expanded]="item2Expanded()"
      >
        <ng-template nfsAccordionHeader>Item 2 Title</ng-template>
        <ng-template nfsAccordionContent>Item 2 Content</ng-template>
      </ng-template>
      <ng-template
        nfsAccordionItem
        panelId="panel-3"
        [disabled]="item3Disabled()"
        [expanded]="item3Expanded()"
      >
        <ng-template nfsAccordionHeader>Item 3 Title</ng-template>
        <ng-template nfsAccordionContent>Item 3 Content</ng-template>
      </ng-template>
    </nfs-accordion>
  `,
  imports: [
    NfsAccordion,
    NfsAccordionItemDef,
    NfsAccordionHeaderDef,
    NfsAccordionContentDef,
  ],
})
class TestHostComponent {
  /** Reference to the accordion component for testing programmatic methods */
  readonly accordion = viewChild.required(NfsAccordion);

  multiExpand = signal(false);
  disabled = signal(false);
  softDisabled = signal(true);
  wrap = signal(false);
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

  describe('single expand mode (multiExpand=false)', () => {
    beforeEach(() => {
      host.multiExpand.set(false);
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

  describe('multi-expand mode (multiExpand=true)', () => {
    beforeEach(() => {
      host.multiExpand.set(true);
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

    it('should render content when panel is initially expanded', async () => {
      host.item2Expanded.set(true);
      fixture.detectChanges();
      // Wait for @defer block to render the content
      await fixture.whenStable();

      const panels = getPanels();
      expect(panels[1].textContent).toContain('Item 2 Content');
    });

    it('should support multiple initially expanded panels in multi-expand mode', () => {
      host.multiExpand.set(true);
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
        0, // default offset
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
      host.multiExpand.set(true);
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

  describe('softDisabled', () => {
    function pressKey(key: string): void {
      const target = document.activeElement ?? getTriggers()[0];
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

    it('should allow focus on disabled items when softDisabled=true (default)', async () => {
      host.softDisabled.set(true);
      host.item2Disabled.set(true);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      // With softDisabled=true, ArrowDown should move to disabled item (for screen reader)
      pressKey('ArrowDown');
      await fixture.whenStable();

      // Focus should be on the disabled trigger (index 1)
      expect(getFocusedTriggerIndex()).toBe(1);
    });

    it('should skip disabled items when softDisabled=false', async () => {
      host.softDisabled.set(false);
      host.item2Disabled.set(true);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[0].focus();
      fixture.detectChanges();

      // With softDisabled=false, ArrowDown should skip disabled item
      pressKey('ArrowDown');
      await fixture.whenStable();

      // Focus should skip index 1 (disabled) and go to index 2
      expect(getFocusedTriggerIndex()).toBe(2);
    });

    it('should skip disabled items in reverse navigation with softDisabled=false', async () => {
      host.softDisabled.set(false);
      host.item2Disabled.set(true);
      fixture.detectChanges();

      const triggers = getTriggers();
      triggers[2].focus();
      fixture.detectChanges();

      // With softDisabled=false, ArrowUp should skip disabled item
      pressKey('ArrowUp');
      await fixture.whenStable();

      // Focus should skip index 1 (disabled) and go to index 0
      expect(getFocusedTriggerIndex()).toBe(0);
    });
  });

  describe('expandAll and collapseAll', () => {
    it('should expand all panels when expandAll() is called in multi-expand mode', async () => {
      host.multiExpand.set(true);
      host.allowAllClosed.set(true);
      fixture.detectChanges();

      // Initially all collapsed
      expect(isExpanded(0)).toBe(false);
      expect(isExpanded(1)).toBe(false);
      expect(isExpanded(2)).toBe(false);

      // Call expandAll
      host.accordion().expandAll();
      await fixture.whenStable();
      fixture.detectChanges();

      // All should be expanded
      expect(isExpanded(0)).toBe(true);
      expect(isExpanded(1)).toBe(true);
      expect(isExpanded(2)).toBe(true);
    });

    it('should collapse all panels when collapseAll() is called', async () => {
      host.multiExpand.set(true);
      host.allowAllClosed.set(true);
      host.item1Expanded.set(true);
      host.item2Expanded.set(true);
      host.item3Expanded.set(true);
      fixture.detectChanges();

      // Initially all expanded
      expect(isExpanded(0)).toBe(true);
      expect(isExpanded(1)).toBe(true);
      expect(isExpanded(2)).toBe(true);

      // Call collapseAll
      host.accordion().collapseAll();
      await fixture.whenStable();
      fixture.detectChanges();

      // All should be collapsed
      expect(isExpanded(0)).toBe(false);
      expect(isExpanded(1)).toBe(false);
      expect(isExpanded(2)).toBe(false);
    });

    it('should not expand all when multiExpand=false', async () => {
      host.multiExpand.set(false);
      fixture.detectChanges();

      // expandAll should not work in single-expand mode
      host.accordion().expandAll();
      await fixture.whenStable();
      fixture.detectChanges();

      // Should remain collapsed or at most one expanded
      const expandedCount = getTriggers().filter(
        (t) => t.getAttribute('aria-expanded') === 'true',
      ).length;
      expect(expandedCount).toBeLessThanOrEqual(1);
    });

    it('should respect allowAllClosed when collapseAll() is called', async () => {
      host.multiExpand.set(true);
      host.allowAllClosed.set(false);
      host.item1Expanded.set(true);
      host.item2Expanded.set(true);
      fixture.detectChanges();

      // Call collapseAll
      host.accordion().collapseAll();
      await fixture.whenStable();
      fixture.detectChanges();

      // At least one panel should remain open due to allowAllClosed=false
      const expandedCount = getTriggers().filter(
        (t) => t.getAttribute('aria-expanded') === 'true',
      ).length;
      expect(expandedCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Foundation API methods (down, up, toggle)', () => {
    function getItemDefs(): NfsAccordionItemDef[] {
      return [...host.accordion().itemDefs()];
    }

    it('should expand panel when down() is called', async () => {
      const items = getItemDefs();
      expect(isExpanded(0)).toBe(false);

      items[0].down();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(true);
    });

    it('should collapse panel when up() is called', async () => {
      host.item1Expanded.set(true);
      fixture.detectChanges();
      expect(isExpanded(0)).toBe(true);

      const items = getItemDefs();
      items[0].up();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(false);
    });

    it('should toggle panel expansion with toggle()', async () => {
      const items = getItemDefs();
      expect(isExpanded(0)).toBe(false);

      // Toggle to expand
      items[0].toggle();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(isExpanded(0)).toBe(true);

      // Toggle to collapse
      items[0].toggle();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(isExpanded(0)).toBe(false);
    });

    it('should not expand when down() is called on disabled item', async () => {
      host.item1Disabled.set(true);
      fixture.detectChanges();

      const items = getItemDefs();
      items[0].down();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(false);
    });

    it('should not collapse when up() is called on disabled item', async () => {
      host.item1Expanded.set(true);
      host.item1Disabled.set(true);
      fixture.detectChanges();
      expect(isExpanded(0)).toBe(true);

      const items = getItemDefs();
      items[0].up();
      await fixture.whenStable();
      fixture.detectChanges();

      // Should remain expanded since item is disabled
      expect(isExpanded(0)).toBe(true);
    });

    it('should not toggle when toggle() is called on disabled item', async () => {
      host.item1Disabled.set(true);
      fixture.detectChanges();

      const items = getItemDefs();
      items[0].toggle();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(isExpanded(0)).toBe(false);
    });
  });

  describe('Foundation API outputs (down, up)', () => {
    it('should emit down event when panel is expanded via click', async () => {
      const downSpy = vi.fn();
      host.accordion().down.subscribe(downSpy);

      await clickTrigger(0);

      // Wait for microtask to process
      await fixture.whenStable();

      expect(downSpy).toHaveBeenCalledWith({
        itemId: 'panel-1',
        expanded: true,
      });
    });

    it('should emit up event when panel is collapsed via click', async () => {
      host.item1Expanded.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const upSpy = vi.fn();
      host.accordion().up.subscribe(upSpy);

      await clickTrigger(0);
      await fixture.whenStable();

      expect(upSpy).toHaveBeenCalledWith({
        itemId: 'panel-1',
        expanded: false,
      });
    });

    it('should emit down event when panel is expanded via down() method', async () => {
      const downSpy = vi.fn();
      host.accordion().down.subscribe(downSpy);

      const items = [...host.accordion().itemDefs()];
      items[0].down();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(downSpy).toHaveBeenCalledWith({
        itemId: 'panel-1',
        expanded: true,
      });
    });

    it('should emit up event when panel is collapsed via up() method', async () => {
      host.item1Expanded.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const upSpy = vi.fn();
      host.accordion().up.subscribe(upSpy);

      const items = [...host.accordion().itemDefs()];
      items[0].up();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(upSpy).toHaveBeenCalledWith({
        itemId: 'panel-1',
        expanded: false,
      });
    });

    it('should not emit events when action is prevented (disabled)', async () => {
      host.item1Disabled.set(true);
      fixture.detectChanges();

      const downSpy = vi.fn();
      host.accordion().down.subscribe(downSpy);

      const items = [...host.accordion().itemDefs()];
      items[0].down(); // Should be ignored due to disabled state
      fixture.detectChanges();
      await fixture.whenStable();

      expect(downSpy).not.toHaveBeenCalled();
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
