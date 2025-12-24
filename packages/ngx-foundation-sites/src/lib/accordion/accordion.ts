import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
} from '@angular/aria/accordion';
import { NfsAccordionItem } from './accordion-item';
import { AccordionDeepLinkService } from './accordion-deep-link.service';

@Component({
  selector: 'nfs-accordion',
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
  host: {
    style: 'display: block',
    '[class.nfs-accordion-no-plusminus]': '!plusminus()',
  },
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion {
  readonly #deepLinkService = inject(AccordionDeepLinkService);
  readonly #destroyRef = inject(DestroyRef);

  /** Allow multiple panels to be expanded simultaneously */
  readonly multiExpandable = input(false);

  /** Disable all accordion interactions */
  readonly disabled = input(false);

  /** Whether to allow disabled items to receive focus.
   * When true, disabled items are focusable but not interactive.
   * When false, disabled items are skipped during navigation.
   * Default: true (allows focus for screen reader announcement)
   */
  readonly softDisabled = input(true);

  /** Whether keyboard navigation wraps from last to first item */
  readonly wrap = input(false);

  /** Link the location hash to the open pane */
  readonly deepLink = input(false);

  /** Adjust scroll position when deep linking to ensure panel is visible */
  readonly deepLinkSmudge = input(false);

  /** Delay in milliseconds before scroll adjustment (allows animation to complete) */
  readonly deepLinkSmudgeDelay = input(300);

  /** Scroll offset in pixels for sticky headers when deep linking */
  readonly deepLinkSmudgeOffset = input(0);

  /** If true, adds to browser history; if false, replaces current entry */
  readonly updateHistory = input(false);

  /** Allow all panels to be closed. If false, at least one panel must remain open. */
  readonly allowAllClosed = input(false);

  /** Enable/disable the +/- indicator icons. Default: true */
  readonly plusminus = input(true);

  /** Collected accordion items */
  protected readonly items = contentChildren(NfsAccordionItem);

  /**
   * Reference to the AccordionGroup directive for programmatic control.
   * Note: Uses TypeScript `protected` instead of `#` because Angular's
   * `viewChild` requires compile-time access to the field.
   */
  protected readonly accordionGroup = viewChild(AccordionGroup);

  /** Track the last expanded panel ID for deep linking and allowAllClosed */
  #lastExpandedPanelId: string | null = null;

  /** Flag to prevent hash clearing until after initial hash is processed */
  #initialHashProcessed = false;

  constructor() {
    // Handle initial hash on first render
    afterNextRender(() => {
      if (this.deepLink()) {
        this.#handleInitialHash();
        this.#setupHashChangeListener();
      }
      this.#initialHashProcessed = true;
    });

    // Track expansion changes for deep linking and allowAllClosed enforcement
    effect(() => {
      const items = this.items();
      if (items.length === 0) return;

      // Early return if neither deep link nor allowAllClosed enforcement needed
      const needsAllowAllClosedEnforcement =
        !this.allowAllClosed() && !this.disabled();
      const needsDeepLink = this.deepLink();

      if (!needsAllowAllClosedEnforcement && !needsDeepLink) return;

      // Find the currently expanded panel(s)
      const expandedItems = items.filter((item) => item.expanded());
      const expandedPanelId = expandedItems[0]?.panelId() ?? null;

      // Handle allowAllClosed enforcement (skip if accordion is disabled)
      if (
        !this.allowAllClosed() &&
        !this.disabled() &&
        expandedItems.length === 0
      ) {
        // Re-open the last expanded panel, or the first non-disabled panel
        const panelToOpen = this.#lastExpandedPanelId
          ? items.find(
              (item) =>
                item.panelId() === this.#lastExpandedPanelId &&
                !item.disabled(),
            )
          : items.find((item) => !item.disabled());

        if (panelToOpen) {
          // Use queueMicrotask to write signal outside effect context
          queueMicrotask(() => {
            panelToOpen.expanded.set(true);
          });
          return;
        }
      }

      // Track expanded panel for future reference
      if (expandedPanelId && expandedPanelId !== this.#lastExpandedPanelId) {
        this.#lastExpandedPanelId = expandedPanelId;
      }

      // Handle deep linking (use untracked to avoid re-triggering on hash updates)
      if (this.deepLink()) {
        untracked(() => {
          if (expandedPanelId) {
            this.#deepLinkService.updateHash(
              expandedPanelId,
              this.updateHistory(),
            );

            if (this.deepLinkSmudge()) {
              this.#deepLinkService.scrollToPanel(
                expandedPanelId,
                this.deepLinkSmudgeDelay(),
                this.deepLinkSmudgeOffset(),
              );
            }
          } else if (this.allowAllClosed() && this.#initialHashProcessed) {
            // Only clear hash if we're actually allowing all closed
            // and initial hash has already been processed
            this.#deepLinkService.clearHash(this.updateHistory());
          }
        });
      }
    });
  }

  /**
   * Expands all accordion panels.
   * Only works when `multiExpandable` is true.
   */
  expandAll(): void {
    this.accordionGroup()?.expandAll();
  }

  /**
   * Collapses all accordion panels.
   * Note: If `allowAllClosed` is false, at least one panel will remain open.
   */
  collapseAll(): void {
    this.accordionGroup()?.collapseAll();
  }

  /** Handles the initial URL hash when the component loads */
  #handleInitialHash(): void {
    const hashPanelId = this.#deepLinkService.getHashPanelId();
    if (!hashPanelId) return;

    const items = this.items();
    const matchingItem = items.find((item) => item.panelId() === hashPanelId);

    if (matchingItem) {
      matchingItem.expanded.set(true);
      this.#lastExpandedPanelId = hashPanelId;

      if (this.deepLinkSmudge()) {
        this.#deepLinkService.scrollToPanel(
          hashPanelId,
          this.deepLinkSmudgeDelay(),
          this.deepLinkSmudgeOffset(),
        );
      }
    }
  }

  /** Sets up listener for browser back/forward navigation */
  #setupHashChangeListener(): void {
    const cleanup = this.#deepLinkService.onHashChange((panelId) => {
      if (!panelId) return;

      const items = this.items();
      const matchingItem = items.find((item) => item.panelId() === panelId);

      if (matchingItem && !matchingItem.expanded()) {
        matchingItem.expanded.set(true);
        this.#lastExpandedPanelId = panelId;

        if (this.deepLinkSmudge()) {
          this.#deepLinkService.scrollToPanel(
            panelId,
            this.deepLinkSmudgeDelay(),
            this.deepLinkSmudgeOffset(),
          );
        }
      }
    });

    this.#destroyRef.onDestroy(cleanup);
  }
}
