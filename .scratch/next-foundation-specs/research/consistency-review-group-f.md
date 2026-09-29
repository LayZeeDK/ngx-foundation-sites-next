# Consistency review, phase 2: group f

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 2, group f,
2026-09-29. Model: Opus 5.5, one reviewer, AFK under the map's override. Specs: Toggler, Tooltip, Top Bar, Triggers,
Typography Helpers, Variant declaration tooling, Visibility Classes, XY Grid. Input: the coordinator's decisions
([consistency-review-decisions.md](consistency-review-decisions.md)), with its checks CR-A to CR-D and its per-spec
index; the Answers of the five family re-runs (tickets 151 to 155); the orchestrator's addendum on the registration
rule of [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md); every spec
of the group read in full against building-blocks, ADRs 0039, 0040, 0044, 0045, and 0046, and the glossary.

Governing tickets (the ticket the map's Decisions so far cites last for each spec), each given a dated
`### Amendment, 2026-09-29 (consistency review)` at its end:

| Spec | Governing ticket |
| --- | --- |
| [toggler](../specs/toggler.md) | [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md) |
| [tooltip](../specs/tooltip.md) | [Re-run: Tooltip spec under the class rule](../issues/119-rerun-tooltip-class-rule.md) |
| [top-bar](../specs/top-bar.md) | [Re-run: Top Bar spec, out-of-scope survivors](../issues/148-rerun-top-bar-out-of-scope-survivors.md) |
| [triggers](../specs/triggers.md) | [Re-run: Triggers (shared utility) spec under the class rule](../issues/130-rerun-triggers-class-rule.md) |
| [typography-helpers](../specs/typography-helpers.md) | [Re-run: Typography Helpers spec, out-of-scope survivors](../issues/146-rerun-typography-helpers-out-of-scope-survivors.md) |
| [variant-declaration-tooling](../specs/variant-declaration-tooling.md) | [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) (its prototype's verdict sits there too) |
| [visibility-classes](../specs/visibility-classes.md) | [Re-run: Visibility Classes spec for the print classes](../issues/143-rerun-visibility-classes-print.md) |
| [xy-grid](../specs/xy-grid.md) | [Spec: XY Grid](../issues/99-spec-xy-grid.md) |

The decisions file names a different home and heading (the original spec ticket, `(class-rule consistency review)`);
this group followed the phase-2 brief, which names the governing ticket and `(consistency review)`. The closing pass
may want one form for all six groups.

Checks rerun on every spec after the edits: the CR-A search (`class="`, `[class`, `ngClass`, `routerLinkActive=`,
`animate.enter`/`animate.leave`) gives the same hits as before the edits, every one rendered output, a labelled
copied-class case, Foundation's labelled markup, prose, or an Application class; the CR-C search finds no deferral
left; no banned word, no non-ASCII character, LF line endings kept.

## Per spec

### Toggler (5 decided items, 3 other fixes)

Decided items applied:

- R2: development check 4 has three cases with three messages (an animation that does not start; a dot-form `nfs-`
  class; a value that does not split into one entering and one leaving value, which the type admits through a value
  that starts with a dot); the API comment says such a value maps to no class; the browser-level Motion names case
  and the pure-logic case follow; the Out of Scope Motion bullet names the `fast`/`slow` modifiers and Motion UI
  names outside the `nfs-motion` set.
- R32/R64: the usage component imports `NgOptimizedImage`, and its three thumbnails write `ngSrc` with
  `width="300" height="200"`.
- R52, R54: "consuming-directive rule 3 lets a directive bind no Motion class".
- R57: the `toggler` row names Application class names and the `animate` row "an Application class that is a
  keyframe animation"; "application class" is capitalised; "the developer's own class" and its variants ("the
  developer's toggled class", "the developer's keyframes") become "the consumer's own ...".

Other fixes:

- The `animate` row said a value of another shape is reachable "only" by a cast or `$any()`, which R2's measurement
  refutes (`'.a .b .c'` and `'.a fade-in'` compile); it now says what the browser-level case says (R2's intent,
  item 1).
- Fallback: "a pair of two such halves was not compiled separately" is out of date; it now records the pair type's
  `tsc` 6.0.3 compile by this review (`D:/tmp/nfs-133/motion/pair-probe.ts`: Foundation's forms compile, three
  malformed forms fail, and the dot form admits shapes check 4 reports).
- CR-B: the class mapping gains one row per other family whose classes the examples or Foundation's Toggler docs
  page use: Callout, Menu (`.menu`; `.expanded` already had its row), Thumbnail, XY Grid (the docs' multiple-targets
  layout), Button, Close Button.

Confirmed, unchanged: R11, R14 (2.5.8 row), R16 (D3 is the reference), R65, R66; CR-A, CR-C, CR-D (the usage
component's imports now match its template); the In-family line (fixer X5), kept as written.

### Tooltip (1 decided item, 2 other fixes)

Decided items applied:

- R57: the `templateClasses` cells of the Foundation contract, the class mapping, and the API table read
  "Application classes"; D7's rationale gains the decided sentence on `is-` names; "the developer's own class" becomes
  "the consumer's own class" (nine places) and "the application's own class(es)" becomes "Application class(es)"
  (three places).

Other fixes:

- Development check 4 read "no text content", which counts text inside `aria-hidden="true"` subtrees, so a trigger
  whose only content is an `aria-hidden` glyph was silent though it has no name. It now reads "no text outside
  `aria-hidden="true"` subtrees", R74's reading of a name from content (the image clause was already there).
- CR-B: rows for the Button's classes on a trigger (Foundation's docs put tooltips on `.button`) and the Dropdown
  pane's class in the usage example.

Confirmed, unchanged: R51 (the labelled check-6 input `class="right"`), R65, R66; CR-A, CR-C; CR-D (no component
example).

### Top Bar (5 decided items, 3 other fixes)

Decided items applied:

- R47: D9's projected case is fixed with `alignment="right"`; a provided token has no value to give.
- R56: the `top-bar--title-bar` story's panels are Off-canvas panels with `position="left"` and `position="right"`.
- R59 (with R56's Zero-breakpoint `needs`): the Runtime checks paragraph names `nfsVariantCheck('nfsTopBar')`, the
  `include('nfs-breakpoint-properties', ['breakpoint-classes'])` call only while `stackedFor` is bound, and the
  `needs` per value; the missing-property case sits in a test file of its own.
- R57: "the Application class" (twice).
- R74: `NfsMenuIcon` check 1 counts the non-blank `alt` of an `img` or `aria-label` of a `role="img"` element inside
  the button; check 2 reads the name as check 1 does; the browser-level list gains a silent image-only case.

Other fixes:

- Check 3 found `nfsButton` or `nfsCloseButton` beside the icon by their classes only, so with a forgotten
  `NfsButton` import it stayed silent about a misuse that remains once the import is added. It now reads the
  attributes too, with a test case (ticket 153's routed item on checks that find a peer by its class; the placement
  rule's "separate misuse" sentence).
- "The hit-area rule" (Solution) and "the hit area" (D7, twice) become "the 24 px box": R14 and R22 record that the
  box is a transparent border on a content box, not a hit area, which building-blocks 1.10 rejects.
- CR-B: a table of the other families' classes the markup and Foundation's Top Bar docs page use (Menu, Dropdown
  Menu with the Nested menu, Button, Visibility Classes, Responsive Toggle, Sticky, Off-canvas).

Confirmed, unchanged: R4 (the WCAG and Sass subsections name the exact formula, the helper, and both Foundation
functions as not used; figures stand), R15, R22/R53, R40, R48, R65; check 7 agrees with the placement rule of the
forgotten-import checks spec (ticket 154's routed item); CR-A, CR-C, CR-D; the In-family lines (ticket 151), kept.

### Triggers (6 decided items, 4 other fixes)

Decided items applied:

- R2 (with R65): the focus hint writes `animate="fade-in fade-out"`, `data-closable` replacement 2 and "Both at
  once" write `animate="fade-out"`, and the paragraph after them names the Toggler's Motion names.
- R14: the 2.5.8 row, the story paragraph, the Off-canvas usage comment, and Sass item (5) name `nfs-menu-icon`'s
  24 px box.
- R22/R53: D13 cites the Top Bar spec.
- R52: the heading "What each Openable spec provides" and the 2.4.3 row's citation of it.
- R57: "Application class" (twice).
- R65: `<button type="button" nfsClose nfsTooltip="Close">`.

Other fixes:

- The orchestrator's registration rule: development check 1 finds its Openable by registration (the Nearest
  Openable). It now says nothing for a bare Trigger inside an element that carries an Openable's attribute where the
  shared verdict finds no instance of its directive, a forgotten import that `strictDirectiveImports` reports once
  (M1); it keeps its message for a truly bare Trigger, the kept-optional case of the family rule's item 2. The
  In-family line and a browser-level case follow. This revises ticket 152's decision 1.2 ("check 1 stays the report
  ... and it stays true when the Openable's import was forgotten"), which the shared spec did not adopt.
- CR-C: three deferrals ("by the out-of-scope triage, `type` (the Top Bar spec fixes it)", "which fixes its inputs",
  "take the directive names given in [Triage ...] which the [Spec: Top Bar] fixes") and the link to the Off-canvas
  re-run in the usage paragraph now cite the published Top Bar and Off-canvas specs.
- CR-D: the `app-header` example imported `NfsToggler`, but its `<div nfsToggler toggler="compact">` matches
  `NfsClassToggler` (`[nfsToggler][toggler]`), so the template's class-mode Toggler had no directive and `NfsToggler`
  was an unused import; `NfsClassToggler` replaces it.
- CR-B: rows for the other families' classes the examples use (the Dropdown pane, Reveal, Off-canvas panel, Toggler,
  Responsive Toggle, and Tooltip as Openables; the Title Bar; the Callout; the Menu).

Confirmed, unchanged: R50, R51, R56; CR-A; the In-family lines (ticket 152), apart from check 1's alignment above;
`nfsOpenableToken`'s description follows M7's multi-provider form (ticket 152's routed item; see the Nested menu
proposal below).

### Typography Helpers (no decided item, 3 other fixes)

No decided item changes this spec.

Other fixes:

- R4's S1: the Sass subsection's check named the exact helper but not the two Foundation functions as not used; the
  check sentence now adds them (the equivalent R4 allows; S1 verbatim would say `$body-background`, while the code
  pair composites over `$code-background`).
- CR-C: D4's "the published placeholders already use `nfsTextAlign`" now states the fact: the Forms, Pagination,
  Flexbox Utilities, Float Classes, and Prototyping Utilities specs write `nfsTextAlign`.
- CR-B: a table of the other families' classes the examples and stories use (Pagination, XY Grid, Card, Callout).

Confirmed, unchanged: R4 (figures), R9/R23, R39, R59 (the handle has its argument, the call is conditional, the
missing-property case has its own file), R71/R72, R73; CR-A, CR-D; the In-family line (fixer X3), kept.

### Variant declaration tooling (2 decided items, 2 other fixes)

Decided items applied:

- R27: the flags bullet takes the Table's exception (its trailing parenthesis became a sentence, so two
  parentheticals do not run together).
- R30: the known-mixins bullet (the exception for a setting no entry point owns; `nfs-callout` writes
  `--nfs-callout-sizes` alone; `nfs-button-group` writes none).

Other fixes:

- The manifest shape's example comment listed `['nfs-button', 'nfs-button-group']` as the writers of
  `--nfs-button-palette`, which R30 (and Button Group D11) contradicts; it lists `['nfs-button']`.
- The package diagram said "25 empty interfaces" where the settings table, the Solution, and D2 count 26.

Confirmed, unchanged: R67 (D28 and the generated file's `declare global {}`); R2's primary-entry-point sentence;
CR-A to CR-D (no class, no component example).

### Visibility Classes (1 decided item, 3 other fixes)

Decided items applied:

- R40: the Rendered HTML sticky example (both halves) and the usage example "A compact title while the bar is stuck"
  hold `<main>...</main>` after the sticky element, with the ADR 0019 comment; `visibility--sticky` has a tall body.

Other fixes:

- Development check 3 found the Sticky element by its class `.sticky` only, so with a forgotten `NfsSticky` import
  it told the developer to move a correctly placed element inside `nfsSticky`. It now reads the `nfsSticky`
  attribute too and stays silent there, `strictDirectiveImports` being the report, with a test case (ticket 153's
  routed item on checks that find a peer by its class).
- CR-D: the `app-root` example's template writes `<app-site-header />`, which its `imports` did not list, so it
  would not compile; `SiteHeader` joins the imports, and the sentence after names it as the application's own
  component.
- CR-B: rows for the Sticky's, Close Button's, Button's, Menu's, and Top Bar's classes in the examples and stories.

Confirmed, unchanged: R1, R39, R59, R71/R72; CR-A, CR-C; the In-family line (fixer X4), kept.

### XY Grid (3 decided items, 1 other fix)

Decided items applied:

- R16: the `hidden` note takes the shared sentence, with its own classes (`.grid-x`, `.grid-y`,
  `.cell-block-container`) and its measured detail kept (a plain `.cell` and `.grid-container` are hidden). The
  shared sentence's list of specs leaves out the XY Grid itself; the other four R16 specs may want the same edit.
- R43: D3's rejected alternative loses the collision clause.
- R59: the handle is written `nfsVariantCheck('nfsGridX')`, `nfsVariantCheck('nfsGridY')`, and
  `nfsVariantCheck('nfsCell')`.

Other fixes:

- CR-B: rows for the Flexbox Utilities' and the Card's classes of the usage examples.

Confirmed, unchanged: R9/R23, R11, R26 (the frame's 1.4.12 row), R34/R35, R37 (D15), R44, R48; check 2 agrees with
the placement rule, the separate-misuse sentence included (tickets 154 and 155); CR-A, CR-C, CR-D; the In-family
line (ticket 155), kept.

## The re-runs' routed items

- Ticket 151 (label and form of the In-family lines): every spec of the group uses the label "In-family checks";
  the forms differ with the family (nested lines for the Top Bar and Triggers, one bullet for the XY Grid, one
  sentence for the fixer lines of the Toggler, Typography Helpers, and Visibility Classes). The brief keeps the
  re-runs' bullets as they are, so no form was changed.
- Ticket 152: `nfsOpenableToken` and `nfsMenuModeToken` both follow M7's multi-provider form; the Nested menu's adds
  the words "a menu root:" (proposal 2 below). The registration checks follow the shared spec, not ticket 152's
  sentence (Triggers check 1 above).
- Ticket 153: cross-family neighbours are left to the runtime and static checks in every spec of the group (the
  Triggers line says so; the other families probe only their own parts). Checks that find a peer by its class: the
  XY Grid's check 2 already accepts the attribute; the Top Bar's check 3 and the Visibility Classes' check 3 now do.
  No other check in the group finds a peer by class.
- Ticket 154: the Top Bar's check 7 and the XY Grid's check 2 agree with the placement rule.
- Ticket 155: its routed Flex Grid item is not in this group.

## Open

Nothing is OPEN FOR HUMAN. Every change above is impact LOW (wording, examples, mapping rows, development
warnings, a test case) with confidence HIGH (the decided items, the shared spec's rules, and the specs' own
selectors and texts).

## Proposed changes to shared documents and other groups' specs

1. `specs/forgotten-import-checks.md`, In-family checks, after the registration bullet (a check that finds a peer by
   registration), so the class-based case has one stated rule beside the placement and registration ones:

   > - A family's own development check that finds a peer of another family by that peer's class reads the peer
   >   directive's attribute too where one directive owns the class, so a forgotten import of that directive
   >   neither hides a misuse that stays once the import is added nor draws a message that names the wrong fix (the
   >   Top Bar's check 3 with `nfsButton` and `nfsCloseButton` beside `nfsMenuIcon`, the Visibility Classes' check 3
   >   with an enclosing `nfsSticky`); where any family's directive can be the peer, the check keeps its class read
   >   and its message names the forgotten-import case (the Flexbox Utilities' check 2).

2. `specs/nested-menu.md` (its group): `nfsMenuModeToken`'s description, for word-for-word agreement with M7's
   multi-provider form and `nfsOpenableToken`: replace `"nfsMenuModeToken (provided by a menu root: NfsAccordionMenu`
   with `"nfsMenuModeToken (provided by NfsAccordionMenu`. Optional; the text names the right directives either way.

3. The four other R16 specs (thumbnail, float-classes, flexbox-utilities, flex-grid; their groups): where the shared
   `hidden` sentence lists "the Thumbnail, Float Classes, Flexbox Utilities, XY Grid, and Flex Grid specs", a spec
   leaves itself out of that list, as the XY Grid's now does. Optional.

4. `specs/forgotten-import-checks.md`, M7 row: the multi-provider clause sits inside the quoted message template,
   so the row reads as if the clause were part of the printed text. Suggested: close the quote after
   `declared in the same template)"` and write the clause after it as plain text:

   > "<tokenName> (provided by <Directive> from '<entry point>' on an ancestor element declared in the same
   > template)". For a token several directives provide, each is written "<Directive> from '<entry point>'", joined
   > with commas and "or", and for a contract token an application may also provide, the list ends with "or a
   > component that implements <Interface>" (`nfsOpenableToken`).

No change is proposed to `building-blocks.md`, `CONTEXT.md`, `README.md`, the map, the ADRs,
`storybook-conventions.md`, or the architecture guide beyond what the decisions file already routes to the closing
pass.
