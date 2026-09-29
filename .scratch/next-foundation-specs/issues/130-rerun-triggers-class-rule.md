# 130. Re-run: Triggers (shared utility) spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Triggers (shared utility)](54-spec-triggers.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/triggers.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Triggers (shared utility)](54-spec-triggers.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK as a self-grilling (both sides) against the sources the ticket names, with `/domain-modeling` for vocabulary and `/to-spec` for the revision. Spec: [specs/triggers.md](../specs/triggers.md), revised in place; the dated amendment is in the [Spec: Triggers (shared utility)](54-spec-triggers.md).

Gist: the Triggers have no Foundation class and still bind none, so they gain no directive, Variant input, Variant registry, Variant property, or Runtime check request. What the consumer still wrote goes: trigger hosts become `nfsButton`, `nfsCloseButton` (with a bare `nfsClose` beside it, since it closes nothing itself), or `nfsMenuIcon`, placed beside the Trigger rather than hosted; every Openable, title bar, menu, and callout in the examples is its directive. The `data-closable` replacements write no library class: hiding in place animates through the Toggler's typed Motion input, and removal with `@if` animates only with the consumer's own keyframe class, or hides through the Toggler first and is removed in its `closed` output for a library Motion. No Openable writes a class on its Triggers. The 2.5.8 row takes the Close Button's 24 px floor and the Top Bar spec's menu-icon hit area. API, contract, Trigger roles, ARIA, keyboard, rendering modes, and Story ids are unchanged.

### Grilling record

Sources: FS = the Foundation 6.9.0 clone; ADR 0039 with its follow-up decision on class names in input values; ADR 0040; T = `research/out-of-scope-triage.md`; X = `research/out-of-scope-exclusions.md`; BB = `building-blocks.md` as it stands; CB = the [Spec: Close Button](83-spec-close-button.md) and its Answer; CO = the [Spec: Callout](89-spec-callout.md) and its Answer; the spec before this revision is "the spec".

Round 1 (no prerequisites): which classes exist, and who binds them.

1. **Does a Trigger have a Foundation class?** No. The Triggers utility writes none (FS `js/foundation.util.triggers.js`); of the responding plugins only Dropdown writes one on its anchors, `.hover` while open (FS `js/foundation.dropdown.js:252`, `:293`), which no Foundation Sass reads (FS `scss/`: the only `.hover` is `table.hover`, `scss/components/_table.scss:321`) and the [Spec: Dropdown](26-spec-dropdown.md) already drops. Reveal, Off-canvas, and Toggler add no class to their triggers (FS `addClass` calls in those plugins, all on the plugin's own element, content, overlay, `html`, or `body`). So no directive, no Variant input, no registry, no Variant property, and no Runtime check request; item (6) of the Sass subsection is "none".
2. **Which consumer-written classes did the spec carry?** Rendered HTML: `class="dropdown-pane"`, `class="reveal"`, `class="close-button"`, `class="title-bar"`, `class="menu-icon"`, `class="title-bar-title"`. Usage examples: `class="dropdown"`, `class="secondary"`, `class="alert"`, `class="hollow"` on `nfsButton`; `class="reveal"` twice; `class="title-bar"`, `class="title-bar-left"`, `class="menu-icon"`; `class="off-canvas position-left"`; `class="close-button"` three times; `class="vertical menu"`; `class="secondary callout"` and `class="callout"` twice; `animate="nfs-fade-in nfs-fade-out"` twice and `animate.leave="nfs-fade-out"`, library class names as values. Prose that left classes to hosts: the 2.5.8 row (`.close-button` through the spacing exception, `.menu-icon` through `nfs-responsive-toggle`), layer 1's host rule, and the Sass subsection's "Close Button markup" and "Title Bar markup". Source: the spec.
3. **Who binds them?** `.button` and its Variants: `nfsButton` with `dropdown`, `color`, `fill` ([Re-run: Button spec under the class rule](128-rerun-button-class-rule.md)). `.close-button` and its sizes: `nfsCloseButton` (CB decisions 1, 4). `.title-bar`, `.title-bar-left`, `.title-bar-title`, `.menu-icon`: `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarTitle`, `button[nfsMenuIcon]` (T section 2, Top Bar row, HIGH, HIGH; the [Spec: Top Bar](86-spec-top-bar.md), in progress, fixes them). `.dropdown-pane` and `.reveal`: already static host classes of `NfsDropdownPane` and `NfsReveal` (their specs' class mappings). `.off-canvas` and `.position-left`: `nfsOffCanvas` with a `position` input; Foundation has no `data-position` Option and reads the class (FS `js/foundation.offcanvas.js:106`), so BB 1.4 naming rule 3 gives the dimension Foundation's code and class template use; the [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md) decides it. `.menu.vertical`: `nfsMenu orientation="vertical"` (the [Spec: Menu](85-spec-menu.md)). `.callout`, `.secondary`: `nfsCallout color="secondary"` (CO).
4. **Should a Trigger host the class directive of its host, or the class directive host the Trigger?** For hosting: one attribute instead of two, and Foundation's examples always pair them. Against: host directives are static, so a Trigger hosting `NfsButton` would make every Trigger a `.button`, including close buttons, menu icons, and links; `nfsCloseButton` hosting `NfsClose` was rejected by CB decision 2 (a close button whose handler removes content, or that submits `<form method="dialog">`, must be able to leave the Trigger off); the map's composition preference places directives beside each other. Settled: beside, never hosted (D16).

Round 2 (depends on 1-4): the `data-closable` replacements and State classes.

5. **What replaces `animate.leave="nfs-fade-out"` in the removal recipe?** ADR 0039's follow-up rules out the value; the user added "keep in mind to use `animate.enter` and `animate.leave` when applicable" ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md), follow-up decision). Options:
   - (a) A shared typed leave directive (`nfsLeave="fade-out"`) that binds `animate.leave` with the mapped `nfs-*` class. For: a one-to-one typed replacement, the user's `animate.leave` hint, the library's reduced-motion override. Against: a new public directive and a shared Motion name type that the Toggler, Reveal, Dropdown, Responsive Toggle, and Tooltip re-runs are typing now; BB Part 3 gives Motion no spec of its own; Foundation's `data-closable` never removed anything (it hides with `display: none`, FS `js/foundation.util.triggers.js:50-63`), so removal with a library Motion is an Angular addition, not parity.
   - (b) A Motion input on `nfsCallout` and on every other removable component's directive. Against: one input per component for one recipe, and CO's D4 decided the callout has no Motion.
   - (c) A library function returning the class for the consumer's own `animate.leave` binding. Against: the consumer would still apply a library class itself, which is what the rule's "the directive maps it to its class" excludes.
   - (d) `animate.leave` with the consumer's own keyframe class, which ADR 0039 keeps ("inputs that apply the consumer's own classes stay"), plus a composition for a library Motion: the element is a Toggler in visibility mode, whose typed Motion input animates the hide (State classes on a persistent element, BB 1.6 rule 1), and the consumer removes it in the Toggler's `closed` output, which fires after the element is hidden and its animation has ended (the [Spec: Toggler](17-spec-toggler.md), `closed`).
   Settled: (d) (D17). Every `nfs-*` Motion stays reachable with existing API, nothing new is public, and (a) stays additive if a later spec needs it. CO delegated the form to this ticket and adopts it.
6. **May an Openable put a State class on its Triggers with `Renderer2`, under the user's decision in [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md)?** No. That decision covers only elements that carry no library directive; a Trigger's element always carries one, the Trigger. Such a class would have to be a Trigger host binding fed through the contract. No Openable needs one (question 1), so none is added (D18).
7. **Should a Trigger warn about Foundation classes copied onto its host (BB 1.4's initial-state bullet)?** For: migrating markup such as `<button class="button" data-toggle="x">` keeps `.button` without `nfsButton`, so the look arrives without the `type` and disabled contract. Against: BB 1.4 asks a directive to report copies of classes it binds itself; a Trigger binds none, so the check would duplicate `nfsButton`'s and `nfsCloseButton`'s and couple entry points; the Storybook checklist and the consistency review keep the library's own examples class-free. Settled: no check (Out of Scope).
8. **Does 1.4's initial-state rule touch the Triggers?** No: a Trigger reads no static class and seeds nothing. The focus-replacement hint keeps the Toggler's static `hidden`, a native attribute, not a class; the Toggler re-run owns its seeds. The test Openable binds `hidden` and no class.
9. **The 2.5.8 row.** CB decision 8 gives every close button a 24 px box floor in `nfs-close-button`, measured in three engines, so the spacing-exception reasoning goes, as CB's note for this ticket asks. T and ADR 0012's dated note move the menu icon's 24 px hit area to the Top Bar spec's Library mixin (`nfs-top-bar`) for every menu icon, inside a title bar or not, so the `.menu-icon` outside `.title-bar` exception goes. The bare-button sentence stays.

Round 3 (depends on 1-9): examples, stories, tests.

10. **Rendered HTML?** Consumer markup writes directives only; the resulting DOM shows the host directives' classes, which are server-rendered host bindings (BB 1.11 decision 1), and `jsaction="click:;"` on every server Trigger, which the spec already promised but some examples omitted. Static and directive attributes are left out, as the other specs do.
11. **Stories and play functions?** Story ids unchanged. Layer 1's host rule names `nfsButton`, `nfsCloseButton`, and `nfsMenuIcon`, and no story writes a class; `triggers--open-close-toggle` uses `nfsButton` Triggers, `triggers--nearest-openable` a bare `nfsClose` on an `nfsCloseButton`, and `triggers--with-nfs-button` asserts the host's class list is exactly `button`.
12. **Browser-level and SSR?** A browser-level case asserts that a Trigger binds no class (an empty class list on a plain host in every role; exactly the host directive's classes beside `nfsButton` and `nfsCloseButton`). The SSR fixture writes no `class` attribute, adds an `nfsButton` Trigger and an `nfsCloseButton` close button, and asserts the class attributes.
13. **Glossary or ADR?** No new term: Trigger, Openable, Nearest Openable, Trigger role, Structural class, Variant class, State class, Close Button, and Motion class carry it. The **Motion class** definition ("either one of Foundation's Motion UI names or the consumer's own") predates ADR 0039's follow-up; a sharpened definition is proposed below. No ADR: D16 and D18 apply ADR 0039 and its clarification, and D17 is additive to reverse.

The frontier is empty.

### Decisions

1. Triggers bind no Foundation or library class and have no Variant input, Variant registry, Variant property, or Runtime check request (Foundation has no trigger class; Dropdown's `.hover` stays dropped).
2. The classes on a Trigger's host come from the directive beside it: `nfsButton` (and its `dropdown`, `color`, `fill`, `size`), `nfsCloseButton` (and `size`; it closes nothing, so a bare or bound `nfsClose` or a handler sits beside it), or `nfsMenuIcon`; placed beside, never hosted (D16).
3. A Trigger never binds `class`; attribute ownership adds `class` to the list and names what each host directive owns.
4. The `data-closable` replacements write no library class (D17): hide in place with a Toggler in visibility mode and a bare `nfsClose` on its `nfsCloseButton`, animated by the Toggler's typed Motion input (Foundation's `data-closable="<motion>"` value becomes that Motion name); remove with `@if` and a handler, with `animate.leave` taking only the consumer's own keyframe class (with its own reduced-motion rule) or nothing; for a library Motion on removal, hide through the Toggler and remove in its `closed` output. No typed leave directive.
5. No Openable writes a class on its Triggers; should one ever need a State class there, it is a Trigger host binding through the contract, never a `Renderer2` write (D18; every Openable spec inherits it).
6. No development check for Foundation classes copied onto a Trigger's host.
7. 2.5.8: `nfsButton` through `nfs-button`'s floor, `nfsCloseButton` through `nfs-close-button`'s 24 px box floor, `nfsMenuIcon` through the Top Bar spec's hit area on every menu icon; bare buttons as before.
8. Every example, story, test host, and fixture writes directives only; the examples leave out the Toggler's Motion input until its re-run names the values.
9. Tests: a browser-level class case; SSR class assertions on a class-free fixture; `triggers--with-nfs-button` asserts the class list; Story ids unchanged.
10. No glossary term, no ADR.

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| D17: `data-closable` replacements without library class names; no typed leave directive (decision 4) | MEDIUM: the documented recipe the Callout, Close Button, and Toggler specs point to; no API, and a typed leave directive stays additive | HIGH: ADR 0039's follow-up text keeps the consumer's own classes and gives library classes to directives only; Foundation's `data-closable` hides in place, so the Toggler is the parity replacement; the composition uses decided API (the Toggler's `closed`) | DECIDED. Caveat for the orchestrator: if the user reads "use `animate.leave` when applicable" as asking for a library Motion on consumer-removed elements through `animate.leave` itself, option (a) of question 5 is the additive route, typed by the Motion name the Toggler and Reveal re-runs define |
| D16: host class directives beside the Trigger, never hosted (decision 2) | LOW: example markup; the pairing already existed with classes | HIGH: host directives are static; CB decision 2 | DECIDED |
| D18: no class on Triggers from an Openable (decision 5) | LOW: a rule no Openable breaks today | HIGH: the user's Magellan decision covers elements without a library directive only; FS and the Dropdown spec | DECIDED |
| No copied-class check (decision 6) | LOW: development only | HIGH: BB 1.4 scopes the check to classes a directive binds | DECIDED |
| 2.5.8 row (decision 7) | LOW: text; the floors belong to other specs | HIGH: CB decision 8 (measured); T and ADR 0012's dated note for the menu icon | DECIDED; the menu-icon mixin name follows the Top Bar spec |
| Names from other specs (`nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarTitle`, `nfsMenuIcon`, the Off-canvas `position`) | LOW: example markup, aligned by the consistency review | HIGH: T section 2 (HIGH, HIGH); FS and BB 1.4 naming rule 3 for `position` | DECIDED; the Top Bar spec and the Off-canvas re-run own them |

Nothing is OPEN FOR HUMAN, and no prototype is needed: every point rests on ADR 0039, ADR 0040, a resolved spec, or Foundation's source.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md` 1.8, the `data-closable` sentence. Replace:

   "`data-closable` (remove an element with an animation) is not a directive: the consumer writes `@if` with `animate.leave`, or, to hide in place as Foundation's `fadeOut()` did, the element is a Toggler in visibility mode with a bare `nfsClose` inside."

   with:

   "`data-closable` is not a directive: to hide in place as Foundation's `fadeOut()` did, the element is a Toggler in visibility mode with a bare `nfsClose` on the `nfsCloseButton` inside, animated by the Toggler's typed Motion input; to remove it, the consumer writes `@if` and a handler, and its `animate.leave` takes only the consumer's own keyframe class; a removal that should play a library Motion hides through the Toggler and is removed in its `closed` output, so no library class name appears in consumer code ([Spec: Triggers (shared utility)](issues/54-spec-triggers.md), D17; [ADR 0039](adr/0039-directives-manage-every-foundation-class.md))."

2. `building-blocks.md` 1.8, after "Reveal, OffCanvas, DropdownPane, Toggler, ResponsiveToggle and Tooltip provide the token." insert:

   "A Trigger binds no class, and no Openable writes one on its Triggers: the classes on a Trigger's host come from the directive beside it (`nfsButton`, `nfsCloseButton`, `nfsMenuIcon`), placed beside rather than hosted ([Spec: Triggers (shared utility)](issues/54-spec-triggers.md), D16, D18)."

3. `building-blocks.md` 1.8, once the [Spec: Top Bar](issues/86-spec-top-bar.md) confirms the `type` default the triage gave the menu icon: after "or from `nfsCloseButton` ([Spec: Close Button](issues/83-spec-close-button.md))" insert ", or from `nfsMenuIcon` ([Spec: Top Bar](issues/86-spec-top-bar.md))".

4. `building-blocks.md` Table C, Triggers row, first cell. Replace:

   "`[nfsOpen]`, `[nfsClose]`, `[nfsToggle]` on consumer-written `<button type="button">` (or a link that also navigates); `nfsOpenableToken`"

   with:

   "`[nfsOpen]`, `[nfsClose]`, `[nfsToggle]` on consumer-written `<button type="button">` (or a link that also navigates), binding no class, beside the `nfsButton`, `nfsCloseButton`, or `nfsMenuIcon` that binds the host's classes; `nfsOpenableToken`"

5. `building-blocks.md` 1.6, rule 2, append:

   "An element the consumer inserts or removes itself (a callout inside `@if`) carries no library Motion class: its `animate.enter` and `animate.leave` take only the consumer's own keyframe classes, and a library Motion there goes through a Toggler's typed Motion input, with removal in its `closed` output ([Spec: Triggers (shared utility)](issues/54-spec-triggers.md), D17; [ADR 0039](adr/0039-directives-manage-every-foundation-class.md))."

6. `CONTEXT.md`, **Motion class**, if the Toggler and Reveal re-runs propose no wording of their own: replace the definition line with

   "A CSS animation class that animates an element's entry, exit, or state change: one of the library's `nfs-*` keyframe classes, which a directive applies from a typed Motion name, or the consumer's own keyframe class; never a library class name written in consumer code."

7. `map.md`, Decisions so far: the gist line below.

No change to any ADR, `README.md`, or `research/` is needed: the X rows TR1 to TR8 hold as T section 3 judged them (TR3's quoted reason still describes the two replacements).

### What other specs need from this one

- [Spec: Callout](89-spec-callout.md) (resolved; amend in place), which delegated the removal recipe's animation here:
  - Animation: replace "a removed one animates through `animate.leave` on its `@if` block, in the typed form the [Re-run: Triggers (shared utility) spec under the class rule](../issues/130-rerun-triggers-class-rule.md) decides for Foundation's `data-closable` replacements, because no library class name may appear in consumer code (ADR 0039). Until then the removal recipe animates with the consumer's own keyframe class or not at all." with "a removed one leaves at once, animates through `animate.leave` with the consumer's own keyframe class, or, to play a library Motion, hides through a Toggler and is removed in its `closed` output: the `data-closable` replacements of the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) (D17), because no library class name may appear in consumer code (ADR 0039)."
  - Out of Scope, first bullet: "and the typed leave animation of the `@if` recipe belong to" becomes "and the `@if` recipe's animation belong to".
- [Spec: Close Button](83-spec-close-button.md) (resolved; amend in place): Animation, "(a Toggler's Motion classes, `animate.leave` on an `@if` block)" becomes "(a Toggler's typed Motion input, or `animate.leave` with the consumer's own keyframe class on an `@if` block, the Triggers spec's D17)".
- [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md): the Dropped options sentence's "or `@if` with `animate.leave`" becomes "or `@if`, whose `animate.leave` takes only the consumer's own keyframe class (Triggers spec, D17)". The Triggers spec relies on the Toggler's typed Motion input animating a dismissible callout's hide and on `closed` firing after the element is hidden and its animation has ended, which ends the removal composition. The Triggers examples leave the Motion input out; once the re-run names its values, the consistency review can add them to the focus-replacement hint and replacement 2.
- [Spec: Top Bar](86-spec-top-bar.md): the Triggers spec uses `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarTitle`, and `button[nfsMenuIcon]` (the triage's names), with `nfsResponsiveToggle` on the same element as `nfsTitleBar`, and relies on `nfsMenuIcon` defaulting `type="button"`, binding none of the four Trigger attributes (`aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-pressed`), and giving every menu icon its 24 px hit area in the spec's Library mixin; the 2.5.8 row names `nfs-top-bar` after the triage and ADR 0012's note. If the names or the mixin differ, the Triggers' Rendered HTML, usage examples, and 2.5.8 row follow.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md): the Triggers usage example writes `<div nfsOffCanvas position="left">` (Foundation reads the side from the class, `js/foundation.offcanvas.js:106`, so the input name follows BB 1.4 naming rule 3); its close button is `nfsCloseButton` with a bare `nfsClose`, and its menu icon `nfsMenuIcon` in `nfsTitleBar > nfsTitleBarLeft`. If the re-run names the input otherwise, that one example follows it.
- [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md): the title-bar Trigger is `nfsMenuIcon` with a bare `nfsToggle`; the Triggers spec no longer cites `nfs-responsive-toggle` for the menu icon's hit area.
- [Re-run: Reveal spec under the class rule](110-rerun-reveal-class-rule.md), [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md), and [Re-run: Tooltip spec under the class rule](119-rerun-tooltip-class-rule.md): D18 is an inherited requirement (write no class on a Trigger). Dropdown's `.hover` stays dropped. A Tooltip's own host class, if its re-run binds one (Foundation's `triggerClass`, `has-tip`), is that directive's host binding on its own host, which is not its Trigger (`skipSelf`), so D18 does not touch it.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec shows `animate.enter` or `animate.leave` with an `nfs-*` class in consumer code (this spec was the only one that did); that every Trigger in every spec's examples sits on `nfsButton`, `nfsCloseButton`, `nfsMenuIcon`, a link, or a bare native button, with no class; the Top Bar and Off-canvas names above; and the **Motion class** definition (proposal 6).

### Gist for Decisions so far

- [Re-run: Triggers (shared utility) spec under the class rule](issues/130-rerun-triggers-class-rule.md) -- Triggers have no Foundation class and still bind none, so no Variant input, registry, or Runtime check request; trigger hosts become `nfsButton`, `nfsCloseButton` (with a bare `nfsClose` beside it, since it closes nothing itself), or `nfsMenuIcon`, placed beside rather than hosted, and every Openable, title bar, menu, and callout in the examples is its directive; the `data-closable` replacements write no library class (hide in place through the Toggler's typed Motion input; remove with `@if` animated only by the consumer's own keyframe class, or hide through the Toggler and remove in its `closed` output for a library Motion; no typed leave directive, D17); no Openable writes a class on its Triggers (D18); 2.5.8 takes the Close Button floor and the Top Bar spec's menu-icon hit area; API, contract, ARIA, keys, rendering modes, and Story ids unchanged; impact MEDIUM, confidence HIGH. Spec: [specs/triggers.md](specs/triggers.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/triggers.md` was revised in place. The API, the Openable contract, the Trigger roles, ARIA, keyboard, rendering modes, development checks, and Story ids do not change.

- Hierarchy and DI shape gains the In-family lines: `NfsOpen`, `NfsClose`, and `NfsToggle` each call `nfsDirectiveCheck` with their class name and pass no parent and no children. `NfsOpen` injects no parent; `NfsClose` and `NfsToggle` keep their Nearest Openable injection optional (a bound target replaces it, and construction cannot see the inputs), so development check 1 stays the report for a bare Trigger with no Nearest Openable. Their targets are peers linked by reference, whose forgotten imports fail to compile (NG8002, NG8003). An Openable probes no Trigger, as the Toggler's line already says. `strictParents` changes nothing.
- `nfsOpenableToken` carries a development-only description listing the seven library Openable directives with their entry points and "a component that implements NfsOpenable", because the token has several providers and an application may add its own (ADR 0013); the library injects it only optionally.

Triage: impact LOW (development-only lines and one development-only string), confidence HIGH (ADR 0046, building-blocks 1.9, the shared spec's rule and its kept-optional list). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2 (group f), applying the coordinator's decisions ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)) and the review's checks CR-A to CR-D; `specs/triggers.md` was revised in place. The evidence for each change is in [research/consistency-review-group-f.md](../research/consistency-review-group-f.md).

- R2, with R65: the focus hint writes `animate="fade-in fade-out"`, `data-closable` replacement 2 and "Both at once" write `animate="fade-out"`, and the paragraph after them names the Toggler's Motion names ([Spec: Toggler](17-spec-toggler.md), D18); this ticket's proposal for those examples is applied.
- R14: the 2.5.8 row, the story paragraph, the Off-canvas usage comment, and Sass item (5) name `nfs-menu-icon`'s 24 px box.
- R22/R53: D13 cites the [Spec: Top Bar](86-spec-top-bar.md).
- R52: the heading "What each Openable spec provides", and the 2.4.3 row's citation of it.
- R57: "Application class" is capitalised.
- R65: the prose Trigger reads `<button type="button" nfsClose nfsTooltip="Close">`.
- The registration rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md): development check 1 says nothing for a bare Trigger inside an element that carries an Openable's attribute with no instance of its directive, a forgotten import that `strictDirectiveImports` reports once; it keeps its message for a truly bare Trigger. The In-family line and a browser-level case follow. This supersedes the part of decision 1.2 of the [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md) that kept check 1 as the report for a forgotten Openable import; the shared spec did not adopt that sentence.
- CR-C: three deferrals to the Top Bar spec and the usage paragraph's link to the Off-canvas re-run cite the published [Spec: Top Bar](86-spec-top-bar.md) and [Spec: Off-canvas](25-spec-off-canvas.md).
- CR-D: the `app-header` example imports `NfsClassToggler`, which its class-mode Toggler (`toggler="compact"`) matches, in place of the unused `NfsToggler`.
- CR-B: the class mapping gains rows for the other families' classes the examples use (the Openables, the Title Bar, the Callout, the Menu).
- Unchanged: R50, R51, R56; CR-A; `nfsOpenableToken`'s description.
- Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.
