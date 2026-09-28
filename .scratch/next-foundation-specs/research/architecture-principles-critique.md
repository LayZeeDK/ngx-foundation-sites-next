# Critique: directive and component architecture principles, tested against Angular 22.2, the Browser target, Foundation's CSS, and this effort's decisions

Ticket: [Research: directive and component architecture principles for Angular UI libraries](../issues/140-research-directive-component-architecture-principles.md), lens 3 of 3 (adversarial critique). Written 2026-09-28.

## Question

For each principle, layer, and decision rule of the [user draft](architecture-principles-user-draft.md), and for each principle the draft lacks: where does it break? Is it false for Angular, untestable, self-contradictory, or in conflict with Angular 22.2, the Browser target (Baseline widely available on 2026-05-07), Foundation's class-based CSS contract, or this map's recorded decisions? What evidence decides each case?

## Status of the draft

The user ruled on 2026-09-28 that Microsoft Copilot generated the draft with little to no research, that it is inspiration for the kind of guide to produce and not authoritative, and that any claim adopted from it must be verified and backed by research. This file therefore tests the draft claim by claim, not only heading by heading. Each claim is marked:

- **Verified**: a primary source or a recorded decision of this effort confirms it as stated.
- **Refuted**: a primary source or a recorded decision contradicts it.
- **Unverified**: no source read here confirms or refutes it. An unverified claim carries no weight in the guide.

The draft's code examples are quoted with this effort's `nfs` prefix in place of the draft's `fnd`. Verdicts per principle are adopt, adopt with qualification, reject, or add. Strength is strong (a primary source and a measured or recorded decision of this effort agree), moderate (a primary source without an effort decision, or an effort decision without an outside source), or weak (reasoning only).

## Sources read

| Key | Source | Version or date |
| --- | --- | --- |
| `NG/` | Angular framework and angular.dev docs, `d:/projects/github/angular/angular` (`adev/src/content/` for docs, `packages/` for source) | branch 22.2.x, `package.json` 22.2.0 |
| `NC/` | angular/components (Aria `src/aria`, CDK `src/cdk`, Material `src/material`, `CODING_STANDARDS.md`), `d:/projects/github/angular/components` | branch 22.2.x, 22.2.0 |
| `CLI/` | angular/angular-cli, `d:/projects/github/angular/angular-cli` | branch 22.0.x (the clone is not on 22.2.x; one fact is cited from it and marked) |
| `FS/` | Foundation for Sites, `d:/projects/github/foundation/foundation-sites` | v6.9.0 (`git describe`: v6.9.0-1-g337be7a8d) |
| `APG/` | WAI-ARIA Authoring Practices, `d:/projects/github/w3c/aria-practices` | local clone |
| `WF` | `web-features` package, `data.json` (web-platform-dx's dataset, the one behind the supported-browsers page the map names), downloaded from `registry.npmjs.org/web-features` | 3.40.0, published 2026-09-24; each feature's `baseline_high_date` compared with 2026-05-07 by a scratch script |
| axe | axe-core in this repository's `node_modules` | 4.11.0 (the effort pins 4.13.0; cited only for one rule's existence and tags) |
| WHATWG | HTML Standard, 4.4 Grouping content, https://html.spec.whatwg.org/multipage/grouping-content.html | fetched 2026-09-28 through markdown.new |
| Vue | Vue.js guide, Custom Directives, https://vuejs.org/guide/reusability/custom-directives.html | fetched 2026-09-28 through markdown.new (one comparative claim) |
| Sass | Dart Sass in this repository's `node_modules` | 1.93.2 (compiled one nesting probe) |
| effort | This effort under `.scratch/next-foundation-specs/`, cited by relative path and line: `map.md` Notes (Standing preferences, Design criteria, Out-of-scope triage, Out of scope), ADRs 0001 to 0043 (0001, 0002, 0003, 0006, 0007, 0008, 0009, 0012, 0018, 0022, 0030, 0039, 0040, 0041, 0042, 0043 read in full), `building-blocks.md` Part 1, `CONTEXT.md`, `storybook-conventions.md`, and fifteen specs: Accordion, Tabs, Reveal, Dropdown, Menu, Button, Forms, XY Grid, Prototyping Utilities, Card, Switch, Slider, Tooltip, Off-canvas, Orbit | working tree of branch `wayfinder`, 2026-09-28 |
| repo | This repository's `AGENTS.md` | working tree, 2026-09-28 |

## Summary of findings

1. The draft's component rule is wrong for Angular. Angular's own criterion for a component is a template ("If you need to render your own markup or manage a piece of UI with its own template, reach for a component", `NG/adev/src/content/guide/directives/overview.md:17`), not coordination. Angular Aria ships no component at all (no `@Component` in `NC/src/aria` outside specs), and even Material's `MatAccordion` is a directive with a provider, not a component (`NC/src/material/expansion/accordion.ts:32-40`). Principle 3, Layer 3, the core philosophy, and decision rule 3 all rest on the wrong criterion; ADR 0001's rule (components only for markup the consumer cannot write) is the one the evidence supports.
2. Principle 13's "2-5 inputs" and principle 5's list of options to avoid contradict the map's rule that every Foundation `data-*` Option is an input (`map.md:40`, `building-blocks.md:59`) and ADR 0040's one input per Variant family. The published APIs have 7 to 18 inputs per container directive (Reveal 17 inputs plus a model, Dropdown pane 16 plus a model). The count must go; the questions stay.
3. Principle 11 and Principle 9 name platform features outside the Browser target: `:open` (newly available 2026-05-11), `:popover-open` and the Popover API (newly available 2025-01-27), `:has()` (widely available only from 2026-06-19), CSS anchor positioning (not Baseline in web-features 3.40.0), View Transitions (newly available 2025-10-14), and CSS nesting (widely available only from 2026-06-11, and moot for Sass output). Only `<dialog>`, ResizeObserver, IntersectionObserver, `:focus-visible`, `:checked`, `:disabled`, and size container queries pass.
4. Principle 11's "avoid `isOpen` signals" is refuted by every Openable's `isOpen` model, which `aria-expanded`, Foundation's `.is-open`, and the server HTML need. What survives is a one-source-of-truth rule: the platform's state where Foundation or a Library mixin can style it, otherwise Foundation's State class bound from signal state.
5. Principle 4 puts `effect()` among public APIs; Angular calls it "the last API you reach for", it runs on the server, and Aria uses it only internally. `model()` takes no transform, so a boolean model has no bare-attribute form. The draft's own `disabled = input(false)` example fails strict attribute type checking without a transform.
6. Principle 14 and Layer 4 introduce layout primitives Foundation does not have (Stack, Cluster, Sidebar, Switcher) as element components; that conflicts with the Destination (one spec per Foundation docs page), the rule that the library never re-implements Foundation's styles, and Foundation's child-combinator grid selectors.
7. Many of the draft's example names do not exist in Foundation or contradict the effort's naming rule: `nfsCardHeader` (Foundation has `.card-divider`), `nfsMenuItem` on a link (no class; ADR 0042 rejected a link directive), `nfsInput` and `nfsTextarea` (styled by tag; no directive under ADR 0039), `nfsDropdown` (`.dropdown` is Button's arrow class), and the Trigger/Panel/Content family names.
8. The draft lacks the principles that decided most of this effort's specs: rendering modes, entry points and tree shaking, forms integration, the Sass side (Library mixins, no component styles), naming, host-directive limits, composition over inheritance, one source of truth per state, declaration-site DI, development-mode checks, internationalisation and direction, the test surface, and deprecation and versioning. Of these, deprecation and versioning has no recorded decision in this effort, internationalisation is a practice the specs follow without a recorded rule, and the test surface is decided only as "no custom harness classes in the first specs".
9. The effort itself has one wording conflict the guide must not copy: `building-blocks.md:92` allows `effect()` for "history writes, timers", while `building-blocks.md:200-201` (1.11 decisions 3 and 4) forbid `history` outside render callbacks and timers outside render callbacks or handlers, and effects run on the server. No spec uses an effect for either.

## The vision, core philosophy, and manifesto

- "Preserves the visual language and CSS architecture of Foundation for Sites": **Verified** (`map.md:19`, `map.md:39`).
- "Replacing Foundation's JavaScript implementation with Angular, modern browser APIs, signals, and CSS-based animations": **Verified** (`map.md:19`, `map.md:41`, `map.md:43`; ADR 0003).
- "The library should feel like a natural Angular library, not a React library port": **Unverified** as stated (a goal, not a checkable claim). Its testable form is the Angular primitive for each React idiom: directives and `hostDirectives` where React libraries use `asChild`, DI tokens where they use context (the headless-primitives lens covers the mapping).
- Core philosophy, "introduce components only when coordination between multiple elements is required": **Refuted** (principle 3 below).
- Manifesto, "encapsulates Foundation for Sites styling and behaviour": **Refuted** for styling. No directive or component declares `styles` or `styleUrl` (`building-blocks.md:238`); the consumer compiles Foundation's Sass from its own settings and includes the library's Library mixins after Foundation's (ADR 0012, `adr/0012-sass-packaging.md:7`); Shadow DOM is never used because it silently skips hydration and replay (`building-blocks.md:193`). The library binds Foundation's classes; it does not encapsulate Foundation's styles.

## Principle 1. Directive-first, component-second

Principle: prefer an attribute directive on the existing semantic element over a custom element.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| Directives are "a unique strength of the framework" | **Refuted** ("unique") | Vue has custom directives: "Vue also allows you to register your own custom directives", "mainly intended for reusing logic that involves low-level DOM access on plain elements" (Vue guide, Custom Directives). What Angular's docs do support: a directive "can change how an element looks, how it behaves, or how it fits into the DOM" (`NG/adev/src/content/guide/directives/overview.md:5`), applying "attributes, CSS classes, and event listeners", composing through `hostDirectives`, and injecting and being injected like a component (`NG/adev/src/content/guide/directives/directive-composition-api.md:3`, `:77-103`, `:162-168`) |
| Preserve native semantics and browser behaviour | **Verified** | An attribute selector lets "consumers of the component ... directly use all the element's standard APIs ... especially valuable for ARIA attributes" (`NG/adev/src/content/guide/components/selectors.md:125-138`); Material: "Native inputs used in components should be exposed to developers through `ng-content`" (`NC/CODING_STANDARDS.md:274-305`) |
| Improve accessibility | **Verified** only as "keeps the native element's semantics"; a directive adds nothing by itself | APG: "No ARIA is better than Bad ARIA" (`APG/content/practices/read-me-first/read-me-first-practice.html:19-33`) |
| Reduce DOM wrappers | **Verified** | A directive adds no element; Foundation's selectors need none: `.grid-x > .<size>-<n>` (`FS/scss/xy-grid/_classes.scss:72-100`), `.menu > li` (`FS/scss/components/_menu.scss:104`) |
| Improve composability | **Verified** | Several directives per element and `hostDirectives` (`directive-composition-api.md:77-103`) |
| Improve interoperability | **Unverified** | The term is not defined in the draft |

How it applies: the effort's rule is stronger than the draft's: attribute directives on consumer-written elements, and a component only in three named cases (ADR 0001, `adr/0001-directive-first-with-named-exceptions.md:7`; `building-blocks.md:14`; `map.md:36`). Material agrees for native hosts: `MatButton` is an attribute-selector component on `button` and `a` (`NC/src/material/button/button.ts:28-33`), and Material's standard says "Components should use element selectors except when the component API uses a native HTML element" (`NC/CODING_STANDARDS.md:247-252`).

Cost the draft omits: "Angular does not report errors when it encounters custom attributes that don't match an available component. When using components with attribute selectors, consumers may forget to import the component" (`selectors.md:140-142`). A static `nfsButton` on an element whose directive was not imported renders unstyled and silent; the library's development checks and Runtime checks cannot report it because they run inside the directive. A bound input on the missing directive does fail (NG8002, "Can't bind to ... since it isn't a known property", `NG/adev/src/content/reference/errors/NG8002.md:5-12`), and each entry point exports one import array (`NFS_ACCORDION`, `specs/accordion.md:155`), which narrows the gap without closing it. No effort record names this failure mode.

Strength: strong. Verdict: adopt with qualification: state it as ADR 0001's rule with its three exceptions, and record the silent-import cost.

## Principle 2. Every Foundation concept may have an Angular directive

Principle: a directive is worth having even when all it does is apply Foundation's classes.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| IDE autocomplete | **Verified** | The language service offers the attributes whose addition would make a directive match (`NG/packages/language-service/src/attribute_completions.ts:303-330`); input values: "a declared custom name compiles and is offered by the editor" (ADR 0040, `adr/0040-variant-input-types.md:20`) |
| Type safety | **Verified** | A misspelt Variant name fails with TS2820, and so does a Foundation class name passed as a value (ADR 0040, `:19`) |
| Future extensibility | **Verified** by this effort's history | The class-only period cost a re-run of all 26 published specs once the classes moved into directives (ADR 0039 Consequences, `adr/0039-directives-manage-every-foundation-class.md:20`) |
| Discoverability, consistent surface area, easier migration | **Unverified** | No source read measures them |
| "Users should rarely need to remember Foundation class names" | **Refuted** (too weak) | The user's rule is never: "consumers should not write any CSS classes ... All Foundation for Sites and NFS classes are managed by the Angular components/directives" (ADR 0039, `:8`, `:10`) |

Conflicts: "may" is weaker than the recorded rule, which is "must" for every Structural class (one directive per Structural class, which binds it even when that is all it does, `building-blocks.md:14`). "Every concept" is too broad: an element Foundation styles only by tag gets no directive (text inputs, `textarea`, `select`, checkboxes, radios, bare `fieldset`; ADR 0039 `:10`; `specs/forms.md:28`, `:109`), until Foundation gives it a Variant class (`<progress>`, `<table>`, `label.middle`; ADR 0039 `:29-30`).

Strength: strong. Verdict: adopt with qualification: restate as ADR 0039's class rule.

## Principle 3. Components exist for coordination

Principle (draft): use a component when several elements must cooperate for behaviour, accessibility, state, or content orchestration; `<nfs-accordion>`, `<nfs-tabs>`, `<nfs-off-canvas>`, `<nfs-reveal>`, `<nfs-dropdown>` are the examples.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| Coordination calls for a component | **Refuted** | Angular's criterion is a template: "If you need to render your own markup or manage a piece of UI with its own template, reach for a component, a specialized directive with its own template" (`NG/adev/src/content/guide/directives/overview.md:17`) |
| `<nfs-accordion>`, `<nfs-tabs>` are appropriate components | **Refuted** | Angular Aria's accordion and tabs coordinators are directives that provide a token: `[ngAccordionGroup]` provides `ACCORDION_GROUP` (`NC/src/aria/accordion/accordion-group.ts:62-69`), `[ngTabs]` provides `TABS` (`NC/src/aria/tabs/tabs.ts:53-55`); no file under `NC/src/aria` declares `@Component` outside specs; Aria is "a collection of headless, accessible directives ... All you have to do is provide the HTML structure" (`NG/adev/src/content/guide/aria/overview.md:8`). Material's `MatAccordion` is a `@Directive` on `mat-accordion` with a provider (`NC/src/material/expansion/accordion.ts:32-40`). The effort: seven directives and no component for Tabs (`specs/tabs.md:168`), with the coordinating `[nfsTabsGroup]` binding no class (`specs/tabs.md:124`, `:170`); `NfsAccordion` hosts Aria's `AccordionGroup` (`specs/accordion.md:136-138`) |
| `<nfs-reveal>` is an appropriate component | **Refuted** | Reveal is a directive on the consumer's `<dialog>` for `showModal()`, the top layer, `::backdrop`, and native Escape (ADR 0007, `adr/0007-reveal-on-native-dialog.md:7`; `specs/reveal.md:183`); an element host cannot be a `<dialog>`, and a `<dialog>` inside a component template is out of the consumer's reach for its own attributes (`selectors.md:137-138`) |
| `<nfs-off-canvas>`, `<nfs-dropdown>` are appropriate components | **Refuted** | `[nfsOffCanvas]` on Foundation's `div.off-canvas` (ADR 0030); `[nfsDropdownPane]`, named so because `.dropdown` is Button's arrow class (`building-blocks.md:51`; `specs/dropdown.md:206`) |
| `<nfs-card-header>` is less appropriate; prefer `nfsCardHeader` | **Refuted** (the name) | Foundation has `.card`, `.card-divider`, `.card-section`, `.card-image` and no `.card-header` (`FS/scss/components/_card.scss:112-126`; `FS/docs/pages/card.md:34-39`); the effort's directives are `[nfsCard]`, `[nfsCardDivider]`, `[nfsCardSection]`, `[nfsCardImage]` (`specs/card.md:300`, D1) |

Further evidence against element components on Foundation's markup:

- HTML content models: the `ul` element's content model is "Zero or more `li` and script-supporting elements", and "The items of the list are the `li` element child nodes" (WHATWG 4.4.6). A `<nfs-menu-item>` or `<nfs-accordion-item>` inside Foundation's `ul` is non-conforming, and axe's `list` rule ("`<ul>` and `<ol>` must only directly contain `<li>`, `<script>` or `<template>` elements", tags `wcag2a`, `wcag131`; `node_modules/axe-core/axe.js:29773`, `:31983-31995` in 4.11.0) fails it under this effort's story gate (ADR 0018; `building-blocks.md:182`).
- Hydration: a component that re-renders markup the consumer already owns "fights hydration (server HTML must be the consumer's markup)" (ADR 0001, `:11`); invalid structure in a component template is a hydration mismatch (`NG/adev/src/content/guide/hydration.md:113-121`).

When a component earns its template (the brief's question): when the consumer cannot write the element. ADR 0001 names three cases and they match Angular's own criterion: one of two markup trees rendered from the same content (Responsive Accordion Tabs, because host directives cannot be added conditionally, `directive-composition-api.md:26-27`, so swapping Aria patterns needs `@if` in a template; `building-blocks.md:16`); one inner element the CSS needs (the Accordion's Wrapper component for the grid-row height animation, `building-blocks.md:17`, `:109`); and elements Foundation generates that the consumer never authors (the Tooltip tip and its description element, `building-blocks.md:18`). Where the component sits on a consumer element it takes an attribute selector (`[nfsAccordionContent]`), which Angular recommends for native elements (`selectors.md:123-138`).

Strength: strong. Verdict: reject as written; replace with "a component exists only for markup the consumer cannot write; coordination between elements is a parent directive with a lightweight token".

## Principle 4. Signals-first public APIs

Principle (draft): `input()`, `model()`, `output()`, `signal()`, `computed()`, `effect()` in public APIs and examples, never `@Input`, `@Output`, `EventEmitter` except for compatibility.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| `readonly disabled = input(false)` | **Refuted** as an example | Without a transform the bare attribute `<x disabled>` passes `''`, which strict attribute type checking rejects (`NG/adev/src/content/tools/cli/template-typecheck.md:239-265`); Material requires a transform on every boolean and number input (`NC/CODING_STANDARDS.md:260-272`); the effort uses `booleanAttribute` for Options (`building-blocks.md:59`) and a closed transform for boolean Variant inputs, because `booleanAttribute`'s `unknown` parameter lets `dropdown="flase"` compile (ADR 0040, `:38`) |
| `readonly expanded = model(false)` | **Verified**, with a limit | "Use model inputs when you want a component to support two-way binding" (`NG/adev/src/content/guide/components/inputs.md:258-260`); Aria's public state is `model()` (`NC/src/aria/accordion/accordion-trigger.ts:85`, `NC/src/aria/tabs/tab-list.ts:109`); the effort: `model()` for state Foundation exposes as both a method and an event (`building-blocks.md:79`). Limit: `ModelOptions` has only `alias` and `debugName`, no `transform` (`NG/packages/core/src/authoring/model/model_signal.ts:32-43`), so a boolean model has no bare-attribute form (`specs/accordion.md:230`) |
| `readonly collapsed = computed(() => !this.expanded())` as public API | **Refuted** as API design | A public negation is a second API for one state, against "Always prefer sticking to a single API for accomplishing something" (`NC/CODING_STANDARDS.md:72-78`) and the draft's own principle 13; the effort exposes derived state only where a consumer needs it (`NfsAccordionItem.expanded` is a read-only `Signal`, `specs/accordion.md:188`) |
| `readonly opened = output<void>()` | **Verified** | Item-level outputs are `void`, completion outputs past tense (`building-blocks.md:82-83`) |
| `effect()` belongs in the public architecture | **Refuted** | "Effects should be the last API you reach for ... There are no situations where effect is good, only situations where it is appropriate", and "Avoid using effects for propagation of state changes" (`NG/adev/src/content/guide/signals/effect.md:19-32`); effects run on the server (`research/angular-rendering-modes.md:26`, `:55`) while `afterRenderEffect` runs only in the browser (`effect.md:203-207`); Aria calls `effect()` three times, all internal (`NC/src/aria/menu/menu-trigger.ts:91-92`, `NC/src/aria/menu/menu-item.ts:107`); the effort limits it to non-DOM side effects plus two named exceptions (`building-blocks.md:92`, `:101`) |
| Decorators only "where compatibility requirements demand them" | **Unverified** | No compatibility case was found for a new Angular 22.2 library; Material still uses `@Input` (`NC/src/material/button/button.ts:44`) for its own history, which is no reason for a new library; keeping both forms would be two APIs for one thing |

What the principle lacks: `linkedSignal` for derived-but-writable state (`effect.md:19`; `building-blocks.md:81`); `afterRenderEffect` with explicit phases for DOM work (`effect.md:148-184`; `building-blocks.md:93`); `host` metadata instead of `@HostBinding`/`@HostListener` (`NC/CODING_STANDARDS.md:310-315`; this repository's `AGENTS.md`); read-only public state (`Signal` or `computed`) unless the state is a `model()`; the `isX` rule for a state whose verb would collide with a method or an output (`building-blocks.md:54`); OnPush and zoneless as assumptions (`building-blocks.md:91`).

Rendering modes: `model()` is safe on the server when the first-paint value is a binding (`[expanded]="true"` is applied in the first update pass on server and client, `specs/accordion.md:230`) and never read from the DOM (`building-blocks.md:80`); inside `@defer` the binding arrives with the block. An `effect()` that touches `history` or starts a timer runs during the server render, which is why 1.11 decisions 3 and 4 forbid both outside render callbacks and handlers (`building-blocks.md:200-201`). The wording at `building-blocks.md:92` ("side effects that are not DOM (history writes, timers)") conflicts with those decisions and should not pass into the guide.

Strength: strong. Verdict: adopt with qualification.

## Principle 5. Composition over configuration

Principle (draft): prefer combining primitives to growing a configuration surface; avoid `<nfs-dropdown placement trigger animated close-on-click show-arrow>`.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| The listed Dropdown options should not be inputs | **Refuted** for this library | They are Foundation's Dropdown Options, which the map maps one to one (`map.md:40`; `building-blocks.md:59`); the Dropdown pane keeps `position`, `alignment`, `hover`, `hoverDelay`, `closeOnClick`, `animate`, and eleven more (`specs/dropdown.md:206-224`) |
| `show-arrow` is a Dropdown option | **Unverified** | Not among the effort's Dropdown pane inputs; no Foundation source was found for it |
| Prefer `nfsDropdownTrigger` plus `nfsDropdown` | **Verified** in substance, **refuted** in naming | Triggers are separate directives on native buttons acting on any Openable (`building-blocks.md:125`; ADR 0013); the pane is `nfsDropdownPane` (`building-blocks.md:51`) |

How it applies: the effort already composes wherever Foundation's contract allows it: one Trigger family for every Openable (`building-blocks.md:125`), one shared Positioner for panes and tips (ADR 0002), typed Motion names shared by every animated plugin (`building-blocks.md:110`), and Options that the browser or CSS now owns are dropped rather than kept (`building-blocks.md:85`: `slideSpeed`, `hoverDelay` for Reveal, `animationDuration`, and so on). What it does not do is drop an Option Foundation documents.

Strength: strong. Verdict: adopt with qualification: compose anything beyond Foundation's contract; every documented Foundation Option stays an input; an Option that exists only for jQuery, DOM strings, or timing CSS owns is dropped and listed.

## Principle 6. Small primitives over large components

Principle: many focused building blocks, one responsibility each.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| Prefer focused primitives to feature-rich ones | **Verified** | "Prefer more focused, granular components vs. complex, configurable components" and "Prefer small, focused modules" (`NC/CODING_STANDARDS.md:48-70`) |
| Names `DropdownTrigger`, `DropdownContent`, `AccordionTrigger`, `AccordionPanel`, `TabList`, `Tab`, `TabPanel` | **Refuted** for this library | Names follow Foundation's classes (`AGENTS.md:19`; `building-blocks.md:45`): `NfsAccordionTitle`, `NfsAccordionContent` (`specs/accordion.md:118-121`), `NfsTabs`, `NfsTabsTitle`, `NfsTab`, `NfsTabsPanel` (`specs/tabs.md:125-129`), `NfsDropdownPane`; the draft's names are Aria's classes, which the library hosts under Foundation's names, and the `Nfs` prefix exists because bare names would collide with them (ADR 0009) |
| "Each primitive should have one clearly defined responsibility" | **Unverified** as a test | "Responsibility" is undefined; the effort's testable form is one directive per Structural class, owning that element's class, Variants, State classes, ARIA, and behaviour (`building-blocks.md:14`; ADR 0039) |

Strength: moderate. Verdict: adopt with qualification: the unit is an element of Foundation's markup, not a concern, and the names are Foundation's.

## Principle 7. Behaviour must be composable

Principle: several directives stack on one element without specialised variants; avoid `<nfs-dropdown-button>`.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| `<button nfsButton nfsTooltip ...Trigger>` works | **Verified** in the effort's design | A Trigger binds no class and sits beside `nfsButton` (`building-blocks.md:125`); a close button with a tooltip inside a Reveal still closes the Reveal, because a bare Trigger resolves past the tooltip's own token with `skipSelf` (`specs/tooltip.md:140`) |
| Avoid `<nfs-dropdown-button>` | **Verified** | Triggers are "placed beside rather than hosted" (`building-blocks.md:125`) |
| Behaviour stacks "naturally" | **Refuted** as unconditional | Angular sets a template binding on every directive on the element that declares the input, so `<div nfsCell nfsCallout size="small">` fails to compile against the cell's column count (`building-blocks.md:133`); an un-prefixed utility input would capture another directive's input or a native attribute (`building-blocks.md:78`); an input named after a presentational HTML attribute (`align`) is also set as that attribute and changes rendering (`building-blocks.md:67`); a host binding over a hosted directive's attribute holds only while the hosted value does not change after the host's last write (`building-blocks.md:139`) |

How it applies: stacking needs rules the draft does not state: no two library directives that can share an element declare one input name with different types (where families share a name, the elements nest, `building-blocks.md:133`); tokens provided on an element are skipped by same-element consumers that look for an ancestor (`skipSelf`); a directive whose element is always another family's Structural class hosts that directive through `hostDirectives`, while a behaviour that may sit on any element is written beside (ADR 0041, `adr/0041-menu-plugin-roots-host-menu-directive.md:7`; `building-blocks.md:133`).

Strength: strong. Verdict: adopt with qualification.

## Principle 8. Preserve native HTML

Principle: keep native elements visible and in the consumer's markup.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| `<button nfsButton>`, `<a nfsButton>` | **Verified** | Selector `button[nfsButton]`, `a[nfsButton]`, and `input[nfsButton]` for the submit, button, and reset types (`specs/button.md:135`) |
| `<input nfsInput>`, `<textarea nfsTextarea>` | **Refuted** | Foundation styles them by tag, so they get no directive (ADR 0039, `:10`; `specs/forms.md:28`, `:109`) |
| Benefits: accessibility, form compatibility, browser interoperability | **Verified** | Native elements first (`building-blocks.md:151`); native controls work with Signal Forms and with Reactive and template-driven forms (`specs/slider.md:244`; ADR 0006) |
| Benefits: familiarity, lower learning curve | **Unverified** | No source read measures them |

How it applies: the effort goes further: a selector names the native element wherever semantics depend on it (`button[nfsAccordionTitle]`, `specs/accordion.md:120`; `dialog[nfsReveal]`; `ul[nfsMenu]`, `specs/menu.md:115`; `input[type=range][nfsSliderHandle]`, `specs/slider.md:197`). A hosted directive's selector is ignored (`directive-composition-api.md:29`), so the host's own selector must carry the element restriction. The platform element is not always the right one: the Off-canvas panel is not a `<dialog>` because a closed dialog is `display: none` and always has the `dialog` role, which a revealed sidebar must not carry (ADR 0030); the Accordion is not `<details>` because `<summary>` cannot sit inside a heading (`specs/accordion.md:250`).

Strength: strong. Verdict: adopt with qualification.

## Principle 9. Browser API first

Principle: platform capability, then a light abstraction, then a custom implementation.

The draft's preferred technologies against the Browser target (WF 3.40.0; "widely available on 2026-05-07" means `baseline_high_date` on or before that date):

| Technology | Newly available | Widely available | Usable on 2026-05-07 | Effort record |
| --- | --- | --- | --- | --- |
| `<dialog>` | 2022-03-14 | 2024-09-14 | yes | Used for Reveal (ADR 0007), rejected for Off-canvas (ADR 0030) |
| Popover API (incl. `:popover-open`) | 2025-01-27 (Safari on iOS 18.3) | no | no | Rejected; the named upgrade (ADR 0002) |
| CSS anchor positioning | feature not Baseline in WF 3.40.0 (some keys need Safari 27); core keys newly available 2026-01-13 | no | no | Rejected; the named upgrade (ADR 0002). `research/web-platform-features.md:42` records "newly available 2026-01-13"; WF 3.40.0 now reports the feature as a whole as not Baseline |
| View Transitions (same-document) | 2025-10-14 | no | no | Not used (`building-blocks.md:32`) |
| ResizeObserver | 2020-07-28 | 2023-01-28 | yes | Used (Anchored pane, Drilldown, Equalizer) |
| IntersectionObserver | 2019-03-25 | 2021-09-25 | yes | Used (Sticky, Magellan) |
| `:has()` | 2023-12-19 | 2026-06-19 | no (43 days short) | Not used in library CSS (`building-blocks.md:37`) |
| `:focus-visible` | 2022-03-14 | 2024-09-14 | yes | Foundation's switch already uses it (`FS/scss/components/_switch.scss:153`, `:161`) |
| Container queries (size) | 2023-02-14 | 2025-08-14 | yes | Component-internal sizing only (`building-blocks.md:120`) |
| Container style queries | 2026-05-19 | no | no | Not used (`building-blocks.md:32`) |
| CSS nesting | 2023-12-11 | 2026-06-11 | no | Moot: library CSS is Sass (ADR 0012), whose nesting compiles to flat selectors (a probe with Dart Sass 1.93.2 compiled `.accordion-item { &.is-active { .accordion-title {...} } }` to `.accordion-item.is-active .accordion-title`) |

Other claims:

- "Browser capability, then light abstraction, then custom implementation": **Refuted** as incomplete. The map's order has four named levels, native platform feature, then `@angular/aria`, then `@angular/cdk`, then custom Angular (`map.md:38`; the glossary's Implementation level, `CONTEXT.md:279-281`); "light abstraction" is undefined and untestable.
- The principle has no Baseline gate. The effort's gate is explicit: usable only if every browser of the Browser target supports it (`map.md:45-57`), one code path per behaviour with no progressive enhancement onto a not-usable feature (`building-blocks.md:36`), and each spec's list of platform features to adopt when the target moves (`building-blocks.md:260`).
- A platform feature is used only where it fits Foundation's CSS contract and the APG pattern (ADR 0030; `specs/accordion.md:250`).
- This repository's `AGENTS.md:51-55` puts `@angular/aria` first and asks before falling back; the map's standing preference puts the native platform first (`map.md:38`). The effort's specs follow the map. The guide should state one order and name the other as superseded or scoped.

Strength: strong. Verdict: adopt with qualification.

## Principle 10. Accessibility is a first-class feature

Principle: keyboard, screen readers, focus, reduced motion, ARIA patterns, and high contrast built into every primitive.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| The six listed concerns | **Verified** as needed | `building-blocks.md:149-183`; Aria overview's keyboard, screen reader, focus, and RTL list (`NG/adev/src/content/guide/aria/overview.md:57-62`) |
| High contrast modes | **Verified** | `forced-colors` widely available since 2025-03-12 (WF); Material: "Support styles for Windows high-contrast mode" (`NC/CODING_STANDARDS.md:388-396`); the Switch mixin paints in system colours under forced colours (`building-blocks.md:171`) |
| "ARIA patterns where required" | **Verified** with a sharper form | APG: "A role is a promise" (`APG/content/practices/read-me-first/read-me-first-practice.html:26-33`); the effort: no role without its full keyboard table (`building-blocks.md:150`) |
| "Built into primitives rather than added afterwards" | **Verified** | Each directive owns the ARIA and checks its documented markup lacks, because Foundation's own examples fail WCAG 2.2 AA (ADR 0039, `:10`) |

What the principle lacks: a conformance target and a gate. The effort's are WCAG 2.2 AA, the matching APG pattern, and axe under the six WCAG 2.2 AA tags as the enforcing story gate (`map.md:42`; ADR 0022; ADR 0018; `building-blocks.md:182`); Sass compile-time checks with the exact unrounded ratio where axe has no rule (`building-blocks.md:149`, `:159`, `:180`); and first-paint ARIA in the server HTML (`building-blocks.md:198`). "Should support" is untestable without them.

Strength: strong. Verdict: adopt with qualification.

## Principle 11. Prefer CSS state over framework state

Principle (draft): let the browser manage UI state; prefer `:open`, `:popover-open`, `:focus-visible`, `:checked`, `:disabled`, `:has()` to `isFocused`, `isHovered`, `isOpen` signals.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| `:open` | **Refuted** as usable | Newly available 2026-05-11 (WF), four days after the target date |
| `:popover-open` | **Refuted** as usable | Part of Popover, newly available 2025-01-27 (WF) |
| `:focus-visible` | **Verified** | Widely available since 2024-09-14 (WF) |
| `:checked`, `:disabled` | **Verified** | "Input selectors", widely available since 2018-01-29 (WF) |
| `:has()` | **Refuted** as usable | Widely available from 2026-06-19 (WF); banned in library CSS (`building-blocks.md:37`) |
| Avoid an `isOpen` signal | **Refuted** for this library | Every Openable has an `isOpen` model (`building-blocks.md:79`), because Triggers render `aria-expanded` from it (`building-blocks.md:125`), Foundation styles open panes by class (`.dropdown-pane.is-open`, `FS/scss/components/_dropdown.scss:64`), first-paint state must be a host binding on signal state (`building-blocks.md:198`), and consumers bind it two ways; even the Reveal on a native `<dialog>` keeps `isOpen` (ADR 0007) |
| Avoid `isHovered`, `isFocused` | **Verified** in part | No spec read here exposes a hover or focus signal as public state; hover opening uses non-replayed `pointerenter`/`pointerleave` handlers with a hover-intent timer, and replayed `focusin` handlers re-check live focus (`building-blocks.md:202`); where focus must be tracked across a swap it is recorded from `focusin`/`focusout` host listeners, internally (`building-blocks.md:94`). The state that matters is the open state, not the hover or the focus |

Where Foundation's contract decides: Foundation itself styles platform state where it can: `[disabled]` (`FS/scss/components/_button.scss:199-201`, `FS/scss/components/_accordion.scss:65`), `:focus` (`_accordion.scss:108`), `[aria-selected='true']` (`FS/scss/components/_tabs.scss:102-103`), and `input:checked`, `:focus-visible`, `:disabled` (`FS/scss/components/_switch.scss:143-172`). There the principle holds, and the directives bind the platform state rather than a class: the Accordion renders `[attr.disabled]` so Foundation's rule applies (`specs/accordion.md:124`); the Switch has no model, output, or method, because a `checked` model would be "a second source for the value Angular Forms and the platform own" (`specs/switch.md:434`, D8); ADR 0042 marks the current page with `aria-current` and gives it Foundation's active look through the `menu-state-active` mixin, "so one attribute gives the announcement and the look" (`adr/0042-menu-current-page-aria-current.md:7`). Where Foundation styles state by class (`.is-active`, `_accordion.scss:102`, `:121`; `.is-open`, `_dropdown.scss:64`; `.is-stuck`, `FS/scss/components/_sticky.scss:16`; `.is-visible`, `FS/scss/forms/_error.scss:85`), the class is the contract and the directive binds it from signal state (ADR 0039).

Testable form: one source per state. The platform's state (a native attribute, an ARIA attribute, or a pseudo-class in the Browser target) wherever Foundation's CSS or a Library mixin can style it; otherwise Foundation's State class, bound by a host binding from signal state; never both as independent sources.

Strength: strong. Verdict: adopt with qualification.

## Principle 12. Template readability is a primary goal

Principle: consumers understand structure by reading markup; content-driven structures are markup, not `[items]` data.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| "Angular templates are the main API surface" | **Verified** in part | Consumers meet directives in templates, but the TypeScript surface is public API too: tokens, Defaults token interfaces, methods, and `exportAs` references (`specs/accordion.md:160-211`), and provider functions such as `provideNfsRuntimeChecks` (`building-blocks.md:140`) |
| `<ul nfsMenu>` | **Verified** | `ul[nfsMenu]` (`specs/menu.md:115`) |
| `<a nfsMenuItem>` | **Refuted** | A menu link has no Foundation class; ADR 0042 rejected "a link directive with Material's `activated` input ... a directive on every link for a state the attribute already holds" (`adr/0042-menu-current-page-aria-current.md:12`); the only item-level directive is `li[nfsMenuText]` for `.menu-text` (`specs/menu.md:116`) |
| `<nfs-menu [items]>` is less desirable | **Verified** | Server HTML is the consumer's markup (ADR 0001, `:11`); Aria asks consumers to "provide the HTML structure" (`aria/overview.md:8`); parent-owned registration survives `@for`, `@defer`, Lazy content, and projection (`building-blocks.md:137`) |
| "Developers should understand structure by reading markup" | **Unverified** as a test | Testable form: the consumer's markup keeps the element structure of Foundation's docs markup, with directive attributes where the docs write classes (`building-blocks.md:22`; ADR 0039, `:22`) |

Qualification: data-shaped Options stay data: Breakpoint rules objects and rule strings (`building-blocks.md:121`), Interchange rules, the Slider's `displayWith` (`specs/slider.md:221`).

Strength: strong. Verdict: adopt with qualification.

## Principle 13. Minimise public API surface

Principle (draft): ask five questions before adding an input; prefer 2-5 inputs to 20+.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| "Will removing it later be impossible?" | **Verified** | "Once a feature is released, it never goes away" (`NC/CODING_STANDARDS.md:72-78`); Angular removes an API only in a major release after a deprecation period (`NG/adev/src/content/reference/releases.md:116-123`) |
| "Is the feature genuinely common?" | **Unverified** as a test | No measure is given |
| Composition, CSS, another directive first | **Verified** | The effort drops Options CSS or the browser now owns (`building-blocks.md:85`) and composes Triggers, the Positioner, and Motion (principle 5) |
| Prefer 2-5 inputs | **Refuted** for this library | Every `data-*` Option is an input (`map.md:40`; `building-blocks.md:59`) and every Variant family is one input (ADR 0040; `building-blocks.md:60`). The published APIs: `NfsReveal` 17 inputs and the `isOpen` model (`specs/reveal.md:183-202`), `NfsDropdownPane` 16 and `isOpen` (`specs/dropdown.md:206-224`), `NfsOffCanvas` 12 (`specs/off-canvas.md:188`), `NfsSlider` 11 (`specs/slider.md:181`), `NfsGridX` 8 (`specs/xy-grid.md:157-166`), `NfsAccordion` 7 (`specs/accordion.md:172-185`) |

Replacement: every input traces to a Foundation Option, a Variant family, an APG or WCAG requirement, or a Material API precedent, and its JSDoc names the Foundation equivalent (`AGENTS.md:20-23`; `building-blocks.md:67`); dropped Options are listed per spec (`building-blocks.md:85`); one API per concept (`NC/CODING_STANDARDS.md:77-78`). The draft's own principle 4 example (a public `collapsed` beside `expanded`) breaks this principle.

Strength: strong. Verdict: adopt the questions (with the first made testable), reject the count.

## Principle 14. Layout primitives should be extremely simple

Principle (draft): Stack, Cluster, Grid, Cell, Sidebar, Switcher, each solving one layout problem.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| Stack, Cluster, Sidebar, Switcher | **Unverified** provenance, and **refuted** for this library | Not Foundation's vocabulary; the Destination is one spec per Foundation docs page (`map.md:13`), and the library "never re-implements styles Foundation already has; custom CSS only for what Foundation cannot express" (`map.md:39`; `AGENTS.md:28`); Foundation already covers stacking and wrapping with `.grid-y`, the Flexbox Utilities, the Media Object's `stackFor`, and the Prototype spacing classes (`map.md:285-286`; `specs/xy-grid.md:152-178`), so these four would be new CSS, not Foundation's |
| Grid, Cell | **Verified** as Foundation concepts | `NfsGridX`, `NfsGridY`, `NfsCell` (`specs/xy-grid.md:152-178`; `building-blocks.md:45`) |
| Layer 4 as `<nfs-stack>`, `<nfs-grid>`, `<nfs-cluster>` elements | **Refuted** | ADR 0001 and ADR 0039 give layout systems attribute directives; a host element between `.grid-x` and its cells breaks Foundation's child-combinator selectors (`FS/scss/xy-grid/_classes.scss:72-100`) |
| "Solve one layout problem well", no configuration sprawl | **Verified** in part | The grid directives have no state: "Models, outputs, and methods: none ... `exportAs`: none" (`specs/xy-grid.md:194`); but not few inputs (`NfsGridX` has 8, one per Variant family) |

Strength: strong. Verdict: reject the primitive set and the element components; keep "layout directives carry no state, models, outputs, or methods" as a qualification.

## Principle 15. Smart components belong outside the library

Principle: the library owns presentation and interaction primitives; business logic, API calls, state management, domain workflows, and application architecture stay out.

Claims checked:

| Claim | Check | Evidence |
| --- | --- | --- |
| The include and exclude lists | **Verified** in the main | "Keep components and directives focused on presentation" (`NG/adev/src/content/best-practices/style-guide.md:153-158`); library declarations "should be designed as stateless" (`NG/adev/src/content/tools/libraries/creating-libraries.md:171-172`); services only for state shared across instances (`building-blocks.md:97`) |
| "Applications own behaviour" | **Refuted** as stated | The library owns every behaviour a Foundation plugin had: deep links with History API writes (`specs/accordion.md:244`), validation patterns as Signal Forms schema helpers (ADR 0006), the Breakpoint service (`building-blocks.md:117-118`) |

Strength: strong. Verdict: adopt with qualification: the line is Foundation's plugin behaviour (in) against application behaviour (out).

## The four layers

- Layer 1 (styling directives) and Layer 2 (behaviour directives) as separate layers: **refuted** as a split. One directive per Structural class holds both: `NfsAccordionTitle` binds `.accordion-title` and hosts Aria's `AccordionTrigger` (`specs/accordion.md:120`, `:142-143`). A styling directive plus a behaviour directive on one element is two attributes for one element, which ADR 0041 rejected for menu roots: "two attributes for one element, and a forgotten one leaves the menu unstyled" (`adr/0041-menu-plugin-roots-host-menu-directive.md:12`). What survives of Layer 2 is the behaviour that may sit on any element and binds no class of its own, written beside a class directive: Triggers, Smooth Scroll, Magellan (`building-blocks.md:125`, `:133`).
- Layer 1's "optionally map variants to classes": **refuted**. Every Variant family is a typed input (ADR 0040; `building-blocks.md:60`).
- Layer 2's examples (`nfsTooltipTrigger`, `nfsAccordionTrigger`, `nfsDropdownTrigger`): **refuted** as names (`nfsTooltip` on the trigger, `specs/tooltip.md:167`; `button[nfsAccordionTitle]`; `nfsOpen`/`nfsToggle`).
- Layer 3 (coordinating components): **rejected** (principle 3). Shared state, keyboard patterns, and context propagation are parent-directive responsibilities in Aria and in the effort.
- Layer 4 (layout primitives): **rejected** (principle 14).
- Missing kinds: shared utilities with their own specs (Breakpoint service, Triggers, Anchored pane with its Positioner and Light dismiss registry, Nested menu, Variant declaration tooling; `building-blocks.md` Part 3; ADR 0002); the Sass side, one Library mixin per entry point (ADR 0012); the Runtime checks (ADR 0040).
- Word choice: the effort uses "layer" for its four testing layers (`building-blocks.md:212-221`), and the glossary lists "layer" among the words to avoid for Implementation level (`CONTEXT.md:279-281`). The guide should name these kinds some other way.

## The decision framework

| Rule | Check | Verdict | Evidence |
| --- | --- | --- | --- |
| "Is this only styling? Use a directive." | **Verified** with a condition | Adopt with qualification: only when Foundation gives the element a class; an element styled only by tag gets none | ADR 0039, `:10`, `:29` |
| "Is this behaviour on a native element? Use a directive." | **Verified** | Adopt | ADR 0001; `building-blocks.md:151` |
| "Does it coordinate multiple elements? Use a component." | **Refuted** | Reject; replace with "Is there markup the consumer cannot write (a generated element, an inner element the CSS needs, one of two trees)? Then a component, with an attribute selector when it sits on a consumer element. Otherwise coordination is a parent directive with a lightweight token." | `directives/overview.md:17`; `NC/src/aria/accordion/accordion-group.ts:62-69`; `NC/src/material/expansion/accordion.ts:32-40`; ADR 0001 |
| "Is it business logic? Do not include it." | **Verified** with a condition | Adopt with qualification: Foundation's plugin behaviour is in | principle 15 |
| "Does the browser already provide it? Use the browser feature first." | **Verified** in intent, **refuted** in placement | Adopt with qualification: ask it first, not last, and only within the Browser target and where the feature fits Foundation's CSS and the APG | `map.md:38`, `map.md:45`; ADR 0030 |

Questions the framework lacks, each of which decided specs in this effort: Does Foundation document it (a docs page, a class, an Option)? (`map.md:13`) Does Aria, then CDK, provide it? (`map.md:38`) Does it render correctly on the server, before hydration, and under replay? (ADR 0008) Which Foundation name does each input take? (`building-blocks.md:59-67`) Which entry point owns it? (`building-blocks.md:52`)

Internal contradictions of the draft, collected: the core philosophy and principle 3 against principles 1, 6, and 7; principle 4's public `collapsed` against principle 13; principle 11's "avoid `isOpen`" against principle 4's `expanded = model(false)`; principle 5's avoided options and principle 13's count against Foundation's Options; principle 14 and Layer 4's element components against principle 1's "avoid custom elements"; the decision framework's last question against principle 9's order; Layers 1 and 2 against "reduce DOM wrappers" in spirit (two attributes where one directive suffices).

## Principles the draft lacks

### A. Rendering modes are a design input for every directive

Principle: every directive and component renders its first-paint state on the server as host bindings, touches no browser API before hydration, keeps primary activation replayable, and stays inside one hydration boundary with its parent.

Evidence: the user's rule (`map.md:44`); ADR 0008; `building-blocks.md:187-208`. Angular: direct DOM manipulation and `innerHTML` break hydration (`NG/adev/src/content/guide/hydration.md:103-111`); invalid HTML structure in a template is a mismatch (`hydration.md:113-121`); `ngSkipHydration` "can only be used on component host nodes" (`hydration.md:169`), so a directive has no escape hatch; render callbacks run only in the browser (`effect.md:203-207`); event replay covers only template and `host` listeners of listed native events, and `preventDefault()` throws during replay (`building-blocks.md:194`).

Application: this rule, more than any draft principle, decides directive against component (a component that re-renders the consumer's markup mismatches), where state lives (host bindings on signals), and when `effect()` is allowed (never for DOM, `history`, or timers). Strength: strong. Verdict: add.

### B. Entry points and tree shaking

Principle: one secondary entry point per plugin, family, or shared utility; lightweight tokens between entry points; nothing a consumer does not call reaches its bundle.

Evidence: entry points "define the granularity at which code can be lazily loaded", and "The general rule for APF packages is to use entrypoints for the smallest sets of logically connected code possible", Material publishing one per component (`NG/adev/src/content/tools/libraries/angular-package-format.md:136-159`); `"sideEffects": false` (`angular-package-format.md:239-248`); preventing retention is "the responsibility of the library developer" through lightweight tokens (`NG/adev/src/content/guide/di/lightweight-injection-tokens.md:12-18`, `:71-93`); global providers through a `provideXYZ()` function, and imports across entry points by package path (`creating-libraries.md:164`, `:188-189`). The effort: `ngx-foundation-sites/<plugin>` so a consumer's `@defer` splits per plugin (`building-blocks.md:52`; ADR 0008, Considered options), Variant registries in the primary entry point used as types only (ADR 0040, `:44`), the production checker reachable only through `provideNfsProductionRuntimeChecks` (measured 87 bytes against 895, ADR 0040 `:37`), and a token instead of a class so "every menu bundle" does not keep the Top Bar's directive class (ADR 0043, `adr/0043-menu-root-top-bar-right-section-token.md:13`).

Strength: strong. Verdict: add.

### C. Forms integration

Principle: the native control carries the value; a directive that owns a value implements one Signal Forms contract; a styled native control gets no value API.

Evidence: "Do not implement both `ControlValueAccessor` and `FormValueControl`/`FormCheckboxControl` on the same component" (`NG/adev/src/content/guide/forms/signals/migration.md:460-462`), and a Signal Forms control works with Reactive and template-driven forms as-is (`migration.md:455-458`); `FormValueControl` for single values, `FormCheckboxControl` for on/off state (`NG/adev/src/content/guide/forms/signals/custom-controls.md:124-140`). The effort: `NfsSliderHandle implements FormValueControl<number>` on a native range input, with `ngNoCva` documented because Angular's built-in `RangeValueAccessor` also matches `formControlName` and would bypass the model (`specs/slider.md:197`, `:244`, D4 at `:571`); the Switch keeps the native checkbox's `checked` and adds no model (`specs/switch.md:434`); Abide becomes Signal Forms plus error-binding directives (ADR 0006); Material's rule to expose native inputs through `ng-content` rather than render them (`NC/CODING_STANDARDS.md:274-305`) keeps the native control in the consumer's markup, and with it (by reasoning, not measured here) native form submission and constraint validation.

Strength: strong. Verdict: add.

### D. The CSS side: Foundation's Sass is the theme, Library mixins carry the rest

Principle: the consumer compiles Foundation's Sass from its own settings; the library ships no component styles, only documented Library mixins imported after Foundation; Sass settings stay compile-time and never become inputs; no runtime theming API.

Evidence: ADR 0012 (`:7`, `:21-22`); `building-blocks.md:225-238` (runtime theming through CSS custom properties is out of scope, `:227`; no `styles` or `styleUrl`, `:238`); Sass booleans are compile-time configuration, not inputs (`AGENTS.md:23`); Variant properties are a verification channel, not theming (`building-blocks.md:234`; ADR 0040); no Shadow DOM (`building-blocks.md:193`). The draft has no CSS side at all, although every published spec has a Sass subsection (`building-blocks.md:236-238`).

Strength: strong. Verdict: add.

### E. Naming

Principle: every public name derives from Foundation or from the Angular convention the effort adopted, by a stated rule.

Evidence: directive selectors camelCase with the prefix (`NG/adev/src/content/best-practices/style-guide.md:135-143`), component selectors dash-case with the prefix (`selectors.md:113-121`, `:145-146`), both in Material's standard (`NC/CODING_STANDARDS.md:247-252`); classes `Nfs` plus the Foundation Structural class, tokens `nfsXToken` (ADR 0009; `AGENTS.md:19`, `:24`; `building-blocks.md:45`, `:53`); inputs from Foundation `data-*` names (`AGENTS.md:20-22`; `building-blocks.md:59`), Variant inputs by the four-step naming order (`building-blocks.md:61-67`), never after a presentational HTML attribute (`building-blocks.md:67`); outputs and methods in Material's vocabulary with the `isX` rule (`building-blocks.md:54`); `exportAs` as the directive's camelCase name, as Aria does (`exportAs: 'ngAccordionGroup'`, `NC/src/aria/accordion/accordion-group.ts:63`). The draft's example names break these rules in at least seven places (summary item 7).

Strength: strong. Verdict: add.

### F. Host-directive limits

Principle: use `hostDirectives` knowing its fixed limits.

Evidence: host directives are applied "statically at compile time. You cannot dynamically add directives at runtime", and the hosted directive's selector is ignored (`directive-composition-api.md:26-29`); hosted inputs and outputs are hidden unless listed (`:22`, `:31-33`); the host's bindings apply after the hosted directive's (`:109-131`), but a binding writes only when its own value changes, so overriding an Aria value that can still change loses (`building-blocks.md:139`); one hosted input under two aliases is NG8024 (`directive-composition-api.md:239-266`; ADR 0041, `:18`); a wrapper cannot change a hosted input's default (`building-blocks.md:87`) or set a hosted `input.required` from code (`building-blocks.md:139`: Aria's `AccordionTrigger.panel`); since Angular 22.0 a directive reached several times is created once and a template match wins (`directive-composition-api.md:170-237`; ADR 0041, `:7`). Consequence: no conditional host directive, so a mode that swaps patterns needs a component template (principle 3).

Strength: strong. Verdict: add.

### G. Composition over inheritance

Principle: the library extends behaviour through `hostDirectives` and directives beside each other, never through a consumer subclass.

Evidence: the user's rule (`map.md:37`); Material: "Avoid using inheritance to apply reusable behaviors to multiple components" (`NC/CODING_STANDARDS.md:254-258`); a subclass inherits "host bindings, inputs, outputs, lifecycle methods" (`NG/adev/src/content/guide/components/inheritance.md:23-24`) but, as measured by the effort, not `providers`, the selector, or `exportAs`, so a child that finds its parent through a token silently stands alone (ADR 0040, `:29`; `building-blocks.md:132`).

Strength: strong. Verdict: add.

### H. One source of truth per state

Principle: each state has one writer and one representation; the look and the announcement come from the same source.

Evidence: "Always prefer sticking to a single API for accomplishing something" (`NC/CODING_STANDARDS.md:77-78`); `aria-current` as the only current-page source (ADR 0042); no `checked` model beside the native checkbox (`specs/switch.md:434`); one forms contract, not two (`migration.md:460-462`); initial state is bound, never read from a class (`building-blocks.md:80`). This is the tested form of the draft's principle 11.

Strength: strong. Verdict: add.

### I. Parent discovery follows the declaration site

Principle: children find parents through lightweight tokens; DI follows the template that declares the child, not the DOM.

Evidence: `AGENTS.md:59-85`; `building-blocks.md:131` (required injection when the child cannot exist alone, optional with a development warning when it may), `:134` (projection can hide a provider; one DOM walk after hydration, only when the token is absent; ADR 0043), `:137` (parent-owned registration, not `contentChildren`), `:138` (template references for non-nested links). The draft's "context propagation" (Layer 3) names the need and none of these rules.

Strength: strong. Verdict: add.

### J. Development-mode checks

Principle: every misuse a type cannot catch is reported once in development builds, and costs production nothing.

Evidence: Angular's own packages guard development checks with `typeof ngDevMode === 'undefined' || ngDevMode` (`NC/src/aria/accordion/accordion-group.ts:119`, `NC/src/aria/tabs/tab-list.ts:152`, `NC/src/cdk/a11y/focus-trap/focus-trap.ts:185`; 125 references across Material, CDK, and Aria outside specs); the application builder defines `ngDevMode` as `false` when scripts are optimised (`CLI/packages/angular/build/src/tools/esbuild/application-code-bundle.ts:655`, from the 22.0.x clone). Caveat: `ngDevMode` is declared in `NG/packages/core/src/util/ng_dev_mode.ts:26` but does not appear in `NG/goldens/public-api/core/index.api.md`; it is a convention of Angular's own packages, not documented public API. The effort: per-spec development checks (for example `specs/accordion.md:246`), `HostAttributeToken` reads in development only (`building-blocks.md:80`), Runtime checks on by default in development and opt-in in production (ADR 0040, `:13`, `:49`); layer 4 runs a production build and sees none of them (ADR 0018, Consequences, `adr/0018-browser-testing-stack.md:24`).

Strength: strong. Verdict: add.

### K. Internationalisation and direction

Principle: the library renders no human-readable string of its own; every label, role description, and formatted value comes from consumer markup or a consumer function; direction comes from `Directionality`, and library CSS uses logical properties.

Evidence: Orbit's `aria-roledescription` and labels are "Consumer markup (localised strings)" (`specs/orbit.md:309`, `:313`); the Slider formats spoken values through the consumer's `displayWith` (`specs/slider.md:221`); `Directionality.valueSignal`, never `html[dir]` reads, and logical properties (`building-blocks.md:99`); Foundation's Sass handles direction through `$global-right` (`FS/scss/components/_accordion.scss:116`); Aria handles reversed navigation for right-to-left languages (`aria/overview.md:62`). Browser target: logical properties are widely available since 2024-03-20, `:dir()` only from 2026-06-07 (WF), so library CSS cannot use `:dir()`. Material uses injectable Intl services for its own strings (`research/angular-material-reference.md:1287`), which a library with no strings does not need. Open point: the Slider's fallback `aria-valuetext` for a non-linear handle is "the value as text" (`specs/slider.md:258`); the spec does not say which locale formats it.

Strength: moderate (the rule is implicit in the specs, not recorded as a decision). Verdict: add.

### L. The test surface

Principle: the library's public test surface is stated: Foundation's classes, ARIA, and Story ids, and whether component harnesses ship.

Evidence: harnesses are "a supported API that interacts with the widget the same way an end-user does", so "implementation changes now become less likely to break user tests", and Material ships one per component (`NG/adev/src/content/guide/testing/component-harnesses-overview.md:19-21`). The effort: four layers (ADR 0018; `building-blocks.md:212-221`), DOM-first assertions and "no custom harness classes in the first specs" (`building-blocks.md:221`), Story ids and arg names as contracts whose rename is breaking (`storybook-conventions.md:39`, `:298`). Because Foundation's classes and ARIA are the public contract here (ADR 0039), consumer tests can rely on them, which weakens the case for harnesses; but whether harnesses ship is a public-API decision, and the effort records it only as "not in the first specs".

Strength: moderate. Verdict: add (as a rule the guide states, not a new decision).

### M. Deprecation and versioning

Principle: a public API is removed only after a deprecation period and in a major release, with an update path; the library states how its versions follow Angular's, Foundation's, and the Browser target's.

Evidence: Angular's policy: a deprecated API stays "in at least the next major release (period of at least 12 months)", removal "only in major release", `@deprecated` annotations with an update path (`NG/adev/src/content/reference/releases.md:116-123`); an update schematic "so that `ng update` can ... provide migrations for breaking changes" (`creating-libraries.md:201-203`); the CDK marks removals with `@breaking-change <version>` (`research/angular-cdk-inventory.md:119`, `:272`); "Once a feature is released, it never goes away" (`NC/CODING_STANDARDS.md:72-78`); the components repository versions with Angular (both 22.2.0 here). Drivers specific to this library: the Browser target follows Angular's (`map.md:45`), and every spec names the platform features it adopts when the target moves (`building-blocks.md:260`; ADR 0002 names native `popover` plus anchor positioning), which changes consumer-visible behaviour (a top-layer pane escapes `overflow` clipping that the in-place pane accepts, ADR 0002 Consequences); `foundation-sites` is a peer at `^6.9.0`, and Dart Sass 3's removal of `@import` stops Foundation 6.9 and the library compiling together (ADR 0012, Consequences). No record in `map.md`, `building-blocks.md`, `CONTEXT.md`, or the ADRs states a policy (searched for deprecation, semver, breaking change, and `ng update`; none found).

Strength: moderate (strong sources, no effort decision). Verdict: add; the guide should mark the policy itself as undecided.

## What the guide author must not miss

1. The component criterion is a template, not coordination (principle 3); the evidence is Angular's docs, Aria's all-directive shape, and Material's directive `MatAccordion`, all in the local 22.2 clones.
2. Do not carry the draft's example names into the guide: `nfsCardHeader`, `nfsMenuItem`, `nfsInput`, `nfsTextarea`, `nfsDropdown`, and the Trigger/Panel/Content family names contradict Foundation's classes and ADRs 0039 and 0042.
3. Every platform feature the guide names needs its Baseline date; five of the draft's nine CSS state selectors and technologies fail the target. `research/web-platform-features.md:42` and web-features 3.40.0 disagree on anchor positioning's status; both put it outside the target.
4. `building-blocks.md:92`'s "history writes, timers" in `effect()` conflicts with 1.11 decisions 3 and 4 (`building-blocks.md:200-201`); the guide should state the stricter rule.
5. `AGENTS.md:51-55` (Aria first, ask before falling back) and `map.md:38` (native first) state different orders.
6. "Layer" already means a testing layer in this effort and is a word the glossary avoids for Implementation level.
7. The silent failure of an attribute directive that was not imported has no mitigation recorded.
8. `ngDevMode` is a convention, not documented public API; the one CLI fact above comes from a 22.0.x clone.
9. Deprecation and versioning has no recorded decision, internationalisation has no recorded rule, and the harness question is decided only for the first specs; the guide can state principles for them but should not present them as decided.

## Closing table

| Principle | Verdict | One-line reason | Key source |
| --- | --- | --- | --- |
| Vision and core philosophy | Adopt with qualification | Foundation's CSS and no Foundation JavaScript hold; "components for coordination" and "encapsulates styling" do not | `map.md:19`; `directives/overview.md:17`; ADR 0012 |
| 1. Directive-first | Adopt with qualification | Right, as ADR 0001's rule with three exceptions; record the silent-import cost | ADR 0001; `selectors.md:125-142` |
| 2. Every Foundation concept may have a directive | Adopt with qualification | "Must" for every Structural class, "none" for tag-styled elements | ADR 0039 `:10` |
| 3. Components exist for coordination | Reject | Components exist for markup the consumer cannot write; coordination is a parent directive with a token | `directives/overview.md:17`; `NC/src/aria/accordion/accordion-group.ts:62-69`; `NC/src/material/expansion/accordion.ts:32-40` |
| 4. Signals-first public APIs | Adopt with qualification | `effect()` is not public API and runs on the server; `model()` has no transform; boolean inputs need transforms | `effect.md:19-32`; `model_signal.ts:32-43`; `template-typecheck.md:239-265` |
| 5. Composition over configuration | Adopt with qualification | Compose beyond Foundation's contract; Foundation's Options stay inputs | `map.md:40`; `specs/dropdown.md:206-224` |
| 6. Small primitives | Adopt with qualification | One directive per Structural class, named after Foundation's class | `NC/CODING_STANDARDS.md:48-70`; `building-blocks.md:45` |
| 7. Behaviour composable | Adopt with qualification | Needs rules on shared input names, `skipSelf`, and hosting against beside | `building-blocks.md:133`; ADR 0041 |
| 8. Preserve native HTML | Adopt with qualification | Right; selectors name the element; tag-styled inputs get no directive; the platform element must fit the APG | `specs/forms.md:28`; ADR 0030 |
| 9. Browser API first | Adopt with qualification | Only within the Browser target, in the map's four-level order, one code path | WF 3.40.0; `map.md:38`, `:45`; `building-blocks.md:36` |
| 10. Accessibility first-class | Adopt with qualification | Needs WCAG 2.2 AA, the APG pattern, and the axe gate as the test | ADR 0022; `APG/.../read-me-first-practice.html:26-33` |
| 11. CSS state over framework state | Adopt with qualification | One source per state; platform state where Foundation or a mixin styles it, else Foundation's State class; `:open`, `:popover-open`, `:has()` are out | `FS/scss/components/_switch.scss:143-172`; ADR 0042; WF 3.40.0 |
| 12. Template readability | Adopt with qualification | Content-driven markup in Foundation's element structure; data-shaped Options stay data | ADR 0001; `aria/overview.md:8` |
| 13. Minimise public API surface | Adopt with qualification (questions); reject the count | Inputs trace to Foundation Options and Variant families, 7 to 18 per container | `NC/CODING_STANDARDS.md:72-78`; `specs/reveal.md:183-202` |
| 14. Layout primitives | Reject | Not Foundation's; new CSS; element components break child combinators | `map.md:13`, `:39`; `FS/scss/xy-grid/_classes.scss:72-100` |
| 15. Smart components outside | Adopt with qualification | Foundation's plugin behaviour is in; application behaviour is out | `style-guide.md:153-158`; ADR 0006 |
| Layers 1 and 2 | Reject the split | One directive per element holds class and behaviour; free behaviours sit beside | `specs/accordion.md:142-143`; ADR 0041 `:12` |
| Layer 3 | Reject | Coordination is directive work | principle 3 |
| Layer 4 | Reject | principle 14 | principle 14 |
| Decision framework | Adopt with qualification | Rules 1, 2, 4, 5 hold with conditions; rule 3 is replaced; the platform question goes first; five questions are missing | ADR 0001; `map.md:38` |
| A. Rendering modes | Add | Decides directive against component, where state lives, and what may run before hydration | ADR 0008; `hydration.md:103-121`, `:169` |
| B. Entry points and tree shaking | Add | Per-plugin entry points, lightweight tokens, opt-in production code | `angular-package-format.md:136-159`; `lightweight-injection-tokens.md:12-18` |
| C. Forms integration | Add | Native value carriers; one Signal Forms contract; `ngNoCva` where built-in accessors also match | `forms/signals/migration.md:455-462`; `specs/slider.md:244` |
| D. Sass and theming | Add | Foundation's settings are the theme; Library mixins; no component styles | ADR 0012; `building-blocks.md:225-238` |
| E. Naming | Add | Every name by a stated rule from Foundation or Angular | ADR 0009; `style-guide.md:135-143`; `building-blocks.md:45-67` |
| F. Host-directive limits | Add | Static, selector ignored, defaults and required inputs out of reach, no conditional hosting | `directive-composition-api.md:22-33`, `:170-266` |
| G. Composition over inheritance | Add | The user's rule; a subclass loses providers, selector, `exportAs` | `map.md:37`; ADR 0040 `:29` |
| H. One source of truth per state | Add | One writer and one representation per state | `NC/CODING_STANDARDS.md:77-78`; ADR 0042 |
| I. Declaration-site DI | Add | Tokens, required or optional injection, projection, registration | `AGENTS.md:59-85`; `building-blocks.md:131-138` |
| J. Development-mode checks | Add | Report misuse once in development, nothing in production | `NC/src/aria/accordion/accordion-group.ts:119`; ADR 0040 |
| K. Internationalisation and direction | Add | No library strings; `Directionality`; logical properties; no `:dir()` | `specs/orbit.md:309`; `building-blocks.md:99`; WF 3.40.0 |
| L. Test surface | Add | State the public test surface and the harness decision | `component-harnesses-overview.md:19-21`; `building-blocks.md:221` |
| M. Deprecation and versioning | Add | Angular's policy applies; the target and Foundation move; no policy recorded | `releases.md:116-123`; ADR 0002; ADR 0012 |
