# 91. Spec: Media Object

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Media Object to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/media-object.md` and its Sass is `scss/components/_media-object.scss` in the 6.9.0 clone. Publish `specs/media-object.md`.

Known from the triage: Section parts and their alignment Variants.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5

Spec: [specs/media-object.md](../specs/media-object.md). Two listener-free attribute directives in `ngx-foundation-sites/media-object`: `[nfsMediaObject]` (`.media-object`; `stackFor`) and `[nfsMediaObjectSection]` (`.media-object-section`; `alignment`, `mainSection`), with the Flexbox Utilities' `nfsFlexChild alignSelf` and `nfsFlexAlign` written beside them for the flexbox build, a properties-only `nfs-media-object`, and a 1.4.10 requirement to stack at the Zero breakpoint that Foundation's own docs examples fail.

### Evidence

Measured under `D:/tmp/nfs-wave-91/` (not committed): Playwright 1.63 in Chromium, Firefox, and WebKit, Foundation 6.9.0 from the local clone compiled by Dart Sass 1.104.1 (read-only use of `D:/tmp/nfs-ct-prototype`'s packages; no junction, no server), axe-core 4.13.0, stand-in images of the docs' sizes (the three avatars are 100 by 100, `rectangle-1.jpg` 485 by 248, read from the clone). The three engines agreed on every number.

- E1, reflow. At 320 by 640 px, with the docs' text, in the flexbox build and in the `$global-flexbox: false` (table) build alike: Basics fits (320 px); Section Alignment (three sections) is 335 px wide (354 px with the 1.4.12 text spacing); Nesting 345 px (368 px); the Stack example without `.stack-for-small` 566 px (579 px). With `.stack-for-small` every case is 320 px. At 700 and 1280 px everything fits. Each media object's own `scrollWidth` shows its overflow (the outer object for Nesting).
- E2, alignment. In the flexbox build `.middle` and `.bottom` leave `align-self: auto` (sections at the top) and `.align-self-middle`/`-bottom` align (section box 27 to 135 and 53 to 161 px in a 161 px container at 1280 px); in the table build `.middle`/`.bottom` compute `vertical-align: middle`/`bottom` and `.align-self-*` change nothing.
- E3, stacked image: 320 px wide with the thumbnail class on the `img`, 312 px inside the docs' `div.thumbnail` wrapper (its 4 px borders).
- E4, axe on the docs markup: `image-alt` on all four images; nothing with `alt` (the page-level `page-has-heading-one` is outside Storybook's axe context).
- E5, runtime `dir="rtl"` with a left-to-right compile: the gap between image and text drops from 20 to 4 px in both builds (Foundation's physical `padding-right` on the first section lands on the outer edge); a `$global-text-direction: rtl` compile restores 20 px.
- E6, HTML's obsolete `align` attribute: a static `align="middle"` gives a `div` and a `p` `text-align` centre in all three engines (`-webkit-center`, `-moz-center`), and `li`, `article`, `section`, `figure`, `header`, `ul`, `ol`, and `nav` centre in Chromium and WebKit, and `h4` in all three (Firefox centres only `div`, `p`, `h4`, and `td`); `align="right"` on a `ul` gives `text-align: right` in Chromium and WebKit; `align="bottom"` does nothing. Angular sets every static attribute on the element, input or not (`setUpAttributes` in Angular 22.2's `attrs_utils.ts:42-73`).
- E7, a two-level thread with `.main-section` (shortened docs text): 331 px at 320 (352 with spacing); stacking the reply alone brings it to 320 px with the reply's avatar still 124 px right of the parent's; stacking only the outer object also fits but moves the reply's avatar under the parent's.
- E8, `.main-section` with short text between two avatars at 1280 px: the third section at x = 167 px without it, at the right edge (1156 px) with it.
- E9, two library rules that would avoid a per-object `stackFor`: `.media-object { flex-wrap: wrap; }` wraps a two-section object's text below its image at 1280 px when the text section has no `.main-section`; `min-width: 0; overflow-wrap: anywhere` on sections fits at 320 px but leaves a 72 px text column in the three-section example and shrinks the two-section example's image section to 39 px under its 108 px thumbnail.
- E10, a candidate `nfs-media-object` compiled in five placements: `--nfs-media-object-section: main-section` after `foundation-media-object` on the defaults and after `foundation-everything` (also when the settings say `$global-flexbox: false`, because `foundation-everything` sets it to true, and Foundation's partial then emits `.main-section` too); `middle bottom` after `foundation-media-object` with `$global-flexbox: false` and after `foundation-everything($flex: false)`. The property always matches the classes Foundation emitted.

### Grilling record

The AFK override: both sides played against the sources above; nothing was left for a human.

Round 1 (no prerequisites):

- Q1. Which directives? One attribute directive per Structural class, `[nfsMediaObject]` and `[nfsMediaObjectSection]` (the out-of-scope triage's names), on any element; no component, because Foundation generates nothing (ADR 0001). Answer: adopted (D1).
- Q2. Which Variant families, and whose? `.stack-for-<zero>` on the container, `.middle`/`.bottom` and `.main-section` on sections are Foundation's media-object classes; `.align-self-*` and `.align-*` in the docs' flexbox examples are the Flexbox Utilities'. Answer: the first three are this spec's inputs; the Flexbox Utilities classes are that spec's directives (D4), which its resolved contract (one owner, written beside or hosted, never an input of another spec) confirms.
- Q3. Does the documented markup lack anything for WCAG 2.2 AA? Measured (E1, E4): the docs fail 1.4.10 at 320 px in three of four examples and 1.1.1 on every image. Answer: the directives own a 1.4.10 requirement and a development overflow check; `alt` stays axe's (D7, D8, D13).
- Q4. Roles? None; the element carries the meaning, and the triage rated "no default roles" LOW, HIGH. Answer: no role; recipes use nested `article`s for a thread (D12).

Round 2:

- Q5. How is `stackFor` typed, given that only `.stack-for-<zero>` exists and its name comes from `$breakpoints`, not `$breakpoint-classes` (the tooling spec left this to this spec)? Options: `NfsClassBreakpoint` with the Zero breakpoint the only name that sets a class, the Top Bar's D2 shape in reverse; a new Zero-breakpoint registry, alias, and Variant property; a boolean `stacked`/`stackForSmall`; the literal `'small'`. Answer: `NfsClassBreakpoint`, the class built from `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)` (building-blocks 1.4's Zero-breakpoint read, the Menu's D11), any other name setting none and warning in development. A registry adds public surface for one class whose name the token already mirrors and `strictBreakpointSync` already checks; rule 5 keeps Foundation's words and puts the breakpoint in the value; the literal breaks a renamed Zero breakpoint (D2).
- Q6. What is the section's alignment input called? `align` follows the docs' verb and the Menu's input name, but E6 shows a static `align="middle"` centres the section's text. Answer: `alignment`, the docs' "Section Alignment" (D3).
- Q7. `.middle` and `.bottom` do nothing in Foundation's default flexbox build (E2). Should `alignment` also set `.align-self-*`, should the library style `.middle` in that build, or should the Flexbox Utilities do it? Answer: the Flexbox Utilities, beside: two owners for `.align-self-*` is what the Button Group's D9 and the Flexbox Utilities contract rule out, and a library rule would re-implement what Foundation expresses with its helper classes (D4).
- Q8. Beside or hosted, as the Flexbox Utilities spec allows? Answer: beside. A media object is a Flex parent only while `$global-flexbox` is true; hosting would give every section an `alignSelf` that does nothing in the table build (where `nfsFlexChild`'s own check warns) and add a runtime import of `flexbox-utilities` to the entry point (D4).
- Q9. `.main-section`: an input, or automatic? Answer: the boolean `mainSection` (rule 4); the directive cannot know which section is the content, and E8 shows it matters (D5).

Round 3:

- Q10. The two section families are gated by `$global-flexbox` in opposite directions. How does the Runtime check see them? Building-blocks 1.13 gives a gated family a Variant property of its own, empty while its flag is off, and the Breakpoint service spec lets `include()` name only a property that is never empty. With two such properties neither can be named, so a missing include makes `mainSection` report as a missing class in Foundation's default build. Answer: one property, `--nfs-media-object-section`, listing whichever section classes the compile generates (`main-section`, or `middle bottom`); it is never empty while the mixin is included, so `include()` can name it and every report is right in both builds (E10). This refines the 1.13 wording; the proposed dated note is below (D6).
- Q11. Should `mainSection` in a table build report? It has no rule there, but table cells size themselves, so nothing is lost. Answer: it reports once, because the check's contract is "a bound value whose class the compiled CSS lacks"; table builds are Foundation's legacy mode, and the report says the input has no effect there.
- Q12. Is a library CSS rule for 1.4.10 better than a consumer requirement? E9 measured both candidates and each breaks Foundation's layout; stacking by default breaks the Variant Defaults rule. Answer: a requirement on the content, stated, shown in every recipe, and asserted by e2e for every story (ADR 0022's 2026-09-28 note), plus the development overflow check (D7, D8).
- Q13. Overflow check: first render only, or on resize? Answer: a `ResizeObserver` in `afterNextRender`, in development only, warning once and disconnecting; the failure appears only at narrow widths, which a developer reaches by resizing (D8).
- Q14. A section rendered inside a child component's host is not a flex item. Check it? Answer: yes, from the DOM parent in development, with `hostDirectives` as the fix; DI cannot see it through projection (D10).
- Q15. Nesting at 320 px: stack the outer object or the reply? Answer: the reply; E7 shows it fits and keeps the indent.
- Q16. RTL? Answer: Foundation's compile-time `$global-text-direction`, as every component documents (E5); runtime flipping is out of scope.
- Q17. Stories in both builds? The preview compiles one stylesheet in the flexbox build. Answer: four flexbox stories; the table build is covered by the browser-level class and Runtime-check cases and the node-level Sass compile (D14).
- Q18. Glossary: which terms are domain language? Answer: **Media Object**, **Main section**, and **Flexbox mode** (the docs' own phrase for the build in which several Variant classes differ); not the section (a class name) (D15).

Frontier empty.

### Decisions

1. Two attribute directives, one per Structural class, on any element: `NfsMediaObject` (`[nfsMediaObject]`, static `.media-object`) and `NfsMediaObjectSection` (`[nfsMediaObjectSection]`, static `.media-object-section`); entry point `ngx-foundation-sites/media-object`; no `exportAs`, no Parent token, providers, host directives, or Defaults token (D1, D11).
2. `stackFor: NfsClassBreakpoint | undefined` on `NfsMediaObject`: the Zero breakpoint from `nfsBreakpointsToken` sets `.stack-for-<zero>`; another name sets none and warns in development; no Variant property, because the class exists in every compile and the Zero breakpoint's name is `strictBreakpointSync`'s (D2).
3. `alignment: NfsMediaObjectAlignment | undefined` (`'middle' | 'bottom'`, closed) on the section sets Foundation's table-build `.middle`/`.bottom`; named `alignment`, not `align`, because a static `align` attribute is an HTML presentational hint (D3).
4. `mainSection`, a boolean through `nfsVariantBoolean`, sets `.main-section` (D5).
5. Flexbox-build alignment is `nfsFlexChild alignSelf` beside a section and `nfsFlexAlign` beside the media object, written beside, never hosted and never an input of this spec (D4), aligned with the resolved [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) contract.
6. Class records strip copied `stack-for-<zero>`, `middle`, `bottom`, and `main-section`; development checks report those and copied Flexbox Utilities classes by name (D9).
7. A properties-only `nfs-media-object` writes `--nfs-media-object-section` (`main-section` or `middle bottom` by `$global-flexbox`); `NfsMediaObjectSection` reports `alignment` and `mainSection` through `nfsVariantCheck` and names that property in `include()` while either is bound (D6).
8. 1.4.10 and 1.4.12: a media object whose sections do not fit side by side at 320 CSS px binds `stackFor` to the Zero breakpoint (a thread stacks its replies); every recipe and story does; e2e asserts it in three engines for every story (D7).
9. In development, `NfsMediaObject` warns once, with both widths, when a `ResizeObserver` sees its content wider than its box (D8).
10. In development, a section whose DOM parent is not a media object warns, naming `hostDirectives` (D10).
11. No role, no `alt` check, no image directive; recipes put the Thumbnail directive on the `img` and build threads from nested `article`s (D12, D13).
12. Required Sass settings: none. Stories: `media-object--basics`, `media-object--section-alignment`, `media-object--stack-on-small`, `media-object--nesting` (D14).

### Triage

- Decisions 2 to 5 fix public input names and types. Impact MEDIUM: they are the entry point's public API, but additive to change and followed by no other spec. Confidence HIGH: each follows a building-blocks rule and a published precedent (the Top Bar's D2, the Menu's D11, the Button Group's D9, the Flexbox Utilities contract), and decision 3's name was measured (E6). Decided.
- Decision 7 refines building-blocks 1.13. Impact LOW to MEDIUM: a verification channel read only by the Runtime checks, not in the Variant manifest, and one other spec could reuse its shape. Confidence HIGH: E10 shows the property matches Foundation's output in every placement, and it is the only shape under which the Breakpoint service's `include()` rule and the gated-property rule both hold. Decided; the dated note below records it.
- Decisions 8 and 9: impact MEDIUM (a WCAG requirement on consumers), confidence HIGH (measured in three engines; the alternatives measured worse, E9). Decided.
- Nothing is OPEN FOR HUMAN. No prototype is needed.

### Placeholders

- Published specs name no Media Object directive under a placeholder. The only mentions are the Callout spec's Out of Scope line ("the Card, Media Object, and other containers with their own docs pages", which stands) and the tooling spec's deferral of the Zero breakpoint's typing (proposed change 5).
- This spec uses other families' names: `nfsThumbnail` on `img` (and `NfsThumbnail` in a component's `imports`), as the [Spec: Card](90-spec-card.md) writes it, until the [Spec: Thumbnail](97-spec-thumbnail.md) names it; `nfsFlexChild` with `alignSelf` and `nfsFlexAlign` with `alignY`, now the resolved Flexbox Utilities names.

### Proposed shared-file changes

Line numbers are those of the working tree when this Answer was written.

1. `building-blocks.md` Table D, the Media Object row (`:331`), fill the empty cells:

   "| Media Object | `docs/pages/media-object.md` | [Spec: Media Object](issues/91-spec-media-object.md) | `[nfsMediaObject]` (`NfsMediaObject`: binds `.media-object`; `stackFor`, a Class breakpoint, sets `.stack-for-<zero>` for the Zero breakpoint only); `[nfsMediaObjectSection]` (`NfsMediaObjectSection`: binds `.media-object-section`; `alignment` (`'middle' \| 'bottom'`, closed, the `$global-flexbox: false` classes) and the boolean `mainSection` (`.main-section`, Flexbox mode)); flexbox alignment is `nfsFlexChild alignSelf` and `nfsFlexAlign` written beside | Directives, one per Structural class (ADR 0001, ADR 0039); nothing is generated | Native platform: the consumer's elements under Foundation's flexbox or table-cell CSS; Aria and CDK have no media-object pattern | Static host classes and one `computed` class record per directive (copied classes stripped); `nfsBreakpointsToken` for the Zero breakpoint; `nfsVariantBoolean`; development checks in render callbacks (copied classes, a `stackFor` above the Zero breakpoint, a section outside a media object, and a `ResizeObserver` overflow check for 1.4.10); the Variant check of `alignment` and `mainSection` against `--nfs-media-object-section`; a properties-only `nfs-media-object` | None; the consumer's element carries the meaning (nested `article`s for a comment thread) |"

2. `building-blocks.md` 1.13, the Variant properties bullet (`:222`), after "A family that a Sass flag gates gets a Variant property of its own, written as the empty list (whitespace only) while the flag is off and read only by the runtime checks", insert:

   "; two families that one flag gates in opposite directions share one property listing whichever of their names the compile generates, which is never empty while its mixin is included and may therefore be named in `include()`: `nfs-media-object` writes `--nfs-media-object-section` as `main-section` under `$global-flexbox: true` and `middle bottom` under `false` ([Spec: Media Object](issues/91-spec-media-object.md), D6)"

3. `building-blocks.md` 1.4, Variant inputs, at the end of the paragraph that begins "A responsive form is never its own input" (`:66`), append:

   "An input is never named after an HTML attribute that has a presentational meaning on its hosts: Angular sets every static attribute on the element, input or not, and a static `align="middle"` centres a `div`'s text in Chromium, Firefox, and WebKit, and a `ul`'s, `li`'s, `section`'s, or `nav`'s in Chromium and WebKit (measured by the [Spec: Media Object](issues/91-spec-media-object.md), D3)."

   Consequence for the orchestrator: the [Spec: Menu](85-spec-menu.md)'s `align` input (its D12, chosen because the Dropdown Menu's `alignment` Option shares the `ul`) renders `align="right"` on the `ul` in its examples, which Chromium and WebKit map to an inherited `text-align: right` and Firefox ignores (E6). This spec does not reopen the Menu; [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) should check whether that changes a menu's look and decide on the name there. Bound values (`[align]="'right'"`) render no attribute.

4. `CONTEXT.md`, Foundation side, after **Label** (`:81-83`):

   ```markdown
   **Media Object**:
   Foundation's CSS-only component that sets an item, usually an image, beside content in two or three side-by-side sections, marked by the `.media-object` Structural class; a Media Object nested in a section indents it, as in a comment thread.
   _Avoid_: media block, flag object, media card

   **Main section**:
   The section of a Media Object that takes the width the other sections leave, Foundation's `.main-section`, which only Flexbox mode styles.
   _Avoid_: content section, body section, centre section
   ```

   and after **Export mixin** (`:193-195`):

   ```markdown
   **Flexbox mode**:
   Foundation compiled with `$global-flexbox: true`, its default, in which its components lay out with flexbox; with `$global-flexbox: false` they use Foundation's older float and table layouts, and some Variant classes exist in only one of the two.
   _Avoid_: flex mode, flex build, Flex Grid (a layout system)
   ```

5. `specs/variant-declaration-tooling.md`, the `$breakpoints` bullet (`:123`): replace "The Zero breakpoint's name in Media Object's `stack-for-<zero>` is the Media Object spec's to type." with "The Zero breakpoint's name in Media Object's `stack-for-<zero>` needs no registry: `stackFor` is typed `NfsClassBreakpoint`, and the directive builds the class from `nfsBreakpointsToken`'s Zero breakpoint ([Spec: Media Object](../issues/91-spec-media-object.md), D2)." In the flags bullet (`:126`), after "The owning spec gives a gated family a Variant property of its own, which its mixin writes as the empty list while the flag is off and which only the runtime check reads", insert "(or, for two families one flag gates in opposite directions, one property listing whichever names the compile generates, as `--nfs-media-object-section`)".

6. `specs/breakpoint-service.md`, the `include(mixin, settings)` bullet (`:427`): after "never a flag-gated one, because an empty property and a missing one both read as the empty string", insert "(a property shared by two families that one flag gates in opposite directions is never empty while its mixin is included and may be listed: the Media Object section lists `media-object-section` for `nfs-media-object`)".

7. `storybook-conventions.md`, `preview.scss` (`:116`), after the `nfs-off-canvas` line, add: "@include nfs-media-object; // Media Object: --nfs-media-object-section for the Variant check; every media-object--* story".

8. `map.md` Decisions so far: the gist below.

### What other specs need from this one

- [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) (resolved): nothing to change. This spec writes `nfsFlexChild alignSelf` and `nfsFlexAlign` beside its directives and declares no input for `.align-*` or `.align-self-*`; its copied-class check names them, as the contract allows. The beside choice and its reason (a media object is a Flex parent only in Flexbox mode) are D4, for the consistency review's alignment of beside-or-hosted choices.
- [Spec: Thumbnail](97-spec-thumbnail.md) (in this wave): the recipes put the directive on the `img` itself (`img[nfsThumbnail]`), as Foundation's Thumbnail docs page directs, not on the Media Object docs' `div.thumbnail` wrapper; measured, that makes a stacked image 320 px wide instead of 312. If that spec also accepts a `div` host, the recipes may keep the docs' wrapper; the name `NfsThumbnail` is assumed in one usage example's `imports`.
- [Spec: Menu](85-spec-menu.md): the static `align` finding (change 3).
- [Spec: XY Grid](99-spec-xy-grid.md): the Out of Scope line for stacking at other breakpoints points consumers to its cells; nothing asked.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the `nfsThumbnail` placeholder; the Menu's `align`; the 1.13 refinement.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): nine Out of Scope items and the rejected alternatives of D1 to D15, each with a category; none excluded for being CSS-only.

### Gist for Decisions so far

- [Spec: Media Object](issues/91-spec-media-object.md) -- two listener-free directives in `media-object`: `[nfsMediaObject]` (`.media-object`; `stackFor`, a Class breakpoint, setting `.stack-for-<zero>` from `nfsBreakpointsToken`'s Zero breakpoint, the only stacking class Foundation generates) and `[nfsMediaObjectSection]` (`.media-object-section`; `alignment` for the `$global-flexbox: false` classes `.middle` and `.bottom`, named so because a static `align` attribute centres text (measured), and the boolean `mainSection`); Flexbox mode aligns with the Flexbox Utilities' directives written beside; Foundation's own Section Alignment and Nesting examples scroll sideways at 320 px in three engines, so stacking at the Zero breakpoint is a requirement, asserted by e2e and reported by a development overflow check; a properties-only `nfs-media-object` writes one never-empty flag-gated property for the Variant check; no role, no required setting; impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/media-object.md](specs/media-object.md).

### Amendment, 2026-09-28 (inputs named like HTML attributes)

[Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md) decided the rule that proposal 3 of this Answer offered for building-blocks 1.4: not a ban, but a duty of the declaring directive to own what the static attribute renders, by one of four kinds (building-blocks 1.4, inputs named like HTML attributes). Proposal 3 is superseded and not applied. D3 stands: `alignment` is building-blocks 1.4 rule 3's name from the docs' Section Alignment. The Menu's `align`, the consequence this Answer passed on, keeps its name with a null binding (Menu D15). No spec edit.
