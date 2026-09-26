// PROTOTYPE (throwaway): host-directive wrappers of @angular/aria/tabs on
// Foundation tabs markup. Not library code.
import { AfterContentInit, Directive, contentChild, contentChildren, inject } from '@angular/core';
import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

/** Wrapping element -- hosts Aria's Tabs (the common ancestor Aria requires). */
@Directive({
  selector: '[nfsTabsGroup]',
  hostDirectives: [Tabs],
})
export class NfsTabsGroup {}

/** `ul.tabs` -- hosts Aria's TabList. */
@Directive({
  selector: '[nfsTabs]',
  exportAs: 'nfsTabs',
  hostDirectives: [
    {
      directive: TabList,
      inputs: ['selectedTab: selected', 'selectionMode', 'wrap', 'orientation'],
      outputs: ['selectedTabChange: selectedChange'],
    },
  ],
})
export class NfsTabs implements AfterContentInit {
  readonly tabList = inject(TabList);
  // Tested option: default the selected tab to the first one so server HTML shows a panel.
  protected readonly tabs = contentChildren(Tab, { descendants: true });
  ngAfterContentInit() {
    if (this.tabList.selectedTab() === undefined) {
      this.tabList.selectedTab.set(this.tabs()[0]?.value());
    }
  }
}

/** `a` inside `li.tabs-title` -- hosts Aria's Tab (sets `aria-selected` on the anchor). */
@Directive({
  selector: '[nfsTab]',
  exportAs: 'nfsTab',
  hostDirectives: [{ directive: Tab, inputs: ['value', 'disabled', 'id'] }],
})
export class NfsTab {
  readonly tab = inject(Tab);
}

/** `li.tabs-title` -- `.is-active` from its child tab; presentational like Foundation's JS sets it. */
@Directive({
  selector: '[nfsTabsTitle]',
  host: {
    role: 'presentation',
    '[class.is-active]': 'tab()?.tab.selected() === true',
  },
})
export class NfsTabsTitle {
  protected readonly tab = contentChild(NfsTab);
}

/**
 * `div.tabs-panel` -- a plain DIRECTIVE hosting Aria's TabPanel; content is
 * projected by the consumer's markup, no `ngTabContent` template.
 */
@Directive({
  selector: '[nfsTabsPanel]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value', 'id'] }],
  host: {
    '[class.is-active]': 'panel.visible()',
  },
})
export class NfsTabsPanel {
  readonly panel = inject(TabPanel);
}

export const NFS_TABS = [NfsTabsGroup, NfsTabs, NfsTab, NfsTabsTitle, NfsTabsPanel];
