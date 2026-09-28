# 107. Re-run: Accordion spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Accordion](15-spec-accordion.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/accordion.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Accordion](15-spec-accordion.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK as a self-grilling (both sides) against the sources the ticket names, with `/domain-modeling` for vocabulary and `/to-spec` for the revision. Spec: [specs/accordion.md](../specs/accordion.md), revised in place; the dated amendment is in the [Spec: Accordion](15-spec-accordion.md).

Gist: the published spec already bound every Structural class (static `host` classes) and the State class (host binding). What the consumer still wrote was Foundation's `class="is-active"` as the initial state, `class="button"` on example buttons, and an `.accordion-item` selector in a CSS recipe. The initial state becomes `[expanded]="true"` on the title; a copied `is-active` is stripped by the item's binding and reported by a development-only check; the accordion has no Variant classes, so it has no Variant input; buttons in stories and examples are `nfsButton`; CSS recipes select no Foundation class. Behaviour, ARIA, keyboard, animation, rendering modes, and Story ids are unchanged.

### Decision log

Sources: Aria = `src/aria/accordion/accordion-trigger.ts` in the components 22.2.x clone; Styling = `packages/core/src/render3/instructions/styling.ts` in the angular 22.2.x clone; DI = `packages/core/src/render3/di.ts` there; F = `scss/components/_accordion.scss` in the Foundation 6.9.0 clone.

1. **Which classes did the published spec leave to the consumer?** Four: `class="is-active"` on an item as the initial state (user story 3, the contract row, the title's `expanded` default, the Initial state rule, D8, the default story, the SSR fixture, the browser-level case, and three examples); `class="button"` and `class="button small"` on the usage example's method buttons; the `.accordion-item` selector in the `deepLinkSmudgeOffset` recipe; and user story 2's framing that `class="accordion"` is optional. Every Structural class was already a static `host` class (D21) and `.is-active` a host binding. Source: the spec before this revision.
2. **Structural classes: any change of mechanism?** No. One directive per Structural class, each binding it as a static `host` class, as ADR 0039 asks. A class the consumer writes anyway merges with the static host class and does no harm, so it is not reported; the Storybook checklist and the consistency review keep examples free of it. The mapping table gains a Kind column (building-blocks 1.14). Source: ADR 0039; building-blocks 1.1, 1.14; storybook-conventions checklist.
3. **Variant classes?** None exist. F defines `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`, and the `[disabled]` and `.is-active` selectors, nothing else; `$accordion-plusminus` is a Sass boolean, compile-time (AGENTS.md Design Philosophy 5; building-blocks 1.13). So no Variant input, registry, alias, Variant property, or runtime-check involvement, and item (6) of the Sass subsection reads "none". Exclusion AC7 (the glyph as an input) holds, as the triage judged. Source: F; `research/out-of-scope-exclusions.md` AC7; `research/out-of-scope-triage.md` section 3; ADR 0040.
4. **State class?** `.is-active` stays a `[class.is-active]` host binding on the item from `expanded`. Source: ADR 0039; CONTEXT State class.
5. **How does a consumer open a panel at first paint without `class="is-active"`?** `[expanded]="true"` on the title, Aria's own model, a constant one-way binding applied in the first update pass on server and client, so the server HTML is unchanged, the item's host binding renders `.is-active`, and the user can still close the panel because the binding never re-applies. The `HostAttributeToken` seed and the construction-time write into Aria's model are removed, a deletion. Rejected: keeping the seed (a class-based second spelling of the state, against ADR 0039); a bare `expanded` attribute (Aria declares `expanded = model<boolean>(false)` with no transform, so strict templates reject the static string, the mechanism [Decide the `@angular/aria` fallback confirmation](75-evidence-aria-fallback-confirmation.md) measured for `preserveContent`); an item-level input (two writable copies, D7). Bindings do not make a model emit, so no expansion policy runs for them; two titles bound open in single mode stay open and dev check 4 reports it, as before. Source: Aria; ADR 0039; the spec's Focus rule ("bindings do not emit").
6. **What happens to a static `class="is-active"` copied from Foundation's docs?** It is stripped on server and client: `findStylingValue` consults the static classes only when every binding for the class is `undefined`, and `isStylingValuePresent` treats `false` as a value, so the item's binding wins (the host-elements guide's "one static and one dynamic: the dynamic value wins"). The panel would render closed with no signal, so dev check 7 warns once per item. It reads `HostAttributeToken('class')` (the element's static class list, `injectAttributeImpl` returning `tNode.classes`) in a field initialiser that runs only under `ngDevMode`, because after render the class list no longer shows the copied token. Rejected: no check (a silent change for migrating markup); honouring the class as a legacy seed; warning on every Foundation class (redundant Structural classes are harmless, decision 2). Source: Styling; DI; `adev/src/content/guide/components/host-elements.md`, Binding collisions.
7. **Inputs that take a class name?** None. The accordion has no Motion input, and `.nfs-accordion-content-body` and `.nfs-accordion-content-shown` sit on the Wrapper component's own template element, which the consumer never writes. Source: ADR 0039's follow-up decision on class names in input values.
8. **Buttons that call methods in stories and examples?** `button[nfsButton]`, which binds `.button` and defaults `type="button"`; stories use the default size and no Variant input, so they depend only on the Button directive's selector; the usage example's Done button shows `size="small"`, the name building-blocks 1.4 rule 3 gives a size map. Rejected: `class="button"` (a consumer-written class); bare native buttons (unstyled under Foundation's reset). Source: storybook-conventions section 8; building-blocks 1.4; the Button spec's `type` default.
9. **Does the class rule reach consumer stylesheets, and what do the spec's CSS recipes select?** ADR 0039 and the user's follow-up speak of the consumer's markup and input values; they do not say whether a consumer stylesheet may select `.accordion-item`. The spec's recipes now select no Foundation or library class (`scroll-padding-top` on the scroller; `scroll-margin-top` through an application class or an inline style; the deep-link story's items carry an inline `scroll-margin-top`), which satisfies either reading. D20 stays: re-included Foundation declarations keep Foundation's specificity for any consumer rule that does target a Foundation class. A shared sentence is proposed below. Source: ADR 0039; storybook-conventions section 8 (inline style for values Foundation has no class for).
10. **User stories?** 1 to 3 rewritten and 28 extended in place; 51 (a copied `is-active` is reported) and 52 (no Variant input to learn) appended, keeping the numbering other records cite.
11. **Tests?** No story, test host, or fixture writes a class, except the dev check 7 case. The default story binds `[expanded]="true"`; `nfsButton` controls in `accordion--multi-expand` and `accordion--programmatic`; `accordion--no-region` binds its five open panels. Browser-level: the bound initial state (no `expandedChange`, no Completion output, still closable), a class-free host rendering the four Structural classes, a redundant `class="accordion"` with no warning, and the copied `is-active` stripped with one warning; seven dev checks. SSR smoke: the fixture writes no `class` attribute and the HTML carries every Structural class. Pure logic: dev check 7's whole-token match. Story ids unchanged.
12. **Rendering modes?** Construction now only injects and registers, plus the development-only static-class read; nothing writes Aria's model before hydration. Server HTML, hydration, replay, and `@defer` behaviour are unchanged, because a bound open item was already a case the SSR smoke asserted.
13. **Glossary or ADR?** No new term: Structural class, State class, and Variant class already carry it. No ADR: the decisions follow from ADR 0039 and ADR 0040, and the one real choice (`[expanded]` over a new input) is additive to reverse. The Wrapper component definition is sharpened (proposed below).

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Initial state through `[expanded]="true"` (decision 5) | HIGH (consumer markup contract; the [Spec: Responsive Accordion Tabs](19-spec-responsive-accordion-tabs.md) composes it) | HIGH (ADR 0039 decides the direction; the alternatives fail on Aria's source or D7; the bound path was already asserted) | Decided |
| Dev check 7 on a copied `is-active` (decision 6) | LOW (development only, additive) | HIGH (Angular styling and DI source) | Decided |
| No Variant input (decision 3) | LOW (no API) | HIGH (Foundation's Sass read) | Decided |
| `nfsButton` controls in stories and examples (decision 8) | LOW (examples) | HIGH | Decided |
| CSS recipes select no Foundation class (decision 9) | LOW (examples and prose) | HIGH (the applied default meets both readings of the rule) | Decided; shared sentence proposed |
| Redundant Structural classes not reported (decision 2) | LOW | HIGH | Decided |

No `OPEN FOR HUMAN` item and no `## Prototype needed`: every point is settled by ADR 0039, ADR 0040, or source.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md` 1.4, a new bullet after the `model()` bullet, so every re-run treats class-based seeds alike:

   > - Initial state is bound, never read from a class ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)): an item, panel, or pane that is open, active, or in a variant at first paint is written with the input or model that owns it (`[expanded]="true"` on an accordion title), not with a Foundation class in the markup, and no directive reads a static Foundation class to seed state or a Variant. A Foundation class copied from Foundation's markup that a directive binds dynamically is stripped on server and client, because Angular's styling resolution consults static classes only when every binding for the class is `undefined`; each such directive reads its host's static `class` through `HostAttributeToken` in development builds only and warns once, naming the input to bind ([Spec: Accordion](issues/15-spec-accordion.md), dev check 7). Structural classes written redundantly merge with the directive's static `host` class and are not reported. A directive may still read the consumer's own classes (the Toggler's Class mode). The specs that read a static Foundation class today apply this in their re-runs: the Nested menu's `is-active` seed (and the menus built on it), the Toggler's `is-hidden`, the Slider's `vertical` and `disabled`, the Tooltip's legacy position classes, the Off-canvas position classes, and the Button's `.submit` marker.

2. `building-blocks.md` 1.1, appended to the paragraph that starts "Consequence:":

   > The class rule governs the consumer's templates and input values; a spec's recipe for consumer CSS (a `scroll-margin-top`, a sticky header's `scroll-padding-top`) selects elements, attributes, or the consumer's own classes, never a Foundation or library class, so every example is free of those names however the rule is read for stylesheets ([Spec: Accordion](issues/15-spec-accordion.md), D27).

3. `CONTEXT.md`, **Wrapper component**, replacing its definition line ("A component on a consumer-written Foundation element ..."), which under the class rule reads as if the consumer wrote the class:

   > A component on an element of Foundation's markup that the consumer writes without its class (`[nfsAccordionContent]` on the panel `div`), which binds that class and adds one inner element around the projected content because the element's CSS needs it.

4. `building-blocks.md` 1.11 decision 1 (found while reading, not from the class rule): "a collapsed accordion panel carries `inert` and Foundation's `display: none`" becomes "a collapsed accordion panel carries `inert` and the collapsed `0fr` row of `nfs-accordion` (Foundation's `display: none` only when that mixin is missing)", because `nfs-accordion` rule 4 sets `display: grid` on `.accordion-content`.

5. `building-blocks.md` Tables A and B, Accordion rows: no change; they name no consumer-written class.

6. `map.md`, Decisions so far: the gist line below.

No change to any ADR, `README.md`, or another spec is needed from this ticket.

### What other specs need from this one

- [Re-run: Responsive Accordion Tabs spec under the class rule](111-rerun-responsive-accordion-tabs-class-rule.md): the Accordion's initial state is only the title's `[expanded]` binding (the static `is-active` seed is gone), which the component already binds from `selected`; its rendered template must put no `class` on the `nfsAccordionItem` hosts, or dev check 7 fires. Its phrase "as a title's `[expanded]` binding does in the Accordion spec" stays true.
- [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md): the Accordion's usage example writes `<button nfsButton size="small">`; if the Button re-run names or types its size input otherwise, that one example follows it. The stories use no Button Variant input.
- The re-runs of the Nested menu, Accordion Menu, Drilldown Menu, Dropdown Menu, Responsive Menu, Toggler, Slider, Tooltip, Off-canvas, and Button: proposal 1, if adopted, gives their static-class reads one rule; [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) can check each applied it.

### Gist for Decisions so far

- [Re-run: Accordion spec under the class rule](issues/107-rerun-accordion-class-rule.md) -- the directives already bound every Structural class and `.is-active`; what the consumer still wrote goes: `[expanded]="true"` on the title replaces Foundation's `class="is-active"` seed (a copied one is stripped by the item's binding and reported by a development-only check), the accordion has no Variant classes and so no Variant input, stories and examples call methods from `nfsButton` controls, and CSS recipes select no Foundation class; behaviour, ARIA, keys, animation, rendering modes, and Story ids unchanged; impact HIGH, confidence HIGH. Spec: [specs/accordion.md](specs/accordion.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.
