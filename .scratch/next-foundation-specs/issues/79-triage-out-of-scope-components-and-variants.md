# 79. Triage the out-of-scope Foundation components and variants

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The user ruled on 2026-09-27: being CSS-only must not exclude a Foundation for Sites component or variant from scope. An Angular component or directive is the Angular-native way to use a UI component in a website or web app, even when all it does is add a CSS class. Other exclusion reasons must be re-evaluated and presented to the user.

Which Foundation for Sites components and variants do the map, the specs, and the shared documents rule out of scope, and on what grounds? For each one: an exclusion that rests on being CSS-only comes back into scope by the ruling, and the triage says what it becomes (a directive or a component, in which spec). Every other reason is re-evaluated against its sources, and the item is presented to the user with a recommendation. Components the bundle never mentions count as excluded by omission.

## How to work it

1. Evidence, read-only and in parallel: every exclusion in the bundle, with its location and stated reason (`research/out-of-scope-exclusions.md`); Foundation 6.9's component and variant catalogue from the local clone's docs and Sass, with the bundle's coverage of each item (`research/foundation-component-catalogue.md`).
2. Triage: the CSS-only exclusions come back into scope; lens agents re-evaluate every other reason, at least one of them adversarial, and a judge weighs their arguments and records dissent.
3. Present the triage to the user: the decisions it needs from them, each with a recommendation. After their answers, record the result here, update the map's Destination and Out of scope, and graduate the new spec tickets.

## Answer

Resolved 2026-09-27. Evidence: [research/out-of-scope-exclusions.md](../research/out-of-scope-exclusions.md) (276 exclusions, Sonnet 5) and [research/foundation-component-catalogue.md](../research/foundation-component-catalogue.md) (Foundation 6.9's docs pages and the bundle's coverage, Sonnet 5). Three lenses argued over them: Angular-native API (Fable 5.1), adversarial scope and Foundation fidelity (Opus 5.5), and accessibility (Opus 5.5). An Opus 5.5 judge weighed them in [research/out-of-scope-triage.md](../research/out-of-scope-triage.md), decided what the evidence settles, and put five decisions to the user; the user answered them and three follow-ups the same day.

### Settled by the evidence (judge; impact HIGH, confidence HIGH)

- Every Foundation UI component with a Structural class gets one attribute directive per Structural class on the consumer's elements, never a component, because none generates structure (ADR 0001).
- Each directive also owns the ARIA, `type` default, or development and compile-time check that its documented markup lacks for WCAG 2.2 AA (ADR 0022). The triage found Foundation's own examples failing: every Progress Bar example has no accessible name (axe `aria-progressbar-name`), the Input Group example has an unlabelled field (axe `label`), the docs menu icon has no name, the Switch off track is about 1.6:1 on white, and the Badge and Label `alert` colour is 4.499:1 with white.
- Every exclusion reason that is not CSS-only holds, except those in the triage file's section 3. The published specs leave Structural classes as markup "because no behaviour" (the Orbit wrapper, controls, figure, image, and caption; `.slider-fill`; `.off-canvas-wrapper`; `.submenu-toggle-text`; the close-button rows of Off-canvas, Reveal, and Toggler): that reason fails. B4 (Foundation's Forms page does show `input[type=submit].button` and a `label.button` upload), RT6 (in part), TB7, and SL9 (Shift+Arrow dropped with no reason) fail; TB9, RAT4, RAT6, OR9, B3, B7, DP3, and RV2 hold only in part or need their reasons restated. Each goes to the re-run ticket of its spec below.

### The user's decisions (2026-09-27)

1. Variant classes: typed inputs for every family (sizes, colours, fills, and every modifier), not consumer-written classes. The user's rule, verbatim: "Generally, consumers should not write any CSS classes for any of our components/directives. All Foundation for Sites and NFS classes are managed by the Angular components/directives." This is the class rule: consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, and every State class is a host binding. ADR 0039 records it and supersedes ADR 0010; ADR 0001 keeps its directive-first rule, but consumers now write elements and directives, not Foundation's classes.
2. Layout systems and utility families: in, with directives too: XY Grid, Float Grid, Flex Grid, Prototyping Utilities, Flexbox Utilities, Visibility Classes, Float Classes, and Typography Helpers.
3. Packaging: one spec per Foundation docs page.
4. Destination: this map's Destination is redrawn (the user's goal condition already asks for specs "for each component in Foundation for Sites"), not a fresh effort.
5. The legacy Float Grid and Flex Grid (legacy since 6.4, disabled by default) get a spec each.
6. The 26 published specs are carried into the class rule by one re-run ticket each.
7. How a Variant input is typed over an open Sass map (custom palette colours, custom button sizes, breakpoints) is decided by a `/research` subagent and then a panel. The user vetoed consumer-side TypeScript `namespace` or `module` augmentation (declaration merging), and later the same day extended the veto to every way of changing the library's types from outside the consumer's own code: a tsconfig `paths` remapping of a library type module and a generator that overwrites a type file inside the installed package are out too. Later the same day the user narrowed the veto: consumer-side declaration merging (module augmentation of library-declared registry interfaces) is allowed again, on the condition that a probe confirms it reaches Angular's strict template type check; a tsconfig `paths` remapping stays out, and anything that writes into or overwrites files in `node_modules` is out under all circumstances.

The judge's fifth decision (how far the triage reaches into published specs) is overtaken by decision 6: every published spec is re-run under the class rule, and the menu cross-links the Angular-native lens proposed (the Nested menu roots hosting the Menu directive, the Top Bar feeding the Dropdown Menu through DI) are questions for the Menu, Top Bar, and menu re-run tickets.

### Follow-up decision: class names passed as input values (2026-09-27)

Asked after the fold-in found the ruling silent on inputs whose value is a class name, the user chose: no Foundation or NFS class name appears in consumer code, not even as an input value: an input that selects a library class takes a typed name (a Motion input takes `'fade-in'`, never `'nfs-fade-in'`), and the directive maps it to its class, applying it with `animate.enter` and `animate.leave` where the element enters or leaves the DOM and with a State class on a persistent element otherwise (building-blocks 1.6); inputs that apply the consumer's own classes stay (the Toggler's class mode toggling an application class, the Tooltip's `templateClasses` for application classes), because the rule is about the library's classes. The user added: keep in mind to use `animate.enter` and `animate.leave` when applicable. ADR 0039 records it.

### What stays out

- Foundation's base element styles (Global Styles, Typography Base) and its tooling and guide pages (Installation, Sass, JavaScript, RTL, Kitchen Sink, and the like): they style elements by tag or describe setup, so there is no class for a consumer to write and nothing for a directive to manage; a spec that relies on a base element style documents it.
- Everything else the map's Out of scope lists, on its own reasons: this repo's code, implementation, the jQuery plugin API and Motion UI as a dependency, the `*_PLAN.md` files, Spec Kit, the opt-in `role="menu"` variants (ADR 0004), runtime theming, and moving the bundle.

### The API-design skill

The repository skill `.claude/skills/foundation-api-design/SKILL.md` says "CSS class is purely for styling (no behavior): apply class directly, no directive needed", which the ruling overturns for the next library. It is a file of this repository, outside the planning bundle, and it is not edited. The user clarified the same day that the skill is an initial sketch from an earlier attempt at spec-driven development with Spec Kit in this repository: one input among many, not a source of truth and not of the highest precedence, while the specs this map produces are implemented in a separate, new repository. The bundle's ADRs, building-blocks, and the user's rulings take precedence over it, so the triage file's proposed skill text (its section 5) is not applied.

### New tickets

- [Research: typed Variant inputs over open Sass maps](80-research-typed-variant-inputs-open-sass-maps.md), then [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (a panel; every spec and re-run ticket below waits on it).
- 25 spec tickets, one per docs page: [Spec: Button Group](82-spec-button-group.md), [Spec: Close Button](83-spec-close-button.md), [Spec: Switch](84-spec-switch.md), [Spec: Menu](85-spec-menu.md), [Spec: Top Bar](86-spec-top-bar.md), [Spec: Pagination](87-spec-pagination.md), [Spec: Breadcrumbs](88-spec-breadcrumbs.md), [Spec: Callout](89-spec-callout.md), [Spec: Card](90-spec-card.md), [Spec: Media Object](91-spec-media-object.md), [Spec: Table](92-spec-table.md), [Spec: Badge](93-spec-badge.md), [Spec: Label](94-spec-label.md), [Spec: Progress Bar](95-spec-progress-bar.md), [Spec: Responsive Embed](96-spec-responsive-embed.md), [Spec: Thumbnail](97-spec-thumbnail.md), [Spec: Forms](98-spec-forms.md), [Spec: XY Grid](99-spec-xy-grid.md), [Spec: Float Grid](100-spec-float-grid.md), [Spec: Flex Grid](101-spec-flex-grid.md), [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md), [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md), [Spec: Visibility Classes](104-spec-visibility-classes.md), [Spec: Float Classes](105-spec-float-classes.md), [Spec: Typography Helpers](106-spec-typography-helpers.md).
- 26 re-run tickets, one per published spec, numbered 107 to 132 in the order of the published spec tickets, from [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md) to [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), after all of them; an audit follows it.

### Triage

Impact HIGH (every published spec changes its consumer markup, and 25 specs are added); confidence HIGH (the user decided each open point). Nothing here is left open.
