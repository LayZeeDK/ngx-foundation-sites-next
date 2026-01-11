import {
  AfterContentInit,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  ViewContainerRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
} from '@angular/aria/accordion';
import { NfsAccordionItemDef } from './accordion-item-def';
import { AccordionDeepLinkService } from './accordion-deep-link.service';
import { NfsStyleLoader } from '../core/nfs-style-loader.service';
import { nfsAccordionToken } from './accordion.token';

/**
 * Event payload emitted when an accordion panel opens or closes.
 * @foundation API Parity: Equivalent to Foundation's down.zf.accordion and up.zf.accordion events.
 */
export interface NfsAccordionPanelEvent {
  /** The panelId of the affected accordion item */
  itemId: string;
  /** Whether the panel is now expanded (true) or collapsed (false) */
  expanded: boolean;
}

@Component({
  selector: 'nfs-accordion',
  templateUrl: './accordion.html',
  // Styles auto-loaded via NfsStyleLoader at runtime from /nfs-accordion.css
  // For custom theming: compile Sass with bundleName: "nfs-accordion", inject: false
  encapsulation: ViewEncapsulation.None,
  host: {},
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion implements AfterContentInit {
  readonly #injector = inject(Injector);
  readonly #viewContainer = inject(ViewContainerRef);
  readonly #deepLinkService = inject(AccordionDeepLinkService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #styleLoader = inject(NfsStyleLoader);

  /** Cache for item injectors to avoid creating new instances on each change detection */
  readonly #itemInjectorCache = new WeakMap<NfsAccordionItemDef, Injector>();

  /** Allow multiple panels to be expanded simultaneously */
  readonly multiExpand = input(false);

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

  /**
   * Heading level for accordion titles (1-6).
   * When set, wraps trigger buttons in `<div role="heading" aria-level="N">`
   * for ARIA document outline navigation.
   * @default null (no heading wrapper)
   */
  readonly titleHeadingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | null>(null);

  /**
   * Emitted when a panel is expanded.
   * @foundation API Parity: Equivalent to Foundation's `down.zf.accordion` event.
   */
  readonly down = output<NfsAccordionPanelEvent>();

  /**
   * Emitted when a panel is collapsed.
   * @foundation API Parity: Equivalent to Foundation's `up.zf.accordion` event.
   */
  readonly up = output<NfsAccordionPanelEvent>();

  /** Query all item template definitions from content */
  readonly itemDefs = contentChildren(NfsAccordionItemDef);

  /**
   * Track initialization state for template rendering.
   * Protected for template access.
   */
  protected readonly initialized = signal(false);

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

  /** Track previous expansion states for emitting down/up events */
  #previousExpandedStates = new Map<string, boolean>();

  constructor() {
    // Load component styles on first render (reference-counted)
    afterNextRender(() => {
      this.#styleLoader.load('accordion', '/nfs-accordion.css');
    });

    // Unload styles when component is destroyed
    this.#destroyRef.onDestroy(() => {
      this.#styleLoader.unload('accordion');
    });

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
      const items = this.itemDefs();
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

    // Track expansion changes and emit down/up events
    effect(() => {
      const items = this.itemDefs();
      if (items.length === 0) return;

      // Build current expansion state map and detect changes
      for (const item of items) {
        const panelId = item.panelId();
        const currentExpanded = item.expanded();
        const previousExpanded = this.#previousExpandedStates.get(panelId);

        // Only emit events for actual changes (not initial state)
        if (
          previousExpanded !== undefined &&
          previousExpanded !== currentExpanded
        ) {
          // Use untracked + queueMicrotask to emit outside reactive context
          untracked(() => {
            queueMicrotask(() => {
              if (currentExpanded) {
                this.down.emit({ itemId: panelId, expanded: true });
              } else {
                this.up.emit({ itemId: panelId, expanded: false });
              }
            });
          });
        }

        // Update tracking state
        this.#previousExpandedStates.set(panelId, currentExpanded);
      }
    });
  }

  /**
   * Initialize all item templates to trigger header/content registration.
   *
   * This runs BEFORE the template renders, ensuring headerDef is populated
   * when the accordion structure needs to render the trigger button.
   */
  ngAfterContentInit(): void {
    for (const item of this.itemDefs()) {
      const injector = Injector.create({
        providers: [{ provide: NfsAccordionItemDef, useValue: item }],
        parent: this.#injector,
      });

      // Cache the injector for template use (prevents infinite change detection)
      this.#itemInjectorCache.set(item, injector);

      // Create embedded view to instantiate directives
      const view = this.#viewContainer.createEmbeddedView(
        item.templateRef,
        null,
        { injector },
      );
      view.detectChanges(); // Ensure directive constructors run
      view.destroy(); // Safe to destroy - directive instances & templateRefs remain valid
    }
    this.initialized.set(true);
  }

  /**
   * Get cached injector for item template.
   * Returns the injector created during ngAfterContentInit to avoid
   * creating new instances on each change detection cycle.
   */
  protected getItemInjector(item: NfsAccordionItemDef): Injector {
    const cached = this.#itemInjectorCache.get(item);
    if (!cached) {
      // Fallback for dynamically added items (shouldn't happen normally)
      const injector = Injector.create({
        providers: [{ provide: NfsAccordionItemDef, useValue: item }],
        parent: this.#injector,
      });
      this.#itemInjectorCache.set(item, injector);
      return injector;
    }
    return cached;
  }

  /**
   * Expands all accordion panels.
   * Only works when `multiExpand` is true.
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

    const items = this.itemDefs();
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

      const items = this.itemDefs();
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
