# 20. Spec: Accordion Menu

Type: grilling
Status: resolved
Blocked by: 14, 38, 56
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Accordion Menu plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-menus.md`, `research/angular-aria-inventory.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/accordion-menu.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which Implementation level (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- Nested `ul.menu.vertical.accordion-menu` markup with `is-accordion-submenu-parent`, `submenuToggle`, `submenuToggleText`, `multiOpen`, `slideSpeed`.
- ARIA: this is site navigation, not an application menu. Treeview, disclosure navigation menu (APG example), or plain nested lists with `aria-expanded` buttons?
- `@angular/aria` Tree or Menu: fit or misfit, and why.
- Keyboard model and how the current page item is marked (`aria-current`).

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

## WCAG 2.2 AA guard (user decision, 2026-09-26)

Every directive and component complies with WCAG 2.2 AA; see the map's Accessibility preference and [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md). The spec carries a criteria subsection under Implementation Decisions naming the 2.2 AA criteria this plugin touches (at least 1.4.3, 1.4.11, 2.4.7, 2.4.11, 2.5.8, 4.1.2, and, for overlays and hover content, 1.4.13) and how each is met, as requirements, never recommendations. Where a Foundation default fails a criterion, the spec states the Sass settings the consumer must set or the smallest custom rule the `nfs-<plugin>` mixin adds, with the reason. The story axe gate runs with the WCAG 2.2 AA tags, and the decision log records each criterion addressed.

## Answer

Spec: [specs/accordion-menu.md](../specs/accordion-menu.md). Resolved 2026-09-26 by self-grilling (AFK), both sides played against the sources below, under the user's WCAG 2.2 AA rule, the Foundation Sass reuse rule, the render-hooks rule, the browser testing stack decision, and the triage rule for human-only items.

Gist: one root directive, `ul[nfsAccordionMenu]` (`exportAs: 'nfsAccordionMenu'`, entry point `ngx-foundation-sites/accordion-menu`), the accordion root of the Nested menu exactly as the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md) maps it: `providers: [nfsMenuRootProviders('accordion')]`, `[class.accordion-menu]` while the mode is `accordion`, `(keydown)` forwarded to `root.handleKeydown($event, 'accordion')`, and `root.configure('accordion', {multiOpen, opened, closed})` in the constructor. Its API is the `multiOpen` input (Foundation's `true`, seeded by `nfsAccordionMenuDefaultsToken`), `opened`/`closed` Completion outputs carrying the `NfsMenuItem`, and `expandAll()`/`collapseAll()`. The consumer writes `li[nfsMenuItem]`, `ul[nfsSubmenu]`, and `button[nfsSubmenuToggle]` (with `hybrid` for a Hybrid item named in its `.submenu-toggle-text` span), imported from the Nested menu entry point. ARIA is Disclosure navigation with the hybrid variant; `aria-current="page"` is consumer-written. The slide is the parent-`li` grid of the `nfs-accordion-menu($duration: 250ms)` Library mixin keyed on `data-nfs-expanded` and `data-nfs-shown`. `slideSpeed`, `submenuToggle`, `submenuToggleText`, and `parentLink` are Dropped options. No Foundation default fails WCAG 2.2 AA; the mixin adds compile-time checks, one of them (the Hybrid toggle's own background) new relative to the Nested menu spec.

### Decision log

Sources: FS = the Foundation 6.9.0 clone (`js/foundation.accordionMenu.js`, `scss/components/_accordion-menu.scss`, `docs/pages/accordion-menu.md`); APG = the aria-practices clone (`content/patterns/disclosure/examples/disclosure-navigation.html`, `disclosure-navigation-hybrid.html`, `content/patterns/treeview/examples/treeview-navigation.html`); NG = the Angular 22.2.x clone (`packages/router/src/url_tree.ts`, `packages/router/src/provide_router.ts`, `packages/router/src/directives/router_link_active.ts`); NGC = the components 22.2.x clone (`src/cdk/tree/tree.ts`, `src/aria/tree`); NM = `specs/nested-menu.md` and the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md) answer; P50 = the [Prototype: Nested menu directive family with breakpoint mode switching](50-prototype-nested-menu.md) answer and `prototypes/nested-menu/README.md`; ACC = `specs/accordion.md`; DD = `specs/dropdown.md`; OC = `specs/off-canvas.md`; ST = the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md) answer; SC = `storybook-conventions.md`; BB = `building-blocks.md`; R:x = research files by BB's short names; ADRs by number.

Round 1: what Foundation does and what is already settled.

1. **Which Options, events, and methods does AccordionMenu have?** From `AccordionMenu.defaults`, not the ticket's list: `parentLink` (`false`), `slideSpeed` (`250`), `submenuToggle` (`false`), `submenuToggleText` (`'Toggle menu'`), `multiOpen` (`true`). Events `down.zf.accordionMenu` and `up.zf.accordionMenu` (after the slide, with the submenu), plus the lifecycle `init.zf.accordion-menu` and `destroyed.zf.accordion-menu`. Methods `hideAll()`, `showAll()`, `toggle($target)`, `down($target)`, `up($target)`, `destroy()`. The ticket's list omits `parentLink` (audit guard H6). Source: FS `foundation.accordionMenu.js:194-290, 310-344`; R:menus 1.3 to 1.5.
2. **What does the Nested menu spec already fix for this plugin?** The item, submenu, and toggle directives, `nfsMenuModeToken` carrying `NfsMenuRoot`, `nfsMenuRootProviders(mode)`, `configure()` with the `NfsAccordionMenuBehaviour` slot (`multiOpen`), the accordion key table, completion timing, the focus-loss guard, the class maps, and the `nfs-accordion-menu` rules; its consumer table gives the AccordionMenu row (root selector, providers, root class, `keydown` forwarding, `multiOpen`, aggregate outputs, Defaults token, `expandAll()`/`collapseAll()` delegation, the mixin). This spec uses all of it as written. Source: NM "What each consuming spec maps", API, Sass.

Round 2: shape and DI.

3. **Directive or component?** One attribute directive on the consumer's root `ul`; no component, because Foundation's markup has every element and the only generated structure (toggles, parent-link clones) becomes consumer markup or is dropped. Source: ADR 0001; ADR 0004; NM D1.
4. **Names?** Class `NfsAccordionMenu` from the Structural class `.accordion-menu`, selector `ul[nfsAccordionMenu]`, `exportAs: 'nfsAccordionMenu'`, entry point and story prefix `accordion-menu`. Source: BB 1.3; SC section 3.
5. **How does the root get its handle?** `providers: [nfsMenuRootProviders('accordion')]` and `inject(nfsMenuModeToken, {self: true})`; under `nfsResponsiveMenu` the host's provider wins on the same element, so `self` still finds the shared root. Source: NM hierarchy, usage example; NG directive composition guide (as cited by NM decision 6).
6. **A plugin token (`nfsAccordionMenuToken`)?** No: nothing injects the accordion root; items read the Nested menu token. Source: DD D2 (same reasoning for an unused plugin token).
7. **Is the menu an Openable?** No; a bare `nfsClose` in a menu inside an off-canvas panel must close the panel. Source: NM D22; Triggers spec Out of scope.
8. **Defaults token?** `nfsAccordionMenuDefaultsToken`, Shape B, `{multiOpen?: boolean}`, falling back to `nfsMenuBehaviourDefaults.accordion.multiOpen`. Source: BB 1.4 (one Defaults token per plugin); R:di 5; NM ("the plugin specs also use [the defaults] to seed their inputs").
9. **Should the entry point re-export the Nested menu directives?** No: one owner per symbol, as the Dropdown pane leaves the Triggers in their own entry point. Source: DD hierarchy ("a consumer imports the Triggers directives from their own entry point").

Round 3: the ARIA model and keys.

10. **Treeview, disclosure navigation, or plain nested lists with buttons?** Disclosure navigation (plain nested lists with `aria-expanded` buttons), with the hybrid variant for sections that have a page. The APG's treeview navigation example carries the caution that the `tree` role "requires implementation of complex functionality that is not needed for typical site navigation", and its disclosure navigation examples are the site-navigation pattern; Foundation's `menubar`/`none`/`group` set matches neither. Source: APG `disclosure-navigation.html`, `disclosure-navigation-hybrid.html`, `treeview-navigation.html`; R:apg AccordionMenu; ADR 0004.
11. **`@angular/aria` Tree or Menu: fit or misfit?** Misfit. `ngTree` with `nav` is the Navigation Treeview: `tree`/`treeitem`/`group` roles, a roving tab stop, forced multi-expansion, no separate toggle for a parent that navigates, `ng-template ngTreeItemGroup` plus `[parent]` inputs that break the nested `ul` markup. `ngMenu`/`ngMenuBar` apply `menu` roles the Aria guide says to avoid for navigation. Source: R:aria 6.4 and 8; NGC `src/aria/tree`; ADR 0004.
12. **CDK?** `CdkTree` hosts `role="tree"` and `role="treeitem"` and is data-driven; `CdkAccordion` is flat. Neither is disclosure navigation; CDK contributes `Directionality`, `_IdGenerator`, and `hasModifierKey` through the Nested menu. Source: NGC `src/cdk/tree/tree.ts:107, 1193, 713-724`; R:material 1.
13. **Native `<details>`?** Not in the first release: `<details name>` (for `multiOpen` off) and `::details-content` (to animate) are outside the Browser target, and a `<summary>` cannot carry Foundation's parent button styling nor sit beside a Hybrid item's link. Named as a future upgrade. Source: R:platform 4; BB 1.2.
14. **Keyboard table in accordion mode?** The Nested menu's: Tab and native Enter/Space; Down/Up across visible controls; Right opens a closed section with focus staying; Left closes an open section or the one containing focus and refocuses its toggle; Escape closes the innermost section containing focus (or the focused toggle's open section) and otherwise propagates; no Home, End, or typeahead. Handler order state, focus, `stopPropagation()`, `preventDefault()` last. Deltas from Foundation recorded: Right no longer moves focus in, Escape no longer closes all, Enter/Space are native. Source: FS `foundation.accordionMenu.js:30-38, 146-186`; NM decisions 21 and 24; APG hybrid keyboard table (optional keys supplement Tab).
15. **Escape inside a menu inside an Off-canvas panel?** The first Escape closes the section and stops propagation, so the Off-canvas `window` listener never sees it; the next Escape, on the now-closed toggle, is not handled and closes the panel. Source: NM ARIA and keyboard; OC ("one `keydown` listener on `window` in the bubble phase ... not `defaultPrevented`").
16. **How is the current page marked?** `aria-current="page"` on its link, consumer-written; with the Router, `routerLinkActive` plus `ariaCurrentWhenActive="page"` on the link. `RouterLinkActive.update()` returns early until `router.navigated`, so the server's attribute survives hydration until the initial navigation writes the same value. A leaf `li.is-active` (Foundation's current-link style) is safe because the accordion class maps never hold `is-active` on an item; not on a parent `li`. Source: APG disclosure navigation (`aria-current="page"`); NG `router_link_active.ts:229-250`; NM class-map rule.
17. **Wrapper?** A consumer-written `nav` with `aria-label` or `aria-labelledby`, never "navigation". Source: APG example (`nav aria-label="Mythical University"`); NM.

Round 4: Options, outputs, methods.

18. **`multiOpen`?** `input()` with `booleanAttribute`, default `true`; a change applies to the next open and closes nothing already open, as Foundation checked it only inside `down()`; no `aria-multiselectable`. Source: FS `foundation.accordionMenu.js:53-55, 230-240, 343`; BB 1.4; P50 triage 8.
19. **`submenuToggle` and `submenuToggleText`?** Dropped options; the consumer writes a Hybrid item per section with a toggle named for it ("More Guides pages", the APG example's `aria-label` form, carried here in Foundation's visible-hidden `.submenu-toggle-text` span). Foundation's one "Toggle menu" name on every toggle does not say which section each opens (WCAG 2.4.6), and the inserted buttons are DOM created after load (ADR 0008). Foundation's `title` on the toggle is not kept. Source: FS `foundation.accordionMenu.js:70-72`; APG `disclosure-navigation-hybrid.html:79`; NM decision 20.
20. **`slideSpeed`?** Dropped option: the `nfs-accordion-menu($duration: 250ms)` parameter; a per-menu duration is the consumer's own `transition-duration`, which completion measures. Source: FS `foundation.accordionMenu.js:324`; BB 1.4 (timing options CSS owns); NM decision 36; ACC D9.
21. **`parentLink`?** Dropped option (clones are generated DOM); a Hybrid item keeps the parent link. Source: BB 1.4; FS `foundation.accordionMenu.js:65-68`.
22. **Outputs?** `opened`/`closed` on the root carrying the `NfsMenuItem` (Foundation carried the submenu), emitted after the item's transition, once each, never for the first-paint state, only while accordion is the live mode. Source: BB 1.4 (container aggregate outputs carry the item; `down/up.zf.accordionMenu` -> `opened`/`closed`); FS `foundation.accordionMenu.js:253-259, 283-289`; NM `configure()`.
23. **Methods?** `expandAll()` (`showAll()`) and `collapseAll()` (`hideAll()`), delegating to the root. `expandAll()` does nothing and warns while `multiOpen` is off, a delta: Foundation's `showAll()` opened every submenu regardless, because each target is in its own branch. Per-submenu `toggle`/`down`/`up` become the item's `toggle()`/`open()`/`close()`. Source: FS `foundation.accordionMenu.js:194-240`; NM API; CDK `openAll()` only with `multi` (R:material 1); BB 1.3.
24. **Several pre-open siblings with `multiOpen` off?** Foundation's `_init` runs `down()` on each pre-open submenu in turn, so only the last stays open. The library keeps all open (server HTML shows what the consumer wrote; closing after hydration would move content) and warns once in development at first render. Source: FS `foundation.accordionMenu.js:87-92, 230-240`; ADR 0028 consequences (warning when single mode starts with several open items).
25. **Does an item's `open()` open its closed ancestors?** Not stated by NM; Foundation's `down()` does not (it opens the target only). This spec assumes not and tells consumers to open each item of the Open path; a clarification is proposed to the Nested menu spec below. Source: FS `foundation.accordionMenu.js:227-260`.
26. **Behaviour under ResponsiveMenu?** The root binds `.accordion-menu` and handles keys only while `root.mode()` is `accordion`; its `configure()` slot keeps `multiOpen`; its outputs emit only in accordion mode. Source: NM decisions 6 and 8; NM consumer table.

Round 5: state, render hooks, rendering modes.

27. **State model and zoneless behaviour?** All section state is the Nested menu's signals (`expanded` models, the root's `mode`); the root holds only its input and outputs. The completion fallback timer runs outside the zone. Source: NM Rendering modes; BB 1.5.
28. **Render hooks?** Host bindings on `root.mode()` for the class and the `keydown` listener; the constructor for `configure()` and the Defaults token; one `afterNextRender` under `ngDevMode` for the several-open-siblings check; no `effect`, no `afterRenderEffect` of its own, no `afterEveryRender`. `injectAsync` not applicable: nothing is loaded only after a client interaction, and a Replayed event must find its handler at once. Source: BB 1.5; NM render hooks table and D23.
29. **Server output and first paint?** Classes, ARIA, `inert`, `is-active`, and `data-nfs-*` are host bindings on construction-time signals; closed sections are hidden only by the `nfs-accordion-menu` grid rule, because Foundation's Sass never hides a submenu (its JavaScript wrote inline `display`). Source: R:rendering 7 rules 1 and 2; FS `_accordion-menu.scss` (no hide rule); NM Rendering modes.
30. **Event replay?** Toggle `click` replays and toggles with no `preventDefault()`; root `keydown` replays with the one accepted `ErrorHandler` log; the root has no `click` listener, so links carry no `jsaction` and navigate natively before hydration; nothing opens on hover or focus. Source: BB 1.11 decision 5; BB Part 4, Decided item 3; NM Rendering modes.
31. **Hydration boundary, `@defer`, `hydrate never`?** The whole `nav` in one boundary; `hydrate on interaction` hydrates on a toggle click and replays; in `hydrate never` links work, pre-open sections stay open, closed ones stay closed. Source: BB 1.11 decisions 6 and 7; R:rendering 7 rules 7 and 11.
32. **Open path bound to Router state?** Router's `isActive(url, router)` (public since 21.1) is a `computed` over `lastSuccessfulNavigation()`, and under the default non-blocking initial navigation the navigation starts after the root component is created, so an application-shell menu bound to it renders its section closed in the first client render after the server rendered it open, then reopens it: two slides at hydration. The spec tells consumers to bind it in a routed layout component (created after the navigation) or from route data there, or use a static `.is-active`. Source: NG `url_tree.ts:105-132`; NG `provide_router.ts:268-322` ("the initial navigation starts after the root component has been created"); BB 1.11 decision 9.

Round 6: animation.

33. **Mechanism?** The Nested menu's accordion grid on the parent `li` (`auto 0fr` to `auto 1fr`, `data-nfs-expanded`), the submenu clipped until `data-nfs-shown`, completion from the computed transition with `transitionend` filtered to the `li` or a fallback of the total plus 100 ms, reduced motion at 1 ms, no Motion class, no `animate.enter`, no `@supports` guard. Measured in three engines including the Hybrid item. Source: BB 1.6 rule 3; ADR 0003; ADR 0033; NM Animation; P50 row 7.
34. **Clicks during the slide?** They reverse the transition (a delta from Foundation's `:animated` guard); the reversed transition completes with its own `transitionend`. Source: FS `foundation.accordionMenu.js:211-220`; ACC completion (`transitioncancel` ignored).
35. **`nfsAnimationsToken` `{disabled: true}`?** NM completes at once but does not suppress the CSS transition, so `data-nfs-shown` would release the clip while the row still grows; the Accordion spec's content wrapper binds `transition: none`. This spec requires the same on the `li` and proposes the amendment to the Nested menu spec. Source: ACC Animation ("Disabled animations"); NM Animation (completion text).

Round 7: WCAG 2.2 AA and Sass.

36. **Which criteria, and how is each met?** 1.3.1, 1.3.2, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 1.4.13 (not applicable by design: nothing opens on hover or focus), 2.1.1, 2.1.2, 2.4.3, 2.4.6, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.2.1, 4.1.2, each with its requirement and check in the spec. Foundation's defaults pass all: link and button text `$anchor-color` 4.65:1, arrows `$primary-color` 4.65:1, rows 38 px, Hybrid toggles 40 px; no Storybook settings override. Source: ADR 0022; NM WCAG table; P50 rows 19 to 22; FS `_accordion-menu.scss:19-51`.
37. **A gap in the Nested menu's 1.4.11 check?** Yes: Foundation draws the Hybrid toggle's arrow with `$accordionmenu-arrow-color` on `$accordionmenu-submenu-toggle-background` (when set) and does so whatever `$accordionmenu-arrows` says; NM checks the accordion arrow only against `$accordionmenu-item-background` or `$body-background`. `nfs-accordion-menu` adds the check, ungated; proposed to the Nested menu spec for every mixin that checks toggle size. Source: FS `_accordion-menu.scss:35, 139-163`.
38. **Row height checked at compile time?** No: rows are 38 px with Foundation's defaults, the Accessibility gate's `target-size` rule covers the library's stories, and computing a row height from a padding list in `rem` against inherited font size would be fragile. Source: P50 row 20; NM 2.5.8 row.
39. **Mixin rules?** The six rules NM assigns to `nfs-accordion-menu` (its rules 1 to 5 and 12, accordion parts): parent-button base with padding and background twins, the button arrow twins gated on `$accordionmenu-arrows`, the three grid rules, and the reduced-motion override; plus the three compile-time checks. `$duration` is the only parameter. Source: NM Sass; FS `_accordion-menu.scss:53-75, 92-100, 113-120`; ADR 0012.
40. **What breaks without the include?** Every section shows open while its toggle says collapsed and its content is `inert`; buttons are unpadded inline text without arrows. Source: FS `_accordion-menu.scss` (no hide rule); NM Sass item 5.

Round 8: comparison and tests.

41. **Material comparison?** `MatTree`/`CdkTree` (tree roles, data-driven, `expandAll()`/`collapseAll()`), `MatAccordion`/`CdkAccordion` (`multi`, `openAll()` only with `multi`, `opened`/`closed`, `afterExpand`/`afterCollapse`), Aria `ngTree` `nav`. Borrowed: the `expandAll()` rule, `opened`/`closed`, the `expanded` model, a Defaults token. Source: R:material 1; NGC `src/cdk/tree/tree.ts`; R:aria 8.
42. **Test layers?** The four layers with ST's wording; story ids `accordion-menu--*`; the Nested menu's stories own the key tables and class maps, so these stories assert only what the root adds plus Foundation's docs markup; the Fixture app gets an accordion-mode route, which the Nested menu's route (drilldown and dropdown) does not cover; e2e owns 1.4.12, 1.4.10, 2.4.11, and the rendering modes. Source: ST (test pyramid, wording section); ADR 0018; SC sections 3 and 7; NM Testing Decisions.

### Triage

Rule (map, Orchestration rules): impact HIGH when hard to reverse; confidence NOT HIGH when the default is bare, carried from a prototype without deliberation, or against the research or ADRs. Only HIGH with NOT-HIGH stays open.

1. **Disclosure navigation, not treeview or Aria Tree** (decisions 10, 11). Impact: HIGH (roles are a public contract). Confidence: HIGH (APG cautions, ADR 0004, the Aria guide). Decided.
2. **Several pre-open siblings with `multiOpen` off stay open and warn, instead of Foundation's last-wins** (decision 24). Impact: low (initial-state edge case, reversible). Confidence: HIGH (server-HTML rule, ADR 0028 precedent). Decided.
3. **`expandAll()` inert while `multiOpen` is off** (decision 23). Impact: low; already fixed by NM. Confidence: HIGH (CDK and Aria rule). Decided.
4. **Toggle-background contrast check** (decision 37). Impact: low (a compile check; consumers on defaults see nothing). Confidence: HIGH (read from Foundation's Sass). Decided; proposed to NM.
5. **`transition: none` on the `li` under `nfsAnimationsToken`** (decision 35). Impact: low (tests only). Confidence: HIGH (the Accordion spec's rule). Decided; proposed to NM.
6. **`open()` does not open closed ancestors** (decision 25). Impact: medium (item API semantics shared by three plugins, owned by NM). Confidence: medium, but this spec freezes nothing: it records Foundation's behaviour as the default and asks NM to state it. Decided as the default; proposed clarification to NM.
7. **Router-bound Open path guidance** (decision 32). Impact: low (documentation). Confidence: HIGH for the mechanism (read from Router source); the advice is the building-blocks rule (route data). Decided.
8. **No compile check on row height** (decision 38). Impact: low. Confidence: HIGH (defaults pass; the gate covers stories). Decided.
9. **No re-export of the Nested menu directives** (decision 9). Impact: low (an import path; adding a re-export later breaks nobody). Confidence: HIGH (the Dropdown pane precedent). Decided.
10. **Screen-reader checks.** Nothing AccordionMenu-specific needs assistive technology beyond the pattern the APG example already demonstrates; the Nested menu's open item (a screen reader pass over a ResponsiveMenu swap) stays there. Not an item here.

### OPEN FOR HUMAN

None.

## Prototype needed

None. The accordion mode, its keys, the Hybrid item, the parent-`li` grid, reduced motion, and axe per state ran in Chromium, Firefox, and WebKit in the [Prototype: Nested menu directive family with breakpoint mode switching](50-prototype-nested-menu.md); pre-hydration click replay and hydrate triggers are proven by the [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md) and have accordion-mode e2e cases in the spec's Fixture app route.

### Proposed glossary terms

None new. The spec uses **Hybrid item** and **Open path** as proposed in the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md) answer, which the orchestrator is applying to `CONTEXT.md`.

### Proposed ADR

None. Every hard-to-reverse choice here is already recorded: disclosure navigation (ADR 0004), the grid and its `data-nfs-*` hooks (ADR 0003, ADR 0033), rendering modes (ADR 0008), Sass packaging (ADR 0012). The choices this spec adds (warning instead of last-wins, the extra compile check, no re-export) are easy to reverse, so they fail the domain-modeling bar.

### Proposed building-blocks changes

1. Table B, AccordionMenu row, DI cell: replace "Nested menu mode token (`nfsMenuModeToken`, value `accordion`) provided by the root; `nfsMenuItem` injects it `{optional}`; `nfsSubmenu` injects the owning `nfsMenuItem` `{skipSelf}`; `nfsAccordionMenuDefaultsToken`" with "`nfsMenuModeToken` carrying the Nested menu's `NfsMenuRoot` in mode `accordion`, from `nfsMenuRootProviders('accordion')` on the root; `nfsMenuItem` injects it `{optional}`; `nfsSubmenu` injects its owning `NfsMenuItem` (required); `nfsAccordionMenuDefaultsToken` (`multiOpen`)". Reason: the Nested menu spec's hierarchy (the token's value is the root handle, and a submenu sits on its own element, so `skipSelf` has no effect); decisions 5 and 8.
2. Table B, AccordionMenu row, Outputs cell: append "; the root's `opened`/`closed` carry the `NfsMenuItem`; `expandAll()` acts only while `multiOpen` is on". Reason: decisions 22 and 23.
3. Table B, AccordionMenu row, Rendering-mode cell: append "`jsaction` for `keydown` on the root and `click` on each toggle, none on links; closed sections are hidden only by the `nfs-accordion-menu` grid rule, because Foundation's Sass never hides a submenu; the whole `nav` in one Hydration boundary". Reason: decisions 29 to 31.

### Proposed changes to the Nested menu spec (for the orchestrator)

1. Animation: with `nfsAnimationsToken` `{disabled: true}`, a parent item in accordion mode binds `transition: none` on its `li` (and a drilldown submenu on itself), as the Accordion spec's content wrapper does, besides completing at once. Reason: decision 35.
2. Sass checks: in each mixin that checks the toggle size, also stop the compile when `$accordionmenu-submenu-toggle-background` is not `null` and `color-contrast($accordionmenu-arrow-color, $accordionmenu-submenu-toggle-background)` is below 3, not gated on the mode's arrow boolean. Reason: decision 37.
3. API: state whether `NfsMenuItem.open()` opens closed ancestors. Default this spec assumes: it does not, as Foundation's `down()` did not. Reason: decision 25.

### Amendment, 2026-09-26 (audit 0004)

From [audit 0004](../audits/0004-second-spec-wave.md), findings H1 and L4; `specs/accordion-menu.md` was edited to match.

1. Unrounded ratios (H1; decisions 36 and 37): the `nfs-accordion-menu` arrow checks compute each ratio from Foundation's `color-luminance()` with the WCAG formula and compare it unrounded, the rule of building-blocks 1.10 and of the Nested menu spec's own Sass checks, so the mixin has one rule. Foundation's `color-contrast()` is no longer used or listed as a reused function, because it rounds to one decimal and lets 2.95:1 pass a 3:1 threshold. This also supersedes the `color-contrast(...)` wording of proposed Nested menu change 2 above; the check itself (the arrow against the Hybrid toggle's background when set, not gated on the arrow boolean) is unchanged.
2. Settled wording (L4; decision 35): the `transition: none` rule under `nfsAnimationsToken` is stated as the Nested menu spec's own rule, which its amendment from this ticket carries, instead of a proposed amendment.

### Amendment, 2026-09-26 (consistency review)

Applied to `specs/accordion-menu.md` by the [Consistency review and bundle index](36-consistency-review.md), which lists every place a spec chose not to use an available `@angular/aria` building block with the spec's reason; nothing new is decided.

1. Implementation level: the spec now also states why Aria's accordion (`ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`), which the Accordion plugin hosts, is not used for the Accordion Menu: it is the APG Accordion pattern for page sections (a `region` landmark per panel, which the APG advises against when panels are many), its triggers share one roving tab stop and its arrow keys move between triggers only (disclosure navigation keeps every button and link in the tab sequence, and Foundation's arrow keys move across links), and each trigger needs a required `[panel]` binding. The spec already gave the reasons for rejecting `ngTree`, `ngMenu`, and `ngMenuBar` (ADR 0004). Source: the components 22.2.x clone, `src/aria/accordion/accordion-panel.ts` (`role: 'region'`), `src/aria/private/accordion/accordion.ts` (`focusMode` `'roving'`); decisions 10 and 11 of this ticket.

### Amendment, 2026-09-26 (audit 0005)

From [audit 0005](../audits/0005-final-bundle.md), finding M1 (unrecorded departure 1); `specs/accordion-menu.md` was edited to match. The audit offered two fixes, a row check in the mixin or an exception recorded in building-blocks 1.10; the first is applied.

1. Row height (supersedes decision 38): `nfs-accordion-menu` also stops the compile with `@error` naming the setting when `1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1). Changed in the spec: user story 35, the 2.5.8 row, the Sass compile test (a `$accordionmenu-padding` of `0.2rem 1rem` stops the compile), the Checks paragraph, the reused functions (`rem-calc()`), and a new design decision D18. Reason: row height is a consumer setting, and a small padding gives stacked rows under 24 px with touching targets, where the spacing exception does not apply; building-blocks 1.10 guarantees 2.5.8 in the Library mixin where settings can fail it, and the story gate compiles only the library's own settings (ADR 0022), the reason the [Spec: Drilldown Menu](22-spec-drilldown-menu.md) gives in its decision 40. Decision 38's fragility concern is answered by using the Drilldown mixin's computation unchanged, so the three menu mixins share one row rule. Source: building-blocks 1.10; ADR 0022; the Drilldown Menu spec's D20 and checks; Foundation's `$accordionmenu-padding` and `$accordionmenu-submenu-padding` in the 6.9.0 settings.

#### Triage

Impact MEDIUM: a consumer compile with a padding under the threshold now stops, but no API, markup, or default changes, and Foundation's defaults (38 px rows) pass. Confidence HIGH: building-blocks 1.10 and ADR 0022 require it, and the Drilldown mixin already does it. Decided.

### Amendment, 2026-09-27 (Decide the `@angular/aria` fallback confirmation)

The [Decide the `@angular/aria` fallback confirmation](75-evidence-aria-fallback-confirmation.md) confirmed that the Accordion Menu does not use Aria's accordion (its fallback 7), with a condition: "one roving tab stop over the triggers" is false. `specs/accordion-menu.md` was edited to match.

1. Decision 11 and the consistency-review amendment's item 1 above: the claim that Aria's accordion triggers "share one roving tab stop" (item 1 cited `focusMode` `'roving'`) is struck. Every enabled trigger is a tab stop: Aria computes `tabindex` from `isFocusable` (0 unless hard-disabled), not from the roving rule, measured `0,0,0,0,0,0,0` in the Aria prototype's case 10 and in probes E and H, which matches the APG accordion pattern. Decision 11's tree facts (a roving tab stop for `ngTree`) are correct and stand.
2. The reason rests on these facts instead: the group's host `keydown` listener handles keys from inside open sections without checking the target, so its arrow keys move between triggers only and its Enter and Space toggle a section and are cancelled, and a menu would have to guard Aria's keys off on every level and re-add Foundation's cross-link arrows beside them (else Enter on a link inside an open section toggles the section and does not follow the link); the `region` landmark per panel is removable through the Accordion's `region` input, so it is a cost, not a blocker; each trigger needs a required `[panel]` binding; and ResponsiveMenu needs one directive family across its modes (ADR 0004), so an Accordion Menu on Aria's accordion would be a second implementation of the plugin.
3. Changed in the spec: the Implementation level paragraph's Aria accordion clause, replaced with the reasons above, plus the ResponsiveMenu sentence.

Triage, from the decision ticket: impact HIGH, confidence HIGH (source read by the judge; the tab stops measured). Decided; nothing open.
