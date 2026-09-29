# 117. Re-run: Off-canvas spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81, 83, 86
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Off-canvas](25-spec-off-canvas.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/off-canvas.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: `.off-canvas-wrapper` gains its directive; the close-button rows follow the Close Button spec; the menu-icon hit area follows the Top Bar spec.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Off-canvas](25-spec-off-canvas.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides with `/domain-modeling` for vocabulary and `/to-spec` for the revision, against the sources below. Spec: [specs/off-canvas.md](../specs/off-canvas.md), revised in place; the dated amendment is in the [Spec: Off-canvas](25-spec-off-canvas.md).

Gist: four directives now bind every Foundation class of the plugin, and the developer writes none. `NfsOffCanvas` binds `.off-canvas`, or `.off-canvas-absolute` under a second selector `[nfsOffCanvasAbsolute]`; a required `position` Variant input sets `.position-<side>`; `revealOn` and `inCanvasOn` take Class breakpoints, report through the Runtime checks, and no longer have library rules for other breakpoints; the overlay binds `.js-off-canvas-overlay` and `is-overlay-*` from its panel; `nfsOffCanvasWrapper` binds `.off-canvas-wrapper`; copies of Foundation classes are stripped and reported; the close button, title bar, and menu icon are their specs' directives, with their 24 px boxes from `nfs-close-button` and `nfs-menu-icon`; every contrast check uses the exact WCAG formula. Behaviour, ARIA, keys, animation, rendering modes, and Story ids are unchanged.

### Sources

FS = the Foundation 6.9.0 clone (`docs/pages/off-canvas.md`, `scss/components/_off-canvas.scss`, `js/foundation.offcanvas.js`, `scss/util/_color.scss`); ADR 0039 with its dated notes (the State-class clarification from [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md), User decision); ADR 0040; TYP = the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); BB = `building-blocks.md` as it stands (1.1, 1.3, 1.4, 1.5, 1.7, 1.9, 1.10, 1.13, 1.14); CB = the Answer of [Spec: Close Button](83-spec-close-button.md); TB = the Answer of [Spec: Top Bar](86-spec-top-bar.md); TR = the Answer of [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md); BP = the Answer of [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md); AC = the Answer of [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md) (BB 1.4's initial-state rule); RT = the Answer of [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md), resolved while this ticket ran; T = `research/out-of-scope-triage.md`; X = `research/out-of-scope-exclusions.md` (rows OC1 to OC10); the Reveal re-run's revised `specs/reveal.md` for the table shape; the spec before this revision is "the spec".

### Measurements

Under `D:/tmp/nfs-wave-117/` (not committed; no junction, no server; Dart Sass 1.104.1 loaded read-only from `D:/tmp/nfs-ct-prototype` through `createRequire`):

- `ratios.mjs`, the exact WCAG relative-luminance formula (0.04045 threshold; identical results with 0.03928 for 8-bit values), self-checked at 21:1 for black on white: `$anchor-color` #1779ba on `$light-gray` 3.7554:1, on `$white` #fefefe 4.6473:1; `$closebutton-color` #8a8a8a on `$light-gray` 2.7660:1, on `$white` 3.4230:1; `$closebutton-color-hover` and `$body-font-color` #0a0a0a on `$light-gray` 15.8630:1, on `$white` 19.6304:1. The spec's quoted ratios hold at two decimals; its "15.9:1" for body text becomes 15.86:1.
- `scale.mjs` and `ratios2.mjs`: under the Storybook overrides that the Callout spec adds (`$anchor-color: scale-color($primary-color, $lightness: -15%)`, `$closebutton-color: #767676`), links on `$white` are 6.02:1 (hover 7.46:1) and the close button 4.50:1; on `$light-gray` they would be 4.87:1 and 3.64:1, so the Callout's lines alone would already pass the Off-canvas stories.
- `scan.mjs` and `scan2.mjs`, a 16-step colour grid (4096 colours) compiled against Foundation's own `color-luminance()` and an exact `math.pow` helper, with a positive control: no pair that Foundation's function passes and the exact formula fails at 3:1 or 4.5:1 against `#fefefe` or `#e6e6e6`, and 26 against `#0a0a0a` (`#116666` 3.006 against 2.938; `#1177dd` 4.505 against 4.437), which TB's Probe 3 also counted. A dark `$offcanvas-background` is therefore where the helper changes an outcome, and the Sass compile test uses those pairs.

### Grilling record

Round 1 (no prerequisites): which classes, and who binds them.

1. **Which Foundation and library classes did the spec leave to the developer?** `.off-canvas`, `.off-canvas-absolute`, `.position-*`, `.off-canvas-content` (the directive existed, the class was written), `.js-off-canvas-overlay` with `is-overlay-fixed` or `is-overlay-absolute`, `.off-canvas-wrapper`, `.close-button`, `.title-bar`, `.title-bar-left`, `.title-bar-title`, `.menu-icon`, `.vertical.menu`, `.button`, `.hide-for-large`, `.callout`; prose that read a static class (decision 10's position, the reveal-class warning) or left classes to the developer (the 2.5.8 row, the Sass subsection's `nfs-responsive-toggle` requirement). Source: the spec; ADR 0039.
2. **`.off-canvas-absolute`: a boolean input, a second directive class, or a second selector?** For a boolean `absolute`: one attribute, a typed value. Against: FS's docs call it "the alternative class" and its Sass builds it from `off-canvas-base` as `.off-canvas` is built, so it is a Structural class that replaces `.off-canvas`, not a Variant beside it (ADR 0039: one directive per Structural class); an input can change at runtime and switch fixed and absolute under an open panel; naming rule 4 would call it `offCanvasAbsolute`. For a second class: the rule literally. Against: a duplicated Openable, or host-directive plumbing, and a union for the overlay's `panel` type. Settled: `[nfsOffCanvasAbsolute]`, a second selector of `NfsOffCanvas`, read once through `HostAttributeToken`; same API and `exportAs`, a read-only `absolute` (decision 1). Material's button served several attribute selectors from one class the same way.
3. **`.position-*`: name, type, default?** Name: FS's class template `position-<side>`, its `off-canvas-position($position)` parameter, its `this.position`, and its content classes `has-position-<side>` name the dimension (BB 1.4 naming rule 3), as TR wrote in its example. Type: the closed `'left' | 'right' | 'top' | 'bottom'`; `foundation-off-canvas` writes the four classes itself, so no registry. Default: three options. (a) `'left'`, Foundation's JavaScript fallback: it fixes only Foundation's content classes, not the panel's CSS, and it is a runtime default that sets a class, which ADR 0040 rules out. (b) Unset sets no class, with a warning: FS's CSS gives such a panel no transform, size, or offset, and the docs say the panel "requires a positioning class". (c) Required: a compile error where Foundation fails silently; ADR 0040's default rule exists so the Sass default is the look, and here no Sass setting names one. Settled: (c) (decision 2); the spec's dev check 1 half on a missing class goes.
4. **`.off-canvas-wrapper`?** A directive that binds only its class (ADR 0039 names it among the classes that gain directives). A token for the panel's reflow check: against, because FS's clip works by DOM ancestry, and TB's D13 found projection breaks the DI path for exactly this kind of check. Settled: `[nfsOffCanvasWrapper]`, no token, no `exportAs`; the check keeps reading the DOM (decision 3).
5. **The overlay's classes?** `.js-off-canvas-overlay` static; `is-overlay-*` came from the panel's computed `position` in FS's `_init`, which needs layout. The Structural class decides that position and is known on the server. Settled: bound from the referenced panel's `absolute`, in server HTML (decision 4).
6. **`.off-canvas-content` and `$maincontent-class`?** The directive binds `off-canvas-content`; FS's Sass lets `$maincontent-class` rename it, and the Variant declaration tooling spec left the rename to this spec (its settings table: "the Float Grid and Off-canvas specs decide"). An input carrying a class name is out (ADR 0039's follow-up), and a silent rename would leave the push, reveal, and nested rules without an element. Settled: `nfs-off-canvas` stops the compile when the setting is renamed (decision 5).
7. **State classes?** The panel's `is-open`, `is-closed`, `is-transition-*`, the content's fourteen, and the overlay's `is-visible`, `is-closable` were already host bindings. `body.is-off-canvas-open` stays a `Renderer2` write: `body` carries no library directive and the lock has no first-paint value, which the user's decision in [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md) covers; BB 1.5 adds "strips when copied, and removes on destroy". Settled: the Scroll lock removes a copy it finds while its count is zero, reports it, and releases a destroyed open panel's lock (decision 8). No Openable writes a class on its Triggers (TR D18); this one never did.

Round 2 (depends on 1-7): typing and copies.

8. **`revealOn` and `inCanvasOn`?** TYP and BB 1.7: an Option that sets a class only for Class breakpoints is `NfsClassBreakpoint`; BP: its values pass to `atLeast()` unchanged, and the Runtime check replaces the spec's check for a breakpoint with no class. Two consequences. The Zero breakpoint is a Class breakpoint, but FS's loops skip it, so the directive treats it as `null` and warns, as TB does for `stackedFor`; the Runtime check gets `[]` for it, so one mistake makes one report. And Sass rule (e), reveal and in-canvas classes for breakpoints outside `$breakpoint-classes`, can now serve only a cast value, so it goes, with its `$reveal-for` and `$in-canvas-for` parameters; the cost (adding `xlarge` to `$breakpoint-classes` also generates its grid and visibility classes) is recorded. Settled (decision 6). `inCanvasOn` on an absolute panel does nothing, because FS's rule selects `.off-canvas.in-canvas-for-<bp>`: a development warning (decision 6).
9. **When does the panel call `include()`?** BP's general line says every run, bound value or not, which is the Close Button's case: its own mixin holds the floor it needs. Here the property is `nfs-breakpoint-properties`'s and matters only for a bound breakpoint; an application without reveal or in-canvas panels should not be asked for that include (BP's own decision 21 rejects the same over-report). Settled: only while either Option is bound, as TB does for `stackedFor` (decision 7); the wording clarification is proposed below.
10. **Copied classes?** BB 1.4 (from AC): bound classes strip copies only when bound `false`, not `undefined`, so the panel binds one record over both Structural classes, the four position classes, both transition classes, `is-open`/`is-closed`, and the reveal and in-canvas classes of every non-zero breakpoint of the token's map, true or false; the content binds its record the same way. A development-only field initialiser reads the static `class` (the Reveal re-run's form, because a stripped class is gone by the first render) and reports each copy with its input; the spec's check 2 folds into it. Settled (decision 9).

Round 3 (depends on 1-10): neighbours, Sass, examples, tests.

11. **Close button?** CB decisions 2 and 8: `button[nfsCloseButton]` closes nothing, so a bare `nfsClose` sits beside it; its floor on every close button replaces Sass rule (c), and D20 changes as CB asked. CB decision 9 leaves the panel pair to this mixin; the spec checked only `$closebutton-color`, so `$closebutton-color-hover` joins (decision 10).
12. **Title bar and menu icon?** TB decisions 1, 6, and 7: `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarTitle`, `button[nfsMenuIcon]` with the Trigger beside it; the 24 by 24 px box is `nfs-menu-icon`'s on every menu icon, superseding the spec's "`.title-bar .menu-icon` needs `nfs-responsive-toggle`" and its "`.menu-icon` outside `.title-bar` gets no hit area". RT (resolved while this ran): `nfs-responsive-toggle` draws no hit area and requires `$hide-for`, so a leftover include fails the compile. Settled (decision 11).
13. **Contrast arithmetic?** The brief and TB decision 8: the exact formula through the library's helper, compositing translucent colours over `$body-background`. The measurements above show no change on light panels and false passes on a dark one. Settled (decision 12).
14. **Examples and stories?** Directives only: `nfsMenu orientation="vertical"`, `nfsButton` Triggers, `nfsCallout`, the XY Grid's `nfsGridX` and `nfsCell` and the Visibility Classes directive with names their open specs fix (`nfsVisibility hideFor`, as the Breakpoint service spec writes `nfsVisibility showFor`), the Sticky spec's `nfsStickyContainer` and `nfsSticky`. The copied-class block in the Rendered HTML is labelled as a copy, as TB's is. Story ids unchanged. Settled (decision 13).
15. **Tests?** Class, breakpoint-class, copied-class, Scroll lock copy, and Runtime check cases at layer 2, the Runtime check ones in files of their own (BP's once-per-realm rule); a class-free SSR fixture with an absolute panel and one copied pair; Sass compile cases for the removed rules, the hover check, the dark-panel pairs, and the `$maincontent-class` guard. Settled (decision 14).
16. **Glossary or ADR?** No new term. **Scroll lock** in `CONTEXT.md` names only Reveal's lock while this spec uses the term for its own; a sharpened definition is proposed. No ADR: decision 1 applies ADR 0039 literally and a selector can be added or aliased later; decision 2 relaxes to optional without a breaking change if Foundation ever gains a default side; both are recorded in BB and ADR 0040 notes instead. The frontier is empty.

### Decisions

1. `NfsOffCanvas` has two selectors: `[nfsOffCanvas]` binds `.off-canvas`, `[nfsOffCanvasAbsolute]` binds `.off-canvas-absolute` instead; one API, `exportAs: 'nfsOffCanvas'`, a read-only `absolute`; both attributes on one element use absolute and warn (D25).
2. `position: InputSignal<NfsOffCanvasPosition>`, required, `NfsOffCanvasPosition = 'left' | 'right' | 'top' | 'bottom'` (closed, no registry, no Variant property); sets `position-<value>`; not in the Defaults token (D6).
3. `[nfsOffCanvasWrapper]` (`NfsOffCanvasWrapper`) binds `.off-canvas-wrapper`; no token, input, output, or `exportAs`; the reflow check reads the DOM ancestor (D26).
4. `NfsOffCanvasOverlay` binds `.js-off-canvas-overlay` and `is-overlay-absolute` for an absolute panel, else `is-overlay-fixed`, from its panel reference (D27).
5. `NfsOffCanvasContent` binds `.off-canvas-content`; `nfs-off-canvas` stops the compile when `$maincontent-class` is not `'off-canvas-content'` (D29).
6. `revealOn` and `inCanvasOn` are `NfsClassBreakpoint | null` Options (no Defaults token slot, as before); the Zero breakpoint sets no class, behaves as `null`, and warns; `inCanvasOn` on an absolute panel warns; `nfs-off-canvas` loses its `$reveal-for` and `$in-canvas-for` parameters and their rules, and takes no parameters (D28).
7. Runtime checks: `nfsVariantCheck('nfsOffCanvas')` (or `'nfsOffCanvasAbsolute'`); while either Option is bound, `include('nfs-breakpoint-properties', ['breakpoint-classes'])` and `value()` per bound Option with the need `{setting: 'breakpoint-classes', name}`, or `[]` for the Zero breakpoint; they replace the spec's development check 7; one read-phase callback holds them and the development checks.
8. `body.is-off-canvas-open` stays a `Renderer2` write by `NfsOffCanvasScrollLock`, with the calling panel's `Renderer2`; removed on the last release or on destroy; a copy found while the count is zero is removed at the first panel's first render and reported (D31).
9. Every class the directives bind is bound true or false (class records), so copies are stripped on the server and in the browser; development check 1 reports each copy with its input from a development-only read of the static `class`; the checks are renumbered to ten (D30).
10. The close button is `button[nfsCloseButton]` with a bare `nfsClose`; its floor is `nfs-close-button`'s and Sass rule (c) is removed; `nfs-off-canvas` checks `$closebutton-color` and `$closebutton-color-hover` against `$offcanvas-background` (D20, D21).
11. Title bars and menu icons are the Top Bar spec's directives; the menu icon's 24 by 24 px box is `nfs-menu-icon`'s; the spec no longer mentions `nfs-responsive-toggle` except to say it is not included for this (D32).
12. Every ratio is the exact WCAG formula through the library's internal helper, unrounded (D33).
13. Examples, stories, fixtures, and test hosts write directives only; Story ids unchanged; the ARIA, keyboard, animation, and rendering-mode contracts are unchanged.
14. Tests as listed in round 3, question 15.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Decision 1, `[nfsOffCanvasAbsolute]` | HIGH (a public selector) | HIGH (ADR 0039's one directive per Structural class; FS calls it the alternative class and builds it from the same base mixin; the boolean and second-class options each fail a recorded rule) | Decided |
| Decision 2, required `position` | HIGH (a required public input) | HIGH (FS's docs require the class; FS's CSS has no look without it; ADR 0040's default rule presumes a Sass default; TR already wrote `position="left"`) | Decided; dissent recorded: a `'left'` default |
| Decision 6, Class-breakpoint Options and the removed Sass parameters | MEDIUM (a Sass parameter removed; CSS size for a breakpoint outside the defaults) | HIGH (ADR 0040, BB 1.7, TYP, BP decide the type) | Decided |
| Decision 7, `include()` only while bound | LOW (reversible inside the library) | HIGH (BP decision 21's reasoning; TB's `stackedFor`) | Decided; wording clarification proposed |
| Decisions 3, 4, 5, 8, 9 | LOW to MEDIUM | HIGH (ADR 0039, BB 1.4 and 1.5, the Magellan user decision, the tooling spec's hand-off of `$maincontent-class`) | Decided |
| Decisions 10 to 12 | LOW (other specs own the rules) | HIGH (CB, TB, RT, measured ratios) | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the selector form, `HostAttributeToken`, required inputs, and class-record stripping are standard Angular behaviour or were measured by the Menu and Top Bar tickets, and the ratios were measured here.

### Proposed shared-file changes (for the orchestrator)

Read against the documents as they stand; several items build on the Top Bar and Close Button proposals, which the fixer may already have applied.

1. `building-blocks.md` 1.3, Plugin name mapping: replace "OffCanvas is `NfsOffCanvas` with selector `nfsOffCanvas`" with:

   > OffCanvas is `NfsOffCanvas` with the selectors `nfsOffCanvas` (binding `.off-canvas`) and `nfsOffCanvasAbsolute` (binding Foundation's alternative class `.off-canvas-absolute`), one directive class for Foundation's two Structural classes of the panel ([Spec: Off-canvas](issues/25-spec-off-canvas.md), D25)

2. `building-blocks.md` 1.4, the "Defaults and binding" bullet of Variant inputs: after its first sentence ("... so the consumer's Sass default is the look;") insert:

   > A Variant family without which Foundation's CSS gives the element no look, because Foundation's docs require one of its classes and no Sass setting names a default, is a required input instead, so the no-class state cannot arise: the Off-canvas `position` ([Spec: Off-canvas](issues/25-spec-off-canvas.md), D6).

3. `building-blocks.md` 1.10, the Target size bullet: apply the [Spec: Top Bar](issues/86-spec-top-bar.md) Answer's proposal 2 as written; it removes the sentence "The same `.title-bar .menu-icon` rule serves ... the Off-canvas spec requires `@include nfs-responsive-toggle;` for it, and no separate title-bar mixin exists (Table B OffCanvas)", which no longer holds: the Off-canvas spec requires `nfs-menu-icon` and `nfs-title-bar`.

4. `building-blocks.md` Table A, OffCanvas row, first cell: replace it with:

   > `[nfsOffCanvas]` binding `.off-canvas`, or `[nfsOffCanvasAbsolute]` binding `.off-canvas-absolute` (one directive), with the required `position` Variant input for `.position-<side>`; `[nfsOffCanvasContent]` binding `.off-canvas-content`; `[nfsOffCanvasOverlay]` on a developer-written `div`, binding `.js-off-canvas-overlay` and `is-overlay-fixed` or `is-overlay-absolute` from its panel; `[nfsOffCanvasWrapper]` binding `.off-canvas-wrapper`; triggers via `nfsOpen`/`nfsToggle`/`nfsClose` beside `nfsButton`, `nfsCloseButton`, or `nfsMenuIcon`

5. `building-blocks.md` Table B, OffCanvas row: in the DI cell, after "`nfsOffCanvasOverlay` links to the panel by a required template reference;" insert " `nfsOffCanvasWrapper` binds its class and provides nothing;". In the last cell, replace everything from "The 24 px `.title-bar .menu-icon` hit area stays in `nfs-responsive-toggle`" to the end with (the Top Bar Answer's proposal 8 plus this re-run's sentences):

   > A title-bar menu icon that opens a panel is `button[nfsMenuIcon]`, whose 24 by 24 px box is `nfs-menu-icon`'s ([Spec: Top Bar](issues/86-spec-top-bar.md)); the Consistency review's decision to keep the hit area in `nfs-responsive-toggle` is superseded, because Title Bar and Menu Icon are now in the destination. The close button's 24 px floor is `nfs-close-button`'s ([Spec: Close Button](issues/83-spec-close-button.md)). `revealOn` and `inCanvasOn` take Class breakpoints (`NfsClassBreakpoint`) and report through the Runtime checks, so `nfs-off-canvas` emits no reveal or in-canvas rules of its own and takes no parameters ([Re-run: Off-canvas spec under the class rule](issues/117-rerun-off-canvas-class-rule.md)).

6. `adr/0040-variant-input-types.md`, Consequences, append:

   > - 2026-09-28 ([Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md)): the Defaults rule presumes that the Sass settings give an element a look with no Variant class. Where they do not, because Foundation's docs require one of the family's classes and no setting names a default (the Off-canvas panel's `.position-<side>`), the Variant input is required, so there is no unset state and still no runtime default that sets a class.

7. `CONTEXT.md`, **Scroll lock**: replace the definition line with:

   > Keeping the page from scrolling behind an open modal Reveal, as Foundation's `html.is-reveal-open` rule does, or behind an open OffCanvas panel whose `contentScroll` is false, as Foundation's `body.is-off-canvas-open` rule does; counted per document so the lock holds while any locking Openable is open.

8. `specs/triggers.md` (the [Spec: Triggers (shared utility)](54-spec-triggers.md)), the `nfsOpenableToken` sketch: replace `dialog[nfsReveal] | [nfsOffCanvas] | [nfsDropdownPane]` with `dialog[nfsReveal] | [nfsOffCanvas] | [nfsOffCanvasAbsolute] | [nfsDropdownPane]`. Its usage example's `<div nfsOffCanvas ... position="left">` is confirmed as written.

9. `specs/breakpoint-service.md` (the [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md)):
   - The consumer table's OffCanvas row, last cell: after "`revealOn`, `inCanvasOn` (`NfsClassBreakpoint`)" add "; both reported through `nfsVariantCheck` while bound, the Zero breakpoint setting no class".
   - The Variant check bullet "In that callback the directive calls `include()` first, on every run, whether or not a Variant input is bound": append "; a directive whose Variant property is read only for a value that may stay unbound, and whose own mixin holds nothing it needs, calls `include()` only while that value is bound (Off-canvas `revealOn` and `inCanvasOn`, Top Bar `stackedFor`), so an application that binds none is not asked for the include".

10. `specs/variant-declaration-tooling.md` (the [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md)):
    - Two `uses` entries under `NfsBreakpointClassesOverrides`: `{entryPoint: 'ngx-foundation-sites/off-canvas', directive: 'NfsOffCanvas', input: 'revealOn', alias: 'NfsClassBreakpoint', shape: 'name'}` and the same for `inCanvasOn`. `position` is closed and has no entry.
    - The excluded-settings bullet on class-name renames: replace "the Float Grid and Off-canvas specs decide" with "the Float Grid spec decides its own; the Off-canvas spec decided that `nfs-off-canvas` stops the compile on a renamed `$maincontent-class`".

11. `storybook-conventions.md` section 5, the Off-canvas override's comment: replace the two comment lines above `$offcanvas-background: $white;` ("// Non-text contrast (1.4.11) and color-contrast (1.4.3): nfs-off-canvas stops the compile on the close" and "// button (2.77:1 on $light-gray), and links are 3.76:1. Spec: Off-canvas, every off-canvas--* story.") with:

    > // Non-text contrast (1.4.11) and color-contrast (1.4.3): on Foundation's defaults nfs-off-canvas stops the compile on the
    > // close button (2.77:1 on $light-gray) and links are 3.76:1 (exact WCAG formula). With the Callout lines below they would
    > // pass on $light-gray (3.64:1 and 4.87:1); the Off-canvas stories keep the setting the spec documents.
    > // Spec: Off-canvas, every off-canvas--* story.

    and in `preview.scss`, `@include nfs-off-canvas; // Off-canvas: reduced motion, the wrapper clip, panel contrast checks; every off-canvas--* story` if the includes block does not list it yet.

12. `map.md`, Decisions so far: the gist below.

No change to `README.md` (its OffCanvas row names no class), ADR 0001, ADR 0012, ADR 0022, ADR 0030, ADR 0039, or `research/` (X rows OC1 to OC10 hold as T section 3 judged them).

### What other specs need from this one

- [Spec: Top Bar](86-spec-top-bar.md) (resolved): its `top-bar--title-bar` story's "story panels" are Off-canvas panels; they need `position` (required) and the Off-canvas scaffolding imports. Nothing else; the names match.
- [Spec: Close Button](83-spec-close-button.md) (resolved): its line "the Off-canvas spec requires `$offcanvas-background: $white`" holds; the Off-canvas check now covers `$closebutton-color-hover` against the panel too.
- [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md) (resolved): `position="left"` confirmed; proposal 8 adds the second selector to its token sketch.
- [Spec: Visibility Classes](104-spec-visibility-classes.md) (open): the Off-canvas examples and its development check 6 hide a Trigger at the reveal breakpoint with that spec's directive, written as `nfsVisibility hideFor="large"` until it fixes the names.
- [Spec: XY Grid](99-spec-xy-grid.md) (open): `off-canvas--absolute` puts two wrappers in `nfsGridX` and `nfsCell` cells; the story follows that spec's names.
- [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md) (open): `off-canvas--with-sticky` uses `nfsStickyContainer` and `nfsSticky`, and relies on `nfs-off-canvas`'s wrapper clip, unchanged.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.off-canvas`, `.off-canvas-absolute`, `.position-*`, `.off-canvas-content`, `.js-off-canvas-overlay`, `is-overlay-*`, or `.off-canvas-wrapper` in consumer markup; that every Off-canvas panel in any spec's examples binds `position`; that the Top Bar's `stackedFor` and these Options agree on the Zero-breakpoint report (a development warning and `[]` needs); and that no spec still cites `nfs-responsive-toggle` or a panel-scoped rule for an Off-canvas close button or menu icon.

### Gist for Decisions so far

- [Re-run: Off-canvas spec under the class rule](issues/117-rerun-off-canvas-class-rule.md) -- the four directives now bind every class the developer wrote: `NfsOffCanvas` binds `.off-canvas`, or `.off-canvas-absolute` under a second selector `[nfsOffCanvasAbsolute]` (one API; D25), a required closed `position` input sets `.position-<side>` because Foundation's docs require the class and its Sass has no look without it (D6), the overlay binds `.js-off-canvas-overlay` and `is-overlay-*` from its panel, and `[nfsOffCanvasWrapper]` binds `.off-canvas-wrapper`; `revealOn` and `inCanvasOn` take Class breakpoints, the Zero breakpoint sets none and warns, the Runtime checks replace the old visibility check, and `nfs-off-canvas` drops its extra reveal and in-canvas rules and parameters; copies of Foundation classes are stripped and reported; `body.is-off-canvas-open` stays a `Renderer2` write, stripped when copied; the close button and menu icon take `nfs-close-button`'s and `nfs-menu-icon`'s 24 px boxes (never `nfs-responsive-toggle`), the panel checks the close button's hover colour too, a renamed `$maincontent-class` stops the compile, and every ratio uses the exact WCAG formula (measured: false passes of Foundation's function only on dark panels); behaviour, ARIA, and Story ids unchanged; impact HIGH, confidence HIGH. Spec: [specs/off-canvas.md](specs/off-canvas.md).

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/off-canvas.md` was revised in place. The API, the markup, ARIA, keyboard, focus, rendering modes, and Story ids do not change.

- Hierarchy and DI shape gains the In-family lines: `NfsOffCanvas` (both selectors) passes no parent, because its `nfsOffCanvasContentToken` injection stays optional with a supported `null` (a sibling panel binds `content`), and development check 3 stays the report for a panel that needs a content; `NfsOffCanvasContent` probes the panels nested in it; `NfsOffCanvasWrapper` probes the panels and contents inside it; `NfsOffCanvasOverlay` probes nothing and reaches its panel by reference. The `content` and overlay links are peers by reference, whose forgotten imports fail to compile (NG8002, NG8003). An Openable probes no Trigger. `strictParents` changes nothing.
- `nfsOffCanvasContentToken` carries a development-only description naming `NfsOffCanvasContent` and `ngx-foundation-sites/off-canvas`.
- Development check 3's wrapper half finds the wrapper by its `nfsOffCanvasWrapper` attribute or its class, so a wrapper whose import was forgotten is reported once, by `strictDirectiveImports` on the wrapper (M1), and check 3 never asks for an attribute already written; a browser-level case asserts it.

Triage: impact LOW (development-only checks and one development-only string), confidence HIGH (ADR 0046, building-blocks 1.9, the shared spec's rule and its kept-optional list, D26's DOM-ancestry reason). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group d, applying the coordinator's decisions in [research/consistency-review-decisions.md](../research/consistency-review-decisions.md) and the forgotten-import checks spec's rules for family checks; `specs/off-canvas.md` was revised in place. The reviewer's record is [research/consistency-review-group-d.md](../research/consistency-review-group-d.md).

- R25: the 1.4.3 row names Foundation's `$anchor-color` for its 4.65:1 and adds 6.01:1 with the Callout's required `$anchor-color`, which the Storybook overrides carry; a 1.4.12 row after the 1.4.10 row (Foundation's example passes: the menu links end before the close button at 320 CSS px with the text spacing, in three engines); the e2e layer's text-spacing case on `off-canvas--default`.
- R26: rule (b) adds `overflow-wrap: break-word` to `.off-canvas-wrapper` with its measured reason and why not `anywhere`; the Solution, the Sass summary, D19, the 1.4.10 row, and the missing-include item follow.
- R52: "consuming-directive rule 1" in the two citations of the Breakpoint service's rule.
- R57: "the consumer's own classes" in two places.
- The registration rule of the forgotten-import checks spec (its second bullet after the family rule's item 5): development check 3's content half says nothing for a panel inside an element that carries `nfsOffCanvasContent` without its directive, whose forgotten import `strictDirectiveImports` reports once (M1); it keeps its message for a bare panel with no such element. The `NfsOffCanvas` In-family line and the browser-level development-check case follow. This replaces the disclosure and carousel re-run's "check 3 stays the report ... still true when a content ... lost its import", whose shared-spec proposal was not adopted.
- Unchanged, confirmed: R4, R14, R22/R53, R50, R56, R59, R65, R66, R68, R69/R70, CR-A, CR-C, CR-D (no component example).

### Amendment, 2026-09-29 (audit 0008)

- L4, [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md): `NfsOffCanvasOverlay` loses its `exportAs` (`nfsOffCanvasOverlay`); its only member is its required `panel` input, no state or method to read (building-blocks 1.3).
