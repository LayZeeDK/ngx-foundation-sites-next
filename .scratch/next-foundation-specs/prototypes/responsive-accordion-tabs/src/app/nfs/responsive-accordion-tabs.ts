// PROTOTYPE (throwaway): one component that renders either the Accordion or the
// Tabs directive set (the Aria prototype's wrappers) from the same consumer
// `ng-template[nfsResponsiveAccordionTabsPanel]` panels. Not library code.
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  InjectionToken,
  OnInit,
  TemplateRef,
  afterRenderEffect,
  computed,
  contentChildren,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NFS_ACCORDION } from './accordion';
import { NFS_TABS } from './tabs';
import { NfsBreakpointRules, NfsMediaQuery, parseNfsBreakpointRules } from './media-query';

const modes = ['accordion', 'tabs'] as const;
type Mode = (typeof modes)[number];

/**
 * PROTOTYPE switch between the two first-render strategies under test:
 * - 'service': first render uses the service's `current` (the Server breakpoint
 *   before the service goes live, the live one afterwards) -- the spec as written.
 * - 'instance': first render always uses the Server breakpoint's mode; the swap
 *   happens in this instance's own first earlyRead callback.
 */
export const nfsRatGateToken = new InjectionToken<'service' | 'instance'>('nfsRatGateToken', {
  providedIn: 'root',
  factory: () => 'service',
});

/** Consumer panel: `<ng-template nfsResponsiveAccordionTabsPanel title="..." value="...">`. */
@Directive({ selector: 'ng-template[nfsResponsiveAccordionTabsPanel]' })
export class NfsResponsiveAccordionTabsPanel {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly template = inject(TemplateRef);
}

interface SwapLog {
  t: number;
  from: Mode;
  to: Mode;
  restore: string | null;
  refocused?: string;
}

@Component({
  selector: 'nfs-responsive-accordion-tabs',
  imports: [NgTemplateOutlet, NFS_ACCORDION, NFS_TABS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-mode]': 'mode()' },
  template: `
    @if (mode() === 'tabs') {
      <div nfsTabsGroup>
        <ul
          nfsTabs
          class="tabs"
          [attr.aria-label]="label()"
          [selected]="tabsSelected()"
          (selectedChange)="selected.set($event)"
        >
          @for (p of panels(); track p.value()) {
            <li nfsTabsTitle class="tabs-title" [attr.data-nfs-value]="p.value()">
              <a nfsTab #control [value]="p.value()" data-nfs-mode="tabs" [attr.data-nfs-value]="p.value()">{{
                p.title()
              }}</a>
            </li>
          }
        </ul>
        <div class="tabs-content">
          @for (p of panels(); track p.value()) {
            <div nfsTabsPanel class="tabs-panel" [value]="p.value()" [attr.data-nfs-value]="p.value()">
              <ng-container [ngTemplateOutlet]="p.template" />
            </div>
          }
        </div>
      </div>
    } @else {
      <ul nfsAccordion class="accordion" [multiExpand]="false">
        @for (p of panels(); track p.value()) {
          <li nfsAccordionItem class="accordion-item" [attr.data-nfs-value]="p.value()">
            <h3>
              <button
                nfsAccordionTitle
                #control
                class="accordion-title"
                type="button"
                data-nfs-mode="accordion"
                [attr.data-nfs-value]="p.value()"
                [panel]="c.panel"
                [expanded]="selected() === p.value()"
                (expandedChange)="onExpanded(p.value(), $event)"
              >
                {{ p.title() }}
              </button>
            </h3>
            <div nfsAccordionContent class="accordion-content" #c="nfsAccordionContent">
              <ng-container [ngTemplateOutlet]="p.template" />
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class NfsResponsiveAccordionTabs implements OnInit {
  /** Foundation `data-responsive-accordion-tabs`, e.g. `accordion medium-tabs`. */
  readonly rules = input.required<string | NfsBreakpointRules<Mode>>();
  /** Value of the selected tab / the expanded accordion item (shared by both modes). */
  readonly selected = model<string | undefined>(undefined);
  /** Accessible name of the tab list. */
  readonly label = input<string>();

  protected readonly panels = contentChildren(NfsResponsiveAccordionTabsPanel);
  protected readonly controls = viewChildren('control', { read: ElementRef });

  readonly #mq = inject(NfsMediaQuery);
  readonly #gate = inject(nfsRatGateToken);
  readonly #host = inject(ElementRef).nativeElement as HTMLElement;
  readonly #document = inject(DOCUMENT);
  readonly #parsed = computed(() => parseNfsBreakpointRules(this.rules(), modes, this.#mq.breakpoints));
  /** The mode the viewport asks for. */
  readonly #target = computed<Mode>(() => this.#mq.resolve(this.#parsed()) ?? 'accordion');
  /** The mode on screen. Follows #target in an earlyRead callback, so focus is read before the old nodes go. */
  protected readonly mode = signal<Mode>('accordion');
  /** Tabs always show one panel: fall back to the first when nothing is selected. */
  protected readonly tabsSelected = computed(() => this.selected() ?? this.panels()[0]?.value());
  #restore: string | null = null;

  constructor() {
    afterRenderEffect({
      earlyRead: () => {
        const target = this.#target();
        const shown = untracked(this.mode);

        if (target === shown) {
          return;
        }

        const active = this.#document.activeElement;
        this.#restore =
          active && this.#host.contains(active)
            ? (active.closest('[data-nfs-value]')?.getAttribute('data-nfs-value') ?? null)
            : null;
        log({ t: performance.now(), from: shown, to: target, restore: this.#restore });

        // Tabs always show a panel; carry the visible one into the accordion (Foundation
        // moves `.is-active` from the tab panel to its `li`).
        if (target === 'accordion' && this.selected() === undefined) {
          this.selected.set(this.tabsSelected());
        }

        this.mode.set(target);
      },
      write: () => {
        const mode = this.mode();
        const controls = this.controls();

        if (this.#restore === null) {
          return;
        }

        const el = controls
          .map((c) => c.nativeElement as HTMLElement)
          .find((e) => e.dataset['nfsMode'] === mode && e.dataset['nfsValue'] === this.#restore);

        if (el) {
          el.focus();
          log({ t: performance.now(), from: mode, to: mode, restore: this.#restore, refocused: el.textContent?.trim() });
          this.#restore = null;
        }
      },
    });
  }

  ngOnInit() {
    this.mode.set(
      this.#gate === 'instance'
        ? (this.#mq.resolve(this.#parsed(), this.#mq.serverBreakpoint) ?? 'accordion')
        : this.#target(),
    );
  }

  protected onExpanded(value: string, expanded: boolean) {
    if (expanded) {
      this.selected.set(value);
    } else if (this.selected() === value) {
      this.selected.set(undefined);
    }
  }
}

// PROTOTYPE instrumentation read by the Playwright tests.
function log(entry: SwapLog) {
  const g = globalThis as { __nfsSwaps?: SwapLog[] };
  (g.__nfsSwaps ??= []).push(entry);
}

export const NFS_RESPONSIVE_ACCORDION_TABS = [NfsResponsiveAccordionTabs, NfsResponsiveAccordionTabsPanel];
