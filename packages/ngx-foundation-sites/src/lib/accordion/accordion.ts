import {
  AfterContentInit,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  ErrorHandler,
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
import { NfsAccordionIdGenerator } from './accordion-id-generator.service';
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

/**
 * Accessible accordion component that wraps Angular ARIA's accordion primitives.
 *
 * ## FR-106a: Concurrent Interaction Handling
 *
 * This component delegates event processing to @angular/aria's `AccordionTrigger`
 * and `AccordionPanel` directives, which handle keyboard/mouse interactions with
 * signal-based state management in zoneless Angular.
 *
 * **Event Processing in Zoneless Mode:**
 * - **Browser Event Queue**: Events arrive in chronological order and are processed
 *   sequentially by the JavaScript event loop (FIFO by nature in single-threaded JS)
 * - **@angular/aria**: Tested primitives handle keyboard navigation (ArrowDown/Up)
 *   and click interactions with signal-based state updates that trigger change detection
 * - **Signal Reactivity**: State changes via `[(expanded)]` model signal automatically
 *   notify Angular's change detection scheduler without Zone.js dependency
 *
 * **Testing Strategy**: The ConcurrentKeyboardAndClick Storybook test validates
 * correct behavior for simultaneous keyboard + click interactions. All tests run
 * in zoneless mode via `provideZonelessChangeDetection()`.
 *
 * **Note**: This component does NOT implement explicit timestamp-based event queuing
 * (T182). Browser event loop ordering + @angular/aria signal handling provide
 * sufficient serialization for FR-106a requirements. If race conditions are observed,
 * T182 can be implemented as an enhancement.
 *
 * @see ConcurrentKeyboardAndClick story in accordion.stories.ts
 * @see phase-9-zoneless-config.md for zoneless Angular configuration
 */
@Component({
  selector: 'nfs-accordion',
  exportAs: 'nfsAccordion',
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
  readonly #errorHandler = inject(ErrorHandler);
  readonly #idGenerator = inject(NfsAccordionIdGenerator);

  /** Cache for item injectors to avoid creating new instances on each change detection */
  readonly #itemInjectorCache = new WeakMap<NfsAccordionItemDef, Injector>();

  /** Unique instance ID for this accordion (e.g., 'nfs-accordion-1') */
  readonly #instanceId = signal(this.#idGenerator.nextAccordionInstanceId());

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
   * Whether to announce panel expansions/collapses to screen readers.
   * When true, adds a live region that announces state changes.
   * @default false
   */
  readonly announce = input(false);

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
   * Live region announcement text for screen readers.
   * Protected for template access.
   */
  protected readonly announcement = signal('');

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

  /** Registry for detecting duplicate panelIds (FR-017a) */
  #panelIdRegistry = new Map<string, number[]>();

  /** Debounce timer for live region announcements (T198) */
  #announcementDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Pending announcement to be published after debounce */
  #pendingAnnouncement: string | null = null;

  /** Track previous title text for detecting changes (T188) */
  #previousTitleTexts = new Map<string, string>();

  /** Title change debounce timers per item (T188) */
  #titleChangeDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    // Load component styles on first render (reference-counted)
    // FR-062a: Guarded with try/catch for SSR hydration error handling
    afterNextRender(() => {
      try {
        this.#styleLoader.load('accordion', '/nfs-accordion.css');
      } catch (error) {
        this.#errorHandler.handleError(
          new Error(
            `NfsAccordion: Hydration failed during style loading. ` +
              `This may occur during SSR hydration mismatch. ` +
              `Original error: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error },
          ),
        );
      }
    });

    // Unload styles when component is destroyed
    this.#destroyRef.onDestroy(() => {
      this.#styleLoader.unload('accordion');
    });

    // Handle initial hash on first render
    // FR-062a: Guarded with try/catch for SSR hydration error handling
    afterNextRender(() => {
      try {
        if (this.deepLink()) {
          this.#handleInitialHash();
          this.#setupHashChangeListener();
        }
        this.#initialHashProcessed = true;
      } catch (error) {
        // Mark as processed even on error to prevent stale state
        this.#initialHashProcessed = true;
        this.#errorHandler.handleError(
          new Error(
            `NfsAccordion: Hydration failed during deep link initialization. ` +
              `This may occur during SSR hydration mismatch. ` +
              `Original error: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error },
          ),
        );
      }
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

              // Update live region announcement for screen readers (T198: debounced by 100ms)
              if (this.announce()) {
                const action = currentExpanded ? 'expanded' : 'collapsed';
                this.#pendingAnnouncement = `Panel ${panelId} ${action}`;
                this.#scheduleAnnouncement();
              }
            });
          });
        }

        // Update tracking state
        this.#previousExpandedStates.set(panelId, currentExpanded);
      }
    });

    // T188: Monitor title content changes and announce to live region
    effect(() => {
      if (!this.announce() || !this.initialized()) return;

      const items = this.itemDefs();
      for (const item of items) {
        const panelId = item.panelId();
        const headerDef = item.headerDef();

        // Try to extract current title text (best effort)
        if (headerDef?.templateRef) {
          // Use untracked to avoid creating reactive dependency
          untracked(() => {
            queueMicrotask(() => {
              try {
                // Look for rendered button element with matching panelId
                const buttonElement = document.querySelector(
                  `button[data-panelid="${panelId}"]`,
                ) as HTMLElement | null;

                if (buttonElement) {
                  const currentText = buttonElement.textContent?.trim() ?? '';
                  const previousText = this.#previousTitleTexts.get(panelId);

                  // Announce change if text differs from previous
                  if (previousText !== undefined && previousText !== currentText) {
                    this.#scheduleTitleChangeAnnouncement(
                      panelId,
                      currentText,
                    );
                  }

                  this.#previousTitleTexts.set(panelId, currentText);
                }
              } catch {
                // Silently ignore if button element not found
              }
            });
          });
        }
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
    const items = this.itemDefs();

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
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

      // FR-017a: Detect duplicate panelIds
      const panelId = item.panelId();
      const existingIndexes = this.#panelIdRegistry.get(panelId) ?? [];
      existingIndexes.push(index);
      this.#panelIdRegistry.set(panelId, existingIndexes);

      if (existingIndexes.length > 1) {
        this.#errorHandler.handleError(
          new Error(
            `NfsAccordion: Duplicate panelId "${panelId}" detected. ` +
              `Conflicting items at indexes: [${existingIndexes.join(', ')}]. ` +
              `Using first registered item. Ensure each panelId is unique.`,
          ),
        );
      }

      // FR-026a: Detect missing header template
      // Note: headerDef is populated during view.detectChanges() above
      if (!item.headerDef()) {
        this.#errorHandler.handleError(
          new Error(
            `NfsAccordion: Missing <ng-template nfsAccordionHeader> in accordion item at index ${index} ` +
              `(panelId: "${panelId}"). Item will render but may not be keyboard accessible.`,
          ),
        );
      }
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
    } else {
      // FR-067b: Report deep link target not found
      this.#errorHandler.handleError(
        new Error(
          `NfsAccordion: Deep link target not found. Panel with id "${hashPanelId}" ` +
            `does not exist. Available panels: [${items.map((i) => i.panelId()).join(', ')}].`,
        ),
      );
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

  /**
   * Get the unique instance ID for this accordion.
   * Used for generating stable IDs for panels and titles.
   * @returns The accordion instance ID (e.g., 'nfs-accordion-1')
   * @public
   */
  getInstanceId(): string {
    return this.#instanceId();
  }

  /**
   * Validate and register a panelId, detecting duplicates (T057c, FR-017a).
   * Called when items are added or panelId changes at runtime.
   * @param panelId The panelId to validate
   * @param itemIndex The index of the item in the accordion
   * @returns true if panelId is valid (not a duplicate), false if duplicate
   * @public
   */
  validatePanelId(panelId: string, itemIndex: number): boolean {
    const existingIndexes = this.#panelIdRegistry.get(panelId) ?? [];

    // If panelId already exists and item is from a different index, it's a duplicate
    if (existingIndexes.length > 0 && !existingIndexes.includes(itemIndex)) {
      existingIndexes.push(itemIndex);
      this.#panelIdRegistry.set(panelId, existingIndexes);

      // Report duplicate error
      this.#errorHandler.handleError(
        new Error(
          `NfsAccordion: Duplicate panelId "${panelId}" detected. ` +
            `Conflicting items at indexes: [${existingIndexes.join(', ')}]. ` +
            `Using first registered item. Ensure each panelId is unique.`,
        ),
      );
      return false;
    }

    // Register new panelId if not already there
    if (existingIndexes.length === 0) {
      this.#panelIdRegistry.set(panelId, [itemIndex]);
    }

    return true;
  }

  /**
   * Extracts plain text content from an accordion title.
   * Handles complex projected content (icons, nested elements) by using textContent.
   * @param titleComponent The NfsAccordionTitle component to extract text from
   * @returns The trimmed text content of the title
   */
  protected extractTitleText(titleComponent: { elementRef?: { nativeElement?: { textContent?: string } } }): string {
    return titleComponent.elementRef?.nativeElement?.textContent?.trim() ?? '';
  }

  /**
   * Schedule debounced announcement publication to live region (T198).
   * Debounces announcements by 100ms to coalesce rapid expand/collapse events.
   * @private
   */
  #scheduleAnnouncement(): void {
    // Clear existing timer to reset debounce
    if (this.#announcementDebounceTimer !== null) {
      clearTimeout(this.#announcementDebounceTimer);
    }

    // Schedule new announcement after 100ms
    this.#announcementDebounceTimer = setTimeout(() => {
      if (this.#pendingAnnouncement) {
        this.announcement.set(this.#pendingAnnouncement);
        this.#pendingAnnouncement = null;
      }
      this.#announcementDebounceTimer = null;
    }, 100);
  }

  /**
   * Schedule debounced announcement for title content changes (T188).
   * Debounces by 100ms to coalesce rapid title updates.
   * @param panelId The ID of the panel whose title changed
   * @param newTitle The new title text
   * @private
   */
  #scheduleTitleChangeAnnouncement(panelId: string, newTitle: string): void {
    // Clear existing timer for this panel to reset debounce
    const existingTimer = this.#titleChangeDebounceTimers.get(panelId);
    if (existingTimer !== undefined) {
      clearTimeout(existingTimer);
    }

    // Schedule new announcement after 100ms
    const timer = setTimeout(() => {
      this.#pendingAnnouncement = `Title changed: ${newTitle}`;
      this.#scheduleAnnouncement();
      this.#titleChangeDebounceTimers.delete(panelId);
    }, 100);

    this.#titleChangeDebounceTimers.set(panelId, timer);
  }
}
