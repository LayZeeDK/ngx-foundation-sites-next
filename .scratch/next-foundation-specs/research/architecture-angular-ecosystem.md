# Research: the Angular ecosystem's directive/component architecture and API design conventions

Question: what do the Angular team and established Angular UI libraries say, in their own docs, source, and conventions, about how a UI library divides work between attribute directives and components, and about public API design? Tests the 15 principles, four layers, and decision framework in [architecture-principles-user-draft.md](architecture-principles-user-draft.md) against this evidence, for [issue 140](../issues/140-research-directive-component-architecture-principles.md).

Sources read (all versions/dates confirmed 2026-09-28):

- `d:/projects/github/angular/angular` (local clone, `package.json` version `22.2.0`): `adev/src/content/guide/components/`, `guide/directives/`, `guide/di/`, `guide/signals/`, `guide/components/content-projection.md`, `best-practices/style-guide.md`, `best-practices/a11y.md`, `tools/libraries/creating-libraries.md`, `tools/libraries/angular-package-format.md`.
- `d:/projects/github/angular/components` (local clone, `package.json` version `22.2.0`): `CODING_STANDARDS.md`, `guides/using-component-harnesses.md`, `src/aria/` (accordion, tabs), `src/material/button/button.ts`.
- `spartan.ng` (fetched 2026-09-28 via markdown.new): `/documentation/introduction`, `/components/accordion`.
- `ng-primitives.mintlify.app` (fetched 2026-09-28 via markdown.new): `/introduction`.
- `ng.ant.design` (NG-ZORRO, fetched 2026-09-28 via markdown.new): `/docs/introduce/en`; source `components/button/button.component.ts` (via `gh api`, GitHub `NG-ZORRO/ng-zorro-antd`, default branch).
- `taiga-ui.dev` (fetched 2026-09-28 via markdown.new): `/getting-started`.
- GitHub source, read via `gh api repos/<owner>/<repo>/contents/<path>` (default branch, fetched 2026-09-28): `ng-bootstrap/ng-bootstrap` (`README.md`, `src/dropdown/dropdown.ts`, `src/alert/alert.ts`), `primefaces/primeng` (`README.md`, `packages/primeng/src/button/button.ts`), `vmware-clarity/ng-clarity` (`README.md`), `openng-org/optimus-ui` (repository metadata via `gh api repos/openng-org/optimus-ui`; `packages/optimus-ui/src/button/button.ts`).
- `primeui.dev/nextchapter` (fetched 2026-09-28 via markdown.new): PrimeTek's own announcement of the PrimeNG/PrimeUI licensing change.
- `optimus.openng.org` (fetched 2026-09-28 via markdown.new): Optimus UI's own description of itself as the free PrimeNG v21 continuation.
- `primeng.org/introduction` and `clarity.design/documentation/get-started` returned no usable content (a 404 page and an unrendered client-side shell respectively); ng-bootstrap's own docs site (`ng-bootstrap.github.io`, hash-routed SPA) likewise returned an empty shell. Where a rendered docs site failed, this file relies on the library's GitHub README and source instead.

## Principle 1: Directive-First, Component-Second

Draft: prefer attribute directives whenever behaviour or styling can be applied to an existing semantic HTML element; avoid a custom element like `<fnd-button>` unless it adds significant value.

Evidence:

- Angular's own accessibility guide states this almost verbatim, but names the mechanism as an **attribute selector on a component**, not "prefer a directive": "instead of creating a custom element for a new variety of button, create a component that uses an attribute selector with a native `<button>` element." It cites `MatButton`, `MatTabNav`, and `MatTable` as examples (`d:/projects/github/angular/angular/adev/src/content/best-practices/a11y.md:74-78`).
- The components guide's selector chapter gives the same recommendation independently, with a worked example (`selector: 'button[yt-upload]'`) under "When to use an attribute selector" (`d:/projects/github/angular/angular/adev/src/content/guide/components/selectors.md:123-134`).
- Material's own coding standard: "Component selectors should be lowercase and delimited by hyphens. Components should use element selectors **except when the component API uses a native HTML element**. Directive selectors should be camel cased." (`d:/projects/github/angular/components/CODING_STANDARDS.md:247-252`).
- `MatButton` is a `@Component` (it has `templateUrl: 'button.html'`) with the attribute selector `button[matButton], a[matButton], button[mat-button], ...` (`d:/projects/github/angular/components/src/material/button/button.ts:28-42`).
- NG-ZORRO independently arrived at the identical shape: `NzButtonComponent` is a `@Component` with `selector: 'button[nz-button], a[nz-button]'` (GitHub `NG-ZORRO/ng-zorro-antd`, `components/button/button.component.ts:46-48`).
- PrimeNG ships **both** forms for the same concept: a template-less `ButtonDirective` at `selector: '[pButton]'` for plain native-button augmentation, and a full `Button` component at `selector: 'p-button'` with its own template for icon/label slots and a loading spinner (GitHub `primefaces/primeng`, `packages/primeng/src/button/button.ts:164-165` and `:576-577`).
- Angular Aria's `AccordionTrigger` is the "directive, no template" half of the same picture: a plain `@Directive({selector: '[ngAccordionTrigger]'})` with no `template`/`templateUrl` at all (`d:/projects/github/angular/components/src/aria/accordion/accordion-trigger.ts:43-61`).

Application: the draft's dichotomy conflates two independent axes: (a) does the class need its own template/encapsulated view (component vs. directive), and (b) does the selector read as an attribute or a custom element. Every primary source above keeps these separate. A `Component` with an attribute selector on a native element (Material's, NG-ZORRO's, and PrimeNG's `Button`) is the team-recommended shape whenever the concept needs internal markup (an icon slot, a ripple element, a loading state) on top of a native element; a plain `Directive` with an attribute selector is right when no template is needed at all (Angular Aria's triggers and panels, PrimeNG's `ButtonDirective`). For this effort, `nfsButton` should be free to become a `@Component` with an attribute selector the moment it needs internal markup Foundation's `.button` class alone can't express (for example, a loading spinner), without that being read as abandoning "directive-first."

Strength: strong. Independently confirmed by the Angular team's own guidance and by three unrelated component libraries (Material, NG-ZORRO, PrimeNG) converging on the same shape.

Where it holds / needs qualification: holds as "prefer an attribute selector over a new custom element when augmenting a native element," fails as written if read literally as "prefer directives (no template) over components (with template)" -- that reading is not what Angular's own components do.

## Principle 2: Every Foundation Concept May Have an Angular Directive

Draft: a directive is valuable even when it only applies Foundation classes; benefits include discoverability, autocomplete, type safety, and migration ease.

Evidence:

- Angular Aria is exactly this pattern at production scale, built by the Angular team itself: "Angular Aria provides headless directives for patterns such as accordion, combobox, listbox, menu, tabs, and toolbar. These directives handle keyboard interaction, ARIA attributes, focus management, and screen reader support while letting you provide the HTML structure and styling for your application." (`d:/projects/github/angular/angular/adev/src/content/best-practices/a11y.md:66-67`).
- Confirmed structurally: the entire `src/aria/accordion/` and `src/aria/tabs/` directories contain zero `.html` template files and zero non-test `@Component` decorators; every public class (`AccordionGroup`, `AccordionPanel`, `AccordionTrigger`, `AccordionContent`, `Tabs`, `TabList`, `Tab`, `TabPanel`, `TabContent`) is a `@Directive` (confirmed by direct grep of `d:/projects/github/angular/components/src/aria/accordion/` and `src/aria/tabs/`).

Application: directly validates the draft's "many small directives, zero styling opinion" model, and validates it at the scale of a whole pattern library, not a single example.

Strength: strong.

Where it holds / needs qualification: holds without qualification from this lens. Whether a Foundation concept that itself renders internal markup (for example, an off-canvas overlay's close button) can still be "only a directive" is a component-vs-coordination question, covered under Principle 3.

## Principle 3: Components Exist for Coordination

Draft: use a component when multiple elements must cooperate for behaviour, accessibility, state, or content orchestration; gives `<fnd-accordion>`, `<fnd-tabs>`, `<fnd-off-canvas>` as component examples.

Evidence, and a direct conflict:

- ng-bootstrap's dropdown -- a textbook "multiple elements must cooperate" case -- is coordinated entirely by directives, with **no wrapping component**: `[ngbDropdown]` (the coordinator, `exportAs: 'ngbDropdown'`), `[ngbDropdownAnchor]`, `[ngbDropdownToggle]`, `[ngbDropdownMenu]`, and `[ngbDropdownItem]` (GitHub `ng-bootstrap/ng-bootstrap`, `src/dropdown/dropdown.ts:48-162`). `NgbAlert`, by contrast, is a `@Component` with `selector: 'ngb-alert'` because it renders its own dismiss button in its own template (`src/alert/alert.ts`, `selector: 'ngb-alert'`, has `template:`).
- Angular Aria's own `Accordion` and `Tabs` patterns confirm the same split, at first-party scale: `AccordionGroup` (`selector: '[ngAccordionGroup]'`, `d:/projects/github/angular/components/src/aria/accordion/accordion-group.ts:61-62`) coordinates `AccordionTrigger` and `AccordionPanel` purely through an injected `ACCORDION_GROUP` token (`accordion-tokens.ts:13`), no component anywhere in the pattern. `Tabs` (`[ngTabs]`), `TabList` (`[ngTabList]`), `Tab` (`[ngTab]`), and `TabPanel` (`[ngTabPanel]`) are all directives too (confirmed by direct grep of `d:/projects/github/angular/components/src/aria/tabs/`).

Application: this is the most consequential finding in this lens. Angular's own team, building the reference implementation for exactly this class of widget, does **not** reach for a component when elements need to cooperate -- it reaches for a directive that provides an injection token (or `hostDirectives`) to coordinate its descendants, and reserves `@Component` for when the widget needs markup that doesn't already exist in the caller's template (Material's `mat-tab-nav-bar` needs an ink-bar element; `NgbAlert` needs a dismiss button; Angular Aria's accordion needs none of that, so it stays directive-only). For this effort, `nfsAccordion` does not need to become `<nfs-accordion>` merely because it coordinates `nfsAccordionItem`/`nfsAccordionTrigger`/`nfsAccordionPanel`; it can be `[nfsAccordion]` on the caller's own wrapping element, exactly like Angular Aria's `AccordionGroup`, unless it needs to render markup Foundation's classes don't already cover.

Strength: strong, and in direct tension with the draft as written.

Where it conflicts: the draft's premise ("does it coordinate multiple elements? -> use a component") is falsified by Angular's own Accordion, Tabs, and by ng-bootstrap's Dropdown. The correct axis is still template need (Principle 1), not coordination. Coordination is a DI/`hostDirectives` question, independent of whether the coordinator itself is a directive or a component.

## Principle 4: Signals-First Public APIs

Draft: use `input()`/`model()`/`output()`/`computed()`/`effect()` exclusively in public-facing code; avoid `@Input`/`@Output`/`EventEmitter` except for compatibility.

Evidence:

- `input()`, `model()`, and `output()` guides all frame the signal-based functions as the primary recommendation while stating the decorator forms "remain fully supported": "While the Angular team recommends using the signal-based `input` function for new projects, the original decorator-based `@Input` API remains fully supported." (`d:/projects/github/angular/angular/adev/src/content/guide/components/inputs.md:270`; equivalent language for `@Output` at `outputs.md:129-130`).
- The style guide directs: "Mark component and directive properties initialized by Angular as `readonly`. This includes properties initialized by `input`, `model`, `output`, and queries." (`d:/projects/github/angular/angular/adev/src/content/best-practices/style-guide.md:192-205`).
- Confirmed in the Angular team's own 22.x source: Angular Aria's `AccordionTrigger` and `AccordionPanel` use `input()`, `model()`, and `computed()` exclusively, with every field marked `readonly` (`d:/projects/github/angular/components/src/aria/accordion/accordion-trigger.ts:73-89`, `accordion-panel.ts:71-74`).
- `model()` inputs implicitly create a `<name>Change` output for two-way binding, and are recommended specifically "when you want a component to support two-way binding... such as a date picker or combobox" (`d:/projects/github/angular/angular/adev/src/content/guide/components/inputs.md:235-260`) -- directly applicable to this effort's `expanded`/`selected`-style state.
- `linkedSignal()` is the modern replacement for "state that mirrors another signal but can be locally overridden," with a documented pattern (`source`/`computation`/`previous`) for exactly the "selection that should reset when its source list changes, but preserve the user's choice when possible" case (`d:/projects/github/angular/angular/adev/src/content/guide/signals/linked-signal.md:57-115`) -- worth naming explicitly in the guide as the tool for derived-but-settable state, which the draft's principle 4 lists in passing (`linkedSignal`) but never explains.

Application: fully confirmed, no qualification needed. The one addition worth making: model inputs are the concrete mechanism for "two-way bindable primitives," and `linkedSignal` is the concrete mechanism for "derived state that can still be locally overridden" -- both are more specific tools than the draft's blanket "use signals" language conveys.

Strength: strong.

## Principle 5: Composition Over Configuration

Draft: prefer combining primitives instead of large configuration surfaces; avoid components that accumulate many options.

Evidence:

- Material's own coding standard states this as a historical, deliberate refactor: "Prefer more focused, granular components vs. complex, configurable components," with a before/after example replacing `<mat-button class="mat-fab">` with a dedicated `<mat-fab>` (`d:/projects/github/angular/components/CODING_STANDARDS.md:48-62`).
- The concrete Angular mechanism that makes composition-without-duplication possible is `hostDirectives` (the directive composition API): "Directives can apply attributes, CSS classes, and event listeners to an element... You apply directives to a component by adding a `hostDirectives` property," including chaining across multiple levels ("`MenuWithTooltip` can compose behaviors from multiple other directives") (`d:/projects/github/angular/angular/adev/src/content/guide/directives/directive-composition-api.md:1-103`).

Application: strong endorsement, and the draft's aspiration ("behaviour should stack naturally") has a named, documented Angular mechanism (`hostDirectives`) it should cite directly rather than leaving as an abstract goal.

Strength: strong.

Where it needs qualification: composition is not free once two directives share cross-cutting state on the same host. Angular had to add explicit merge and de-duplication rules for exactly this case: when the same directive is host-composed more than once (a shared dependency), Angular "merges all instances into a single directive instance," and if two paths expose the same input/output under **different** aliases, "Angular throws an error at compile time (NG8024)" (`directive-composition-api.md:170-266`). Any Foundation concept this effort composes across multiple trigger-style directives (tooltip trigger, dropdown trigger, both wanting a shared `TriggerRef`-style identity) needs that shared dependency designed up front, using the same alias on every path.

## Principle 6: Small Primitives Over Large Components

Draft: prefer many focused building blocks (`Dropdown`/`DropdownTrigger`/`DropdownContent`) over "mega" components; one responsibility per primitive.

Evidence:

- Same Material coding-standard section as Principle 5 ("Prefer small, focused modules... Ideally, individual files are 200-300 lines of code. As a rule of thumb, once a file draws near 400 lines... start considering how to refactor into smaller pieces.") (`d:/projects/github/angular/components/CODING_STANDARDS.md:64-70`).
- This has a direct packaging consequence the draft never mentions: "the Angular Material package publishes each logical component or set of components as a separate entrypoint - one for Button, one for Tabs, etc. This allows each Material component to be lazily loaded separately, if desired." (`d:/projects/github/angular/angular/adev/src/content/tools/libraries/angular-package-format.md:151-159`).

Application: strong endorsement, plus a concrete build-system consequence this effort's `building-blocks.md` should state explicitly: granular primitives are only fully realized as a tree-shaking/lazy-loading win if the library also ships one secondary entry point per primitive family (see the new "Library entry points" item below), not merely small class files inside one bundle.

Strength: strong.

## Principle 7: Behaviour Must Be Composable

Draft: multiple directives should stack on one host naturally (`fndButton fndTooltipTrigger fndDropdownTrigger`); avoid combined-concern variants like `<fnd-dropdown-button>`.

Evidence: this principle IS `hostDirectives` / the directive composition API, already covered in full under Principle 5 (`directive-composition-api.md`). The best real-world demonstration in this research is Spartan's `HlmAccordionItem`:

```ts
@Directive({
  selector: '[hlmAccordionItem],hlm-accordion-item',
  hostDirectives: [
    { directive: BrnAccordionItem, inputs: ['isOpened', 'disabled'], outputs: ['openedChange'] },
  ],
  host: { 'data-slot': 'accordion-item' },
})
export class HlmAccordionItem { /* ... */ }
```

(spartan.ng, `/components/accordion`, fetched 2026-09-28). `HlmAccordionItem` composes `BrnAccordionItem`'s behaviour via `hostDirectives`, explicitly re-exposes only the inputs/outputs it wants public, and itself supports a dual selector (`'[hlmAccordionItem], hlm-accordion-item'`) so a consumer can apply it as an attribute on their own element or use it as its own element -- directly matching this effort's `nfs`-prefixed directive pattern.

Strength: strong. Same evidence and same qualification (de-duplication/alias-conflict rules) as Principle 5.

## Principle 8: Preserve Native HTML

Draft: keep native elements visible (`<button fndButton>`, `<input fndInput>`) rather than replacing them with custom elements (`<fnd-input>`), unless necessary.

Evidence:

- The same a11y guidance from Principle 1 covers the simple case (button/link augmentation via attribute-selector components).
- For elements that genuinely need a wrapper, angular.dev gives the specific pattern the draft is missing: "the native `<input>` element cannot have children, so any custom text entry components need to wrap an `<input>` with extra elements. By just including `<input>` in your custom component's template, it's impossible for your component's users to set arbitrary properties and attributes to the `<input>` element. Instead, create a container component that uses content projection to include the native control in the component's API," citing `MatFormField` (`d:/projects/github/angular/angular/adev/src/content/best-practices/a11y.md:80-87`).
- Material's coding standard states the same rule independently, with explicit Do/Don't code: "Native inputs used in components should be exposed to developers through `ng-content`... allows developers to interact directly with the input and allows us to avoid providing custom implementations for all the input's native behaviors." (`d:/projects/github/angular/components/CODING_STANDARDS.md:274-306`).

Application: strong confirmation, plus the answer to a gap the draft leaves open: when a native element (like `<input>` or `<textarea>`) needs a wrapper for layout/validation/label markup, the right shape is a coordinating wrapper (a component, content-projecting the native element) plus a thin attribute directive on the projected native element itself (Material's `matInput` on the projected `<input>`, inside `<mat-form-field>`) -- not a `<fnd-input>` that owns and re-renders the control.

Strength: strong.

## Principle 9: Browser API First

Draft: prefer platform capabilities (`<dialog>`, Popover API, `:has()`, etc.) over custom abstractions, in the order "browser capability -> light abstraction -> custom implementation."

Evidence from this lens (the platform lens covers this more directly, but the Angular ecosystem sources corroborate the middle rung):

- Angular Aria's own event-handling infrastructure is exactly the "light abstraction" middle option the draft's principle names but doesn't otherwise justify: rather than raw `addEventListener` calls scattered per directive, every pattern builds a `KeyboardEventManager`/`PointerEventManager` (`d:/projects/github/angular/components/src/aria/private/ui-pattern-rules.md:99-238`) -- a small, typed wrapper over native `KeyboardEvent`/`PointerEvent` handling, not a heavier custom implementation.
- `HostAttributeToken` (component/host-elements.md:170-190) exists specifically so a directive can read a static native attribute the caller already set, rather than requiring a duplicate Angular input for information the platform already carries.

Strength: moderate from this lens (primarily the headless-primitives/platform lens's territory); the corroborating detail is that Angular's own reference implementation treats "light abstraction over native events" as a designed layer (the `behaviors`/`ui-patterns` split), not an afterthought.

## Principle 10: Accessibility Is a First-Class Feature

Draft: every component should support keyboard navigation, screen readers, focus management, reduced motion, ARIA patterns, and high-contrast modes, built into primitives rather than added after.

Evidence:

- Angular Aria exists specifically to make this feasible for a directive-only library: "these directives handle keyboard interaction, ARIA attributes, focus management, and screen reader support" (`a11y.md:66-67`, already cited).
- The CDK ships a dedicated `a11y` package with `LiveAnnouncer` (screen-reader announcements) and `cdkTrapFocus` (focus containment for dialogs/off-canvas panels) as reusable primitives, not per-component reimplementations (`a11y.md:52-64`).
- Material's coding standard has a dedicated rule for high-contrast support, with a working example: `@include cdk-high-contrast(active, off) { ... }` (`d:/projects/github/angular/components/CODING_STANDARDS.md:388-396`).

Application: strong confirmation; the useful addition for this effort is naming the specific first-party tools (`LiveAnnouncer`, `cdkTrapFocus`, the `cdk-high-contrast` mixin, and the `KeyboardEventManager`/`PointerEventManager` pattern) this effort can reuse or mirror instead of inventing equivalents from nothing.

Strength: strong.

## Principle 11: Prefer CSS State Over Framework State

Draft: use platform state (`:open`, `:checked`, `:has()`, `:focus-visible`) instead of framework signals like `isOpen = signal(...)`, unless application state genuinely needs representation in Angular.

Evidence and a direct tension:

- Angular's own reference accordion does the *opposite* of what the draft recommends for coordinated, multi-element widgets: `AccordionTrigger` tracks `expanded` as a `model<boolean>()` and `active` as a `computed()`, then **projects** that Angular-owned state outward onto the DOM via host bindings -- `'[attr.data-active]': 'active()'`, `'[attr.aria-expanded]': 'expanded()'` (`d:/projects/github/angular/components/src/aria/accordion/accordion-trigger.ts:46-89`). CSS and assistive technology consume the resulting `data-*`/`aria-*` attributes, but the *source of truth* is the Angular signal, not a CSS pseudo-class Angular reads back from.

Application: this is a genuine qualification, not a rejection. For a widget the platform itself tracks state for natively -- a native `<input type="checkbox">`'s `:checked`, a native `<details>`'s `:open`, `:disabled` on a native control -- the draft's preference holds and is uncontroversial. But for a coordinated, multi-element widget the platform has no native state model for (an accordion group built from `<div>`/`<button>`, Foundation's `.accordion`), Angular's own reference implementation keeps the state in a signal and pushes it out as a `data-*`/`aria-*` attribute for CSS/AT to key off, rather than trying to read state back from CSS. The guide should state the qualification explicitly: prefer CSS state when the platform is already the source of truth for that state (native form controls, native disclosure elements); when the library itself is the state's source of truth (because no native element models it), keep it in a signal and reflect it outward via host bindings, exactly as Angular Aria does.

Strength: moderate; the draft's framing needs a qualification, not a rewrite -- the underlying instinct (don't duplicate state the platform already owns) is intact, but "prefer CSS state" is the wrong direction for state the library itself must own.

## Principle 12: Template Readability Is a Primary Goal

Draft: templates are the main API surface; prefer plain markup with directives (`<a fndMenuItem>`) over data-driven templates (`<fnd-menu [items]="menuItems()" />`) for content-driven structures.

Evidence: angular.dev does not assert this as a named principle, but every Angular Aria usage example embedded in its own source JSDoc follows exactly this shape -- plain HTML decorated with directives, e.g. `<button ngAccordionTrigger [panel]="panel">Accordion Trigger Text</button>` (`d:/projects/github/angular/components/src/aria/accordion/accordion-trigger.ts:35-38`) rather than a data-bound list input. The style guide's related, narrower rule -- "Avoid overly complex logic in templates... refactor logic into the TypeScript code (typically with a computed)" (`d:/projects/github/angular/angular/adev/src/content/best-practices/style-guide.md:160-171`) -- supports the same instinct (templates stay declarative and inspectable) without stating the draft's specific claim.

Strength: moderate -- supported by convention across every first-party usage example, but not asserted as a named principle in any primary source read.

## Principle 13: Minimise Public API Surface

Draft: every input is a maintenance cost; ask whether a feature can be composition, CSS, or another directive before adding one; prefer 2-5 inputs over 20+ on one primitive.

Evidence:

- Verbatim match in Material's coding standard: "Once a feature is released, it never goes away. We should avoid adding features that don't offer high user value for [the] price we pay both in maintenance, complexity, and payload size. When in doubt, leave it out. This applies especially to providing two different APIs to accomplish the same thing. Always prefer sticking to a single API for accomplishing something." (`d:/projects/github/angular/components/CODING_STANDARDS.md:72-78`).
- The lightweight-injection-tokens guide is an entire document devoted to keeping optional relationships (an optional sub-component found via `contentChild`) from inflating the bundle of applications that never use them -- the bundle-size half of "every public API is a maintenance cost" the draft doesn't mention (`d:/projects/github/angular/angular/adev/src/content/guide/di/lightweight-injection-tokens.md:1-19`).

Strength: strong, close to verbatim.

## Principle 14: Layout Primitives Should Be Extremely Simple

Draft: ship small layout building blocks (`Stack`, `Cluster`, `Grid`, `Cell`, `Sidebar`, `Switcher`); each should solve one layout problem.

Evidence: this lens found no primary-source Angular-ecosystem statement of, or counter-example to, this principle. Neither the CDK nor Material ships general-purpose visual layout primitives of this kind; the CDK's own `layout` package is `BreakpointObserver` (a responsive-query service), not a set of layout components. That absence is a weak, indirect data point (the Angular team has not needed layout primitives in its own widely-used library) rather than a citation of a stated position.

Strength: weak (untested by this lens's sources); the headless-primitives/platform lens or the critique lens is better placed to evaluate this one, since it is closer to a design-system question than an Angular-framework question.

## Principle 15: Smart Components Belong Outside the Library

Draft: the library owns presentational components, styling/behaviour directives, accessibility primitives, and layout primitives; it excludes business logic, API calls, state management, and domain workflows.

Evidence: near-verbatim match in the library-authoring guide's advice for migrating application code into a library: "Declarations such as components and pipes should be designed as stateless, meaning they don't rely on or alter external variables... Components should expose their interactions through inputs for providing context, and outputs for communicating events to other components." It further recommends that libraries "declare their own providers, rather than declaring providers in the NgModule or a component" and expose a `provideXYZ()` function for any global service, keeping the library's own footprint narrow and tree-shakable (`d:/projects/github/angular/angular/adev/src/content/tools/libraries/creating-libraries.md:166-189`).

Strength: strong.

## The four layers

- **Layer 1 (Styling Directives)** and **Layer 2 (Behaviour Directives)**: both are strongly evidenced -- Layer 2 in particular is the best-evidenced concept in this whole research, since it is exactly Angular Aria's entire shape (Principle 2's evidence applies directly).
- **Layer 3 (Coordinating Components)**: needs the Principle 3 qualification applied directly to its own framing. As named, the layer implies coordination always produces a component; Angular's own Accordion, Tabs, and ng-bootstrap's Dropdown coordinate through directives with an injected coordinator instead. Consider renaming this layer "Coordinating primitives" and stating the actual test (does the coordinator need to render markup beyond what the caller's own elements already provide?) rather than naming it after component-only examples.
- **Layer 4 (Layout Primitives)**: weak evidence either way from this lens, per Principle 14.

## The decision framework

Four of the five questions hold as stated, evidenced above. The third needs the same correction as Layer 3: "Does it coordinate multiple elements? -> use a component" should read "Does it coordinate multiple elements **and need to render markup the caller's own elements don't already provide**? -> use a component. Coordinates without new markup? -> a directive with a DI-provided (or `hostDirectives`-composed) coordinator, as in Angular Aria's `AccordionGroup`/`Tabs` and ng-bootstrap's `NgbDropdown`."

## Additions: principles the draft lacks

### A. Library entry-point granularity has a stated Angular convention

One primary entry point plus one secondary entry point per logical unit, each with its own `ng-package.json`, is the documented Angular Package Format convention, and Material follows it literally: "the Angular Material package publishes each logical component or set of components as a separate entrypoint - one for Button, one for Tabs, etc. This allows each Material component to be lazily loaded separately." (`d:/projects/github/angular/angular/adev/src/content/tools/libraries/angular-package-format.md:151-159`; mechanics in `tools/libraries/creating-libraries.md:79-165`). Strength: strong. This effort's `building-blocks.md` should state its own entry-point granularity (one per primitive family, matching Material, or one for the whole library) as an explicit, deliberate choice rather than leaving it to `ng-packagr` defaults, since it directly determines whether "many small primitives" (Principle 6) actually pays off as a lazy-loading win.

### B. Lightweight injection tokens for optional content relationships

Whenever a coordinating directive/component finds an *optional* sub-part via `contentChild`/`contentChildren` (for example, an optional card header, an optional accordion icon slot), referencing the concrete class directly in the value position defeats tree-shaking even when the caller never uses that sub-part, because the compiler must retain anything referenced as a *value*, not just a *type* (`d:/projects/github/angular/angular/adev/src/content/guide/di/lightweight-injection-tokens.md:20-70`). The documented fix is a small abstract-class token (`abstract class LibHeaderToken {}`) that the concrete component provides itself via `useExisting`, queried instead of the concrete class (`lightweight-injection-tokens.md:95-135`). Strength: strong, and directly actionable: any optional sub-component this effort queries with `contentChild` should follow this pattern from the start, not retrofit it once bundle-size becomes a complaint.

### C. `hostDirectives` is the named mechanism for "composable behaviour" -- with stated limits

Already covered under Principles 5 and 7; worth restating as its own guide entry because the draft treats composability as an aspiration without naming the mechanism. Its constraints belong in the guide up front: host directives apply statically at compile time only (no dynamic composition at runtime), a host-composed directive may not be `standalone: false`, and composing the same shared dependency through two different alias paths is a compile-time error (NG8024) rather than a silent conflict (`d:/projects/github/angular/angular/adev/src/content/guide/directives/directive-composition-api.md:24-30, 239-266`).

### D. Declaration-site DI for projected content has a documented boundary and a documented escape hatch

Content projected via `<ng-content>` resolves its dependencies against the injector where it was *declared* in the template, not the injector of the component it renders inside -- so a component's `viewProviders` are invisible to its own projected content by design (`d:/projects/github/angular/angular/adev/src/content/guide/components/content-projection.md:255-277`, and the matching detail in `guide/di/hierarchical-dependency-injection.md:628-707`). When projected content genuinely needs to reach a view-level service or the projecting component instance, the documented escape hatch is to accept the content as an `<ng-template>` instead of projecting it directly, then render it through `NgTemplateOutlet` with an explicit `ngTemplateOutletInjector` (`content-projection.md:748-781`). This is directly relevant to this effort's `skipSelf`-based optional-parent pattern for content-projected items (`nfsAccordionToken`, etc.): the pattern this effort already uses (declaration-site injection via `inject(token, {optional: true, skipSelf: true})`) is the correct one for a directive applied directly to a projected element, and the `NgTemplateOutlet` escape hatch is the one to reach for only if a future primitive needs the projected content to see a *view-scoped* service rather than the declaring component's own providers.

### E. Token-naming conventions differ even within Angular's own first-party code

Angular's own style guide recommends naming a lightweight injection token as the component's base name plus a `Token` suffix, e.g. `LibHeaderToken` (`d:/projects/github/angular/angular/adev/src/content/guide/di/lightweight-injection-tokens.md:179-186`) -- the same shape this effort's `nfsAccordionToken` convention already uses (per `AGENTS.md`'s worked example). Angular Aria's own internal tokens do not follow that guidance: `ACCORDION_GROUP` is a bare `InjectionToken` constant in SCREAMING_SNAKE_CASE with no `Token` suffix (`d:/projects/github/angular/components/src/aria/accordion/accordion-tokens.ts:13`). Strength: strong as reassurance, not as a new finding -- this effort's existing convention has a documented primary-source basis in the Angular style guide itself, even though the newest first-party Angular code (Aria, 22.x) does not follow its own team's documented recommendation internally.

## Third-party library survey: agreement and splits

- **Spartan** (`spartan.ng`, fetched 2026-09-28) splits every primitive into two packages by design: `spartan/ui/brain` ("Unstyled, accessible primitives... Handles ARIA attributes, keyboard navigation, and focus management... Regular dependency with updates and maintenance included") and `spartan/ui/helm` ("Styled components with a shadcn-inspired design system... Built with Tailwind CSS classes you can edit directly... Lives in your codebase"). The FAQ states outright: "we adapted the copy-paste philosophy and design patterns from shadcn/ui (React) and Radix UI for Angular." Concretely, its `Hlm*` layer is directives and components composing `Brn*` behaviour through `hostDirectives`, exactly matching Principles 5/7/Addition C above, and its coordinating classes (`HlmAccordion`, `HlmAccordionItem`) are directives with dual attribute/element selectors, matching the Principle 1 correction, not components.
- **ng-primitives** (`ng-primitives.mintlify.app/introduction`, fetched 2026-09-28) is headless-only, with no styling layer at all: "we don't provide any styles, you provide your own to seamlessly blend with your brand's identity." It states its own lineage plainly: "Angular Primitives would not have been possible without inspiration from... Radix UI, Headless UI, React Aria." It ties its own major-version cadence to Angular's: "We release a new major version each time Angular releases a new major version." This is the closest third-party analogue to Angular Aria itself (directive-only, headless), and the sharpest contrast with Spartan's two-package split.
- **ng-bootstrap** (GitHub `ng-bootstrap/ng-bootstrap`) mixes both shapes concept-by-concept, exactly as this lens's Angular-ecosystem evidence recommends: `NgbDropdown` is directive-only coordination (Principle 3 evidence, above); `NgbAlert` is a component because it renders its own dismiss button. Its README frames itself as "widgets built from the ground up using only Bootstrap 5 CSS with APIs designed for the Angular ecosystem" -- i.e., CSS-only integration with no JS framework dependency, the same posture this effort takes toward Foundation.
- **PrimeNG** ships duplicate directive-and-component pairs for some concepts (`ButtonDirective` at `[pButton]` alongside the `Button` component at `p-button`), giving consumers an explicit choice rather than picking one shape per concept. Correction to this file's earlier read of PrimeNG's status: PrimeNG is not abandoned, it became a paid product going forward. PrimeTek's own announcement states that starting with the next major version, PrimeNG (and its React/Vue siblings) move to a commercial "PrimeUI" license: "these future major versions [PrimeNG 22, PrimeReact 11, PrimeVue 5] will be distributed under the PrimeUI license and will no longer be released as open source," while "all existing MIT-licensed versions remain MIT forever" (`primeui.dev/nextchapter`, sections "What Happens to Existing MIT Versions?", fetched 2026-09-28). The free continuation is **Optimus UI**, an OpenNG project: its GitHub description reads "80+ accessible, customizable Angular components under the MIT license. A community-maintained continuation of PrimeNG v21, built to stay open." (`gh api repos/openng-org/optimus-ui`, checked 2026-09-28: created 2026-06-29, last pushed 2026-09-28, not archived), and its own homepage states outright: "Optimus UI is a community MIT licensed fork of PrimeNG, now closed source and using a commercial license." (`optimus.openng.org`, fetched 2026-09-28). Any further PrimeNG comparison in the guide should treat PrimeNG v21-and-earlier (MIT) plus Optimus UI as the free lineage, and PrimeNG v22+/PrimeUI as the commercial one.
- **Optimus UI** (GitHub `openng-org/optimus-ui`, `packages/optimus-ui/src/button/button.ts`, fetched 2026-09-28) is, at the source level, a literal continuation of PrimeNG v21's architecture rather than a redesign: it ships the identical `[pButton]`/`[pButtonLabel]`/`[pButtonIcon]` directives alongside a `p-button` component (`button.ts:164-174, 576-634`), the same directive-for-native-augmentation-plus-component-for-full-widget split confirmed under Principle 1. It applies `hostDirectives: [Bind]` on every one of those four classes (`button.ts:62, 115, 172, 632`) -- a cross-cutting behaviour directive composed into the whole button family, a real-world example of Addition C (`hostDirectives` as the composition mechanism) at library scale, alongside Spartan's. Its public API, however, is still overwhelmingly the decorator-based `@Input()` form with getters and setters (`button.ts:203-388, 637-781`), with `input()`/`computed()` used only for a handful of internally-derived values (`fluid`, `isIconOnly`, `isTextButton`) -- a live counter-example to Principle 4's signals-first public API worth flagging to the guide author: even a library actively forked and maintained through September 2026 has not rebuilt its public surface around signals, because it inherited a 2021-era PrimeNG codebase rather than being designed signals-first from the start.
- **Clarity** (GitHub `vmware-clarity/ng-clarity`, `README.md`) splits along the same seam as this effort's own Foundation-Sass-only posture, but at the package level rather than the directive/component level: `@clr/ui` ships "the static styles for building HTML components" with no Angular dependency, and `@clr/angular` layers Angular components on top, depending on `@clr/ui` for styles. This is a package-boundary precedent for keeping styling entirely CSS-driven and framework-independent, distinct from (and complementary to) the directive-vs-component question the other libraries above answer.
- **NG-ZORRO** (`ng.ant.design/docs/introduce/en`, fetched 2026-09-28) is a large (70+ component), single-package library synchronized against an external design spec ("`ng-zorro-antd` synchronizes design specification with Ant Design on a regular basis"), and keeps the same major version as `@angular/core`. Its `nz-button` selector convention (`button[nz-button], a[nz-button]`, confirmed in source above) independently reaches the same Principle 1 shape as Material.
- **Taiga UI** (`taiga-ui.dev/getting-started`, fetched 2026-09-28) organizes its component docs by purpose (Form, Layout, Navigation) rather than by directive/component distinction, and is notable mainly for treating AI agents as first-class documentation readers (a flat `llms.txt`, an MCP server, and "agent skills") -- a documentation-tooling data point, not an architecture one; its getting-started page did not surface further architectural claims worth citing.

Where the third-party libraries split: **headless-only vs. dual-layer vs. single fully-styled layer** is the real fork. ng-primitives (headless-only, no styling) and Spartan (headless brain + separately-copyable styled helm) sit at opposite ends of "how much styling does the library itself own," while NG-ZORRO, PrimeNG, Optimus UI, and ng-bootstrap ship one fully-styled layer with no separate headless product. This effort's own posture -- Foundation's Sass is the only styling source, applied via directives/components that carry no visual opinion of their own -- sits closest to Clarity's package-level split (`@clr/ui` styles, `@clr/angular` behaviour) and to Spartan's `brain`/`helm` split in spirit, but without Spartan's copy-into-your-codebase step, since Foundation's CSS is consumed as a dependency, not vendored.

## Closing table

| Principle | Verdict | Reason (one line) | Key source |
|---|---|---|---|
| 1. Directive-First, Component-Second | Adopt with qualification | Right instinct, wrong axis: prefer attribute selectors over custom elements; template need (not directive-vs-component) decides the class kind | `a11y.md:74-78`; `MatButton`, `button.ts:28-42`; Optimus UI `button.ts:164-174, 576-634` |
| 2. Every Concept May Have a Directive | Adopt | Angular Aria is exactly this, at first-party scale, directive-only | `a11y.md:66-67`; `src/aria/accordion/`, `src/aria/tabs/` |
| 3. Components Exist for Coordination | Adopt with qualification | Falsified as written: Angular's own Accordion/Tabs and ng-bootstrap's Dropdown coordinate via directives + DI, no component | `accordion-group.ts:61-62`; `tabs.ts:52-53`; ng-bootstrap `dropdown.ts:48-162` |
| 4. Signals-First Public APIs | Adopt | Confirmed by guidance and Angular's own 22.x source; caveat: Optimus UI's actively-maintained 2026 fork still ships a mostly decorator-based public API | `inputs.md:270`; `accordion-trigger.ts:73-89`; Optimus UI `button.ts:203-388` |
| 5. Composition Over Configuration | Adopt with qualification | Confirmed, with a named mechanism (`hostDirectives`) and documented sharing-conflict rules to design around | `CODING_STANDARDS.md:48-62`; `directive-composition-api.md:170-266` |
| 6. Small Primitives Over Large Components | Adopt with qualification | Confirmed, but only pays off as lazy-loading if paired with one entry point per primitive family | `CODING_STANDARDS.md:64-70`; `angular-package-format.md:151-159` |
| 7. Behaviour Must Be Composable | Adopt | This principle IS `hostDirectives`; Spartan's `HlmAccordionItem` is a working demonstration | `directive-composition-api.md`; spartan.ng `/components/accordion` |
| 8. Preserve Native HTML | Adopt with qualification | Confirmed; wrapper elements (input, textarea) need a content-projecting container component, not a replacement element | `a11y.md:80-87`; `CODING_STANDARDS.md:274-306` |
| 9. Browser API First | Adopt | Corroborated by Aria's own light-abstraction event managers, though this lens is secondary evidence for it | `ui-pattern-rules.md:99-238` |
| 10. Accessibility Is First-Class | Adopt | Confirmed; reuse the CDK's own `LiveAnnouncer`/`cdkTrapFocus`/high-contrast mixin rather than reinventing them | `a11y.md:52-64`; `CODING_STANDARDS.md:388-396` |
| 11. Prefer CSS State Over Framework State | Adopt with qualification | Holds for platform-owned state (native controls); Angular's own accordion keeps state in signals and reflects it outward when no native element models it | `accordion-trigger.ts:46-89` |
| 12. Template Readability Is a Primary Goal | Adopt | Supported by convention across every first-party usage example, not asserted by name in any source read | `accordion-trigger.ts:35-38`; `style-guide.md:160-171` |
| 13. Minimise Public API Surface | Adopt | Near-verbatim match, plus a bundle-size dimension (lightweight tokens) the draft omits | `CODING_STANDARDS.md:72-78`; `lightweight-injection-tokens.md:1-19` |
| 14. Layout Primitives Should Be Simple | Untested | No Angular-ecosystem source addresses this; better evaluated by the platform or critique lens | none in this lens |
| 15. Smart Components Belong Outside | Adopt | Near-verbatim match in the library-authoring guide | `creating-libraries.md:166-189` |
| Layer 3: Coordinating Components | Adopt with qualification | Rename to "coordinating primitives"; component only when new markup is needed, else a directive coordinator | same as Principle 3 |
| Decision framework, "coordination -> component" | Adopt with qualification | Add "and needs new markup" to the test | same as Principle 3 |
| Add: library entry-point granularity | Add | Documented Angular Package Format convention; Material follows it literally | `angular-package-format.md:151-159` |
| Add: lightweight injection tokens for optional content | Add | Prevents tree-shaking failures for optional sub-parts found via `contentChild` | `lightweight-injection-tokens.md:20-135` |
| Add: `hostDirectives` named and its limits stated | Add | Names the mechanism behind Principles 5/7 and its static-only, alias-conflict constraints; Optimus UI applies one shared `Bind` host directive across its whole button family | `directive-composition-api.md:24-30, 239-266`; Optimus UI `button.ts:62, 115, 172, 632` |
| Add: declaration-site DI boundary and escape hatch for projected content | Add | Documents why `viewProviders` don't reach projected content, and the `NgTemplateOutlet` + explicit injector escape hatch | `content-projection.md:255-277, 748-781` |
| Add: token-naming convention (`*Token` suffix) has a primary-source basis | Add (reassurance) | This effort's `nfsAccordionToken` convention matches the Angular style guide's own recommendation | `lightweight-injection-tokens.md:179-186` |
