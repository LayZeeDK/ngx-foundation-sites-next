# 125. Re-run: Orbit spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Orbit](33-spec-orbit.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/orbit.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: the Orbit wrapper, controls, figure, image, and caption gain directives; OR9 keeps its exclusion with a restated reason.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Orbit](33-spec-orbit.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK as a self-grilling (both sides) against the sources below, with `/domain-modeling` for vocabulary and `/to-spec` for the revision. Spec: [specs/orbit.md](../specs/orbit.md), revised in place; the dated amendment is in the [Spec: Orbit](33-spec-orbit.md) under `### Amendment, 2026-09-28 (class rule)`.

Gist: the eight behaviour directives already bound their Structural classes as static host classes and `.is-active` as host bindings. What the consumer still wrote goes. Five class-only directives bind `.orbit-wrapper`, `.orbit-controls`, `.orbit-figure`, `.orbit-image`, and `.orbit-caption`; the rotation control's `class="button small"` becomes `nfsButton` written beside it; the `.show-for-sr` spans take the Visibility Classes directive (placeholder `nfsShowForSr`). A copied `is-active` is stripped and reported in development. Foundation's Orbit has no Variant class, so there is no Variant input. The compile-time checks move to the exact WCAG formula, with the caption and arrow bands composited over `#fff` and `#000`; no verdict moves. OR9 keeps its exclusion, now for the cost of a second APG style, not WCAG. Behaviour, ARIA, keys, the focus handoff, ADR 0037's `inert` override, rendering modes, and Story ids are unchanged. Nothing is `OPEN FOR HUMAN`, and no prototype is needed.

### Decision log

Sources: ADR 0039, ADR 0040, and the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) ("81"); the answers of [Re-run: Tabs spec under the class rule](108-rerun-tabs-class-rule.md) ("108"), [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md) ("107"), [Re-run: Slider spec under the class rule](124-rerun-slider-class-rule.md) ("124"), and the user decision in [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md); `research/out-of-scope-triage.md` ("triage", the OR9 row and the judge-found row naming `specs/orbit.md:115`, `:119`); `research/out-of-scope-exclusions.md` (OR1 to OR13); `research/foundation-component-catalogue.md` (the Orbit row); BB = `building-blocks.md` as it stands (1.1, 1.4 initial-state rule, 1.9, 1.10, 1.13, 1.14); FS = the Foundation 6.9.0 clone (`scss/components/_orbit.scss`, `scss/components/_tabs.scss`, `docs/pages/orbit.md`, `js/foundation.orbit.js`); NGC = the components 22.2.x clone (`src/aria/tabs/tab.ts`, `tab-list.ts`, `tab-panel.ts`, `src/aria/private/tabs/tabs.ts`); W = WCAG 2.2; Ratios = a Node script with the WCAG 2.x relative-luminance formula, colours composited per channel without rounding, confirmed against Dart Sass 1.93.2 (the repository's copy, run from `D:/tmp/nfs-wave-125/`, no junction, nothing left running), whose `mix()` keeps fractional channels (`mix(#0a0a0a, #fff, 50%)` is `rgb(132.5, 132.5, 132.5)`).

1. **Which classes did the published spec leave to the consumer?** Three sets. `class="orbit-wrapper"`, `class="orbit-controls"`, `class="orbit-figure"`, `class="orbit-image"`, and `class="orbit-caption"` in every example (two mapping rows "Plain consumer markup", the hierarchy's "plain markup", the Rendered HTML, the usage example). `class="button small"` and `class="button small hollow"` on the rotation control (the mapping row "the consumer styles it with Foundation's button classes"). `class="show-for-sr"` on the arrows' and bullets' text. The eight behaviour directives already bound their Structural classes as static host classes, and `.is-active` was a host binding. The published spec never seeded state from a class, but Foundation's docs put `is-active` on the first slide and bullet (FS `docs/pages/orbit.md:37`, `:64`). Source: the spec before this revision.
2. **Do the wrapper and controls get directives, although nothing styles them?**
   - For keeping them markup: FS `_orbit.scss` has no `.orbit-wrapper` or `.orbit-controls` rule (its `orbit-wrapper` mixin styles `.orbit`, `:54-57`, `:156-158`), and FS `js/foundation.orbit.js` never reads either class, so a directive binds a class nothing reads.
   - Against: the triage's judge-found row fails "no behaviour" as a reason; ADR 0039's consequences name the Orbit wrapper and controls by name; the class rule leaves no Foundation class to the consumer; and consumer markup keeps the element structure of Foundation's docs (ADR 0039).
   - Decided: `NfsOrbitWrapper` and `NfsOrbitControls`, a static host class each (D23). The spec says that leaving the two elements out changes nothing on screen, so no reader thinks they carry layout.
   - Rejected: dropping the two elements from the examples (`superseded` by the class rule's element structure).
3. **Selectors?**
   - `[nfsOrbitWrapper]` and `[nfsOrbitControls]` name no element: nothing depends on one, and the docs' `div` is what the examples write.
   - `figure[nfsOrbitFigure]`, `img[nfsOrbitImage]`, and `figcaption[nfsOrbitCaption]` keep Foundation's elements, as 124 kept `span[nfsSliderFill]`: FS pairs each class with its element in every example, and the `figcaption` names its `figure`.
   - The cost of an element-qualified selector, an attribute on another element that silently matches nothing, is accepted for the precedent and the semantics. A caption on a content slide is not a documented Foundation form; Foundation calls figure, image, and caption "premade styles for image-based slides with a caption" (FS `docs/pages/orbit.md:134`).
4. **What do the five inject?** Nothing in production. In development builds, an optional lookup of `nfsOrbitToken` backs dev check 8 (one of them outside an Orbit). That is 124's fill shape: a required injection would throw in production for a class holder that needs nothing from the Orbit, while a caption outside a slide is positioned against whatever ancestor is positioned, with no signal (D23). The five register nothing and have no inputs or `exportAs`. A lazier option, no check at all, is recorded as the rejected alternative. It would save one development-only lookup per directive, but it would break consistency with the Slider.
5. **Variant classes?** None. FS `_orbit.scss` defines `.orbit`, `.orbit-container`, `.orbit-slide`, `.orbit-figure`, `.orbit-image`, `.orbit-caption`, `.orbit-previous`, `.orbit-next`, and `.orbit-bullets`, plus the `.is-active` and `.no-motionui` states. Its `$orbit-*` settings are compile-time Sass (AGENTS.md Design Philosophy 5). So the Orbit has no Variant input, alias, Variant registry, Variant property, Runtime check, or Defaults token key for a Variant. The Sass subsection's item (6) reads "none", and the Variant declaration tooling gets no Orbit entry (81; BB 1.4, 1.13).
6. **State classes?** `.is-active` stays a `[class.is-active]` host binding on `NfsOrbitSlide` and `NfsOrbitBullet`. `.is-in` and `.no-motionui` stay unbound, now with category `superseded`. Every Orbit State class sits on an element a library directive hosts, so the Magellan user decision on `Renderer2` writes to elements no library directive hosts does not apply. The only `Renderer2` write stays the inline `scroll-behavior: auto` of the instant alignment, which is not a class.
7. **Initial state and copied classes (BB 1.4)?**
   - Initial state is the `selected` model; the Orbit never read a static class, so nothing is removed.
   - Both bindings are booleans, so a copied `is-active` is stripped on server and client (107's reading of Angular's `findStylingValue`). On a later slide it would change nothing, with no signal.
   - Decided: dev check 7. The slide and the bullet read `HostAttributeToken('class')` in a development-only field initialiser, match `is-active` as a whole token, and warn once per element, naming `[selected]` (D24). A copy on the first slide is reported too, as 107 and 108 do, because the seed means nothing.
   - Redundant Structural classes merge and are not reported.
8. **The rotation control's look?**
   - `nfsButton` written beside `nfsOrbitRotation`, never hosted (D25). Foundation has no rotation control, so no Foundation class belongs to it. A consumer may style it as a clear or hollow button or as their own control, and BB 1.9 hosts a class directive only where the element is always that component's Structural class. The Triggers spec writes `nfsButton` beside its Triggers the same way (BB 1.8).
   - `nfsButton`'s `[attr.type]` binding and the rotation control's static `type="button"` agree, since the Button's default is `'button'`.
   - The examples keep the published look (`size="small"`, `fill="hollow"` in the usage example, the Button spec's names). The stories use no Variant input, so they depend only on the Button directive's selector, as 107's stories do.
   - The 2.5.8 row now cites `nfs-button`'s 24 px floor too.
9. **`.show-for-sr`?** The Visibility Classes directive on the `span`s, written `nfsShowForSr` until the [Spec: Visibility Classes](104-spec-visibility-classes.md) names it (D26). That is the placeholder the Button, Dropdown, Drilldown, Responsive Menu, and Abide re-runs use. The spans complete the arrows' and bullets' accessible names, as Foundation's docs have them. Rejected: an Orbit-owned span directive (a second owner of a Visibility class); `aria-label` on the buttons (BB 1.10 adds none to an element named from content).
10. **The Tabs re-run (108): does anything reach the Orbit?**
    - The Orbit hosts `@angular/aria`'s Tabs directives, which bind no class (NGC `tab.ts:41-48`, `tab-list.ts:49-54`, `tab-panel.ts:45-50`: roles and attributes only). It never hosts the library's Tabs family, which now binds `.tabs`, `.tabs-title`, `.tabs-content`, and `.tabs-panel`.
    - Hosting those would draw Foundation's tab strip on the bullets, and FS `_tabs.scss:132-140` (`.tabs-panel { display: none }` unless `.is-active`) would hide every unselected slide and end scroll snap.
    - Recorded in the Aria composition bullet and as a rejected alternative of D20. Nothing else in 108 applies: no Aria input is exposed as a Variant input here.
11. **Contrast checks under the exact formula (BB 1.10; ADR 0022, dated note)?** Rules 0a and 0b now compute every ratio with the library's internal contrast helper (`math.pow`), unrounded, not with Foundation's `color-luminance()`, which the [Spec: Top Bar](86-spec-top-bar.md) measured passing failing pairs (D17 revised). Exact figures from Ratios:
    - `$medium-gray` #cacaca on `$white` #fefefe: 1.6252:1.
    - `$dark-gray` #8a8a8a on #fefefe: 3.4230:1.
    - `$black` #0a0a0a against #8a8a8a: 5.7349:1.
    - #8a8a8a against #cacaca: 2.1062:1.
    - `$white` on `rgba($black, 0.5)` over `#fff`: 3.6835:1, and 3.7084:1 over #fefefe.
    - `$white` on `rgba($black, 0.6)` over `#fff`: 5.2066:1.
    - No pass or fail verdict moves, and the three required settings are unchanged.
    - `color-pick-contrast()` stays, only to know which caption text colour Foundation's `.orbit-caption` rule paints.
12. **Which backdrop for the translucent bands?**
    - The published rule composited over `$white` and `$black` and so claimed "over any image". A consumer's `$white` can be darker than an image's white, though. With `$white: #f0f0f0` and `rgba($black, 0.58)`, the band gives the `$white` text 4.70:1 over `$white` but only 4.29:1 over `#fff`, so the old check would pass a failing caption.
    - Decided: composite over `#fff` and `#000`, the lightest and darkest colours an image can hold. They join the WCAG minimums and the ring offset as the mixin's only literals. The composited colours are opaque, so the helper's own compositing over `$body-background` does not apply.
    - Against: two literals, and at Foundation's defaults a difference under 1 percent. Accepted, because the check exists for arbitrary images.
    - Test: the Sass compile test gains that custom-`$white` case, which holds whether or not the helper rounds channels (both composites round apart), and the Top Bar's pair as a bullet case (`#116666` on a `#0a0a0a` page: 2.94:1 exact, 3.01:1 through Foundation's function, per ADR 0022's dated note).
13. **OR9: the basic carousel, restated (triage OR9 row: holds in part).**
    - Foundation's `bullets: false` does allow a bullet-less Orbit (FS `js/foundation.orbit.js:431`).
    - The exclusion's reason is cost, not WCAG. The arrows alone are single-pointer alternatives to swiping (W 2.5.1, 2.5.7). The basic style's slides are `group`s with a slide role description, not tab panels, and the slide hosts Aria's `TabPanel` through static `hostDirectives`, which cannot switch. So the style needs a second slide directive, a second ARIA and keyboard table, and a second test matrix.
    - Category changed from `superseded` to `scope-boundary`: the tabbed style does not supersede the basic one; it is the chosen boundary.
    - The grouped style becomes its own Out of Scope item (`scope-boundary`).
    - The `bullets` Option row, which said both "required" and "their presence in the markup is the switch", now cites the same reason. Dev check 3 now warns because the slides would be tab panels that no tab controls (NGC `tabs.ts:104`: no `aria-labelledby` without a tab), not for WCAG. D3's rationale and the 2.5.1 row say that the bullets, with the arrows, are the single-pointer alternative.
14. **Categories.** Every Out of Scope item, Dropped option, dropped event, not-bound or dropped class, and rejected Design-decisions alternative now carries a one-line reason and one category. Changes against `research/out-of-scope-exclusions.md`:
    - OR1 `bullets`: `scope-boundary` (item 13), was `jquery-or-dom-plumbing`.
    - OR6 `accessible`: `platform-or-a11y`, was `jquery-or-dom-plumbing`. The option made Foundation's container focusable and gave it arrow keys (FS `js/foundation.orbit.js:95`, `:242-259`), so an off switch would be a switch to fail W 2.1.1.
    - OR9: `scope-boundary`, was `superseded`.
    - OR10 split: cloned slides `platform-or-a11y` (duplicated content for assistive technology, find-in-page, and crawlers); other transitions `superseded`.
    - OR11: `other` (not a Foundation feature, the triage's grouping), was `scope-boundary`.
    - Unchanged: OR2 (`jquery-or-dom-plumbing`), OR3, OR4, OR7, OR12, OR13 (`superseded`), OR5 (`platform-or-a11y`), OR8 (`variant-as-class`).
    - New entries: `.is-in` and `.no-motionui`, the "Current Slide" span, and `data-slide` (`superseded`); Foundation's `_reset()`, `_updateBullets()`, and `_destroy()` (`jquery-or-dom-plumbing`); the grouped carousel (`scope-boundary`); runtime theming (`other`, design choice); automated screen-reader output (`scope-boundary`).
    - Being CSS-only is the reason for none.
15. **User stories?** Story 1 is rewritten in place; 46 (a copied `is-active` is reported) and 47 (a misplaced class-only directive is reported) are appended; numbering is kept.
16. **Tests?**
    - Stories: no story writes a class on a library element; `orbit--basics` asserts the Structural classes of the class-free markup.
    - Browser level: class bindings over a class-free host (a consumer's own class kept, a redundant `orbit-slide` merged without a warning); the initial state with copied `is-active` on the second slide and bullet (stripped, one warning each); eight dev checks, with check 8 silent inside a nested Orbit's slide; no production injection in the five.
    - SSR smoke: the fixtures write no class and assert all eleven Orbit Structural classes and one `.is-active` slide and bullet.
    - Sass compile test: the two exact-formula cases (item 12) and "no Variant property".
    - e2e: unchanged.
    - Story ids: unchanged.
17. **Rendering modes?** Unchanged in behaviour. The new classes are static host classes, so they are in server HTML and every dehydrated block (BB 1.1, 1.11 decision 1). The class-only directives register nothing and add no Hydration boundary.
18. **Glossary or ADR?** Neither.
    - Glossary: Structural class, State class, Utility class, Variant class, and Rotation control already carry the language, and no term was sharpened.
    - ADR: no decision meets all three bars. Each follows from ADR 0039, ADR 0040, BB 1.4, or BB 1.10, and each is reversible without breaking consumers except the five selectors, which ADR 0039 already decided. ADR 0025 and ADR 0037 stand as written.

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Five class-only directives and their selectors (items 2 to 4) | HIGH: public selectors in every carousel's markup | HIGH: ADR 0039 names the five classes; the Slider fill and Nested menu span precedents; FS markup | Decided |
| Initial state and dev check 7 (item 7) | LOW: development only, additive | HIGH: BB 1.4 initial-state rule; 107's styling reading | Decided |
| No Variant input (item 5) | LOW: no API | HIGH: FS `_orbit.scss` read | Decided |
| `nfsButton` beside the rotation control (item 8) | MEDIUM: consumer markup of one element | HIGH: BB 1.8 and 1.9; Foundation has no rotation control | Decided |
| `nfsShowForSr` placeholder (item 9) | LOW: a placeholder name in examples | NOT HIGH: the Visibility Classes spec has not run | Decided as a placeholder, as the Button re-run did; that spec's name replaces it |
| Exact formula and the `#fff`/`#000` backdrop (items 11, 12) | LOW: Sass checks, reversible, no API | HIGH: BB 1.10; ADR 0022's dated note; Ratios; Dart Sass channel behaviour measured | Decided |
| OR9 restated, categories (items 13, 14) | LOW: wording and classification | HIGH: the triage's OR9 row; FS option source | Decided |

No trap-quadrant item. Nothing is `OPEN FOR HUMAN`.

### Dissent

- Against D23's wrapper and controls: a directive whose class nothing styles is API with no visible effect, and the lazier path is to drop the two elements from the examples. Not adopted: the triage and ADR 0039 decided it, and the elements are Foundation's documented structure. Reopens if Foundation drops the two classes from its docs.

### Prototype needed

None. The class bindings, the copied-class check, and the Sass cases are ordinary browser-level, SSR, and compile tests; the ratios were computed here.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, Orbit row, second cell: replace it with

   "`[nfsOrbit]` (root, binds `.orbit`, hosts `ngTabs`); `[nfsOrbitWrapper]`, `[nfsOrbitControls]` (bind `.orbit-wrapper`, `.orbit-controls` only); `div[nfsOrbitContainer]` (scroll-snap container); `div[nfsOrbitSlide]` (hosts `ngTabPanel` and overrides its `inert`; `tabpanel` is not allowed on `li`); `figure[nfsOrbitFigure]`, `img[nfsOrbitImage]`, `figcaption[nfsOrbitCaption]` (bind `.orbit-figure`, `.orbit-image`, `.orbit-caption` only); `[nfsOrbitBullets]` (hosts `ngTabList`); `button[nfsOrbitBullet]` (hosts `ngTab`); `button[nfsOrbitPrevious]`, `button[nfsOrbitNext]`; `button[nfsOrbitRotation]` (new, required by the APG; its look is `nfsButton` beside it)"

   the third cell with

   "Directives on Foundation's elements, one per Structural class ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)), plus one added button"

   and append to the fifth (Primitives) cell, before its closing `|`:

   "; `HostAttributeToken('class')` in development builds only, for a copied `is-active`; the five class-only directives inject nothing in production"

2. `building-blocks.md`, Table B, Orbit row, DI shape cell: replace it with

   "`nfsOrbitToken`; slides and bullets register; the five class-only directives inject nothing in production (an optional development-only lookup); Aria `TABS`/`TAB_LIST` from the hosted directives, never the library's Tabs family; `nfsOrbitDefaultsToken` (`timerDelay`, `autoPlay`, `infiniteWrap`), no Variant"

3. `building-blocks.md` 1.10, first bullet: after "that composites a translucent colour over `$body-background` first;" insert

   "a translucent colour painted over an image rather than the page (the Orbit's caption and arrow bands) is composited over `#fff` and over `#000`, the lightest and darkest colours an image can hold, before the helper compares it ([Spec: Orbit](issues/33-spec-orbit.md), D17);"

4. `storybook-conventions.md` section 5, the Orbit comment in the settings overrides block: replace

   "// Non-text contrast (1.4.11) and 1.4.3 over images: nfs-orbit stops the compile on Foundation's bullets
   // (1.6:1) and caption band (3.7:1). Spec: Orbit, every orbit--* story."

   with

   "// Non-text contrast (1.4.11) and 1.4.3 over images: nfs-orbit stops the compile on Foundation's bullets
   // (1.63:1) and caption band (3.68:1 over #fff, exact formula). Spec: Orbit, every orbit--* story."

5. No change to `CONTEXT.md`, the ADRs, or `README.md`; `map.md` gets the Decisions-so-far line below.

### What other specs need from this one

- [Spec: Visibility Classes](104-spec-visibility-classes.md): the Orbit's arrows and bullets name themselves with `<span nfsShowForSr>` text inside native buttons, and the spans complete the accessible names. The Orbit's stories and SSR smoke assert `show-for-sr` on them. Its directive's name replaces the placeholder.
- [Spec: Button](37-spec-button.md) (and its class-rule re-run): the rotation control writes `nfsButton` beside `nfsOrbitRotation`, with `size="small"` and `fill="hollow"` in the examples and no Variant input in the stories. The Orbit relies on the `type` default of `'button'` agreeing with the rotation control's static `type="button"`.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the category changes and new entries of item 14 (OR1, OR6, OR9, OR10 split, OR11; the grouped carousel; the not-bound classes and dropped markup).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md):
  - Replace `nfsShowForSr` in the Orbit spec once the Visibility Classes spec names its directive.
  - Check that the five class-only directives have the Slider fill's DI shape everywhere they are cited.
  - Check that every spec whose translucent colour sits over images composites over `#fff` and `#000` if proposal 3 is adopted.
  - Check that Table A's Orbit row matches the spec.

### Gist for Decisions so far

- [Re-run: Orbit spec under the class rule](issues/125-rerun-orbit-class-rule.md) -- the consumer writes no class. Five class-only directives, `[nfsOrbitWrapper]`, `[nfsOrbitControls]`, `figure[nfsOrbitFigure]`, `img[nfsOrbitImage]`, and `figcaption[nfsOrbitCaption]`, bind their Structural classes, with no production injection and a development warning outside an Orbit. The rotation control's look is `nfsButton` written beside it, and the screen-reader text takes the Visibility Classes directive (placeholder `nfsShowForSr`). A copied `is-active` is stripped and reported, and Foundation's Orbit has no Variant class, so there is no Variant input. The contrast checks use the exact WCAG formula with the caption and arrow bands composited over `#fff` and `#000` (no verdict moves). OR9 holds for the cost of a second APG style, not WCAG. The bullets keep hosting Aria's Tabs, never the library's class-binding Tabs family. Behaviour, ARIA, keys, ADR 0037's `inert` override, rendering modes, and Story ids are unchanged; impact HIGH, confidence HIGH. Spec: [specs/orbit.md](specs/orbit.md).

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/orbit.md` was revised in place. Behaviour, ARIA, keys, ADR 0037's `inert` override, rendering modes, and Story ids do not change.

- Hierarchy and DI shape gains the In-family lines: `NfsOrbit` probes all twelve parts, because each depends on the root; the seven parts with behaviour have no parent check, because their `nfsOrbitToken` injection is required; the five class-only parts (`[nfsOrbitWrapper]`, `[nfsOrbitControls]`, `figure[nfsOrbitFigure]`, `img[nfsOrbitImage]`, `figcaption[nfsOrbitCaption]`) pass `NfsOrbit` as their parent from their development-only optional lookup, with an `alone` sentence for the caption, so their parent check replaces dev check 8 and reports once, and under `strictParents` each throws M8 in development builds. Slides and bullets are peers paired by `value`.
- `nfsOrbitToken` carries a development-only description naming `NfsOrbit` and `ngx-foundation-sites/orbit`.
- Recorded: the slide, the bullets, and the bullet host Aria's `TabPanel`, `TabList`, and `Tab`, whose own `TABS` or `TAB_LIST` injection runs first; a missing root is still reported with the description by an earlier part that hosts nothing, but a bullet inside an `nfsOrbitBullets` element whose import was forgotten throws Aria's NG0201 for `TAB_LIST`, and the static check names that import.
- Dev checks 1 and 3 stay; they are still true when the rotation control or the bullets were written with a forgotten import, which the root's probe names. D23 and the browser-level dev-check case follow the parent check.

Triage: impact LOW (development-only checks, one development-only string, and a development-only throw under an opt-in flag), confidence HIGH (ADR 0046, building-blocks 1.9, the shared spec's `strictParents` table row for these five parts, the Slider fill's identical shape, and the directive composition guide's execution order). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group d, applying the coordinator's decisions in [research/consistency-review-decisions.md](../research/consistency-review-decisions.md) and the forgotten-import checks spec's rules for family checks; `specs/orbit.md` was revised in place. The reviewer's record is [research/consistency-review-group-d.md](../research/consistency-review-group-d.md).

- R15: Library mixin rule 13 (under `forced-colors: active`, a `CanvasText` ring on every bullet and a `Highlight` fill on the selected one, no `forced-color-adjust`), the rules' lead-in, the missing-include item, a 1.4.11 forced-colours row, the e2e forced-colours case (not run in WebKit), the compile test, D27, and the Foundation-behaviour list.
- R26: rule 14 (`.orbit-caption { overflow-wrap: break-word; }`), a 1.4.12 row written in the table's three columns, and the e2e text-spacing case.
- R32/R64: the slide images write `[ngSrc]` with `[priority]="first"` and no `[attr.loading]` in the Rendered HTML and the usage component, which imports `NgOptimizedImage`; the rendered `img` shows no `src`; the lead-in says `NgOptimizedImage`'s own attributes are left out; a sentence after the usage block; the `@defer` bullet's lazy-loading sentence names `NgOptimizedImage` in place of `loading="lazy"`.
- R61/R63: each "(class only)" in the hierarchy block reads "(class only; in development builds only: optional nfsOrbitToken, for its parent check)", R61's intent applied to the Slider fill's current line, which the form and value-control re-run reworded.
- The registration rule of the forgotten-import checks spec: development checks 1 and 3 say nothing where the root holds an element carrying `nfsOrbitRotation`, `nfsOrbitBullets`, or `nfsOrbitBullet` that registered nothing (a forgotten import, which the root's probe reports once, M2), and keep their messages for an Orbit with no such element. The root's In-family line, the check definitions, and the browser-level case follow; the disclosure and carousel re-run's "Dev checks 1 and 3 stay" is replaced.
- The class-only parts' In-family line says why M4 and the `strictParents` throw hold for a projected class-only part (every part with behaviour must already be declared in the Orbit's template), as the forgotten-import checks spec's `strictParents` table now notes; the disclosure and carousel re-run flagged it for this review.
- Unchanged, confirmed: R1, R4 (figures stand; the new figures are the measured ones of R15 and R26), R62, CR-A, CR-C, CR-D.

### Amendment, 2026-09-29 (audit 0008)

- L4, [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md): `NfsOrbitContainer` and `NfsOrbitBullets` lose their `exportAs`; both classes are empty, with no state or method to read (building-blocks 1.3).
- L5, [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md): the Content slides comment's "chart-placeholder is the application's own class" reads "chart-placeholder is an Application class".

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsOrbitContainer` and `NfsOrbitBullets` regain their `exportAs` (removed by audit 0008 L4), and `NfsOrbitRotation`, `NfsOrbitWrapper`, `NfsOrbitControls`, `NfsOrbitPrevious`, `NfsOrbitNext`, `NfsOrbitFigure`, `NfsOrbitImage`, and `NfsOrbitCaption` gain one for the first time (`nfsOrbitRotation`, `nfsOrbitWrapper`, `nfsOrbitControls`, `nfsOrbitPrevious`, `nfsOrbitNext`, `nfsOrbitFigure`, `nfsOrbitImage`, `nfsOrbitCaption`).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group d](168-rerun-specs-without-checks-group-d.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/orbit.md` was revised in place and describes a library with no checks. What left the spec, per check (each check's full text stays in [research/checks-extraction-d.md](../research/checks-extraction-d.md) for the later milestone's specs):

- Forgotten-import checks: the In-family lines (the root's probes of twelve parts, the seven behaviour parts' lines, the five class-only directives' parent check with the caption's `alone` sentence and its `strictParents` throw), the five class-only directives' development-only `inject(nfsOrbitToken, {optional: true})`, `nfsOrbitToken`'s development-only description (M7), and the browser-level cases, including the `provideNfsRuntimeChecks({strictParents: true})` case. The token's description is now its plain name; the class-only directives inject nothing at all; an "Imports (documented usage)" bullet says what a directive left out of the imports does (NG0201 for a part with behaviour and Aria's `TAB_LIST` case, NG8002 for a bound input, NG8003 for an `exportAs` reference, no class for a class-only directive). The required injections of the seven behaviour parts stay, with NG0201 as Angular's report.
- Misuse warnings: dev checks 1 (`autoPlay` without a rotation control), 2 (the rotation control after the container), 3 (no bullets), 4 (no name or role description), 5 (unnamed bullets), and 7 (a copied `is-active`), the `ngDevMode`-only `afterNextRender`, the `HostAttributeToken('class')` read, and the browser-level "Dev-mode checks" bullet and the `[selected]` warning case. Beyond the manifest: the warning for an unknown `selected` value (API, and its browser-level case). They are rules 1 to 5, 7, and 9 of a new Documented usage in the API, split between the JSDoc of `NfsOrbit`, `NfsOrbitSlide`, and `NfsOrbitBullet`; user stories 42 and 46, D18, D22, and D24, and the WCAG rows 2.2.2, 2.5.1 and 2.5.7, and 4.1.2 are rewritten in place.
- Family checks: dev check 6 (two slides with one `value`) and dev check 8 (a class-only part outside an Orbit, already the In-family parent check). They are rules 6 and 8; user story 47 and D23 are rewritten in place.
- Build-time checks: the `nfs-orbit` `@error` rules 0a (bullet contrast) and 0b (caption text and arrow glyph over the image extremes), with their Sass compile cases (Foundation's defaults stopping, and the `#116666` and `rgba($black, 0.58)` cases that pinned the exact formula and the backdrop). They are now the Sass subsection's Required settings with Foundation's failing figures and the passing example; the WCAG rows 1.4.3 and 1.4.11, the Sass and custom CSS summary, user story 43, D17, and the story Sass sentence say so, and the Sass compile test asserts the rules on Foundation's defaults and with the stories' settings. The mixin's reused-settings list keeps only what its rules read.
- Also rewritten beyond the manifest: Aria's own development log for each slide is described without naming a console method, and D20's rejected ADR 0034 contract no longer lists its per-bullet warning.
- Kept: the thirteen directives, the scroll-snap layout, Aria's Tabs composition and the `inert` override, the focus handoff, the rotation, every Library mixin rule 1 to 14, every story and its axe gate, the browser-level behaviour cases, the SSR smoke, the e2e layer, and the manual release test. Decision numbers are unchanged.
- No API, class, ARIA, keyboard, or rendering change. Impact LOW, confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.

### Amendment, 2026-09-30 (later-milestone families)

From [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md), applied by [Re-run: specs without the later-milestone families, group b](177-rerun-specs-without-later-families-group-b.md): `specs/orbit.md` no longer assumes the XY, Float, or Flex Grid, the Typography Helpers, or the four Utilities specs, names none of their directives, and links none of them. Their classes are Foundation's normal classes, which the consumer and the library's own stories write, with Foundation's global styles loaded (ADR 0039's exception for a family with no first-milestone spec). What changed:

- The arrows' and bullets' screen-reader text is `<span class="show-for-sr">`, a normal class: the Solution, user story 1 (now "no Orbit class"), the class-mapping row, the entry-point bullet, the ARIA row, the Rendered HTML lead, markup, and class note, the styling line, the Sass paragraph, the story note, D26, and the usage example, whose `imports` drops the visibility directive.
- D26 keeps its rejected alternatives; the first is restated as an Orbit owner of another family's class.
- Unchanged: the thirteen directives, the tokens, the slide contract, the focus handoff, ARIA and keyboard, the required settings, the rendering modes, and the Story ids.

### Amendment, 2026-09-30 (audit 0010)

From [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md); `specs/orbit.md` was revised in place:

- L1: "No Foundation or library class is left for the consumer" is narrowed to families with a first-milestone spec.
