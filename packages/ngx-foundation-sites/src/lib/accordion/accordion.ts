import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';
import { NfsAccordionItem } from './accordion-item';
import { AccordionDeepLinkService } from './accordion-deep-link.service';

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
  private readonly deepLinkService = inject(AccordionDeepLinkService);
  private readonly destroyRef = inject(DestroyRef);

  /** Allow multiple panels to be expanded simultaneously */
  readonly multiExpandable = input(false);

  /** Disable all accordion interactions */
  readonly disabled = input(false);

  /** Whether keyboard navigation wraps from last to first item */
  readonly wrap = input(false);

  /** Animation duration in milliseconds for expand/collapse transitions */
  readonly slideSpeed = input(250);

  /** Link the location hash to the open pane */
  readonly deepLink = input(false);

  /** Adjust scroll position when deep linking to ensure panel is visible */
  readonly deepLinkSmudge = input(false);

  /** Delay in milliseconds before scroll adjustment (allows animation to complete) */
  readonly deepLinkSmudgeDelay = input(300);

  /** If true, adds to browser history; if false, replaces current entry */
  readonly updateHistory = input(false);

  /** Computed CSS value for slide speed */
  protected readonly slideSpeedCss = computed(() => `${this.slideSpeed()}ms`);

  /** Collected accordion items */
  protected readonly items = contentChildren(NfsAccordionItem);

  /** Track the last expanded panel ID to detect changes */
  private lastExpandedPanelId: string | null = null;

  constructor() {
    // Handle initial hash on first render
    afterNextRender(() => {
      if (this.deepLink()) {
        this.handleInitialHash();
        this.setupHashChangeListener();
      }
    });

    // Track expansion changes and update hash
    effect(() => {
      const items = this.items();
      const deepLink = this.deepLink();

      if (!deepLink || items.length === 0) return;

      // Find the currently expanded panel
      const expandedItem = items.find((item) => item.expanded());
      const expandedPanelId = expandedItem?.panelId() ?? null;

      // Use untracked to avoid re-triggering when updating hash
      untracked(() => {
        if (expandedPanelId !== this.lastExpandedPanelId) {
          this.lastExpandedPanelId = expandedPanelId;

          if (expandedPanelId) {
            this.deepLinkService.updateHash(expandedPanelId, this.updateHistory());

            if (this.deepLinkSmudge()) {
              this.deepLinkService.scrollToPanel(
                expandedPanelId,
                this.deepLinkSmudgeDelay()
              );
            }
          } else {
            this.deepLinkService.clearHash(this.updateHistory());
          }
        }
      });
    });
  }

  /** Handles the initial URL hash when the component loads */
  private handleInitialHash(): void {
    const hashPanelId = this.deepLinkService.getHashPanelId();
    if (!hashPanelId) return;

    const items = this.items();
    const matchingItem = items.find((item) => item.panelId() === hashPanelId);

    if (matchingItem) {
      matchingItem.expanded.set(true);
      this.lastExpandedPanelId = hashPanelId;

      if (this.deepLinkSmudge()) {
        this.deepLinkService.scrollToPanel(hashPanelId, this.deepLinkSmudgeDelay());
      }
    }
  }

  /** Sets up listener for browser back/forward navigation */
  private setupHashChangeListener(): void {
    const cleanup = this.deepLinkService.onHashChange((panelId) => {
      if (!panelId) return;

      const items = this.items();
      const matchingItem = items.find((item) => item.panelId() === panelId);

      if (matchingItem && !matchingItem.expanded()) {
        matchingItem.expanded.set(true);
        this.lastExpandedPanelId = panelId;

        if (this.deepLinkSmudge()) {
          this.deepLinkService.scrollToPanel(panelId, this.deepLinkSmudgeDelay());
        }
      }
    });

    this.destroyRef.onDestroy(cleanup);
  }
}
