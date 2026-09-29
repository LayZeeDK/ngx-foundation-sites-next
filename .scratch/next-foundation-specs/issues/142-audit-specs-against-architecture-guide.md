# 142. Audit: the specs against the architecture guide

Type: grilling
Status: resolved
Blocked by: 100, 101, 105, 106, 138, 139, 141, 143, 144, 145, 146, 147, 148, 149, 150
Labels: wayfinder:grilling
Map: ../map.md

## Question

Where does each published spec fall short of the guide that [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md) adopts, and which of those findings survive deduplication and triage?

## How to work it

It runs after every wave spec is published and after [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) and [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), including the re-run tickets they create, are resolved, so the auditors read final spec text and no resolution collides with another. The orchestrator adds those re-run tickets to Blocked by when they are created.

1. Auditors (Sonnet 5 evidence sweeps), one per group of about nine specs, check every spec against every principle of `architecture-guide.md` and write findings to `research/architecture-audit-<group>.md`: spec, section, principle, what the spec says (quoted), why it falls short, and the smallest change that meets the principle.
2. A judge (Opus 5.5) deduplicates the findings across groups (one finding for one cause, listing every spec it reaches), verifies each against the spec text, drops false positives with the reason, and rates each survivor under the map's triage rule. A HIGH impact survivor without HIGH confidence goes to the user as OPEN FOR HUMAN.
3. Answer: the deduplicated finding table with verdicts, and for the survivors one re-run ticket per affected spec (or one ticket for a cross-cutting change), each blocking [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md).
4. Check every spec with more than one directive for its In-family check lines by the rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md), every parent token for its development-only description, and the eight families of that spec's `strictParents` table (Nested menu, Menu, Breadcrumbs, Pagination, Slider, Orbit, Equalizer, Drilldown Menu) for a line saying their part throws under `strictParents`, and the Drilldown Menu for why its root's wrapper injection stays optional.

## Answer

### Panel

- Auditors: six Sonnet 5 evidence sweeps, one per group, each checking every spec of its group against P1 to P26: group a (Abide to Button), b (Callout to Flexbox Utilities), c (Float Classes to Menu, with the forgotten-import checks spec), d (Nested menu to Responsive Menu), e (Responsive Toggle to Thumbnail), f (Toggler to XY Grid, with the Variant declaration tooling). Findings: `research/architecture-audit-a.md` to `research/architecture-audit-f.md`.
- Judge: Opus 5.5, who verified every finding against the spec text of 2026-09-29 and the records that outrank the guide, and also worked the four spec findings [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md) routed here. Deduplicated table, evidence, and reasons: [research/architecture-audit-triage.md](../research/architecture-audit-triage.md).

### Counts

64 raw items (53 spec findings, 7 guide problems, 4 routed items) become 18 findings: 11 survive, one of them OPEN FOR HUMAN, and 7 are dropped. They resolve into 5 re-run tickets, 10 fixer items (14 edits), 5 guide edits, 3 `building-blocks.md` edits, and 1 item OPEN FOR HUMAN.

The checks of item 4: only the Accordion lists In-family check lines (`accordion.md:156`); `nfsDirectiveCheck`, `strictParents`, and "In-family" appear in no other spec but the Breakpoint service and the shared spec. 13 of the corpus's 15 parent tokens lack their development description. None of the eight `strictParents` families says its part throws, and the Drilldown Menu does not say why its root's wrapper injection stays optional.

### Findings and verdicts

| ID | Finding | Principle | Verdict |
| --- | --- | --- | --- |
| T1 | 30 specs with more than one directive predate ADR 0046: no In-family line per part, no `strictParents` line, no Drilldown wrapper reason, parent tokens without descriptions (also Reveal's token) | P24 | Survives: R1 to R5, X1 to X6 |
| T2 | 17 single-directive specs do not state the `nfsDirectiveCheck` call | P24 | Dropped against the specs (building-blocks 1.9 is inherited; [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md)'s own routing); the shared spec's rule line corrected: X7 |
| T3 | The Accordion's lines are one bullet | P24 | Dropped: [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md)'s proposal 10 text, all five items per part |
| T4 | Typography Helpers says a forgotten `NfsPrintStyles` "reports nothing" | P24 | Survives: X8 |
| T5 | Float Classes and Float Grid development checks read the computed `direction`, unrecorded in building-blocks 1.5 | P21 | Survives against the record: BB1, BB2, E5 |
| T6 | The Slider's non-linear value text has no stated format | P21 | Survives: X9, E5 |
| T7 | `[nfsTooltip]` accepts any element | P5 | Dropped: interactivity includes ARIA-role hosts a selector cannot list; D5 |
| T8 | Progress Bar states no kind for `value`, `min`, `max` | P9 | Dropped: [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md) does not rate published `inert` rows |
| T9 | One `nfs-prototyping-utilities` mixin for seventeen export mixins, against ADR 0012's dated note | P18 | OPEN FOR HUMAN |
| T10 | Forms and Abide cite NG0309, which building-blocks 1.9 measured not to occur | P8 | Survives: X10 |
| T11 | `color-luminance()` ratios in Accordion and Forms | P17 | Dropped here: row R4 of `research/consistency-review-routed-items.md` carries it to [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) |
| T12 | Reveal and Accordion measure the timer always | P19 | Dropped: building-blocks 1.6 rule 1 now measures always |
| G1 | P13's "four-step order" is ambiguous | P13 | Survives: E2 |
| G2 | P10 and a service's methods | P10 | Dropped: methods are not a forbidden form; 1.7 records the reactive reads |
| G3 | P26 "one tab stop per composite" and the Accordion | P26 | Dropped: an accordion is not a composite (APG: every header in the Tab sequence) |
| G4 | P4 and development-only class lookups | P4 | Survives: E1 |
| G5 | P17 lacks the Drilldown's `invisible` ancestor levels | P17 | Survives: E3, BB3 |
| G7 | P19 quotes the old 1.6 rule 1 and omits rule 5's exception | P19 | Survives: E4 |

Group d's P18 guide problem is T9: the guide restates ADR 0012 correctly, so P18 needs no edit.

### Triage

| Item | Impact | Confidence | Verdict |
| --- | --- | --- | --- |
| T1 | MEDIUM: development-only checks in 30 specs; the `strictParents` part list is fixed already | HIGH: ADR 0046, building-blocks 1.9, and the shared spec's rule decide the form | Decided: R1 to R5, X1 to X6 |
| T2 | LOW: one sentence of the shared spec | HIGH: building-blocks 1.9 and [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md)'s routing | Decided: X7 |
| T4 | LOW | HIGH: ADR 0046's runtime and static checks report it | Decided: X8 |
| T5 | LOW: development-only checks | HIGH: the Slider exception's own reason, stated by both Float specs | Decided: BB1, BB2, E5 |
| T6 | MEDIUM: what assistive technology speaks | HIGH: Material's default `` `${value}` ``; P21 needs no locale service | Decided: X9, E5 |
| T9 | HIGH: Library mixin names are consumer-facing Sass API, frozen at the first release (ADR 0045) | NOT HIGH: the applied default contradicts ADR 0012's dated note, ADR 0044 says "the family's Library mixin", and an umbrella is a vocabulary choice no record makes | OPEN FOR HUMAN |
| T10 | LOW: a wrong reason; each decision stands on its others | HIGH: measured with Angular 22.2.0 (building-blocks 1.9, `menu.md:133`) | Decided: X10 |
| G1, G4, G5, G7 | LOW: guide wording; no spec changes | HIGH: each follows a record quoted in the triage file | Decided: E1 to E4, BB3 |

### Re-run tickets

Five tickets, one per family group, each blocking [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md). One ticket over 25 specs would be one long serial run of small edits; 25 tickets would repeat one brief and split parent lists that cross specs. The groups keep each cross-spec list in one ticket and touch disjoint specs, so they can run in parallel.

What every one of them decides, per part, by `specs/forgotten-import-checks.md:198-206` (the Accordion's `accordion.md:156` is the worked example):

1. The call's name; the parent check (the parent directives, meaning the provider and every directive that hosts it, with the family's `alone` sentence) or "none" for a required injection; the child probes (the child directives in the part's scope; the Accordion probes every DOM-nested child); the peers linked by reference or value; the `strictParents` effect from the table (`forgotten-import-checks.md:232-253`) or "nothing".
2. Where an existing development warning reports a part outside its optional parent, it becomes the parent check's `alone` sentence, so the part reports once (`forgotten-import-checks.md:191`).
3. Where an existing check reports placement from the DOM alone (building-blocks 1.9), whether its message still holds when the parent's own import is forgotten and the parent element lacks its class.
4. Each parent token's development-only description in M7's form (`forgotten-import-checks.md:255-263`), and its wording where a token has several providers.
5. A part whose host is `ng-template` or `ng-container` says it calls nothing.

- R1. Title: "Re-run: navigation family specs, In-family check lines". Specs: Menu, Nested menu, Drilldown Menu, Top Bar, Breadcrumbs, Pagination. Items: the throw under `strictParents` for `li[nfsMenuText]`, `li[nfsMenuItem]`, `span[nfsSubmenuToggleText]`, `li[nfsBreadcrumbsItem]`, the three Pagination items, and `li[nfsDrilldownBack]`; the Drilldown root's wrapper injection kept optional, with its reason (`forgotten-import-checks.md:249`); `NfsMenuItem` and `NfsDrilldownBack` to `NfsSubmenu` and the Nested menu root to `nfsTopBarRightToken` kept optional (`:250`, `:251`); descriptions for `nfsMenuModeToken` (four root providers) and `nfsTopBarRightToken`. Also decides: the parent directives of `NfsMenuText` (`NfsMenu` and every directive that hosts it, across four specs) and of `NfsMenuItem`. Evidence: `menu.md:116`, `nested-menu.md:140`, `:146`, `:212`, `drilldown-menu.md:145-148`, `:164`, `top-bar.md:128`, `breadcrumbs.md:108`, `:112`, `pagination.md:110`.
- R2. Title: "Re-run: disclosure and carousel family specs, In-family check lines". Specs: Triggers, Off-canvas, Responsive Toggle, Tabs, Orbit. Items: the throw for Orbit's five class-only parts, whose development check 8 becomes their parent check; `nfsClose` and `nfsToggle` and the Off-canvas panel's content injection kept optional (`:246`, `:247`), Triggers' check 1 staying; descriptions for `nfsOpenableToken` (six library providers and consumer implementations, ADR 0013, so it names no single directive), `nfsOffCanvasContentToken`, `nfsTabsGroupToken`, `nfsTabsToken`, `nfsOrbitToken`; peers: Tabs' value-keyed panels, the overlay's panel reference, the Trigger targets, the Responsive Toggle's `menu`. Evidence: `triggers.md:121`, `off-canvas.md:175`, `responsive-toggle.md:199`, `tabs.md:146`, `orbit.md:168`.
- R3. Title: "Re-run: form and value-control family specs, In-family check lines". Specs: Abide, Forms, Switch, Slider, Progress Bar. Items: the throw for `span[nfsSliderFill]`, whose development check 6 becomes its parent check; `NfsAbideInput`'s injections kept optional (`:248`); descriptions for `nfsAbideToken`, `nfsAbideLabelToken`, `nfsSliderToken`, `nfsProgressToken`; the probes of the input group, the Switch, and the Progress meter; the Forms and Abide lines decided together, because their directives sit beside each other on one element (`forms.md:148`). Evidence: `abide.md:155`, `forms.md:132`, `switch.md:126`, `slider.md:153`, `:158`, `:236`, `progress-bar.md:116`.
- R4. Title: "Re-run: CSS-only component and free-behaviour family specs, In-family check lines". Specs: Card, Media Object, Table, Sticky, Equalizer. Items: the throw for `[nfsEqualizerWatch]`, whose "found no nfsEqualizer" warning becomes the `alone` sentence; the description for `nfsEqualizerToken`; the probes of the card, media object, table scroll, and sticky container; the Media Object's check 3 kept as a DOM check, with its message decided for a forgotten `NfsMediaObject`. Evidence: `card.md:95`, `media-object.md:165`, `table.md:104`, `sticky.md:129`, `equalizer.md:136`, `:144`.
- R5. Title: "Re-run: layout system and flex utility family specs, In-family check lines". Specs: XY Grid, Float Grid, Flex Grid, Flexbox Utilities. Items: the probes of `grid-x`, `grid-y`, and rows; the Float Grid's and Flex Grid's `NfsRow` and `NfsColumn` lines agreeing, as the manifest's rule 2 requires the same selector and host class (`forgotten-import-checks.md:143`); `NfsFlexContainer` hosting `NfsFlexAlign`, which records itself (`:175`); the XY Grid's check 2 and the Flex Grid's DOM check kept, with their messages decided for a forgotten parent. Evidence: `xy-grid.md:210`, `float-grid.md:160`, `flex-grid.md:127`, `flexbox-utilities.md:124`.

A sixth, "Re-run: Prototyping Utilities spec, architecture-guide findings", follows only if the user picks option (b) or (c) of T9 below.

### Fixer items

Quoted text is the replacement or the addition; each needs no decision. Specs link to tickets as `../issues/...`.

- X1. `specs/interchange.md`, Hierarchy and DI shape: after the bullet that begins "- Entry point: `ngx-foundation-sites/interchange`", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsInterchange` calls `nfsDirectiveCheck('NfsInterchange')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing; `NfsInterchangeOutlet` sits on `ng-container` and calls nothing, so only the static check sees a forgotten outlet.

- X2. `specs/prototyping-utilities.md`, Hierarchy and DI shape: after the bullet that begins "- Entry point: `ngx-foundation-sites/prototyping-utilities`", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): each of the eighteen directives calls `nfsDirectiveCheck` with its class name (`nfsDirectiveCheck('NfsPrototypeSpacing')`), with no parent check, no child probes, and no peers, because no directive of the family needs another on any element, and `strictParents` changes nothing.

- X3. `specs/typography-helpers.md`, Hierarchy and DI shape: after the bullet that begins "- Entry point: `ngx-foundation-sites/typography-helpers`", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsTextAlignment`, `NfsTypographyHelpers`, `NfsNoBullet`, `NfsTypographyBase`, and `NfsPrintStyles` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.

- X4. `specs/visibility-classes.md`, Hierarchy and DI shape: after the bullet that begins "- Entry point: `ngx-foundation-sites/visibility`", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsVisibility`, `NfsShowForSr`, and `NfsShowOnFocus` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.

- X5. `specs/toggler.md`, Hierarchy and DI shape: after the bullet that begins "- Entry point: `ngx-foundation-sites/toggler`", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsToggler` calls `nfsDirectiveCheck('NfsToggler')` and `NfsClassToggler` calls `nfsDirectiveCheck('NfsClassToggler')`, each with no parent check, no child probes, and no peers (a Trigger reaches either by template reference or as the Nearest Openable, links the Triggers spec lists), and `strictParents` changes nothing.

- X6. `specs/reveal.md:160`: replace "`nfsRevealToken = new InjectionToken<NfsReveal>('nfsRevealToken')`, in a token file that imports only types (building-blocks 1.9, ADR 0009)" with:

  > `nfsRevealToken = new InjectionToken<NfsReveal>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsRevealToken (provided by NfsReveal from 'ngx-foundation-sites/reveal' on an ancestor element declared in the same template)" : '')`, its description in development builds only, in a token file that imports only types (building-blocks 1.9, ADR 0009)

- X7. `specs/forgotten-import-checks.md:206`: replace "A single directive's spec states only that it calls `nfsDirectiveCheck` with its name." with:

  > A spec with a single directive and no parent, child, or peer adds no line: building-blocks 1.9, which every spec inherits, gives the directive the call with its class name.

- X8. `specs/typography-helpers.md:583`: replace "sets nothing and reports nothing, and the loss shows only on paper, so the usage example names the import and the `--print-breaks` e2e case covers the library's own stories (the architecture guide's P24)." with:

  > sets nothing, and the loss shows only on paper; in development the `strictDirectiveImports` Runtime check reports the attribute on screen and the opt-in static check reports it in CI ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)), the usage example names the import, and the `--print-breaks` e2e case covers the library's own stories (the architecture guide's P24).

- X9. `specs/slider.md:258`, the `[attr.aria-valuetext]` row: replace "`displayWith(value)`; for a non-linear handle without `displayWith`, the value as text; otherwise absent" with:

  > `displayWith(value)`; for a non-linear handle without `displayWith`, `` `${value}` `` (JavaScript's number-to-string conversion with no locale format, as Material's default `displayWith`); otherwise absent

- X10. The NG0309 reason, five edits:
  - `specs/forms.md:148`: replace "`NfsAbideLabel` does not host `NfsFormLabel`: a consumer who also wrote `nfsFormLabel` would match the directive twice, which Angular rejects at run time (NG0309, "Directive ... matches multiple times on the same element"), and `middle` would be spelt through a different directive on validated and unvalidated labels." with "`NfsAbideLabel` does not host `NfsFormLabel`: `middle` would be spelt through a different directive on validated and unvalidated labels."
  - `specs/forms.md:440`: replace "(writing both attributes throws NG0309, and `middle` would be spelt through two directives)" with "(`middle` would be spelt through two directives)".
  - `specs/abide.md:154`: replace "a consumer who also wrote the hosted attribute would match the directive twice, which Angular rejects at run time (NG0309), the hosted look would be forced on every host" with "the hosted look would be forced on every host".
  - `specs/abide.md:570`: replace "(a written `nfsCallout` would match twice, NG0309; the Abide entry point would import Callout's)" with "(the Abide entry point would import Callout's)".
  - `specs/abide.md:571`: replace "(a written `nfsFormLabel` would throw NG0309, and `middle` would be spelt through two directives)" with "(`middle` would be spelt through two directives)".

### Shared-document proposals (the orchestrator applies)

Guide edits, `architecture-guide.md`:

- E1, P4, Rule: after "and reports it in development." append:

  > A lookup that exists only in development builds, for a placement warning, may inject the parent's class instead of a token where both sit in one entry point, because the guard removes it from production (Menu D9; the Breadcrumbs and Pagination items).

- E2, P13, Rule: replace "Variant inputs follow the four-step order (a Foundation Option that names the family, then the hosted Aria input's name, then one enum per set of mutually exclusive names named for its dimension, then a boolean named after its class)" with:

  > each Variant input takes its name from the first step of building-blocks 1.4's naming order that applies (a Foundation Option that names the family, then the hosted Aria input's name, then one enum per set of mutually exclusive names named for its dimension, then a boolean named after its class), an order for choosing one input's name, not for declaring a directive's inputs

- E3, P17, Rule: replace "(dialogs and top-layer elements, the closed Off-canvas panel, the Tooltip tip)" with:

  > (dialogs and top-layer elements, the closed Off-canvas panel, the Tooltip tip, a hidden Drilldown ancestor level)

- E4, P19, Rule: replace "the declared duration plus 100 ms, the duration measured from the host's computed `animation-*` or `transition-*` where the Motion class is consumer-chosen or the length is a consumer Sass setting, a measured zero completing at once;" with:

  > the duration measured from the host's computed `animation-*` or `transition-*` once the class is bound, plus 100 ms, a measured zero completing at once;

  and replace "`prefers-reduced-motion` shortens every library animation to 1 ms;" with:

  > `prefers-reduced-motion` shortens every library animation to 1 ms, and a directive may in addition bind no consumer Motion class while `reducedMotion()` is true and complete the change in the same tick (building-blocks 1.6 rule 5: the Responsive Toggle, the Dropdown);

- E5, P21, Rule: replace "Two recorded Slider exceptions: its Handles read the host's computed `direction` in client event handlers, because native range inputs and the Fill follow CSS direction (building-blocks 1.5), and a non-linear Handle without `displayWith` speaks "the value as text", whose locale format the Slider spec does not state (an open point for the audit)." with:

  > Recorded exceptions (building-blocks 1.5): a read of the rendered layout takes the computed `direction`, because the layout follows CSS direction, which `Directionality` does not see below a `dir` it does not track: the Slider's Handles in client event handlers, and the development geometry checks of the Float Classes and the Float Grid. A non-linear Slider Handle without `displayWith` speaks `` `${value}` ``, with no locale format, as Material's default `displayWith` does.

  and in its Decided-by line replace "building-blocks 1.5 (RTL, with the Slider exception)" with "building-blocks 1.5 (RTL, with its rendered-layout exceptions)".

`building-blocks.md` edits:

- BB1, 1.5, the RTL bullet: replace "Exception: the Slider reads the host's computed `direction` in client event handlers, because its native inputs and fill follow CSS direction." with:

  > Exceptions, each a read of the rendered layout, which follows CSS direction while `Directionality` reports only the `dir` of the document or of an element carrying CDK's `Dir` directive: the Slider reads the host's computed `direction` in client event handlers, because its native inputs and fill follow CSS direction; and the development geometry checks of the Float Classes (check 2) and the Float Grid (D9) read the parent's or the row's computed `direction`, because float placement follows it (2026-09-29, [Audit: the specs against the architecture guide](issues/142-audit-specs-against-architecture-guide.md)).

- BB2, 1.10, the Strings and direction bullet: replace "(1.5, with the Slider's handler exception)" with "(1.5, with its exceptions for reads of the rendered layout)".
- BB3, 1.10, the hidden-content bullet: after "shows at larger breakpoints (1.11 decision 8)." insert:

  > A hidden Drilldown ancestor level, which still holds the open level, uses Foundation's `invisible`, never `inert`, because `inert` cannot be undone inside a subtree and the open level's `visible` overrides `visibility: hidden` ([Spec: Nested menu (shared utility)](issues/56-spec-nested-menu.md), D9, measured in [Prototype: Nested menu directive family with breakpoint mode switching](issues/50-prototype-nested-menu.md); recorded 2026-09-29 by [Audit: the specs against the architecture guide](issues/142-audit-specs-against-architecture-guide.md)).

### OPEN FOR HUMAN

T9, the Prototyping Utilities' Library mixin. `specs/prototyping-utilities.md:584` gives the whole page one `nfs-prototyping-utilities` mixin over seventeen family export mixins (`foundation-prototype-spacing` to `foundation-prototype-text-decoration`) and Foundation's umbrella `foundation-prototype-classes`. ADR 0012's dated note, written before the spec, says "an entry point whose docs page covers several Foundation export mixins gets one Library mixin per export mixin, named after it and included after it, so each check runs only for a component the consumer compiles"; ADR 0044 speaks of "the family's Library mixin". With one mixin, the arrow check runs, the responsive spacing reprint prints, and every registry's Variant and flag properties are written whether or not the consumer compiled that export mixin, so `strictVariantProperties` cannot report a directive whose Foundation export mixin is missing.

- (a) Keep one `nfs-prototyping-utilities`, and add a dated note to ADR 0012 making a standalone utility family an exception. For: one include; the spec's single presence marker (D19) stays. Against: the costs above; the Top Bar and Typography Helpers follow the rule.
- (b) One Library mixin per prototype export mixin that needs one (`nfs-prototype-spacing` after `foundation-prototype-spacing`, and so on), each writing its own registry, flag, and presence properties. For: the record's rule, and each check and reprint only for what the consumer compiles. Against: up to seventeen includes for a consumer who writes Foundation's umbrella; seventeen public names; D19 changes.
- (c) (b), plus `nfs-prototype-classes`, named after Foundation's umbrella export mixin `foundation-prototype-classes`, included after it, and including the seventeen. For: the rule read literally (the umbrella is itself an export mixin), with one include for the common case, as Foundation offers. Against: eighteen public names; an umbrella the Typography Helpers did not add for `foundation-typography`.

Recommendation: (c). Why confidence is not high: the applied default contradicts ADR 0012's dated note, ADR 0044's singular wording points the other way, and whether to add an umbrella is a vocabulary choice no record makes. After the ruling, (b) or (c) opens "Re-run: Prototyping Utilities spec, architecture-guide findings", which the audit after it checks (map, Audits), since [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) resolved on 2026-09-29 with T9 open; (a) is a dated note on ADR 0012.

No ADR from this ticket. No prototype is needed.

### Gist for Decisions so far

- [Audit: the specs against the architecture guide](issues/142-audit-specs-against-architecture-guide.md) -- six Sonnet 5 auditors checked the 53 specs against the guide's 26 principles, and an Opus 5.5 judge triaged 64 raw items into 18 findings: 11 survive and 7 are dropped. The one cross-cutting cause, specs written before ADR 0046, goes to five family-group re-runs (navigation; disclosure and carousel; forms and value controls; CSS-only components and free behaviours; layout systems and flex utilities) that add each part's In-family check line, the `strictParents` throws, the Drilldown's kept-optional wrapper, and the parent tokens' development descriptions, with fixer lines for five families whose parts never nest and for Reveal's token; single-directive specs need no line, because building-blocks 1.9 gives every directive the call, and the shared spec's rule now says so. Ten fixer items in all: also the Slider's non-linear value text becomes `` `${value}` ``, as Material's default; Forms and Abide drop an NG0309 reason that building-blocks 1.9 measured false; Typography Helpers no longer says a forgotten import reports nothing. The guide's P4, P13, P17, P19, and P21 are edited, and building-blocks 1.5 and 1.10 record the Float checks' computed-direction reads and the Drilldown's invisible levels. The Prototyping Utilities' one Library mixin for seventeen export mixins, against ADR 0012's dated note, is OPEN FOR HUMAN (recommended: one per export mixin plus `nfs-prototype-classes`); no ADR. Findings: [research/architecture-audit-triage.md](research/architecture-audit-triage.md).
