# 120. Re-run: Sticky spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Sticky](28-spec-sticky.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/sticky.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Sticky](28-spec-sticky.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5

Spec: [specs/sticky.md](../specs/sticky.md), revised in place. Resolved 2026-09-28 by self-grilling (AFK), both sides played against the sources below. The revision is recorded in the [Spec: Sticky](28-spec-sticky.md) as "Amendment, 2026-09-28 (class rule)". The names `nfsSticky` and `nfsStickyContainer` are kept: nothing in the class rule or the other specs gives a reason to change them, and the Top Bar, Magellan, and Off-canvas specs already write them.

Gist: Sticky has two Structural classes, four State classes, and no Variant class, so the API, the measurement, ARIA, keys, rendering modes, Sass, and Story ids are unchanged, and there is no Variant input. `nfsStickyContainer` becomes the only way to get `.sticky-container` (the "writing the class is equivalent" sentence and warning 1's mention of the class go), a copied State class is stripped by the bindings and not reported, a stuck element is styled through the consumer's own class bound from `isStuck()`, and `nfsSticky` sits beside `nfsTitleBar`, `nfsTopBar`, or `nfsCallout` and `nfsStickyContainer` beside `nfsCell`, neither hosting nor hosted. Every example, story, test host, and fixture writes directives only; the off-canvas wrapper recipe, which selected a Foundation class, is removed in favour of the `nfs-off-canvas` include. While rewriting, the Top Bar spec's sticky example turned out to have a container as tall as its bar, which never sticks; a fix is proposed.

### Decision log

Sources: FS = the Foundation 6.9.0 clone (`scss/components/_sticky.scss`, `docs/pages/sticky.md`, `js/foundation.sticky.js`, `scss/components/_callout.scss`, `_title-bar.scss`, `_top-bar.scss`, `scss/xy-grid/`); ADR 0019, ADR 0039 with its dated notes (the Magellan State-class clarification and its User decision), ADR 0040; TYP = the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); BB = `building-blocks.md` as it stands (1.1, 1.3, 1.4, 1.5, 1.9, 1.10, 1.13, 1.14, Tables A and B); T = `research/out-of-scope-triage.md`; X = `research/out-of-scope-exclusions.md`; CAT = `research/foundation-component-catalogue.md`; SBC = `storybook-conventions.md`; TB = the Answer of [Spec: Top Bar](86-spec-top-bar.md) and `specs/top-bar.md`; MG = the Answer of [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md); AC = the Answer of [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md); OC = `specs/off-canvas.md` and the Answer of [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md); "the spec" is `specs/sticky.md` before this revision.

Round 1 (no prerequisites): which classes exist, and which ones the consumer still wrote.

1. **Which Foundation classes does Sticky have?** FS `_sticky.scss` defines `.sticky-container`, `.sticky`, and `.sticky.is-stuck`, `.is-at-top`, `.is-at-bottom`, `.sticky.is-anchored` as compounds; CAT's Sticky row lists the same. Two Structural classes, four State classes, no Variant class. So no Variant input, registry, Variant property, or Runtime check request (ADR 0040), and the Sass subsection's item (6) reads "none". Source: FS; CAT; ADR 0040.
2. **Which consumer-written classes did the spec carry?** Rendered HTML: `grid-x`, `cell small-6`, `thumbnail`. Mapping: `.sticky` "the consumer may also write it". Hierarchy: "Writing `class="sticky-container"` instead is equivalent and documented". Development warning 1 and user story 23: "or the sticky-container class". Story `sticky--overflow-hidden-ancestor`: Foundation's `.overflow-hidden` Prototype class. Usage examples: `grid-x`, `cell small-6`, `thumbnail`, `title-bar`, `title-bar-left`, `callout`, and `panel` (no Foundation 6 class; a leftover name that reads like one). Consumer CSS recipes on Foundation classes: `.off-canvas-wrapper { overflow: clip; display: flow-root; }`, and prose sending the consumer to `.is-stuck` (the Animation paragraph's `.sticky.is-stuck` transition, user story 11, Out of Scope's shrink-on-scroll item). The Structural classes were already static host classes and the State classes already host bindings. Source: the spec.
3. **Do the exclusion rows change?** ST1 to ST9 (X `:255-263`) sit under T's "Reasons that still hold" (T section 3), and none rests on a class being CSS-only. Changes: ST3 (`stickyClass`, `containerClass`) gains ADR 0039's reason that no class name is an input value; ST6 is split, because one category cannot cover both halves (Foundation's `both` is only a comment in its source, FS `js/foundation.sticky.js:373`, so `deprecated-upstream`; horizontal sticking never existed, so `scope-boundary`); ST7's reason points at the consumer's own class instead of `.is-stuck`; ST9 moves from `superseded` to `scope-boundary`, since the reason that holds is that Foundation's Table has no sticky header (T groups ST9 under "Not a Foundation feature"), not that something replaced it. Source: X; T.

Round 2 (depends on 1 to 3): the two directives, the State classes, and styling.

4. **Does `nfsStickyContainer` stay, and is it now required?** For dropping it: it binds one class, and `nfsSticky` could write `.sticky-container` on its parent. Against: ADR 0039's dated note (the Magellan user decision) allows a `Renderer2` State-class write on an element no directive hosts only for state with no first-paint value, and `.sticky-container` is a Structural class whose `position: relative` is first-paint layout (the containing block for the consumer's absolutely positioned content, and the sentinels'); writing it after hydration would shift layout. The consumer cannot write it either (ADR 0039). **Decided: the directive stays and is the only way to get the class** (D1); the "equivalent class" sentence and warning 1's "(or the sticky-container class)" go. Source: ADR 0039; BB 1.5; FS.
5. **Is `stickTo` a Variant input, since it decides `.is-at-top` or `.is-at-bottom`?** No: those are State classes of the measured `edge`, and an element with `stickTo: 'top'` carries `.is-at-bottom` once scrolled past its range. `stickTo`, `marginTop`, `marginBottom`, and `stickyOn` stay Options with their transforms and Defaults token slots; `stickyOn` stays `string`, as Tooltip's `showOn` does (BB 1.3 names both as behaviour Options). `data-nfs-sticky-on` is an attribute, which the class rule does not touch (D16). Source: BB 1.3, 1.4; ADR 0040.
6. **A State class copied onto the host: report it, as BB 1.4's initial-state rule does for other directives?** It is stripped on server and client either way, because each State-class binding always has a boolean value and Angular's styling resolution consults a static class only when every binding for it is `undefined` (AC decision 6). For a warning: one mechanism across specs. Against: BB 1.4's report exists to catch an initial state the consumer meant to set (the Accordion's closed panel with no signal); Sticky's state is measured, never set, so a copy changes nothing the bindings do not already correct, and Foundation's Sticky markup carries no State class to copy (FS `docs/pages/sticky.md` writes only `.sticky`). **Decided: stripped, not reported** (D16); a BB 1.4 sentence is proposed so the consistency review reads the difference as intended. Source: AC; BB 1.4; FS.
7. **How does a consumer style a stuck header without naming `.is-stuck`?** BB 1.1 limits a spec's consumer CSS recipes to elements, attributes, and the consumer's own classes. Options: the consumer's own class bound from `isStuck()` through `#bar="nfsSticky"`; a library styling attribute (`data-nfs-stuck`); keeping `.is-stuck` recipes. The signal is public API, zoneless-safe, and false on the server exactly as the State class is, so the timing is the same; an attribute would be a second spelling of the State class. **Decided: the consumer's own class** (D17), with a usage example; the State classes stay Foundation's contract for Foundation's CSS and CSS migrated from Foundation (MG decision 12's reading for Magellan's link class). Source: BB 1.1; MG; the spec's API.
8. **Host or sit beside?** Beside: BB 1.9 writes a behaviour that may sit on any element beside the class directive, TB's D10 decided the same for Sticky on its bars, and host directives are static, so a bar hosting `NfsSticky` would pin every bar. Checked in FS that the neighbours' CSS leaves the gate working: `.title-bar`, `.top-bar`, and `.cell` set no `position`; `.callout` sets `position: relative` at 0,1,0, the same as `.sticky`, and the `nfs-sticky` gate rule (0,2,0) overrides both where it is open. The grid cell stretches to its row's height in the flex row, so a cell carrying `nfsStickyContainer` spans the row, the shape MG decision 14 used. **Decided: composition by placement** (D18, user story 42). Source: BB 1.9; TB; FS.

Round 3 (depends on 4 to 8): examples, stories, tests, and recipes.

9. **Which names for the neighbours?** `NfsTitleBar`, `NfsTitleBarLeft`, `NfsTopBar` (TB, published), `NfsCallout` ([Spec: Callout](89-spec-callout.md), resolved), `NfsGridX` and `NfsCell` with `size` (BB 1.3, 1.4; MG; the [Spec: XY Grid](99-spec-xy-grid.md) is open), and `img[nfsThumbnail]` (the Toggler spec; the [Spec: Thumbnail](97-spec-thumbnail.md) is open). `.small-6` is `size="6"`: a bare value is the Zero breakpoint (BB 1.4), and a count's transform accepts the static-attribute string (TYP, case A14). The mapping table gains a Kind column and one row per neighbour class, as MG's does. Source: BB; TB; MG; TYP.
10. **Rendered HTML?** Static template attributes and directive selectors serialise in lowercase (MG decision 5, from Angular's `setUpAttributes`), and static host classes are written after them, so the server HTML reads `<div nfscell="" size="6" nfsstickycontainer="" class="cell sticky-container small-6">`; the class-token order follows directive matching and is stated as not part of the contract. A one-line block shows `nfsTitleBar` beside `nfsSticky`. Source: MG; the spec.
11. **`sticky--overflow-hidden-ancestor` without `.overflow-hidden`?** The class is out (ADR 0039), the [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md) is open, and SBC section 8's 2026-09-27 note waits for a directive before scaffolding uses one. A guessed directive name would be churn. The story compares two overflow values, of which Foundation has a class for only one. **Decided: both values inline**, recorded in D19 for the consistency review, which rewrites SBC section 8's list. Source: SBC; ADR 0039.
12. **The off-canvas wrapper recipe?** It selected `.off-canvas-wrapper`. OC's Sass subsection already names "Sticky elements inside the wrapper stop sticking" as what breaks without `nfs-off-canvas`, and the wrapper is now `nfsOffCanvasWrapper`. Rewriting the rule on `[nfsOffCanvasWrapper]` would copy the Off-canvas mixin's rule into consumer CSS. **Decided: the recipe goes; the include is the fix, and warning 3 names `overflow: clip` for other clipping ancestors** (D20). Source: OC; BB 1.1.
13. **1.4.3 row?** TB asked for it: a Top Bar is opaque only while `$topbar-background` is, and FS's `$topbar-submenu-background` doc comment ("Usefull if $topbar-background is transparent") shows a transparent bar is a documented setting; TB's compile check composites a transparent bar over `$body-background`, which says nothing about the content a stuck bar covers. The row now names Title Bar and Callout as opaque, Top Bar as opaque only with an opaque setting, and stories pin a component that paints a background. Source: TB; FS.
14. **Stories and tests?** Story markup follows the class rule (a paragraph under Testing Decisions); `sticky--navigation` writes `nfsTitleBar` beside `nfsSticky` inside a page-spanning container; layer 2 gains a class-free host, the title-bar pairing, and the copied `is-stuck` case with no warning; the SSR smoke's fixtures write no `class` and assert `title-bar sticky` on the paired host. Story ids unchanged (SBC section 3). Source: BB 1.12; SBC.
15. **A defect found outside this spec.** `specs/top-bar.md`'s usage example `<div nfsStickyContainer><div nfsTopBar nfsSticky stickyOn="all">...</div></div>` gives the bar a container exactly as tall as itself, so its Sticky range is empty: it never sticks and Sticky's development warning 2 fires, the same trap as Foundation's title-bar docs markup (ADR 0019 Consequences) and MG decision 14. A fix is proposed below.

Round 4 (depends on all above): shared documents.

16. **ADR?** None: every decision applies ADR 0039, ADR 0040, or BB, and the one choice with alternatives (D16, no report) is a development-only warning that can be added later without breaking anyone. **Glossary?** No new term: Sticky range, Structural class, State class, and Variant input already carry it.
17. **Building-blocks?** Table A's Sticky row still says the directives sit "on `.sticky`" and that the "container is consumer markup"; BB 1.4's initial-state bullet reads as if every directive with a State class reports a copy; BB 1.10's Sticky bullet names only 2.4.11. Proposals below.

### Decisions

1. Two Structural classes (`.sticky`, `.sticky-container`) and four State classes, no Variant class: no Variant input, registry, Variant property, or Runtime check request; `stickTo`, the margins, and `stickyOn` stay Options (decisions 1, 5; D16).
2. `NfsStickyContainer` is required to get `.sticky-container`; neither the consumer nor `nfsSticky` writes it; warning 1 names only the directive (decision 4; D1).
3. A copied State class is stripped by the bindings on server and client and not reported (decision 6; D16).
4. A stuck element is styled through the consumer's own class bound from `isStuck()` or `edge()`; no recipe selects `.is-stuck` (decision 7; D17; user stories 11 and 43).
5. `nfsSticky` beside `nfsTitleBar`, `nfsTopBar`, or `nfsCallout`, `nfsStickyContainer` beside `nfsCell`; neither hosts nor is hosted (decision 8; D18; user story 42).
6. Examples, stories, test hosts, SSR fixtures, and the Rendered HTML write directives only, with the neighbour names of decision 9; `sticky--overflow-hidden-ancestor` sets both overflow values inline (decisions 9 to 11, 14; D19).
7. The off-canvas wrapper recipe is removed; `nfs-off-canvas` is the fix (decision 12; D20).
8. The 1.4.3 row covers a transparent Top Bar (decision 13).
9. Out of Scope, Dropped options, and Design decisions carry one exclusion category per item; ST6 split, ST9 recategorised (decision 3).
10. The names `nfsSticky` and `nfsStickyContainer` are kept; the API, the measurement, ARIA, keys, rendering modes, Sass rules, and Story ids are unchanged.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| `nfsStickyContainer` required, no `Renderer2` alternative (decision 4) | MEDIUM: consumer markup of every Sticky; additive to relax | HIGH: ADR 0039 and its dated note decide it; the class's first-paint role is in FS | DECIDED |
| No Variant input; `stickTo` an Option (decision 5) | LOW: no API change | HIGH: FS defines no Variant class | DECIDED |
| Copied State class not reported (decision 6) | LOW: a development-only warning, addable later without a break | HIGH: stripping is Angular's styling rule (AC decision 6); the report's purpose does not apply to measured state; Foundation's markup has no copy to make | DECIDED; BB 1.4 sentence proposed |
| Styling through the consumer's own class (decision 7) | MEDIUM: the documented styling path of every stuck header | HIGH: BB 1.1 decides recipes; the signal is already public API | DECIDED |
| Composition by placement (decision 8) | LOW: the default composition rule | HIGH: BB 1.9 and TB's D10; neighbour CSS read in FS | DECIDED |
| Neighbour names from open specs (decision 9) | LOW: examples and stories | HIGH: BB 1.3, 1.4 and the MG and Toggler precedents; the consistency review aligns | DECIDED; the XY Grid and Thumbnail specs own them |
| Inline overflow values in one story (decision 11) | LOW: one story | HIGH: ADR 0039 rules out the class; no directive name exists yet | DECIDED; flagged for the consistency review |
| Off-canvas recipe removed (decision 12) | LOW: one example | HIGH: OC's Sass item 5 and BB 1.1 | DECIDED |
| Exclusion categories (decision 3) | LOW: records | HIGH: T section 3 and the seven categories | DECIDED; for [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) |

Nothing is OPEN FOR HUMAN, and no prototype is needed: no decision rests on an unmeasured platform behaviour (the measurement is unchanged and was confirmed by the [Prototype: Sticky measurement refinements](63-prototype-sticky-measurement.md), flex and grid containers included).

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, the Sticky row, first two cells. Replace:

   "| Sticky | `[nfsSticky]` on `.sticky`; `[nfsStickyContainer]` on `[data-sticky-container]` | Directives; container is consumer markup |"

   with:

   "| Sticky | `[nfsSticky]` on the sticky element, binding `.sticky` and the four State classes; `[nfsStickyContainer]` on its parent (Foundation's `[data-sticky-container]` element), binding `.sticky-container`; both written beside the directives of the elements they sit on (`nfsTitleBar`, `nfsTopBar`, `nfsCallout`; `nfsCell`), never hosting or hosted | Directives, one per Structural class ([ADR 0001](adr/0001-directive-first-with-named-exceptions.md), [ADR 0039](adr/0039-directives-manage-every-foundation-class.md)); the container is one consumer-written element with a directive, and the only way to get `.sticky-container` |"

2. `building-blocks.md`, 1.4, the "Initial state is bound, never read from a class" bullet: before "Structural classes written redundantly merge with the directive's static `host` class and are not reported." insert:

   "A directive whose State classes come only from a measurement, with no input or model that could set them (Sticky), strips a copied State class the same way and does not report it, because the copy expresses no state the consumer could have bound ([Spec: Sticky](issues/28-spec-sticky.md), D16)."

3. `building-blocks.md`, 1.10, the bullet "Elements that can cover content (Sticky): WCAG 2.4.11 is met by required consumer `scroll-padding`, checked by a development warning and an e2e case." becomes:

   "Elements that can cover content (Sticky): WCAG 2.4.11 is met by required consumer `scroll-padding`, checked by a development warning and an e2e case; 1.4.3 needs an opaque background on a stuck element that overlaps content, which a Title Bar or a Callout paints and a Top Bar paints only while `$topbar-background` is opaque, so a transparent Top Bar, which Foundation's Sass allows, is not stuck over content ([Spec: Sticky](issues/28-spec-sticky.md))."

4. `specs/top-bar.md`, Usage examples, the sticky Top Bar block (decision 15). Replace:

   ```html
   <!-- A sticky Top Bar: Sticky written beside the bar -->
   <div nfsStickyContainer>
     <div nfsTopBar nfsSticky stickyOn="all">...</div>
   </div>
   ```

   with:

   ```html
   <!-- A sticky Top Bar: Sticky written beside the bar. The container spans the page,
        because the Sticky range is the sticky element's parent (ADR 0019). -->
   <div nfsStickyContainer>
     <div nfsTopBar nfsSticky stickyOn="all">...</div>
     <main>...</main>
   </div>
   ```

   and record it in the [Spec: Top Bar](86-spec-top-bar.md) as a dated correction ("the sticky Top Bar example's container wrapped only the bar, so its Sticky range was empty and it never stuck; the container now spans the page, found by [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md)").

5. `specs/top-bar.md`, WCAG table, the 1.4.3 row, second cell: append

   " A Top Bar or Title Bar made sticky ([Spec: Sticky](../issues/28-spec-sticky.md)) that overlaps content while stuck needs an opaque bar background: a transparent `$topbar-background` passes this check against `$body-background`, not against the content a stuck bar covers."

6. `map.md`, Decisions so far: the gist line below.
7. No change to `CONTEXT.md`, the ADRs, `README.md`, or `storybook-conventions.md` (the inline overflow story is listed for the consistency review instead, which rewrites section 8's list).

### What other specs need from this one

- [Spec: Top Bar](86-spec-top-bar.md): proposals 4 and 5; nothing else, since `NfsTitleBar`, `NfsTitleBarLeft`, and `NfsTopBar` are used as that spec names them and Sticky sits beside them (its D10).
- [Spec: XY Grid](99-spec-xy-grid.md) (open): Sticky's column examples write `<div nfsCell size="6" nfsStickyContainer>` inside `nfsGridX`, and the cell is the Sticky range, so it must stretch to its row's height; if that spec adds an `align-self`-style Variant input, a cell that no longer stretches becomes as tall as its sticky element, which Sticky's development warning 2 reports, and that spec's docs can say so.
- [Spec: Thumbnail](97-spec-thumbnail.md) (open): the column examples write `img[nfsThumbnail]` inside the sticky element.
- [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md) (open): `sticky--overflow-hidden-ancestor` sets `overflow: hidden` and `overflow: clip` inline; if that spec gives `.overflow-hidden` a directive, the consistency review decides whether the story uses it for the first value.
- [Spec: Callout](89-spec-callout.md): nothing asked; `nfsCallout` beside `nfsSticky` works because the gate rule overrides `.callout`'s `position: relative`.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md) and the Off-canvas spec: nothing asked; the Sticky spec no longer carries a consumer rule for the wrapper and relies on `nfs-off-canvas`'s clip, as the Off-canvas D19 already states; `off-canvas--with-sticky` is unchanged.
- [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md): its note that the Sticky spec's "Writing `class="sticky-container"` instead is equivalent" no longer holds is resolved here; nothing asked.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.sticky`, `.sticky-container`, or a Sticky State class, or sends consumer CSS to `.is-stuck`; that every `nfsStickyContainer` in any spec's examples and stories spans more than its sticky element (the Top Bar example of proposal 4 did not); that the neighbour names of decision 9 match the XY Grid and Thumbnail specs once published; and the inline overflow values of `sticky--overflow-hidden-ancestor` against SBC section 8 as rewritten.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): ST1, ST2, ST4, ST5, ST8 unchanged in reason and category; ST3 gains ADR 0039's no-class-names-as-values reason; ST6 is split into `both` (`deprecated-upstream`) and a new horizontal-sticking item (`scope-boundary`); ST7's reason is reworded (the consumer's own class, not `.is-stuck`); ST9 moves from `superseded` to `scope-boundary`. New rows in Design decisions that leave something out: D16's copied-class report and `stickTo` as a Variant input, D17's `data-nfs-stuck` attribute, D18's hosting, D19's `.overflow-hidden` class, D20's wrapper recipe.

### Gist for Decisions so far

- [Re-run: Sticky spec under the class rule](issues/120-rerun-sticky-class-rule.md) -- Sticky has two Structural classes, four State classes, and no Variant class, so `nfsSticky` keeps its API and gains no Variant input; `nfsStickyContainer` becomes the only way to get `.sticky-container` (no consumer class, no `Renderer2` write, since the class is first-paint layout), a copied State class is stripped by the bindings and not reported because Sticky's state is measured, a stuck element is styled through the consumer's own class bound from `isStuck()`, and `nfsSticky` sits beside `nfsTitleBar`, `nfsTopBar`, or `nfsCallout` and `nfsStickyContainer` beside `nfsCell`, never hosting or hosted; examples, stories, and fixtures write directives only, the off-canvas wrapper recipe gives way to the `nfs-off-canvas` include, and the Top Bar spec's sticky example, whose container was as tall as its bar, gets a fix; impact MEDIUM, confidence HIGH. Spec: [specs/sticky.md](specs/sticky.md).

### Amendment, 2026-09-29 (in-family check lines)

[Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md), from item R4 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), adds the Sticky's In-family checks under Hierarchy and DI shape of the [spec](../specs/sticky.md), by the rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)): `NfsStickyContainer` calls `nfsDirectiveCheck('NfsStickyContainer', {children: ['NfsSticky']})` and probes the `nfsSticky` elements inside it; `NfsSticky` calls `nfsDirectiveCheck('NfsSticky')` and probes nothing; neither has a parent check or a peer; `strictParents` changes nothing. Development warning 1 stays a DOM check and is not given for a parent that carries `nfsStickyContainer` without `.sticky-container`: that parent is a forgotten `NfsStickyContainer` import, which the `strictDirectiveImports` check reports once, and "Add nfsStickyContainer to the parent" would ask for a directive already written. The browser-level warnings case asserts it. No other decision changes.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group e, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/sticky.md` was revised in place, and [the group's report](../research/consistency-review-group-e.md) lists every edit.

- R11: D19's rationale names each neighbour's owning spec (the XY Grid's `nfsGridX` and `nfsCell`, the Thumbnail's `nfsThumbnail`, the Callout's `nfsCallout`, the Top Bar's `nfsTitleBar`, `nfsTitleBarLeft`, and `nfsTopBar`) and drops the deferral.
- R32/R64: `img[nfsThumbnail]` in the Rendered HTML and the usage example takes `ngSrc` with `width="600" height="400"`; the rendered lines drop `src` and the lead-in says `NgOptimizedImage`'s own attributes are left out; the story markup and the usage lead-in name `NgOptimizedImage`.
- R41: `sticky--overflow-hidden-ancestor` writes its first ancestor `nfsOverflow="hidden"` (`NfsPrototypeOverflow`, listed in the story's `moduleMetadata.imports`) and keeps `overflow: clip` inline; D19's decision, rationale, and rejected cells, and the story-markup sentence follow.
- Other fix: two usage examples ("Reading the state" and "Deferred") held only the sticky element in their container, so under ADR 0019 they could never stick and development warning 2 would fire; each gains the content the element scrolls past, as R40 did for the Visibility Classes.
- Unchanged (confirmed): R40 (no Sticky class outside rendered output, no recipe on `.is-stuck`); CR-A, CR-C, and CR-D hold (the examples are HTML fragments).

Triage: impact LOW (examples and a story), confidence HIGH (ADR 0019, Foundation's default `$prototype-overflow`). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (audit 0008)

- L5, [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md): the usage comment "The application's own class; no Foundation or library class is selected" reads "An Application class; no Foundation or library class is selected".

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsStickyContainer` gains `exportAs: 'nfsStickyContainer'` for the first time; `NfsSticky` already had `exportAs: 'nfsSticky'`.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/sticky.md` was revised in place. The spec describes and accepts a Sticky with no checks: each rule a check enforced is now documented usage in its API text (usage rules 1 to 6 under API, stated in the directive's JSDoc).

What left the spec, per check, and where its rule now stands:

- Forgotten-import: the In-family line (`NfsStickyContainer`'s `nfsDirectiveCheck` probe of `nfsSticky` elements, `NfsSticky`'s `nfsDirectiveCheck`, and the hand-off of a parent that carries `nfsStickyContainer` without its class to `strictDirectiveImports` and the static check) -- no rule to state beyond importing the directives the template uses; usage rule 1 names the parent's `nfsStickyContainer`. [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md)
- Family: development warning 1 (the parent is not positioned) -- usage rule 1: put `nfsStickyContainer` on the sticky element's parent. [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md)
- Family: development warning 2 (the parent is no taller than the element) -- usage rule 2: the parent spans the range and is taller than the element; the Foundation-contract note on the title-bar example now points at it. [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md)
- Misuse: development warning 3 (an `overflow: hidden` ancestor is the scroll container) -- usage rule 3 (`overflow: clip`), D20 and the off-canvas usage note. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse: development warning 4 (leftover `data-anchor`, `data-top-anchor`, `data-btm-anchor`) -- usage rule 4; D3. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse: development warning 5 (a focused element hidden behind a stuck element) and its development-only `focusin` listener -- usage rule 5 (`scroll-padding`), the WCAG 2.4.11 row, D15, and the Out of Scope line on automatic `scroll-padding`; the `sticky--navigation` story and the e2e focus-not-obscured case stay as the library's own tests. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- D12 (five development-mode warnings) is rewritten to the six usage rules; D16 drops its copied-State-class warning alternative and its Runtime check mention.
- Mentions rewritten: user stories 20, 21, 22, 23, and 39 (numbering kept); the mapping paragraph's "requests no Runtime check" and its "not reported" notes; measurement step 1's warning; the WCAG 2.4.11 row and the note under the WCAG table; the Rendering modes list of what starts in the first render callback; the Testing Decisions intro; the browser-level host-binding case's "no warning is logged" and the development-warnings case; the e2e focus case's "no development warning is logged"; D20; the off-canvas usage note; Sass item 6.
- Other specs' checks the spec quoted: the Breakpoint service's unknown-name warning for a malformed `stickyOn` (now usage rule 6 and "`NfsMediaQuery.is()` answers `false`"), the Breakpoint service's drift check in D4 (now "while the Breakpoint map matches the consumer's `$breakpoints`, as the Breakpoint service spec documents"), the Top Bar spec's compile-time contrast check in the WCAG 1.4.3 row, and the checks-only `nfs-title-bar` in the Storybook preview note (now "the Top Bar spec's title-bar lines").

Kept: no parent injection (the Sticky range is the DOM parent), the State-class bindings and their stripping of a copied State class, the `stickyOn` gate and `width: auto` rules of `nfs-sticky`, the measurement, ARIA, and focus behaviour, and the library's own stories, browser-level, node-level, SSR, Sass-output, and e2e tests, the 2.4.11 and 1.4.10 cases included.

Triage: impact LOW (documented markup rules replace development warnings; no API changes; each check keeps its design in its later-milestone spec), confidence HIGH (the ruling's Decision items 2 to 4). Nothing is OPEN FOR HUMAN.
