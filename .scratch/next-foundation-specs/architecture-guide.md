# Architecture guide: directives and components

Ticket: [Decide: the directive and component architecture guide](issues/141-decide-directive-component-architecture-guide.md). Written 2026-09-28 from the three findings files of [Research: directive and component architecture principles for Angular UI libraries](issues/140-research-directive-component-architecture-principles.md) (`research/architecture-angular-ecosystem.md`, `research/architecture-headless-primitives.md`, `research/architecture-principles-critique.md`), tested against the map's Notes, the ADRs, and `building-blocks.md`, and revised the same day after the critic's review (`research/architecture-guide-review.md`, 39 points, all applied). The user's draft (`research/architecture-principles-user-draft.md`) is inspiration for the shape of this guide, not a source: every principle here is backed by a primary source or a recorded decision, and the draft's example names, most of which are not Foundation's, are not used.

Precedence: the map's Notes (Standing preferences, Design criteria, the user's rulings), the ADRs, and `building-blocks.md` outrank this guide. Where a principle restates one of them it cites it and does not change its substance. Where this guide adds a rule no record covers, the principle says "New" in its Decided-by line and the ticket's Answer rates it under the map's triage rule; a provisional rule is marked as such, is not audited, and is not yet a decision.

How to audit a spec against it: each principle has one rule. For each, an auditor answers "meets it" or "falls short, at <section>" from the spec's class mapping, hierarchy and DI shape, API, ARIA and keyboard tables, rendered HTML, rendering modes, Sass subsection, and Testing Decisions (building-blocks 1.14). The Preferred and Avoided examples are real names from published specs and Foundation's real classes; a spec that matches an Avoided form falls short. A finding is recorded once, under the lowest-numbered principle it falls short of; other principles it touches are cited, not counted.

Glossary terms (CONTEXT.md) are used as written: Plugin, CSS-only component, Structural class, Variant class, State class, Utility class, Trigger, Openable, Implementation level, Browser target, Rendering modes, Library mixin, Wrapper component, Variant input, Utility attribute, Defaults token. The kinds of building block below are called kinds: the effort uses "layer" for the four test layers of ADR 0018 only.

## Statement of intent

The library gives every Foundation for Sites 6.9 UI component, layout system, and utility family its Angular-native form: attribute directives on the elements the consumer writes, which set every Foundation and library class and own the ARIA, the keyboard, and the behaviour Foundation's jQuery plugins had, over Foundation's own Sass compiled from the consumer's settings (map, Domain and Standing preferences; ADR 0039). A component exists only where Foundation generated markup the consumer never writes (ADR 0001). State is signals reflected outward as host bindings, so the server HTML is the first paint in every rendering mode (ADR 0008). Each behaviour is built on the first Implementation level that covers it inside the Browser target: native platform, then `@angular/aria`, then `@angular/cdk`, then custom Angular (map, Standing preferences). WCAG 2.2 AA and the matching APG pattern are requirements enforced by tests, never recommendations (ADR 0022). Behaviour composes through `hostDirectives` and directives written beside each other; nothing is subclassed (map, user rule of 2026-09-27).

## Kinds of building block

A directive can be of more than one kind at once (`ul[nfsAccordion]` is a class directive and a coordinating directive). The kind decides which principles apply.

| Kind | What it is | Decided by | Examples |
| --- | --- | --- | --- |
| Class directive | One attribute directive per Structural class on a consumer-written element: binds the class as a static host class, sets the element's Variant classes from typed inputs, binds its State classes and ARIA from signals, and carries the element's behaviour where it has any (a class directive that hosts an Aria pattern is still one directive). | ADR 0039; building-blocks 1.1 | `button[nfsButton]` (`.button`), `[nfsCallout]` (`.callout`), `ul[nfsMenu]` (`.menu`), `button[nfsAccordionTitle]` (`.accordion-title`, hosts Aria's `AccordionTrigger`), `dialog[nfsReveal]` (`.reveal`) |
| Plugin element directive without a Structural class | A directive on an element of a Plugin's markup that Foundation gives no class of its own but that carries the Plugin's behaviour or Foundation's State classes; named after the Plugin or its part (building-blocks 1.3). | ADR 0004; ADR 0039 (its no-directive rule covers only elements whose look nothing in the library changes); building-blocks 1.3 | `li[nfsMenuItem]`, `button[nfsSubmenuToggle]`, `a[nfsTab]` (`.tabs-title > a`, hosts Aria's `Tab`), `li[nfsDrilldownBack]` |
| Free behaviour directive | Binds no Structural or Variant class, may sit on any element, and is written beside the class directive of its host, never hosted by it; it may bind State, Visibility, and Motion classes for its own state (Toggler, Responsive Toggle) or write a State class with `Renderer2` on elements it does not host (Magellan); a Trigger binds none. | building-blocks 1.8, 1.9 (hosting against beside); ADR 0041; ADR 0039 (dated note on `Renderer2` State classes) | Triggers `nfsOpen`, `nfsClose`, `nfsToggle`; `nfsSmoothScroll`; `nfsMagellan`; `nfsEqualizer` and `nfsEqualizerWatch`; `nfsToggler`; `nfsInterchange`; `nfsResponsiveToggle` |
| Coordinating directive | A parent that provides a lightweight token its children or descendants read, with which its children register; may host an Aria pattern through `hostDirectives`. Coordination never makes it a component. | building-blocks 1.9; ADR 0009; ADR 0041 | `ul[nfsAccordion]` (`nfsAccordionToken`, hosts `AccordionGroup`), `[nfsTabsGroup]` (`nfsTabsGroupToken`, hosts `Tabs`), `[nfsSlider]` (`nfsSliderToken`), `[nfsProgress]` (`nfsProgressToken`), `[nfsEqualizer]` (`nfsEqualizerToken`), `form[nfsAbide]` (`nfsAbideToken`) |
| Component | Only where Foundation's JavaScript generated structure the consumer never writes and that structure is not one plain element: one of two markup trees from the same content, one inner element the CSS needs around projected content (a Wrapper component), or an element Foundation generates and the consumer should not author; plus ADR 0001's dated exception, the Tooltip's description element, one plain element that no consumer-authoring step fits. On a consumer element it takes an attribute selector. | ADR 0001 (and its dated bullet of 2026-09-27); building-blocks 1.1 | `nfs-responsive-accordion-tabs`; `[nfsAccordionContent]` (Wrapper component around `<ng-content>` for the grid-row animation); the Tooltip's internal `NfsTooltipTip` and `NfsTooltipDescription`, created in the browser |
| Layout-system and utility-family directive | A class directive per class that names an element of a layout; or, for a utility family, one of three shapes: a family of standalone Utility classes gets one directive per Foundation export mixin whose inputs are `nfs`-prefixed Utility attributes, a family with roles keeps the Structural class shape, and a family whose templates express one effect keeps one directive with Foundation's words. No state, model, output, or method. | ADR 0039; ADR 0044 (and its Consequences); building-blocks 1.3, 1.4 | `[nfsGridX]`, `[nfsCell]` (`size`, `offset`), `[nfsRow]`, `[nfsColumn]`; `NfsPrototypeSpacing` (`nfsMarginTop="1"`), `NfsFloatClasses` (`nfsFloat`, `nfsClearfix`); `[nfsFlexContainer]`, `[nfsFlexChild]` (roles: `direction`, `alignSelf`, `order`); `[nfsVisibility]` (`showFor`, `hideFor`) |
| Shared service, function, token, or type | A service only for state shared across instances; otherwise an injection-context function, a token, or a type in the primary entry point. | building-blocks 1.5, 1.7, 1.8, Part 3; ADR 0002; ADR 0005; ADR 0040 | `NfsMediaQuery` with `nfsBreakpointsToken`; `NfsLightDismiss`; `nfsPositioner()`, `nfsHoverIntent()`; `nfsOpenableToken` and `NfsOpenable`; Defaults tokens (`nfsRevealDefaultsToken`); the Variant registries (`NfsButtonPaletteOverrides`), `nfsVariantBoolean`, the Motion types |
| Library mixin | The Sass side: one Library mixin per Foundation export mixin that needs custom CSS or Variant properties, named after it and included after it; `nfs-motion` and `nfs-breakpoint-properties` shared. No directive or component carries `styles`. | ADR 0012 (and its dated note of 2026-09-28); building-blocks 1.13 | `nfs-accordion`, `nfs-menu`, `nfs-button`, properties-only `nfs-xy-grid`; `nfs-menu-icon`, the one Library mixin of the top-bar entry point |

## Decision framework

Ask in this order; each question names the principle or record that decides it. The platform question comes before the directive-or-component question because the platform element decides both the element the consumer writes and whether a directive can sit on it (Reveal on `<dialog>`, ADR 0007; Off-canvas not on `<dialog>`, ADR 0030).

1. Is it Foundation's? A docs page, a Structural, Variant, State, or Utility class, or an Option is in scope, one spec per docs page; Foundation's base element styles and its guide pages are not (map, Destination and Out of scope). Application behaviour is out (P15).
2. Which Implementation level covers it inside the Browser target: a native platform feature, then `@angular/aria`, then `@angular/cdk`, then custom Angular? A platform feature counts only if it was Baseline widely available on 2026-05-07 and fits Foundation's CSS contract and the APG pattern; one code path, no progressive enhancement onto a not-usable feature (P16).
3. Does Foundation give the element a class? A Structural class gets a class directive; an element Foundation styles only by tag and whose look nothing in the library changes gets no directive, until Foundation gives it a Variant class; an element of a Plugin's markup that carries the Plugin's behaviour or Foundation's State classes gets the directive that owns them (P2).
4. Is there markup the consumer cannot write? One of two trees, an inner element the CSS needs, or a generated element gets a component, with an attribute selector when it sits on a consumer element; everything else is a directive (P1).
5. Do several elements cooperate? The parent is a directive providing a lightweight token; children inject it (required when they cannot exist alone, optional when they can) and register; non-nested links are template references or value keys (P4).
6. Does the directive always sit on another family's Structural class? Then it hosts that family's directive through `hostDirectives`; a behaviour that may sit on any element is written beside instead (P6, P8).
7. Who owns each state? Platform state is bound as the platform's attribute or pseudo-class where Foundation or a Library mixin styles it; library-owned state is a signal reflected as Foundation's State class or ARIA through a host binding; state Foundation exposed as method plus event is a `model()` (P10, P11).
8. What is the server HTML, what runs before hydration, what replays, and what is the hydration boundary? (P12)
9. Which Foundation name does each input take, which Options are dropped, and how is each Variant family typed? (P13, P14) For a name that is also an HTML attribute, which kind is it on each host the spec allows, and what does the directive bind for it? (P9)
10. Which entry point owns it, and what crosses entry points? Parent handles and optional parts by token, required dependencies by package path, registry types as types only (P22).
11. Which criteria, pattern, and checks does it need to pass WCAG 2.2 AA, and which shared baselines apply? (P17, P26)

## Principles

Each principle: Rule, Why, Preferred, Avoided, Decided by, Sources. `NG/` is `d:/projects/github/angular/angular/adev/src/content/`, `NGP/` is `d:/projects/github/angular/angular/packages/`, `NC/` is `d:/projects/github/angular/components/`, `FS/` is `d:/projects/github/foundation/foundation-sites/`, `APG/` is `d:/projects/github/w3c/aria-practices/`; research files are under `research/`; "critique", "ecosystem lens", and "headless lens" are the three findings files named above, "review" is the critic's review. Records are cited by section and decision number, because `building-blocks.md` is edited by other tickets and its line numbers move.

### Shape

#### P1. Directive on the consumer's element; a component only for markup the consumer cannot write

Rule: A Plugin, CSS-only component, layout system, or utility family becomes attribute directives on the elements the consumer writes. A component is allowed only where Foundation's JavaScript generated structure the consumer never writes and that structure is not one plain element (ADR 0001's three cases and its dated Tooltip-description exception), and on a consumer element it takes an attribute selector.

Why: Angular's own criterion for a component is a template, not coordination; Angular Aria ships no component, and Material's `MatAccordion` is a directive with a provider. A component that re-renders markup the consumer owns fights hydration and Foundation's child-combinator selectors, and an element component inside a `ul` is non-conforming HTML that the story gate fails.

Preferred: `<ul nfsAccordion>`, `<dialog nfsReveal>`, `<div nfsOffCanvas position="left">`; `[nfsAccordionContent]` as a Wrapper component; `nfs-responsive-accordion-tabs`.
Avoided: `<nfs-accordion>`, `<nfs-tabs>`, `<nfs-reveal>` (a `<dialog>` cannot be an element host), `<nfs-off-canvas>`, `<nfs-menu-item>` inside `ul.menu`; a component for a state Foundation does not have (a loading spinner).

Decided by: ADR 0001; ADR 0039; building-blocks 1.1; map, Standing preferences (directive over component).
Sources: `NG/guide/directives/overview.md:17`; `NC/src/aria/accordion/accordion-group.ts:61-69`; `NC/src/material/expansion/accordion.ts:32-40`; `NG/guide/components/selectors.md:123-138`; `NG/guide/hydration.md:113-121`; WHATWG HTML 4.4.6 (`ul` content model); critique, principle 3; ecosystem lens, principle 3.

#### P2. One directive per Structural class, owning the whole element

Rule: Every Structural class has one attribute directive that binds it as a static host class even when that is all it does, sets the element's Variant classes from typed inputs, binds its State classes and ARIA, and carries the element's behaviour; the styling and the behaviour of one Structural class are never split into two directives (a free behaviour or another family's directive written beside, P6, is not a split). An element Foundation styles only by tag and whose look nothing in the library changes gets no directive, until Foundation gives it a Variant class (ADR 0039); an element of a Plugin's markup that carries the Plugin's behaviour or Foundation's State classes gets the directive that owns them even without a Structural class (ADR 0004).

Why: two attributes for one element leave the element unstyled when one is forgotten (ADR 0041); the class-only period cost a re-run of 26 specs once the classes moved into directives (ADR 0039); a tag-styled element has no class to manage, while a menu item has State classes and disclosure behaviour to own.

Preferred: `button[nfsAccordionTitle]` binds `.accordion-title` and hosts Aria's `AccordionTrigger`; `[nfsCardDivider]` binds `.card-divider` and nothing else; `label[nfsFormLabel]` for the `middle` Variant of a tag-styled label, with `nfsAbideLabel` written beside it; `li[nfsMenuItem]` on a menu `li` that has no class; a bare `<input type="text">`.
Avoided: `<button nfsAccordionTitle nfsAccordionTrigger>`; `<input nfsInput>`, `<textarea nfsTextarea>`; a second directive for a Structural class's own behaviour.

Decided by: ADR 0039 (and its dated notes on `<progress>`, `<table>`, and `label.middle`); ADR 0041; ADR 0004; building-blocks 1.1.
Sources: `adr/0041-menu-plugin-roots-host-menu-directive.md:12`; `adr/0039-directives-manage-every-foundation-class.md:10`, `:29-30`; `adr/0004-menus-use-disclosure-navigation.md:7`; `specs/accordion.md:120`, `:142-143`; `specs/forms.md:28`, `:143`, `:148`; `specs/dropdown-menu.md:125`, `:131`; critique, principle 2 and "The four layers"; review, points 6 and 7.

#### P3. The consumer writes no Foundation or library class, not even as a value

Rule: Consumer markup keeps the element structure of Foundation's docs, with the deltas each spec lists (building-blocks 1.1), and carries directive attributes where the docs carry classes; no Foundation or `nfs-` class appears in consumer code, and an input that selects a library class takes a typed name the directive maps to its class. Inputs that apply the consumer's own Application classes stay.

Why: the user's rule; a misspelt Variant or Motion name then fails to compile, and the server HTML still carries every class because host bindings render on the server.

Preferred: `<div nfsCallout color="alert" size="small">`; `animationIn="fade-in"`; `<ul nfsMenu [orientation]="{small: 'vertical', medium: 'horizontal'}">`; `templateClasses="my-tip"`.
Avoided: `<div class="callout alert">`; `animationIn="nfs-fade-in"`; `routerLinkActive="is-active"`; `[class.is-open]` written by the consumer; `class="vertical menu"`.

Decided by: ADR 0039 (class names passed as input values); ADR 0040; building-blocks 1.1 (the deltas), 1.4, 1.6 rule 4.
Sources: `adr/0039-directives-manage-every-foundation-class.md:8`, `:25`; `adr/0040-variant-input-types.md:19`; `adr/0003-animation-mechanics.md:23`; critique, principle 2.

#### P4. Coordination is a parent directive with a lightweight token; DI follows the declaration site

Rule: A parent provides an `InjectionToken` typed with `import type` of its class through `useExisting`; a child injects it, required when it cannot exist alone and optional when it can, with its documented usage stating where it belongs; ordered children register with the parent in `ngOnInit` and unregister on destroy, an unordered child may register at construction, and a child linked by a reference input registers from an `effect` with cleanup; order comes from registration, not `contentChildren`; non-nested parts link by template reference or value key. Where projection can hide a provider, a directive walks the DOM once after hydration, only when the token is absent.

Why: Angular resolves projected content against the injector where it is declared, not where it renders; registration survives `@for`, `@defer`, Lazy content, and projection; a token instead of a class keeps the parent's class out of every child's bundle (P22).

Preferred: `ul[nfsAccordion]` provides `nfsAccordionToken`; `NfsAccordionItem` injects it (required) and registers; `[nfsOpen]="reveal"`; `a[nfsTab value="x"]` paired with `[nfsTabsPanel value="x"]`; the Nested menu root reading `nfsTopBarRightToken` at construction.
Avoided: `<nfs-accordion>` as the coordinator; `contentChildren(NfsAccordionItem)` for order; a DOM walk that also runs when the token is present; a parent found through a DOM query.

Decided by: building-blocks 1.9; ADR 0009; ADR 0013; ADR 0043.
Sources: `NG/guide/components/content-projection.md:255-277`; `NG/guide/di/lightweight-injection-tokens.md:20-70` (the retention reason; the guide's own token is an abstract class, which ADR 0013 rejected for `NfsOpenable`); `building-blocks.md` 1.9 (parent handle, ordered children, ancestry projection can hide); `adr/0013-triggers-target-resolution.md`; `NC/src/aria/accordion/accordion-group.ts:69`; `specs/accordion.md:151-152`; `specs/tabs.md:156-159`; ecosystem lens, additions B and D; critique, principle I; review, points 27 and 32.

#### P5. Native element first; selectors name the element where semantics depend on it

Rule: Triggers are `<button type="button">` (or a link that also navigates), dialogs are `<dialog>`, sliders are `<input type="range">`, links stay `<a href>`; a selector names the native element wherever the ARIA or the platform behaviour depends on it, and because a hosted directive's selector is ignored, the host's own selector carries the restriction. The platform element is chosen only where it fits Foundation's CSS and the APG pattern.

Why: an attribute selector keeps the element's own APIs and ARIA in the consumer's hands; `<dialog>` gives Reveal the top layer, `::backdrop`, and Escape natively, while a closed `<dialog>` is `display: none` with a fixed `dialog` role that a revealed Off-canvas sidebar must not carry, and `<summary>` cannot sit inside a heading.

Preferred: `button[nfsAccordionTitle]`, `dialog[nfsReveal]`, `input[type=range][nfsSliderHandle]`, `ul[nfsMenu]`, `button[nfsCloseButton]`; `[nfsOffCanvas]` on Foundation's `div.off-canvas`.
Avoided: `<a href="#" nfsAccordionTitle>`; `<nfs-input>`; an Off-canvas panel on `<dialog>`; an Accordion on `<details>`.

Decided by: building-blocks 1.8, 1.10 (native elements first); ADR 0007; ADR 0030; ADR 0001 consequences.
Sources: `NG/guide/components/selectors.md:125-138`; `NC/CODING_STANDARDS.md:274-305`; `NG/guide/directives/directive-composition-api.md:29`; `specs/accordion.md:120`, `:250`; `specs/slider.md:197`; `adr/0030-off-canvas-no-dialog.md:7`; critique, principle 8.

#### P6. Host a directive whose element is always another family's Structural class; write every other behaviour beside

Rule: A directive whose element is always another component's Structural class hosts that component's directive through `hostDirectives` and exposes its Variant inputs under their own names, so the class and its Variants have one owner. A behaviour that may sit on any element binds no Structural or Variant class and is written beside the class directive. A Trigger is never hosted by its Openable, and no Openable writes a class on its Triggers.

Why: hosting gives the class one owner without two attributes; hosting a free behaviour would put its host's class on elements that are not that component (a Magellan container need not be a menu); a Trigger beside `nfsButton` stacks with any Openable and keeps the Openable's bundle free of button code.

Preferred: `ul[nfsDropdownMenu]` hosts `NfsMenu`; `<ul nfsMenu nfsMagellan>`; `<button nfsButton nfsToggle="pane">`; `<button nfsCloseButton nfsClose>`.
Avoided: `nfsMagellan` hosting `NfsMenu`; `<nfs-dropdown-button>`; a Trigger hosted by `nfsDropdownPane`; an Openable binding `.hover` on its Trigger.

Decided by: ADR 0041; building-blocks 1.8, 1.9 (hosting a class directive); Triggers spec, D16 and D18.
Sources: `adr/0041-menu-plugin-roots-host-menu-directive.md:7`, `:12`; `building-blocks.md` 1.8 (a Trigger binds no class) and 1.9 (hosting a class directive); ecosystem lens, principles 5 and 7 (Spartan's `HlmAccordionItem`); critique, principle 7.

#### P7. Composition over inheritance

Rule: The library reuses and extends behaviour only through `hostDirectives` and directives written beside each other on one element. No spec asks a consumer to subclass a library directive or to wrap one to retype an input (building-blocks 1.9); a consumer component may host a library directive through `hostDirectives`, and may implement `NfsOpenable` (ADR 0013).

Why: the user's rule; a subclass inherits host bindings, inputs, outputs, and hooks but not `providers`, its selector, or `exportAs`, so a consumer subclass of a token-providing directive leaves its children silently without a parent, and a directive injected by class matches its exact type only.

Preferred: `<button nfsButton nfsToggle="pane">`; the consumer's Variant declaration file for new palette names; a consumer card component hosting `NfsResponsiveEmbed`.
Avoided: `class MyButton extends NfsButton`; an exported abstract base for consumers to type an input; a consumer directive hosting `NfsButton` to narrow its `color`.

Decided by: map, Standing preferences (user rule, 2026-09-27); ADR 0040; ADR 0013; building-blocks 1.9.
Sources: `NC/CODING_STANDARDS.md:254-258`; `NG/guide/components/inheritance.md:25`; `adr/0040-variant-input-types.md:22`, `:29`; `adr/0013-triggers-target-resolution.md:14`; `specs/responsive-embed.md:41`; `specs/triggers.md:54`; critique, principle G; review, point 11.

#### P8. `hostDirectives` within its fixed limits

Rule: Host directives are applied statically, their selectors are ignored, their inputs and outputs are hidden unless listed, a wrapper cannot change a hosted input's default or set a hosted `input.required` from code, one hosted input under two aliases is a compile error, and a host binding over a hosted directive's attribute holds only when the hosted value never changes after the host's last write, or equals the host's whenever it changes, or changes in every pass in which the hosted value does, which a binding computed from the same hosted signal guarantees. A mode that must swap patterns at runtime therefore needs a component template, not conditional hosting.

Why: Angular's documented constraints and the effort's measurements; since Angular 22.0 a directive reached several times through host directives is created once with the input maps merged, and a template match wins over host-directive matches.

Preferred: `#c="nfsAccordionContent"` with `[panel]="c.panel"` for Aria's required link; the Orbit slide's `inert` derived from `TabPanel.visible()`; `NfsTab`'s `tabindex` equal to Aria's whenever Aria's changes; `nfs-responsive-accordion-tabs` owning both templates.
Avoided: a `hostDirectives` entry behind a condition; a Defaults token entry for an Aria input's default; a plain `[attr.inert]` override on an attribute Aria also binds; the same Menu input exposed under two names on one root.

Decided by: building-blocks 1.9 (Aria composition), 1.4 (Defaults tokens); ADR 0037; ADR 0041; ADR 0001 case 1.
Sources: `NG/guide/directives/directive-composition-api.md:22-33`, `:109-131`, `:170-266`; `d:/projects/github/angular/angular/CHANGELOG.md:937` (22.0.0, "de-duplicate host directives", commit 9c55fcb3e6); `building-blocks.md` 1.4 (Defaults tokens) and 1.9 (Aria composition, three clauses); `adr/0037-orbit-slide-hosts-tab-panel.md`; `specs/tabs.md:162`; critique, principle F; ecosystem lens, addition C; review, points 28 and 33.

#### P9. Input names on one element never collide

Rule: Two library directives that can share an element do not declare one input name with different types; where two families share a name, the elements nest as Foundation's markup does. A family of standalone Utility classes takes `nfs`-prefixed Utility attributes; a family with roles or with one effect keeps Foundation's words; and in every shape an un-prefixed input shares no name with another directive's input on the same element, or its spec reports the case (ADR 0044). An input named like an HTML attribute keeps the name its naming rule gives it, and its directive owns what the static attribute renders, by the kind its spec states: bound from the input where the attribute is what the input means (`output`); bound to `null` where the browser would apply it as a presentational hint or through a Foundation attribute selector (`removed`); bound to `null`, and on a host that can take focus when inserted also set only by binding or the Defaults token as a usage rule, where the browser acts on it at insertion (`insertion`, `autofocus`); left alone where it does nothing on the hosts the spec allows (`inert`) (building-blocks 1.4; [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)).

Why: Angular sets a template binding on every directive on the element that declares the input, so a shared name with different types fails to compile; the `nfs` prefix keeps a standalone utility from capturing another directive's input (`position`, `size`, `color`) or a native attribute (`width`, `height`). A static input attribute stays on the element, so a name that is also an HTML attribute renders it: Blink and WebKit map `align` on every element to `text-align`, Foundation styles `.slider[disabled]` and `input[readonly]`, and the browser acts on `autofocus` when the element is inserted, before any host binding runs.

Preferred: `<div nfsCell size="6"><div nfsCallout size="small">`; `<div nfsMarginTop="1" nfsBordered>`; `<div nfsFlexContainer direction="column">`; `<p nfsVisibility hideFor="medium">`; `<ul nfsMenu align="right">`, with `NfsMenu` binding `'[attr.align]': 'null'`; `<ul nfsTabs [autoFocus]="true">`.
Avoided: `<div nfsCell nfsCallout size="small">`; `<div nfsPrototype margin="1" position="relative">`; an un-prefixed utility input that shares a name with a directive on the same element without the spec reporting it; a static input attribute that acts on its host left in the DOM (`<div nfsSlider disabled="false">`, faded by `.slider[disabled]`); a static `autoFocus` on a host that can take focus (`<ul nfsTabs autoFocus>`, which focuses the strip at page load).

Decided by: building-blocks 1.4 (Utility attributes), 1.9 (shared input names); ADR 0044 and its Consequences; XY Grid spec, D15; building-blocks 1.4 (inputs named like HTML attributes) and 1.11 (the null-bound attribute at hydration); Menu spec, D15.
Sources: `adr/0044-utility-directive-rule.md:7`, `:17`; `building-blocks.md` 1.3 (utility families) and 1.9 (two library directives on one element); `specs/prototyping-utilities.md:142-145` (the three shapes); `specs/flexbox-utilities.md:153-166`; `specs/visibility-classes.md:147-150`; `research/presentational-attribute-inputs.md` (the measurements and the 72-input audit); `research/presentational-attribute-lens-api.md` and `research/presentational-attribute-lens-adversarial.md` (the `autofocus` timing); `NC/src/material/form-field/directives/hint.ts:19-25`; review, points 1 and 2.

### State and API

#### P10. Signals-first public API, with transforms, and `effect()` kept out of it

Rule: Public API is `input()` (with `booleanAttribute` or `numberAttribute` on Options and the closed `nfsVariantBoolean` transform on boolean Variants), `model()` for the state Foundation exposed as both a method and an event, `output()`, a read-only `Signal` or `computed()` for derived state a consumer needs, and `linkedSignal()` for derived-but-writable state, all `readonly`; no `@Input`, `@Output`, `EventEmitter`, `@HostBinding`, or `@HostListener`. `effect()` is never public API and never writes `history` or starts a timer (building-blocks 1.11 decisions 3 and 4); otherwise it follows building-blocks 1.5: no DOM writes, and no propagation of state between signals except the rendered-state signal and the reverse-link registration of a reference input.

Why: Angular recommends the signal functions for new code and calls `effect()` the last API to reach for; effects run on the server; `model()` takes no transform, so a boolean model has no bare-attribute form, and an Option input without a transform rejects `<x disabled>` under strict attribute typing; a public negation beside its state is a second API for one thing.

Preferred: `readonly isOpen = model(false)`; `readonly hover = input(false, {transform: booleanAttribute})`; `readonly collapse = input(false, {transform: nfsVariantBoolean})`; `readonly expanded: Signal<boolean>` on `NfsAccordionItem`; `host: {'[class.is-active]': 'expanded()'}`; a Trigger registering with its target from an `effect` with cleanup.
Avoided: `readonly disabled = input(false)` on an Option; `readonly collapsed = computed(() => !this.expanded())` as public API; `@Input() disabled`; an `effect()` that writes `history` or starts a timer; an `effect()` that copies one signal into another.

Decided by: map, Standing preferences (signals, `model()`, `linkedSignal`, OnPush, zoneless-safe, SSR-safe); building-blocks 1.4, 1.5 (with its two exceptions), 1.11 decisions 3 and 4; ADR 0040 (`booleanAttribute` rejected for Variants); AGENTS.md (no `@HostBinding` or `@HostListener`).
Sources: `NG/guide/components/inputs.md:235-270`; `NG/guide/signals/effect.md:19-32`; `NG/guide/signals/linked-signal.md:57-115`; `NGP/core/src/authoring/model/model_signal.ts:32-43`; `NG/tools/cli/template-typecheck.md:239-265`; `NC/CODING_STANDARDS.md:72-78`, `:260-272`; `NC/src/aria/accordion/accordion-trigger.ts:73-89`; `research/angular-rendering-modes.md:55` (effects run on the server); `NC/src/aria/menu/menu-trigger.ts:91` (the registration effect); critique, principle 4; ecosystem lens, principle 4; review, points 3 and 28.

#### P11. One source per state: the platform's where Foundation styles it, else Foundation's State class from a signal

Rule: Each state has one writer and one representation. Platform state (a native attribute, an ARIA attribute, or a pseudo-class inside the Browser target) is the source wherever Foundation's CSS or a Library mixin can style it; otherwise the state lives in a signal and is reflected as Foundation's State class through a host binding; never both as independent sources. The look and the announcement come from the same source. Initial state is bound from an input or model, never read from a static class. Two recorded exceptions to the host-binding form: a State class on an element no library directive hosts is written by the directive that owns the state with `Renderer2` from a render callback, only for state with no first-paint value, and removed on destroy (ADR 0039, dated note); and where Foundation has no class for a state the library's Sass must key on, the directive binds a `data-nfs-<state>` attribute on a consumer element, or an `nfs-` class on a library-owned element inside a Wrapper component (ADR 0033).

Why: Foundation itself styles `[disabled]`, `:focus`, `[aria-selected='true']`, and `input:checked` where the platform has them, and by class (`.is-active`, `.is-open`, `.is-stuck`) where it does not; a second source drifts (a `current` input beside `aria-current`); `:open`, `:popover-open`, and `:has()` are outside the Browser target (P16), so they cannot be a source.

Preferred: `aria-current` on the current link, styled by `nfs-menu`; `[class.is-open]="isOpen()"` on `nfsDropdownPane`; `[expanded]="true"` on an accordion title; `data-nfs-expanded` on a menu item; `.nfs-accordion-content-shown` on the Wrapper's inner element; the Reveal's `is-reveal-open` on `html` from a render callback.
Avoided: a `current` input binding `.is-active` beside `aria-current`; a directive reading a static `is-active` to seed `expanded`; `data-nfs-open` beside `.is-open`; a `Renderer2` State-class write for a state that has a first-paint value.

Decided by: ADR 0039 (State classes as host bindings; initial state bound; the dated note on `Renderer2` State classes); ADR 0042; ADR 0033; building-blocks 1.4 (initial state), 1.5 (host bindings; `Renderer2` limits); Switch spec, D8.
Sources: `FS/scss/components/_switch.scss:143-172`; `FS/scss/components/_tabs.scss:102-103`; `FS/scss/components/_dropdown.scss:64`; `FS/scss/components/_accordion.scss:102`, `:121`; `adr/0042-menu-current-page-aria-current.md:7-12`; `adr/0033-nested-menu-library-state-hooks.md:7`; `adr/0039-directives-manage-every-foundation-class.md:31`; `specs/accordion.md:127`; `specs/reveal.md:127`, `:139`; `NC/src/aria/accordion/accordion-trigger.ts:46-89`; critique, principles 11 and H; headless lens, section 5; review, point 9.

#### P12. Rendering modes are a design input for every directive

Rule: Every state visible at first paint is a host binding on signal state, so the server HTML is the consumer's markup plus host bindings; no node creation, `Renderer2` write, `window`, `matchMedia`, measurement, observer, timer, focus, `history`, or `location` before `afterNextRender` or `afterRenderEffect`, which are the library's only platform check (`isPlatformBrowser` and `ngServerMode` are not used); primary activation is a `click` or `keydown` listener in `host` metadata whose handler changes state before it calls `preventDefault()` last; hover opening uses non-replayed `pointerenter`; a composite widget and a Trigger with its target share one hydration boundary, Magellan's observed sections excepted; library templates contain no `@defer`; `ngSkipHydration` and Shadow DOM are never used; persistent elements animate through State classes (P19).

Why: hydration matches nodes by type and tag, `ngSkipHydration` works only on component hosts so a directive must be hydration-clean by construction, Shadow DOM silently skips hydration and replay, and replay reaches only template and `host` listeners on native events, where `preventDefault()` throws during replay.

Preferred: `'[attr.aria-expanded]': 'expanded()'`; `afterRenderEffect` with `earlyRead` and `write` phases for the Positioner; a non-modal Reveal open at first paint carrying `open` bound from a value fixed at that render.
Avoided: creating the Tooltip tip at construction; an `@if (isBrowser)` template branch; a `document:keydown` host listener as the only activation path; `ngSkipHydration` on a Wrapper component; `ViewEncapsulation.ShadowDom`.

Decided by: ADR 0008; building-blocks 1.5, 1.11 (decisions 1 to 11); map, Standing preferences (rendering modes).
Sources: `NG/guide/hydration.md:103-121`, `:169`; `research/angular-rendering-modes.md` sections 1, 4, 7; `adr/0008-rendering-modes-contract.md:9-11`; `adr/0029-magellan-targets-from-links.md`; `building-blocks.md` 1.11 decisions 3 and 6; critique, principle A; review, point 34.

#### P13. Every public name by a stated rule

Rule: Classes are `Nfs` plus the PascalCase of the Structural class, with building-blocks 1.3's named cases (the Plugin name where no class exists, `NfsDropdownMenu` on `ul.dropdown.menu`, one `NfsOffCanvas` for its two classes, `NfsFormLabel` after Foundation's mixin, `NfsPaginationEllipsis`, the shared `NfsRow` and `NfsColumn`, `NfsVisibility` after its docs page, the export mixin's name without `foundation-` for a standalone utility family, per-element `ul[nfsListStyleType]` and `ol[nfsListStyleType]`, `NfsNoBullet` after its class); directive selectors are `nfs`-prefixed camelCase attributes, components `nfs-` dash-case elements; tokens are camelCase with the `Token` suffix; inputs take Foundation's `data-*` Option names in camelCase, each Variant input takes its name from the first step of building-blocks 1.4's naming order that applies (a Foundation Option that names the family, then the hosted Aria input's name, then one enum per set of mutually exclusive names named for its dimension, then a boolean named after its class), an order for choosing one input's name, not for declaring a directive's inputs, and a responsive form is never its own input; methods and outputs use Material's vocabulary (`open()`, `close()`, `toggle()`, past-tense completion outputs, `xChange` from models, never an `on` prefix), with Aria's `expandAll()` and `collapseAll()` for containers and `isX` for a state whose verb would collide. `exportAs` is the directive's camelCase name, or its family's where two classes share one attribute (both Toggler classes export `nfsToggler`, ADR 0016); every directive and component has one (building-blocks 1.3).

Why: bare class names collide with Aria's `Tabs`, `Tab`, `Menu`, and `Option`, which the library hosts; the token form is this repository's rule and keeps the `Token` suffix of the lightweight-token guide's `LibHeaderToken`; Foundation's names keep the migration mechanical and the JSDoc traceable; Aria names its own `exportAs` after the directive (`ngAccordionGroup`).

Preferred: `NfsDropdownPane` (`.dropdown-pane`), `NfsPrototypeSpacing`, `nfsAccordionToken`, `multiExpand`, `color`, `expanded="medium down"`, `isOpen` beside `open()`, `exportAs: 'nfsReveal'`, `exportAs: 'nfsCardDivider'`.
Avoided: `AccordionTrigger` (Aria's name), `NFS_ACCORDION` as a token, `nfsCardHeader` (Foundation has `.card-divider`), `nfsMenuItem` on a link (no class; ADR 0042), `nfsDropdown` for the pane (`.dropdown` is Button's arrow class), `show()`/`hide()`, `openAll()`, `onOpen`, `mediumExpanded`, `exportAs: 'accordion'`.

Decided by: ADR 0009; ADR 0016; building-blocks 1.3, 1.4; ADR 0040 consequences; ADR 0044; AGENTS.md Design Philosophy 4 to 6. New: the `exportAs` clause, which building-blocks 1.3 records since this guide's ticket; on 2026-09-29 [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md) read the consumer's own inputs as no state to read and removed the `exportAs` of every directive whose public members are only inputs and outputs. On 2026-09-29 the user ruled an `exportAs` on every directive ([Decide: an exportAs on every directive](issues/156-decide-exportas-on-every-directive.md)), which replaces the review's reading.
Sources: `NG/best-practices/style-guide.md:135-143`; `NG/guide/components/selectors.md:113-121`; `NC/CODING_STANDARDS.md:247-252`; `NG/guide/di/lightweight-injection-tokens.md:179-186`; `adr/0009-nfs-prefix-and-token-naming.md:7`; `NC/src/aria/accordion/accordion-group.ts:63`, `:133`, `:138`; `NC/src/cdk/accordion/accordion.ts:51`, `:58` (`openAll()`, the alternative not taken); `FS/scss/components/_card.scss:112-126`; `specs/toggler.md:107`, `:127`; critique, principle E and summary item 7; review, points 12 and 27.

#### P14. Every input earns its place by tracing to Foundation, Aria, the APG, WCAG, or Material; no count

Rule: Every input traces to a Foundation Option, a Variant family, a hosted `@angular/aria` input, an APG or WCAG requirement, or a Material precedent, and its JSDoc names the Foundation equivalent; every Foundation Option is an input unless building-blocks 1.4 lists it as dropped or the spec's Dropped options give one of 1.4's reasons, and each drop is listed with its reason; no two public members set or read one state under different names, and no cancelable event exists beside a predicate; there is no target input count.

Why: Material's standard, "once a feature is released, it never goes away" and "always prefer sticking to a single API"; the map maps Foundation's Options one to one, so the published containers carry 7 to 18 inputs by design; 1.4 drops Options that exist only for jQuery or HTML strings, class names, timing CSS owns, markup that is the switch, WCAG or APG requirements that are always on, platform mechanisms that cannot honour them, and dead code.

Preferred: `NfsDropdownPane` with `position`, `alignment`, `hover`, `hoverDelay`, `closeOnClick`, and the rest of Foundation's Options; `preserveContent` from Aria; `closePredicate` from Material where a veto is needed; `slideSpeed` dropped because CSS owns the duration, `hoverPane` dropped because WCAG 1.4.13 requires the Hover region.
Avoided: a `2-5 inputs` cap; `panelClass`; `show-arrow`; a cancelable `closing` event beside `closePredicate`; `collapsed` beside `expanded`; an Option dropped without a listed reason.

Decided by: map, Standing preferences (input names from Foundation Options); building-blocks 1.4 (Options, Dropped options, the veto predicate); ADR 0040.
Sources: `NC/CODING_STANDARDS.md:72-78`; `AGENTS.md:20-23`; `building-blocks.md` 1.4 (every `data-*` option; Dropped options with their reasons; the predicate rule); `specs/reveal.md:96`, `:98`, `:101`, `:183-202`; `specs/dropdown.md:206-224`; `specs/accordion.md:99`, `:231-235`; critique, principles 5 and 13; review, points 5, 16, and 17.

#### P15. Foundation's behaviour is in; application behaviour is out

Rule: The library owns every behaviour a Foundation plugin had, in Angular's form (deep links through the History API, validation as Signal Forms schema helpers, the Breakpoint service), and nothing else: no business logic, API calls, application state, or domain workflow. A service exists only for state shared across instances; everything else is directive-local state plus DI links.

Why: library declarations are designed stateless with inputs for context and outputs for events; Angular's style guide keeps components and directives on presentation.

Preferred: `deepLink` on `nfsAccordion`; `nfsPatterns` and `nfsEqualTo` for Abide; `NfsMediaQuery`; `NfsRevealStack` internal to its entry point.
Avoided: a data-fetching input; a global store; a public service for per-instance state.

Decided by: building-blocks 1.5 (services); ADR 0006; map, Destination.
Sources: `NG/tools/libraries/creating-libraries.md:166-189`; `NG/best-practices/style-guide.md:153-158`; `building-blocks.md` 1.5 (services are warranted only for state shared across instances); critique, principle 15.

### Platform, accessibility, styling

#### P16. Native platform first, inside the Browser target, one code path

Rule: Each behaviour stops at the first Implementation level that covers it: native platform feature, then `@angular/aria`, then `@angular/cdk`, then custom Angular, with the fallback stated. A platform feature is usable only if every browser of the Browser target (Chrome, Edge, and Firefox 119; Safari 17; Baseline widely available on 2026-05-07) supports it and it fits Foundation's CSS contract and the APG pattern; one code path per behaviour, no progressive enhancement onto a not-usable feature; each spec names the feature it adopts when the target moves. CDK is used where it is the smallest correct piece, as building-blocks 1.2 lists it (`MediaMatcher`, `_IdGenerator`, `Directionality`, `InteractivityChecker`, `FocusTrap` only where native containment is unavailable), and CDK Overlay, Dialog, Menu, Accordion, and Listbox are not used.

Why: two paths double the test matrix; the not-usable features become usable only when the target moves with Angular; Popover, anchor positioning, View Transitions, `:has()`, `:open`, `<details name>`, and `@starting-style` all miss the target, some by one browser version.

Preferred: `<dialog>` with `showModal()` for Reveal; `ResizeObserver` and `IntersectionObserver`; `position: sticky`; the measured Positioner for Anchored panes with native `popover` plus anchor positioning named as the upgrade.
Avoided: `popover`, `anchor-name`, `startViewTransition()`, `:has()`, `:open` without a fallback; `@supports` around a second path; CDK Overlay for an in-flow pane.

Decided by: map, Standing preferences (Implementation order, Browser support); building-blocks 1.2 (the CDK list); ADR 0002; ADR 0007; ADR 0030.
Sources: `map.md`, Standing preferences (Implementation order; Browser support); `building-blocks.md` 1.2; `research/web-platform-features.md`; web-features 3.40.0 (headless lens, section 11; critique, principle 9; review, "Checks that held"); `adr/0002-in-place-measured-positioning-for-anchored-panes.md:12`, `:19`; review, point 37.

#### P17. Accessibility is a requirement with a gate

Rule: Every directive and component meets WCAG 2.2 AA, follows the matching APG pattern with its full keyboard table (no role without one), and is axe-clean under the six tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`), enforced by the story gate in CI. Where a Foundation default fails a criterion, the spec states the Sass settings or the smallest Library mixin rule that makes it pass, and quotes each ratio by the exact WCAG formula of ADR 0022's dated note, never Foundation's `color-luminance()` or `color-contrast()`; never a recommendation and never a silenced rule. Each directive owns the ARIA and `type` default its documented markup lacks, and its spec states each rule the markup must follow as documented usage; hidden in-DOM content gets `inert`, not `aria-hidden`, except the cases building-blocks 1.10 lists (dialogs and top-layer elements, the closed Off-canvas panel, the Tooltip tip, a hidden Drilldown ancestor level); names come from the consumer's `aria-labelledby` or `aria-label` on elements the consumer writes.

Why: Foundation's own examples fail 2.2 AA (unnamed progress bars, 1.6:1 switch tracks, 4.499:1 alert colours); "a role is a promise"; Foundation's `color-luminance()` was measured passing failing pairs; the CDK's `FocusTrap`, `InteractivityChecker`, and high-contrast support are reused rather than reinvented.

Preferred: `nfs-button` emitting a 24 px floor for 2.5.8; the Switch spec requiring `$switch-background: #767676` for a 1.6:1 default track; `inert` on a collapsed panel; the disclosure navigation pattern for every menu.
Avoided: "should support keyboard navigation" without a key table; `parameters.a11y.test` lowered for a Foundation default; `aria-hidden` to hide a closed pane; a ratio quoted from `color-luminance()`; `role="menu"` on site navigation.

Decided by: map, Standing preferences (accessibility); ADR 0022 (and its dated note of 2026-09-28); ADR 0018; ADR 0004; building-blocks 1.10.
Sources: `APG/content/practices/read-me-first/read-me-first-practice.html:19-33`; `NG/best-practices/a11y.md:52-67`; `NC/CODING_STANDARDS.md:388-396`; `adr/0022-wcag-2-2-aa-enforcement.md:7`, `:23`; `adr/0039-directives-manage-every-foundation-class.md:10`; `building-blocks.md` 1.10 (the `inert` exceptions; the contrast formula); critique, principle 10; headless lens, section 6; review, points 10 and 21.

#### P18. Foundation's Sass is the theme; the library ships mixins, never component styles

Rule: The consumer compiles Foundation's Sass from its own settings and imports the library's Sass after it; the library never imports Foundation and never re-implements a style Foundation has; custom CSS is the smallest documented rule Foundation cannot express, in one Library mixin per Foundation export mixin that needs custom CSS or Variant properties, named after it and included after it; no directive or component declares `styles` or `styleUrl`; Sass settings stay compile-time and never become inputs; there is no runtime theming API, and a `--nfs-*` property is an implementation channel for a runtime value CSS must read (a measurement or an input value) or a list the Variant declaration tooling reads (the Variant properties), not theming.

Why: Foundation's export mixins read the consumer's settings as globals, which a `@use` module or a library-built stylesheet cannot see; component styles compile at library build time without the consumer's settings; one mixin per export mixin includes the library's CSS rules only for a component the consumer compiles.

Preferred: `@include nfs-accordion;` after `@include foundation-accordion;`; `nfs-menu-icon` alone in the top-bar entry point; `nfs-breakpoint-properties` writing `--nfs-breakpoint-classes`; `--nfs-reveal-top` from `vOffset`; `$accordion-plusminus` left to Sass.
Avoided: `styles: [...]` on `NfsAccordionContent`; a `plusminus` input; a `theme` input; `--nfs-button-color` as a documented theming hook; one mixin for a docs page that covers three export mixins.

Decided by: ADR 0012 (and its dated note of 2026-09-28); ADR 0040; building-blocks 1.13; map, Standing preferences (Foundation CSS reused); AGENTS.md Styling Guidelines and Design Philosophy 5.
Sources: `adr/0012-sass-packaging.md:7`, `:13`, `:29`; `building-blocks.md` 1.13; `specs/typography-helpers.md:121`; `specs/reveal.md:491-493`; `FS/scss/foundation.scss`; `FS/docs/pages/sass.md`; critique, principle D; review, points 15 and 31.

#### P19. Animation through State classes and CSS; `animate.enter` and `animate.leave` only for client-created content

Rule: An element that stays in the DOM animates through a bound State class plus CSS transitions or keyframes, and the directive awaits `transitionend` or `animationend` before emitting completion outputs, with building-blocks 1.6 rule 1's fallback timer: the duration measured from the host's computed `animation-*` or `transition-*` once the class is bound, plus 100 ms, a measured zero completing at once; an element the library inserts or removes uses `animate.enter` and `animate.leave` host bindings, never a server-rendered element, because `animate.enter` plays at hydration; Motion inputs take typed Motion names or the consumer's own keyframe classes in the dot form, mapped to the library's `nfs-` keyframe classes; `prefers-reduced-motion` shortens every library animation to 1 ms, and a directive may in addition bind no consumer Motion class while `reducedMotion()` is true and complete the change in the same tick (building-blocks 1.6 rule 5: the Responsive Toggle, the Dropdown); no `@angular/animations`, no JavaScript-timed animation, no Motion UI transition classes.

Why: the user's rule; `animate.enter` with transitions needs `@starting-style`, which is outside the target; Motion UI's two-frame class protocol is not performed by `animate.enter`.

Preferred: `.reveal.is-closing` keyed keyframes before `close()`; `animationIn="fade-in"`; `grid-template-rows: 0fr` to `1fr` on the accordion Wrapper.
Avoided: `element.animate()`; `animate.enter` on `dialog[nfsReveal]`; `animate="mui-enter"`; `max-height` to a measured value.

Decided by: ADR 0003; ADR 0008 consequences; building-blocks 1.6 (rules 1 to 7, quoted for the timer); map, Standing preferences (animation).
Sources: `NG/guide/animations/enter-and-leave.md:28`; `adr/0003-animation-mechanics.md:7`, `:23`; `prototypes/animate-enter-hydration/README.md`; `building-blocks.md` 1.6 rule 1 (the fallback timer) and rule 7; review, point 30.

#### P20. The native control carries the value; one forms contract

Rule: A native control the library only styles (the Forms directives, the Switch) keeps its own value, `checked`, and forms directives and gets no value API from the library; a native control whose value the library transforms (the Slider handle) implements one Signal Forms contract (`FormValueControl` or `FormCheckboxControl`), never `ControlValueAccessor` as well, and documents `ngNoCva` where a built-in accessor also matches; validation is Signal Forms schema helpers plus directives that bind Foundation's error markup to field state.

Why: a `checked` model beside the native checkbox is a second source for a value Angular Forms and the platform own; Angular forbids both contracts on one control, and a Signal Forms control already works with Reactive and template-driven forms; Material exposes native inputs through `ng-content` rather than re-rendering them.

Preferred: `NfsSliderHandle implements FormValueControl<number>` on `input[type=range]` with `ngNoCva`; `input[nfsSwitchInput]` with no model; `nfsFormError` bound to field state.
Avoided: `<nfs-input>` re-rendering the control; a `checked` model on `input[nfsSwitchInput]`; a directive implementing both `ControlValueAccessor` and `FormValueControl`; a ported Abide engine.

Decided by: ADR 0006; ADR 0026; building-blocks Table A (Slider, Abide) and Table D (Switch, Forms); Switch spec, D8; Slider spec, D4.
Sources: `NG/guide/forms/signals/migration.md:455-462`; `NG/guide/forms/signals/custom-controls.md:124-140`; `NC/CODING_STANDARDS.md:274-305`; `specs/slider.md:197`, `:244`; `specs/switch.md:441`; critique, principle C; review, point 18.

#### P21. No library strings; direction from `Directionality`; logical properties

Rule: The library renders no human-readable string of its own: every label, role description, and formatted value comes from consumer markup or a consumer function, and a directive declares no name input for an element the consumer writes. Direction is read from `Directionality.valueSignal`, never from `html[dir]`, and library CSS uses logical properties, never `:dir()`. A recorded exception (building-blocks 1.5): a read of the rendered layout takes the computed `direction`, because the layout follows CSS direction, which `Directionality` does not see below a `dir` it does not track: the Slider's Handles in client event handlers. A non-linear Slider Handle without `displayWith` speaks `` `${value}` ``, with no locale format, as Material's default `displayWith` does.

Why: Angular Aria ships no default label string (a source reading of `NC/src/aria`: no default strings in any directive) and handles reversed navigation from `Directionality`; Foundation's Sass handles direction through `$global-right`; logical properties are widely available while `:dir()` misses the target; a library with no strings needs no locale service, which Material needs for its own.

Preferred: Orbit's `aria-roledescription` and the rotation control's name from consumer markup; the Slider's `displayWith` for `aria-valuetext`; `Directionality.valueSignal` for the dropdown Base side; `inline-start` in `nfs-breadcrumbs`.
Avoided: a `closeLabel` input with an English default; `document.documentElement.dir` reads outside the Slider's handlers; `:dir(rtl)` in a Library mixin.

Decided by: New (no record states the rule; it restates building-blocks 1.5 (RTL, with its rendered-layout exceptions) and 1.10 (names), and four spec decisions: Close Button D6, Top Bar D5, Progress Bar D12, Orbit D18).
Sources: `building-blocks.md` 1.5 (RTL) and 1.10 (names); `specs/close-button.md:315`; `specs/top-bar.md:474`; `specs/progress-bar.md:416`; `specs/orbit.md:309`, `:313`, `:556`; `specs/slider.md:221`, `:258`; `NG/guide/aria/overview.md:62` (right-to-left navigation); `NC/src/aria` (source reading, no default strings); `FS/scss/components/_accordion.scss:116`; web-features 3.40.0 (review, "Checks that held": logical properties widely available 2024-03-20, `:dir()` 2026-06-07); `research/angular-material-reference.md:1287`; critique, principle K; review, point 23.

### Delivery

#### P22. One entry point per plugin, family, or utility; nothing unused reaches a bundle

Rule: Every plugin, CSS-only component, layout system, utility family, and shared utility is its own secondary entry point (`ngx-foundation-sites/<name>`), so a consumer can `@defer` per plugin. A class another entry point needs only to find an optional part or an ancestor goes through a lightweight token typed with `import type`; a required dependency (a hosted directive, the Breakpoint service, the Anchored pane functions, the primary entry point's transforms and mapping functions) is a value import by package path; the Variant registries and the shared Variant types are imported as types only (ADR 0040). Global configuration is a Defaults token per plugin or a purpose-named provider function, never an umbrella `provideNfs()` or an NgModule.

Why: entry points define the granularity of lazy loading and preventing retention is the library author's job; a class referenced as a value for an optional part is retained even when unused; measured: injecting `NfsTopBarRight` by class would keep it in every menu bundle.

Preferred: `ngx-foundation-sites/accordion`; `nfsTopBarRightToken` imported by the Nested menu; `contentChild(nfsCloseButtonToken)` in the Callout; `nfsVariantBoolean` imported from the primary entry point; `ul[nfsDropdownMenu]` hosting `NfsMenu` from `ngx-foundation-sites/menu`.
Avoided: one entry point for the whole library; `inject(NfsTopBarRight)`; `contentChild(NfsCloseButton)`; an umbrella `provideNfs()`.

Decided by: building-blocks 1.3 (files), 1.9 (parent handle, Defaults tokens, no umbrella provider); ADR 0008 (considered options); ADR 0040; ADR 0043.
Sources: `NG/tools/libraries/angular-package-format.md:136-159`; `NG/guide/di/lightweight-injection-tokens.md:12-18`, `:71-93`; `NG/tools/libraries/creating-libraries.md:164`, `:188-189`; `adr/0040-variant-input-types.md:37`, `:44`; `adr/0043-menu-root-top-bar-right-section-token.md:13`; `specs/forms.md:134`; `specs/dropdown-menu.md:143-152`; `specs/prototyping-utilities.md:192`; ecosystem lens, additions A and B; critique, principle B; review, point 4.

#### P23. Every misuse a type cannot catch is stated as documented usage

Rule: Each misuse the compiler cannot see (a copied Foundation class, a child outside a parent it may stand without, a missing name, a missing Library mixin include, a `for` that names nothing) is a usage rule of the directive's spec, stated in its API text, its usage section, and the JSDoc it asks for, and the spec's usage examples follow it; the library reports none of them. A child that cannot stand alone is a required injection, whose NG0201 is Angular's report.

2026-09-29: the warnings, Runtime checks, and `strictParents` this principle described are planned and implemented in a later milestone of the implementing repository ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)); in the first milestone each misuse it lists is stated as documented usage in the directive's spec.

Why: WCAG binds the consumer's pages, not the library's diagnostics; the library's own bar is that its components, used as documented, pass axe and WCAG AA, which its stories prove, and a consumer who ignores a usage rule answers for their own page ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)).

Preferred: a usage rule that names the input to bind instead of a copied `is-active`; "`autoPlay` requires an `nfsOrbitRotation` control (WCAG 2.2.2)" in the Orbit's JSDoc; `inject(nfsAccordionToken)` required in `NfsAccordionItem`.
Avoided: a rule that only a check states; a thrown error for a copied class.

Decided by: ADR 0040; ADR 0018 (consequences); building-blocks 1.4 (initial state, copied classes), 1.8 and 1.9 (required against optional injection); [Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md).
Sources: `NC/src/aria/accordion/accordion-group.ts:119`; `NC/src/cdk/a11y/focus-trap/focus-trap.ts:185`; `adr/0040-variant-input-types.md:13`, `:49`; `adr/0018-browser-testing-stack.md:24`; `specs/accordion.md:151`; `specs/abide.md:155`; critique, principle J; review, points 13 and 29.

#### P24. A forgotten import of an attribute directive fails silently; entry points export classes, not import arrays

Rule: Entry points export their directive classes and no import arrays (ADR 0046). A component lists in its `imports` every directive class whose attribute its template writes. A spec's TypeScript usage examples import every directive they use, and its class and ARIA assertions run in the story gate, so a story whose `moduleMetadata.imports` misses a directive fails on the element it leaves bare.

Why: Angular reports no error for a static attribute that matches no imported directive; a bound input on the missing directive fails (NG8002, binding to a property that does not exist), a static one does not, and the first milestone ships no report of its own for it ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)). An exported array prevents only a forgotten member and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports`; the three specs that exported one (`NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, `nfsPrototypeClasses`) dropped it. Material's per-component NgModules are compatibility leftovers, and Angular Aria exports classes and tokens only.

Preferred: `imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent]`, which the unused-imports diagnostic can check member by member; `[expanded]="true"` on a title, which fails to compile when `NfsAccordionTitle` is not imported.
Avoided: an exported import array such as `NFS_ACCORDION`; a TypeScript example that shows `<button nfsButton>` without its import.

Decided by: the user's ruling of 2026-09-28 against import arrays ([ADR 0046](adr/0046-forgotten-imports-caught-by-checks.md)); the user's ruling of 2026-09-29 ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)); building-blocks 1.9 (its imports bullet).
Sources: `NG/guide/components/selectors.md:140-143`; `NG/reference/errors/NG8002.md:5-12`; `NC/src/aria/accordion/public-api.ts`; `NC/src/material/button/button-module.ts:16-20`; `adr/0009-nfs-prefix-and-token-naming.md:12`; critique, principle 1 (the cost) and summary item 7; review, point 24.

#### P25. Tests assert the DOM; no harness classes in the first specs

Rule: Assertions at every test layer are DOM-first (roles, ARIA, State classes, `data-active`), never instance fields; every spec names the four test layers of ADR 0018 with its Story ids and cases; Story ids and arg names are the contract between a spec's own test layers, so renaming one breaks that spec's e2e tests and the spec says so; no custom harness classes ship in the first specs, and whether harnesses ship later is a decision no record has made.

Why: Foundation's classes and ARIA are the contract the directives bind, so tests can assert them directly, which is why the first specs need no harness; Material's harnesses exist because its DOM is not a contract.

Preferred: `await expect(title).toHaveAttribute('aria-expanded', 'true')`; `accordion--multi-expand` listed in the spec's Testing Decisions.
Avoided: `expect(fixture.componentInstance.item.expanded()).toBe(true)`; an `NfsAccordionHarness` in a spec; a Story id renamed without the spec's e2e cases following.

Decided by: ADR 0018; building-blocks 1.12; storybook-conventions.md.
Sources: `NG/guide/testing/component-harnesses-overview.md:19-21`; `building-blocks.md` 1.12 (DOM-first assertions; no custom harness classes in the first specs); `storybook-conventions.md:39`, `:312`; critique, principle L; review, point 19.

#### P26. Shared baselines the audit checks by section

Rule: Every spec meets the shared baselines the records state, checked against the record's own text: focus (building-blocks 1.10: one tab stop per composite, focus persistence across a close or swap, return to the invoker, never the dialog element); disabled (1.10: `aria-disabled` and focusable for composite items, native `disabled` for standalone controls); ids (1.5: the consumer's id wins, `_IdGenerator` with the plugin prefix, Aria's prefixes kept, deep links need consumer ids; ADR 0008); restoring globals on destroy (1.9, last bullet); keys (1.5: `event.key`, `hasModifierKey`, no `keyCode`); output payloads (1.4: aggregate outputs carry the item, item outputs are `void`); the rendered-state rule for render callbacks (1.5); images (1.2: `NgOptimizedImage` for every static `<img>`); a requirement on content the directives cannot read is stated as a requirement, shown in every recipe, and asserted by every story (ADR 0022, dated note of 2026-09-28); member visibility (AGENTS.md: `#` for private members, `protected` for template and query members, no `private`).

Why: each is a recorded rule every sampled spec applies; restating them here would risk rewording them, so the audit reads the section.

Preferred: `focusin`/`focusout` host listeners recording focus before a swap; `nfs-accordion-panel-` ids; the Callout's text naming its kind in every recipe.
Avoided: focusing the `<dialog>` element itself; `keyCode` comparisons; a plain `<img>` in a story where `NgOptimizedImage` can be used.

Decided by: building-blocks 1.2, 1.4, 1.5, 1.9, 1.10; ADR 0008; ADR 0022; AGENTS.md Member Visibility.
Sources: the sections named; `specs/dropdown-menu.md:224` (member visibility applied); review, point 35.

## Release policy (decided by the user, not audited)

Recorded already: the Browser target follows Angular's (map, Standing preferences, Browser support); `foundation-sites` is a peer at `^6.9.0` (ADR 0012); every spec names the platform features it adopts when the target moves (building-blocks 1.14, Further Notes), and ADR 0002 records that such an upgrade changes what consumers see (a top-layer pane escapes `overflow` clipping).

Decided by the user on 2026-09-28 ([ADR 0045](adr/0045-release-policy-devkit-version-scheme.md)): the library follows the Angular devkit's version scheme, `0.<Angular major><Angular minor, two digits>.<patch>` (`0.2202.x` for Angular 22.2, as `@angular-devkit/architect` does); breaking changes, removals, and platform upgrades that change what consumers see land only when the Angular major changes; a public API is removed only after at least one Angular major of deprecation, with `@deprecated`, a changelog entry, and a migration where one can be written; migrations are Nx migrations first, reused as `ng update` migrations. A release for a new Angular minor carries fixes and additive API only. The policy starts with the first published release; renames decided before it need no deprecation. Example: after the first release, an input a later spec renames keeps its old name annotated `@deprecated` with the new name until the next Angular major, where a migration rewrites it. Specs are not audited against this section: it governs releases, not a spec's content.

Sources: `NG/reference/releases.md:114-124`; `NG/tools/libraries/creating-libraries.md:201-203`; `NC/CODING_STANDARDS.md:72-78`; `research/angular-cdk-inventory.md:119`, `:272` (`@breaking-change`); ecosystem lens, third-party survey (NG-ZORRO and ng-primitives version cadence); `adr/0002-in-place-measured-positioning-for-anchored-panes.md:19`; `adr/0012-sass-packaging.md:7`, `:23`; critique, principle M; review, point 26.

## Idioms from other libraries and their form here

For spec authors who know React's headless libraries: the need transfers, the mechanism usually does not.

| Idiom | Form here | Why |
| --- | --- | --- |
| `asChild`, `render`, `as` (Radix, Base UI, Headless UI, Ark UI) | Nothing: an attribute directive attaches to the consumer's own element; `hostDirectives` for a component that must always carry another directive's behaviour | A React part owns its element and must be told to render another; a directive never renders one (headless lens, section 3) |
| Context (`Accordion.Item` reaching `Accordion.Root`) | A lightweight token with `useExisting`, `skipSelf` for a Nearest Openable, template references for non-nested parts (P4) | DI follows the declaration site; tokens keep classes out of child bundles |
| Controlled and uncontrolled props (`value`, `defaultValue`, `onValueChange`) | `model()`; `linkedSignal()` for internal state that tracks a bound value but may diverge (P10) | Unbound, a model is the default; bound two-way, it is controlled, with its `xChange` output generated |
| `data-*` state attributes and render props (`data-open`, `data-pressed`) | Foundation's State classes bound from signals; `data-nfs-<state>` only where Foundation has no class (P11; ADR 0033) | Foundation's classes are the styling contract; a parallel attribute system would be a second source |
| Explicit state machines (Zag, Ark UI) | `computed()` over signals, no statechart runtime | `computed()` cannot go stale; a statechart runtime is a dependency the Implementation order does not call for |
| Copy-in distribution (shadcn/ui) | A published, versioned library with one entry point per plugin (P22) | The Destination is one published library; copy-in forfeits versioning and patching |
| Open UI's part names | A cross-check only; Foundation's and the APG's names win (P13) | Open UI's charter disclaims inventing patterns |

Sources: `research/architecture-headless-primitives.md` sections 3, 4, 5, 7, 8, 10, 12.

## Conflicts between the research and recorded decisions

The guide keeps the recorded decision in each case; the ticket's Answer rates each under the map's triage rule and proposes the shared-file text.

1. `effect()` for history writes and timers. `building-blocks.md` 1.5 allows `effect()` "for side effects that are not DOM (history writes, timers)", while the same section's last bullet says an effect runs on the server and never writes the DOM, and 1.11 decisions 3 and 4 forbid `history` outside render callbacks and timers outside render callbacks or handlers. No spec uses an `effect()` for either (the effects in the specs are the registration, the rendered-state signal, and Interchange's swap, which 1.5's two exceptions cover). P10 states the stricter rule and keeps both exceptions; the Answer proposes replacing the parenthesis in 1.5.
2. Implementation order. This repository's `AGENTS.md` (Implementation Hierarchy) puts `@angular/aria` first and asks before falling back; the map's Standing preferences put the native platform first, then Aria, then CDK, then custom Angular. The map lists `AGENTS.md`'s conventions as one design-criteria input while ruling its component code neither a source nor a constraint, its triage rule treated the confirm-before-fallback as human-only by kind, and [Decide the `@angular/aria` fallback confirmation](issues/75-evidence-aria-fallback-confirmation.md) decided every fallback from evidence; every spec follows the map's order. P16 states the map's order. No edit to `AGENTS.md` is proposed by this ticket; the precedence line the Answer proposes for the map's Notes records that the specs follow the map where `AGENTS.md` differs.
3. The DI example. `AGENTS.md`'s Content Projection and DI pattern injects a parent token with `{optional: true, skipSelf: true}` in every child; building-blocks 1.9 injects it required when the child cannot exist alone and optional when it can, and uses `skipSelf` for the Nearest Openable (1.8). P4 and P23 follow building-blocks; the same precedence line covers it.

Not conflicts, recorded so the audit does not reopen them: the ecosystem lens's allowance for `nfsButton` to become an attribute-selector component once it needs internal markup (a loading spinner) does not apply, because ADR 0001's cases are closed and a loading state is not Foundation's (map, Destination); the headless lens's `data-*` state hooks are covered by ADR 0033's narrower rule; the critique's note that `ngDevMode` is a convention rather than public API no longer bears on P23, which since 2026-09-29 names no development-only code.

## What this guide adds beyond the records

New rules, each rated in the ticket's Answer: P13's `exportAs` clause; P21 (no library strings, `Directionality`, logical properties); P24's import array, decided by the user on 2026-09-28 against arrays (ADR 0046); the release policy section, decided by the user on 2026-09-28 (ADR 0045). Every other principle restates a recorded decision, cited in its Decided-by line.
