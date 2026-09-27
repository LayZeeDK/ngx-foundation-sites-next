# 121. Re-run: Smooth Scroll spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Smooth Scroll](29-spec-smooth-scroll.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/smooth-scroll.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Smooth Scroll](29-spec-smooth-scroll.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5

Spec: [specs/smooth-scroll.md](../specs/smooth-scroll.md), revised in place. Resolved 2026-09-27 by self-grilling (AFK), both sides played against the sources below. The revision is recorded in the [Spec: Smooth Scroll](29-spec-smooth-scroll.md) as "Amendment, 2026-09-27 (class rule)".

Gist: SmoothScroll has no Foundation class, so `NfsSmoothScroll` gains no Variant input, no State class, and no host binding, and its API, behaviour, ARIA, keyboard, rendering modes, and Story ids are unchanged. The class rule changes the markup around it: Foundation's Menu container becomes `<ul nfsMenu nfsSmoothScroll>`, whose `.menu` and Variant classes (`orientation="vertical"` for `.vertical`) the Menu directive binds, written beside `nfsSmoothScroll` rather than hosted by it (new D13). The server HTML carries `class="menu"` from that host binding, the SSR smoke asserts it, and the stories use `ul[nfsMenu]`, `[nfsTopBar]`, and `button[nfsButton]` as scaffolding, with inline styles only for values Foundation has no class for.

### Decision log

Sources: FS = the Foundation 6.9.0 clone; NG = the Angular 22.2.x clone; ADR 0039, ADR 0040; T = `research/out-of-scope-triage.md`; X = `research/out-of-scope-exclusions.md`; CAT = `research/foundation-component-catalogue.md`; BB = `building-blocks.md` as amended by the typing decision; SBC = `storybook-conventions.md`; TYP = the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); the spec before this revision is "the spec".

Round 1 (no prerequisites): what classes are there, and who owns them.

1. **Does SmoothScroll have a Foundation class of its own?** No. Its plugin writes no class (FS `js/foundation.smoothScroll.js` has no `addClass`, `removeClass`, or `toggleClass`; its only DOM write is the generated container id the spec drops); Foundation ships no smooth-scroll Sass (FS `scss/` has no smooth-scroll partial; the one "smooth" match is font smoothing in `scss/_global.scss:181-182`); CAT row "Smooth Scroll" lists no class. The docs example writes `.menu` (the Menu component's) and a `.sections` wrapper that no Foundation Sass defines (FS `docs/pages/smooth-scroll.md:25-34`). So no Structural, Variant, or State class exists for `NfsSmoothScroll` to bind, and no Variant input or registry follows (ADR 0040). Source: FS; CAT; ADR 0039.
2. **Which consumer-written classes did the spec carry?** `class="menu"` (Rendered HTML twice, the Router usage example), `class="menu vertical"` (the Guide usage example), a sticky `.top-bar` in the `smooth-scroll--sticky-offset` story, and prose that left them to the consumer: the class-mapping section ("Foundation's `.menu`, whose classes stay the consumer's"), the ARIA table's Container row ("Foundation's `ul.menu`"), and the Sass subsection's Menu classes. No story or example wrote a State class. Source: the spec.
3. **Who binds them under the class rule?** `.menu`: `ul[nfsMenu]` (T section 2, "Menu markup (G1)"; [Spec: Menu](85-spec-menu.md), in progress in this wave). `.vertical`: the Menu's `orientation` Variant input, a Closed Variant family (BB 1.4 naming rule 2, "`orientation` ... for `.horizontal`, `.vertical`, and their responsive forms"; TYP "What the 25 spec tickets and 26 re-run tickets need to know": "the menu specs: `vertical medium-horizontal` becomes `[orientation]` rules"). `.top-bar`: `[nfsTopBar]` (T section 2, Top Bar row; [Spec: Top Bar](86-spec-top-bar.md), open). This spec uses those names and says the Menu and Top Bar specs own them. Source: T; BB 1.4; TYP.
4. **Do the exclusion rows for this spec change?** No. X rows SS1 to SS7 (X `:248-254`) all sit under T's "Reasons that still hold" (T section 3: SS3 scope, SS7 jQuery plumbing, SS6 platform and accessibility limits, SS4 and SS1 browser target and browser-owned timing, SS2 replaced by a named mechanism, SS5 dropped for design reasons); none rests on a class being CSS-only, and T names no dissent for this spec. Source: X; T.
5. **What does Angular put in server HTML for `<ul nfsMenu nfsSmoothScroll>`?** Static template attributes, directive selectors and static input values included, are set on the element by `setUpAttributes` through `renderer.setAttribute` (NG `packages/core/src/render3/util/attrs_utils.ts:42-73`), so the server HTML carries them, serialised in lowercase as HTML attribute names are, as the prerendered output of the [Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](48-prototype-sticky-css.md) shows (`<div nfsstickycontainer="" ... class="sticky-container">`). Host class bindings render on the server (BB 1.11 decision 1; ADR 0039 Consequences), so `class="menu"` is in the server HTML and hydration keeps it. The spec's Rendered HTML leaves the static attributes out, as the Button spec's does, and now says so. Source: NG; the Sticky CSS prototype; BB 1.11.

Round 2 (depends on 1-5): the shape of the composition.

6. **Should `NfsSmoothScroll` host `NfsMenu`, so the consumer writes one attribute?** For: one attribute where Foundation writes `data-smooth-scroll` on the `.menu`. Against: a Smooth Scroll container need not be a Menu (the spec's own Checkout example puts it on a `form`; a link host, an `article` with a table of contents, a `nav`); host directives are static, so every container would get `.menu`, and Magellan, which hosts `NfsSmoothScroll` (ADR 0029; the Magellan spec's D3), would inherit it too; the Menu's Variant inputs would need a second exposure through `hostDirectives` inputs; and a consumer's `nfsMenu` written beside it would be Angular's development-mode NG0309 error (NG `packages/core/src/render3/view/directives.ts:84`, `:568-585`, `RuntimeErrorCode.DUPLICATE_DIRECTIVE = 309` in `packages/core/src/errors.ts:60`). A second selector (`ul[nfsSmoothScroll]` hosting `NfsMenu`) fails on the same points plus D1's rejection of two forms for one behaviour. **Decided: no; the consumer writes `nfsMenu` beside `nfsSmoothScroll`** (D13). Source: map Standing preferences (directive composition: `hostDirectives` and directives placed beside each other); ADR 0039; NG.
7. **Should the Menu directive host `NfsSmoothScroll`?** Against: every Menu, including Menus of links to other pages, would carry a `click` listener and `jsaction`, and the Menu entry point would import the smooth-scroll one, against per-plugin `@defer` splitting (BB 1.11 decision 7). **Decided: no, recorded as what this spec relies on**, and routed to the Menu spec below. Source: BB 1.11; the spec's D1.
8. **Does a directive beside the container host constrain it?** Yes, one thing: a container host yields to a click that is already `defaultPrevented` (click handling step 2, D3), so a directive on the same element whose `click` listener cancelled in-page link clicks would silence Smooth Scroll. The spec now says so; the Menu spec is asked not to cancel link clicks. Source: the spec's click handling; D3.
9. **Does ADR 0039's second rule (each directive owns the ARIA, `type` default, or check its documented markup lacks for WCAG 2.2 AA) add anything?** Foundation's documented markup fails 2.4.3 (focus stays on the link), which D7 already fixes; the links are native `a[href]`, so there is no `type` default and no role to add; 2.4.11 needs the consumer's `scroll-padding-top`, a value (the bar's height) rather than a class, which the Sass subsection already leaves to the consumer and which the story and e2e geometry assert. A development check for an obscuring bar was weighed: `NfsSmoothScroll` cannot tell which element is a bar, and the Sticky spec owns that check where a sticky element exists (BB 1.10, "Elements that can cover content"). **Decided: nothing added.** Source: ADR 0039; ADR 0022; the spec's WCAG table; BB 1.10.
10. **Does the `nfs-smooth-scroll` mixin need Variant properties?** No. Only an entry point with an Open Variant family writes them (ADR 0012 dated note of 2026-09-27; BB 1.13), and SmoothScroll has no Variant family. The Sass subsection gains item 6, "none". Source: ADR 0012; ADR 0040; BB 1.13.

Round 3 (depends on 6-10): examples, stories, and tests.

11. **Usage examples and Rendered HTML?** Every `class="menu"` becomes `nfsMenu`; `class="menu vertical"` becomes `nfsMenu orientation="vertical"`; `NfsMenu` joins the component imports; the server HTML shows `class="menu"` (and `menu vertical`) from the Menu directive and `jsaction` from `NfsSmoothScroll`. A static `orientation="vertical"` type-checks against the closed union, and a misspelt one fails, as static attributes did against a closed union in the typing probes (TYP round 1, cases S01 and S02). Source: ADR 0039; ADR 0040; decision 5.
12. **Story scaffolding?** The sticky bar is `[nfsTopBar]` held at the scroller's top by an inline `position: sticky; top: 0`: Foundation has no class for plain `position: sticky` (its Prototype position list is static, relative, absolute, fixed, FS `scss/prototype/_position.scss:15-20`), SBC section 8 allows an inline style for a value Foundation has no class for, and `nfsSticky` would bring a second plugin into the story for no assertion. The scroll-container panel takes an inline height and `overflow-y: auto` (Foundation's overflow utilities give only `visible`, `hidden`, and `scroll`, FS `scss/prototype/_overflow.scss:15-19`). Story buttons are `button[nfsButton]`. Containers are `ul[nfsMenu]`. Story ids are unchanged, because renaming one is a breaking change to the spec's e2e tests (SBC section 3). Source: SBC sections 3 and 8 and the checklist; FS.
13. **SSR smoke?** Its container is `ul[nfsMenu]`, the documented form, and it asserts `class="menu"` from `NfsMenu` and that `NfsSmoothScroll` adds no class and no attribute but `jsaction`. For: the smoke is where server HTML is asserted (BB 1.12 layer 3), and TYP asks each spec's SSR smoke to assert the classes in server HTML. Against: the smoke now imports the Menu entry point; accepted, because the Menu is the container Foundation documents. The fixture app's containers are `ul[nfsMenu]` as well. Source: BB 1.12; TYP.
14. **User stories?** Story 1 names `ul[nfsMenu]`; story 26 ("server HTML to be my markup unchanged") no longer holds as written, because the Menu's class is added by a host binding, so it now asks that the directive add nothing but its event-replay annotation; a new story 37 covers writing no class on a smooth-scrolling Menu. Source: ADR 0039 Consequences ("the server HTML still carries every Foundation class").

Round 4 (depends on all above): shared documents.

15. **ADR?** No new one. D13 is not surprising without context (directives placed beside each other are the map's standing composition rule) and it is not the result of a close trade-off (hosting fails on NG0309 and on non-Menu containers), so two of the three domain-modeling conditions fail. ADR 0017 and ADR 0038 name no class and stand unchanged.
16. **Glossary?** No new term. "Beside" is ordinary English for the map's composition rule, and the spec uses the existing terms (Structural class, Variant class, State class, Variant input, Variant registry, Variant properties, Library mixin).
17. **Building-blocks?** Table A's SmoothScroll row gains one clause (below). Its Level cell still says reduced motion "switches to `auto`", stale since the spec's decision 18 chose `'instant'`; the fix is proposed below as a wording correction outside the class rule.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

- Impact: LOW. The directive's public API is unchanged; what changes is example markup and one composition rule (D13) that other specs already follow by default. The Menu and Top Bar names in the examples are theirs to fix, and the class-rule consistency review aligns them.
- Confidence: HIGH. Every change applies decided rules (ADR 0039, ADR 0040, BB 1.4, 1.11, 1.13, 1.14, SBC section 8); the static-attribute and duplicate-directive facts are read from the Angular 22.2 source, and the first is measured in the Sticky CSS prototype.
- Outcome: DECIDED. Nothing is OPEN FOR HUMAN, and no prototype is needed.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, SmoothScroll row, first cell. Replace:

   "`[nfsSmoothScroll]` on a container of in-page links (`a[href]` whose resolved URL is the current document plus a fragment; Foundation's `a[href^="#"]` where the page URL is the base URL) or on one link"

   with:

   "`[nfsSmoothScroll]` on a container of in-page links (`a[href]` whose resolved URL is the current document plus a fragment; Foundation's `a[href^="#"]` where the page URL is the base URL) or on one link; it binds no class, and a Menu container's classes come from the Menu directive written beside it (`<ul nfsMenu nfsSmoothScroll>`, [ADR 0039](adr/0039-directives-manage-every-foundation-class.md))"

2. `building-blocks.md`, Table A, SmoothScroll row, Level cell (a stale value, not a class-rule change). Replace "`prefers-reduced-motion` switches to `auto`" with "`prefers-reduced-motion` switches to `'instant'`".
3. `map.md`, Decisions so far: the gist line below.
4. No change to `CONTEXT.md`, the ADRs, `README.md`, or the Storybook conventions.

### What other specs need from this one

- [Spec: Menu](85-spec-menu.md): Smooth Scroll's examples, stories, and SSR smoke write `<ul nfsMenu nfsSmoothScroll>` and `nfsMenu orientation="vertical"`, the names the triage and BB 1.4 give. The Menu directive should not host `NfsSmoothScroll` (decision 7) and should not cancel in-page link clicks from a `click` listener on the list (decision 8). If the Menu spec chooses other names, the consistency review updates this spec's examples.
- [Spec: Top Bar](86-spec-top-bar.md): the `smooth-scroll--sticky-offset` story uses `[nfsTopBar]` as scaffolding with an inline `position: sticky; top: 0`; nothing else is asked.
- [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md): `NfsSmoothScroll` is unchanged and binds no class, so composing it through `hostDirectives` adds no class to Magellan's host. Magellan's container is usually a Menu too; whether `[nfsMagellan]` hosts `NfsMenu` or is written beside `nfsMenu` is Magellan's decision. If it hosts it, a consumer's `nfsMenu` beside `nfsMagellan` is the NG0309 error of decision 6, and Magellan's `nav` placement would carry `.menu`; this spec's D13 reasons apply to Magellan only in part.
- [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md): the `smooth-scroll--programmatic` story's buttons are `button[nfsButton]`; nothing is asked.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check `NfsMenu`, `orientation`, and `NfsTopBar` in this spec against the published Menu and Top Bar specs.

### Gist for Decisions so far

- [Re-run: Smooth Scroll spec under the class rule](issues/121-rerun-smooth-scroll-class-rule.md) -- SmoothScroll has no Foundation class, so `NfsSmoothScroll` keeps its API and gains no Variant input or host binding; Foundation's Menu container becomes `<ul nfsMenu nfsSmoothScroll>`, with `.menu` and `orientation` set by the Menu directive written beside it rather than hosted (hosting would put `.menu` on non-Menu containers and make a written `nfsMenu` an NG0309 error; D13); the server HTML carries the Menu's class, which the SSR smoke asserts, and the stories use `ul[nfsMenu]`, `[nfsTopBar]`, and `button[nfsButton]`; impact LOW, confidence HIGH. Spec: [specs/smooth-scroll.md](specs/smooth-scroll.md).
