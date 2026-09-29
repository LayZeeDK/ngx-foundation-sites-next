# 110. Re-run: Reveal spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81, 83
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Reveal](18-spec-reveal.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/reveal.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: the close-button rows follow the Close Button spec.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Reveal](18-spec-reveal.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK (map Notes, AFK override): a `/grill-with-docs` session in which the agent played both sides, with `/domain-modeling` for the vocabulary and `/to-spec` for the revision.

Spec: [specs/reveal.md](../specs/reveal.md), revised in place; the change list is the `### Amendment, 2026-09-28 (class rule)` section of the [Spec: Reveal](18-spec-reveal.md).

Sources, cited as: FS = the Foundation 6.9.0 clone (`scss/components/_reveal.scss`, `docs/pages/reveal.md`, `js/foundation.reveal.js`); MUI = Motion UI 2.0.8 as installed in this repository (`src/_classes.scss`, `src/transitions/_spin.scss`, `src/_settings.scss`); BB = `building-blocks.md` as it stands (1.1 already carries the Magellan re-run's State-class clarification); TYP = the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); CB = the Answer of [Spec: Close Button](83-spec-close-button.md) and its spec; BTN = the Answer of [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md); ACC = the Answer of [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md); MAG = the Answer of [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md), section "User decision"; T and X = `research/out-of-scope-triage.md` and `research/out-of-scope-exclusions.md`; "the spec" = `specs/reveal.md` before this revision.

### Measurement made for this ticket

One question needed a fact the bundle did not have: whether a template-literal type for the consumer's own Motion classes type-checks static attribute values in Angular's strict templates, beside closed name unions. Probe under `D:/tmp/nfs-wave-110/` (not committed; `node_modules` linked by a junction for the run and removed afterwards): `ngc` from `@angular/compiler-cli` 22.2.0 with TypeScript 6.0.3, `strictTemplates: true`, over a directive declaring `size: input<NfsRevealSize | undefined>`, `collapse: input<boolean, NfsVariantBoolean>` with `nfsVariantBoolean`, and `animationIn: input<NfsMotionIn>` with `` NfsMotionIn = NfsMotionInName | `.${string}` | '' ``.

- Compiled (exit 0): `size="tiny"`, `size="full"`, a bare `collapse`, `collapse="false"`, `animationIn="spin-in" animationOut="spin-out"`, `animationIn=".my-zoom-in .my-slow"`, `animationOut=""`, `[size]="undefined"`, `[collapse]="true"`, `[animationIn]="'fade-in'"`, `[animationOut]` bound to a `'.custom-out' as const` field, and a Defaults object literal `{ animationIn: 'fade-in', animationOut: '.my-zoom-out' }` typed as `NfsRevealDefaults`.
- Rejected (exit 1, one error each): `size="huge"` (TS2322), `size="reveal tiny"` (TS2322), `collapse="flase"` (TS2820, "Did you mean '"false"'?"), `animationIn="fade-inn"` (TS2820, "Did you mean '"fade-in"'?"), `animationIn="nfs-fade-in"` (TS2322), `animationIn="spin-in fast"` (TS2322), and the leaving name `animationIn="fade-out"` (TS2322).

### Grilling record

Round 1 (nothing settled yet): what the spec left to the consumer, and which classes exist.

1. **Which Foundation or library classes did the spec leave to the consumer?** Seven places. `class="reveal"` in every consumer example, story, and fixture (the directive already bound `.reveal` as a static host class, so only the markup changes). The size classes and `.collapse`, "Written by the consumer" under ADR 0010 (class mapping; user story 7; D11; `reveal--sizes` args; four usage examples). `.close-button` on every close button (CB decision 8's list names the Reveal). The docs' `p.lead`. `nfsButton class="secondary"` and `class="alert"`. Motion class names as input values (`animationIn="nfs-fade-in"`, the Defaults token example), which ADR 0039's follow-up rules out. And the `additionalOverlayClasses` recipe selecting `.reveal.<class>::backdrop`, which BB 1.1's recipe rule rules out. State classes were already host bindings, and the `html` classes were already written by the Scroll lock. Source: the spec; ADR 0039; BB 1.1.
2. **Which classes does Foundation's Reveal define?** FS `_reveal.scss`: `.reveal-overlay`, `.reveal`, `.reveal.collapse`, `.reveal.tiny`, `.small`, `.large`, `.full`, `.reveal.without-overlay`, and `html.is-reveal-open` with `.zf-has-scroll`; the four sizes and `.collapse` are written by the `foundation-reveal` mixin itself, not from a Sass map. Its JavaScript adds `.without-overlay` (from `data-overlay="false"`), the `html` classes, and Motion UI classes. Source: FS.
3. **Does `.reveal` change mechanism?** No: a static host class of `NfsReveal`, as ADR 0039 asks; a copied `class="reveal"` merges and is not reported (BB 1.4). Source: ADR 0039; BB 1.4; ACC decision 2.

Round 2 (depends on 1 to 3): one decision per class family.

4. **The sizes: input name and type?** For `size` with the closed union `'tiny' | 'small' | 'large' | 'full'`: BB 1.4 rule 3 names `size` for Reveal sizes; TYP and CONTEXT's **Closed Variant family** name "Reveal's sizes" as closed; no Sass setting lists the names, so there is nothing for a registry to follow. Against: four booleans (they could contradict each other); a `fullScreen` input for `.full` under rule 1. Rule 1 does not apply: `fullScreen` names one member, not the family, and Foundation's JavaScript set the Option from the class, never the class from the Option. `.full` comes last in `foundation-reveal` and overrides the other widths, so the four exclude each other in effect and one enum holds them. No `'default'` value (Foundation has no `default` size); no responsive form (Foundation has none). Settled: `size: NfsRevealSize | undefined`, alias exported from `ngx-foundation-sites/reveal`, unset sets none; D11 stands with `size="full"` as the one spelling (decisions 1 and 2).
5. **`.collapse`?** BB 1.4 rule 4: a boolean named after the class, through `nfsVariantBoolean`, never `booleanAttribute`. The name `collapse` collides with nothing on `NfsReveal`. Settled (decision 1).
6. **`.without-overlay`: a Variant input?** For: it is a Foundation class that selects a look. Against: the consumer never wrote it (Foundation's JavaScript added it from the `overlay` Option), the Option also decides modal or non-modal behaviour, and a Variant input may have no Defaults token default (ADR 0040), so retyping `overlay` would drop a decided `NfsRevealDefaults` field, a behaviour change the ticket forbids. Settled: `overlay` stays an Option with `booleanAttribute`; `.without-overlay` stays its host binding (decision 4).
7. **The close button?** CB decisions 1, 2, 8, and 9: `button[nfsCloseButton]` binds `.close-button` and defaults `type="button"`, closes nothing, and gets its 24 px floor from `nfs-close-button`; the bare `nfsClose` sits beside it. The spec's 2.5.8 row took the spacing exception; CB measured that axe cannot see a broken exception, so the row becomes CB's proposed text. The 1.4.11 checks against `$reveal-background` stay, because each container checks its own background (CB D9). A close button in a `<form method="dialog">` writes `type="submit"`. Settled (decision 5).
8. **Motion inputs: how does a Motion input take a value without a class name?** ADR 0039's follow-up: "a Motion input takes `'fade-in'`, never `'nfs-fade-in'`", and inputs that apply the consumer's own classes stay; the spec (and ADR 0003, and CONTEXT's **Motion class**) also accepts the consumer's own keyframe classes. Five options. (a) `NfsMotionName | (string & {})`: typos and `'nfs-fade-in'` compile, which is exactly why ADR 0040 dropped that escape for Variant inputs. (b) A registry of Motion names: registries follow Sass settings and the consumer's keyframes have none, so the generator and the drift check could not maintain it. (c) Library names only: drops a decided capability (another speed or effect). (d) A second input pair for the consumer's classes: two inputs per direction and a precedence rule. (e) Closed names plus a marked form for the consumer's classes, a leading dot, which is how Foundation writes a class name in an attribute (`data-toggler=".class"`, which the Toggler spec already accepts). (e) breaks no recorded rule and was measured (above). Split by direction, so `animationIn="fade-out"` fails too. Settled: `NfsMotionIn` and `NfsMotionOut` over `NfsMotionInName`, `NfsMotionOutName`, and `NfsMotionClassList` (decision 3).
9. **The `html` classes?** MAG's User decision: a `Renderer2` write of a State class on an element that carries no library directive satisfies the class rule. The document element carries none, is outside every component template, and the Scroll lock has no first-paint value (no Reveal is modal before hydration), which is the condition BB 1.1 now states. Settled: unchanged (decision 6).
10. **`.is-opening`, `.is-closing`, `.reveal-overlay`?** Unchanged: State class host bindings; the overlay is `::backdrop`, never rendered. Source: the spec; ADR 0039.

Round 3 (depends on 4 to 10): binding, copies, checks, and the Motion set.

11. **How are the classes bound, and what happens to a class copied from Foundation's docs markup?** One `[class]` host binding from a `computed` list (the `size` class, `collapse`, the phase's Motion classes), each only when it is one class token, as BTN decision 8 does; boolean bindings for `without-overlay`, `is-opening`, `is-closing`. So a copied Variant class stays (the list sets only its own classes) and a copied State or `without-overlay` class is stripped (BTN decision 9; ACC decision 6). BB 1.4's initial-state rule asks for a report: development check 8 reads `HostAttributeToken('class')` in a development-only field initialiser and warns once, naming the input (`class="tiny"` names `size="tiny"`); a redundant `reveal` is not reported. Rejected: seeding from the class (BB 1.4 forbids it); no report. Settled (decision 7).
12. **Development check 3 (a regular expression for Motion UI transition names)?** With typed names, Motion UI's names are the values, so the pattern check has nothing left to catch; what can still fail silently is a value that starts no animation (a dot-form class without keyframes, a Motion UI transition class given in the dot form, a missing `nfs-motion` include). The directive already measures the host's animations when a phase starts; check 3 now reports a measured zero there, and a dot-form class that starts with `nfs-`. Settled (decision 8).
13. **Foundation's docs example `data-animation-in="spin-in"`?** The spec already wrote that it becomes the `spin-*` pair "when `nfs-motion` provides those names"; `nfs-spin-out` is in BB 1.6 rule 4's set and `nfs-spin-in` is not. Sass packaging decision 16: "A spec that needs a class outside the set adds it to `nfs-motion` and says so." Settled: `nfs-spin-in` joins the set, the keyframe counterpart of MUI's `spin-in` with its defaults (a clockwise rotation from minus three quarters of a turn, with `spin-and-fade: true`), so Foundation's docs values work unchanged (decision 9).
14. **Where do the Motion types and the mapping live?** Four directives have Motion inputs (Reveal, Toggler, Responsive Toggle, Dropdown pane). Per-entry-point copies would drift; the primary entry point already holds the Variant helper types and one pure function (`nfsVariantBoolean`) that secondary entry points use. Settled: `NfsMotionInName`, `NfsMotionOutName`, `NfsMotionClassList`, `NfsMotionIn`, `NfsMotionOut`, and a pure `nfsMotionClasses(value)` in `ngx-foundation-sites` (decision 10).
15. **The `additionalOverlayClasses` replacement?** BB 1.1: a recipe for consumer CSS selects elements, attributes, or the consumer's own classes. Settled: the consumer's own class on the dialog and `dialog.<class>::backdrop` (specificity 0,1,2, above rule 6's 0,1,1); a backdrop colour of its own is outside the dialog-edge check, so the spec says the consumer keeps 3:1 (decision 11).

Round 4 (depends on all above): examples, stories, tests, rendering modes, vocabulary.

16. **Rendered HTML and rendering modes?** Server HTML gains the size class and `.collapse` from host bindings (BB 1.11 decision 1); Angular also renders the static input attributes (`size="tiny"`, `collapse`, `animationin`), which mean nothing to HTML on a `<dialog>`, as MAG decision 5 and the Button spec record; nothing else changes. Check 8 reports on the client only, so a copied class is in the server HTML as written (a copied size class stays; a copied `without-overlay` is stripped by its binding on both platforms). Settled (decision 12).
17. **Examples?** `p.lead` is a Typography Helpers class whose directive is not yet named, so the examples leave it out and point to the [Spec: Typography Helpers](106-spec-typography-helpers.md) (MAG decision 3's handling of Visibility classes). Buttons are `nfsButton` with `color="secondary"` and `color="alert"` (BTN decision 1). The Defaults example adds `satisfies NfsRevealDefaults`, because `useValue` is untyped. New examples: Foundation's animated modal with `spin-in`/`spin-out`, the dot form with a backdrop class of the consumer's own, and the `<form method="dialog">` close button with `type="submit"`. Settled (decision 13).
18. **Stories and tests?** Story ids unchanged; `reveal--sizes` args become `size` and `collapse`; `reveal--animated` uses `fade-in`/`fade-out` and adds the docs pair; `reveal--basic` asserts the close button's name, class, `type`, and 24 px box (axe would not fail a missing floor, CB decision 14); layer 2 adds the Variant and Motion bindings, check 8's cases, and the revised check 3; the SSR smoke fixture writes no `class` attribute; the pure-logic table covers `nfsMotionClasses`; the Sass compile test adds `nfs-spin-in` and asserts no Variant property. Settled (decision 14).
19. **User stories?** 1, 3, 7, and 28 rewritten in place; 47 to 51 appended, keeping the numbers other records cite (ACC decision 10's practice).
20. **Does the Reveal write any class on its Triggers?** No: it registers them for Light dismiss and focus restore and writes nothing on them, which the [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md) makes a rule for every Openable (its D18, resolved while this ticket ran). The class mapping's reasons now say so; nothing else changes (decision 15).
21. **ADR or glossary?** No new ADR: the Motion typing applies ADR 0039's recorded follow-up, and ADR 0003's "Motion class inputs pass class names straight through" gets a dated note instead; the other decisions follow from ADR 0039, ADR 0040, and CB. Glossary: **Motion name** is added, because the rule now turns on the difference between a name and a class, and **Motion class** takes the Triggers re-run's sharper wording, which agrees with this spec (proposed below).

The frontier is empty.

### Decisions

1. `NfsReveal` gains two Variant inputs: `size: NfsRevealSize | undefined` (`'tiny' | 'small' | 'large' | 'full'`, a Closed Variant family) and `collapse: boolean` through `nfsVariantBoolean`. Unset sets no class. No Variant registry, no Variant property, no Runtime check, no Defaults token entry. `NfsRevealSize` is exported from `ngx-foundation-sites/reveal` and declared as an explicit type argument (BB 1.4 authoring rule). (Spec D23.)
2. `fullScreen` stays dropped; `size="full"` sets `.full`; full-screen Reveals stay modal. (D11 rewritten.)
3. `animationIn: NfsMotionIn` and `animationOut: NfsMotionOut`: an entering or leaving Motion name (the `nfs-motion` set without its prefix), the consumer's own keyframe classes each with a leading dot, or `''`. A name binds `nfs-<name>`; the dot form binds the classes without their dots. Misspelt names, the other direction's names, Motion UI's `fast`/`slow`, and `'nfs-fade-in'` fail to compile (measured). The Defaults token keeps both, typed. (D24.)
4. `overlay` stays an Option (`booleanAttribute`, Defaults token slot); `.without-overlay` stays its host binding. (D25.)
5. Close buttons are `button[nfsCloseButton]` with a bare `nfsClose` beside it; 2.5.8 is the `nfs-close-button` floor, CB's row text; the 1.4.11 checks against `$reveal-background` stay; the `<form method="dialog">` close button writes `type="submit"`. (D28.)
6. The Scroll lock's `html.is-reveal-open` and `html.zf-has-scroll` stay `Renderer2` writes. (D27.)
7. Class bindings: static `reveal`; one `computed` `[class]` list for the size, `collapse`, and the phase's Motion classes; boolean bindings for `without-overlay`, `is-opening`, `is-closing`. New development check 8 reports a copied Foundation or library class, naming the input. (D26.)
8. Development check 3 reports a Motion value that starts no animation when its phase begins, and a dot-form `nfs-` class; the Motion UI name pattern is gone.
9. `nfs-motion` gains `nfs-spin-in`, so Foundation's docs example keeps `animationIn="spin-in" animationOut="spin-out"`.
10. The Motion name types and the pure `nfsMotionClasses` live in the primary entry point, shared by every Motion input.
11. The `additionalOverlayClasses` replacement is the consumer's own class on the dialog and a `dialog.<class>::backdrop` rule.
12. Server HTML carries `.reveal`, the size class, and `.collapse` from host bindings; nothing else in the rendering modes changes.
13. No example, story, fixture, or test host writes a Foundation or library class; the docs' `p.lead` is left out until the Typography Helpers spec names its directive.
14. Tests as in round 4, question 18; Story ids unchanged.
15. The Reveal writes no class on its Triggers (the Triggers spec's D18, inherited); a Trigger's classes come from `nfsButton` or `nfsCloseButton` beside it.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| `size` and `collapse` Variant inputs (decisions 1, 2) | HIGH (public API; examples in other specs copy it) | HIGH (mechanical under ADR 0039, ADR 0040, and BB 1.4 rules 3 and 4; TYP names Reveal's sizes closed; measured) | DECIDED |
| Motion name types with the dot form (decisions 3, 10) | HIGH (a public type the Toggler, Responsive Toggle, and Dropdown pane Motion inputs will share) | HIGH (ADR 0039's follow-up decides the direction; each rejected option fails a recorded rule: ADR 0040's reason against `(string & {})`, the registries' tie to Sass settings, ADR 0003's consumer keyframe classes, one input per concept; the dot form is Foundation's own class notation; measured with `ngc` 22.2.0) | DECIDED. The Toggler re-run runs in the same wave; the consistency review checks that the four Motion inputs agree |
| `overlay` stays an Option (decision 4) | MEDIUM (one input's type, unchanged) | HIGH (the Defaults token field ADR 0040 would otherwise remove; the class was never consumer-written) | DECIDED |
| Close-button rows (decision 5) | LOW (rows of this spec; CB owns the mechanism) | HIGH (CB's measured decision and proposed text) | DECIDED |
| `html` classes by `Renderer2` (decision 6) | LOW (no change) | HIGH (the user's decision in MAG) | DECIDED |
| Check 8 and the binding split (decision 7) | LOW (development only) | HIGH (BB 1.4; BTN and ACC precedents) | DECIDED |
| Check 3 revised (decision 8) | LOW (development only) | HIGH (reuses the phase measurement the spec already makes) | DECIDED |
| `nfs-spin-in` (decision 9) | LOW (additive CSS) | HIGH (Sass packaging decision 16; MUI's definition) | DECIDED |
| Backdrop recipe, examples, tests (decisions 11 to 14) | LOW | HIGH | DECIDED |
| No class on Triggers (decision 15) | LOW (a statement; the Reveal never wrote one) | HIGH (the Triggers spec's D18) | DECIDED |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the one fact the decisions depend on was measured here.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md` 1.4, the Motion bullet: replace its first sentence, "Motion class options stay as string inputs (`animationIn`, `animationOut`, `animate`) and feed 1.6.", with:

   "Motion class options (`animationIn`, `animationOut`, `animate`) take Motion names or the consumer's own keyframe classes in the dot form (1.6 rule 4), never a library class name ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)), and feed 1.6; they are Options, not Variant inputs, so their Defaults tokens hold them."

2. `building-blocks.md` 1.6 rule 4:
   - In the class list, replace "`nfs-hinge-in-from-top`, `nfs-spin-out`)" with "`nfs-hinge-in-from-top`, `nfs-spin-in`, `nfs-spin-out`)".
   - Replace "Consumer-supplied class names are passed through unchanged to `animate.enter`/`animate.leave` and must be keyframe animations." with:

   "A Motion input's value is a Motion name or the consumer's own keyframe classes, never a library class name ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md), class names passed as input values). The primary entry point `ngx-foundation-sites` declares `NfsMotionInName` and `NfsMotionOutName`, the entering and leaving names of the set above written without the `nfs-` prefix (`'fade-in'`, `'spin-out'`); `NfsMotionClassList`, `` `.${string}` ``, the consumer's own keyframe classes, each written with a leading dot as Foundation's `data-toggler=".class"` writes a class; `NfsMotionIn` and `NfsMotionOut`, a name of that direction, the dot form, or `''`; and the pure function `nfsMotionClasses`, which maps a value to the classes to bind: `nfs-<name>` for a name, the dot form's classes without their dots, and none for `''` or anything else. A misspelt name, a name of the other direction, Motion UI's `fast`/`slow` modifiers, and `'nfs-fade-in'` fail to compile (measured with `ngc` 22.2.0 strict templates by the [Re-run: Reveal spec under the class rule](issues/110-rerun-reveal-class-rule.md)). The classes go to a State class binding (rule 1) or to `animate.enter`/`animate.leave` (rule 2) and must be keyframe animations; an input that takes an entering and a leaving value in one string (`animate="<in> <out>"`) types the pair over the same aliases in its own spec."

3. `building-blocks.md` Part 3, "Explicitly no spec of their own", the Motion bullet: append "; the Motion name types and `nfsMotionClasses` live in the primary entry point (1.6 rule 4)".

4. `building-blocks.md` 1.1, first paragraph: replace "such as `body` or the links and list items of a Magellan navigation" with "such as `html` (the Reveal's Scroll lock), `body`, or the links and list items of a Magellan navigation".

5. `building-blocks.md` Table A, Reveal row: replace the first cell with "`dialog[nfsReveal]` with the Variant inputs `size` and `collapse`; triggers `button[nfsOpen]="reveal"`, `[nfsClose]` inside (on the close button, beside `button[nfsCloseButton]`); `nfsRevealDefaultsToken`", and in the second cell replace "Directive on a consumer-written `<dialog class="reveal">` (ADR 0007)" with "Directive on a consumer-written `<dialog>`, binding `.reveal` and setting the size classes and `.collapse` from typed inputs (ADR 0007, [ADR 0039](adr/0039-directives-manage-every-foundation-class.md))".

6. `building-blocks.md` Table B, Reveal row, Animation cell: replace "keyframe Motion classes only on `animationIn`/`animationOut`, and Motion UI transition names warn and do not animate" with "Motion names on `animationIn`/`animationOut` (`spin-in` binds `nfs-spin-in`), or the consumer's keyframe classes in the dot form; a value that starts no animation warns in development".

7. `adr/0003-animation-mechanics.md`, Consequences, append:

   "- 2026-09-28 ([Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md)): Motion class inputs no longer pass class names straight through. Under [ADR 0039](0039-directives-manage-every-foundation-class.md)'s follow-up on class names passed as input values, a Motion input takes a Motion name (`'fade-in'`), which the directive maps to the library's `nfs-` keyframe class of that name, or the consumer's own keyframe classes written with a leading dot; a misspelt name and a library class name fail to compile. The keyframe-only rule and the unsupported Motion UI transition classes stand (building-blocks 1.6 rule 4)."

8. `adr/0007-reveal-on-native-dialog.md`, Consequences, append:

   "- 2026-09-28 ([Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md)): the consumer writes `<dialog nfsReveal>`; the directive binds `.reveal` and sets the size classes and `.collapse` from typed inputs ([ADR 0039](0039-directives-manage-every-foundation-class.md), [ADR 0040](0040-variant-input-types.md)), so this record's title and decision read "a `<dialog>` the consumer writes, which the directive gives Foundation's `.reveal` class"."

9. `adr/0039-directives-manage-every-foundation-class.md`: when the Magellan re-run's dated clarification (its proposal 1) is applied, after "Foundation's `is-off-canvas-open` on `body` (the Off-canvas spec)" insert ", the Reveal's `is-reveal-open` and `zf-has-scroll` on `html` (the Reveal spec's Scroll lock, D27)".

10. `CONTEXT.md`, Foundation side: for **Motion class**, apply the [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md)'s proposal 6, whose wording agrees with this spec, and add **Motion name** after it:

    ```markdown
    **Motion name**:
    A Motion UI animation name (`fade-in`, `spin-out`) given as the value of a Plugin's animation Option, which the directive maps to the library's keyframe Motion class of that name; never a class name.
    _Avoid_: Motion class (for the value), animation class, effect name
    ```

11. `specs/variant-declaration-tooling.md`, Implementation Decisions, the primary-entry-point bullet: replace "Everything there is a type except that one pure function." with "Of the Variant pieces there, everything is a type except that one pure function; the primary entry point also holds the Motion name types and their pure function `nfsMotionClasses`, which `building-blocks.md` 1.6 rule 4 defines for every Motion input and which are not Variant tooling ([Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md))."

12. `README.md`, the ADR index row for 0007: replace "Reveal is a directive on a consumer-written `<dialog class="reveal">`, not a service, a generated overlay, or CDK Dialog" with "Reveal is a directive on a consumer-written `<dialog>` that binds `.reveal`, not a service, a generated overlay, or CDK Dialog (amended 2026-09-28: no class in consumer markup)".

13. `map.md`, Decisions so far: the gist below.

No change to `storybook-conventions.md` (the preview already includes every `nfs-*` mixin, and the stories use Foundation's default names), to ADR 0001, ADR 0012, ADR 0022, ADR 0031, ADR 0036, or ADR 0040.

### What other specs need from this one

- [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md), [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md), and [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md): their `animate` inputs take the same Motion names and dot form (proposal 2), typing the `"<in> <out>"` pair over `NfsMotionIn` and `NfsMotionOut` (a template-literal type of the two, with the second half optional); `nfsMotionClasses` maps each half; their pattern-based "Motion UI transition class" warnings give way to a measured "started no animation" warning, as the Reveal's check 3 does; Foundation's Toggler docs pair `hinge-in-from-top spin-out` is in the set as written. The Toggler re-run is running in the same wave; if it types its input otherwise, the consistency review picks one form for all four.
- [Spec: Close Button](83-spec-close-button.md): nothing new; the Reveal's markup, 2.5.8 row, and `<form method="dialog">` `type="submit"` follow its Answer, and its usage example (`<dialog nfsReveal aria-labelledby="signup-title">`) matches the revised spec.
- [Spec: Typography Helpers](106-spec-typography-helpers.md): Foundation's Reveal docs markup uses `p.lead`; the Reveal examples leave it out until that spec names the directive, and its stories may then add it.
- [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md) (resolved while this ticket ran): the Reveal honours its D18 (no class on a Trigger) and matches its Reveal row and its `<dialog nfsReveal>` example; its D17 relies on typed Motion names for the Toggler's input, which proposal 2 defines for every Motion input, so the consistency review can add the names to its examples once the Toggler re-run adopts them.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md): its `is-off-canvas-open` on `body` is the same case as the Reveal's `html` classes (decision 6); its Scroll lock mechanics, which it reuses from this spec, write their classes the same way.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): `NfsRevealSize` is closed, so no registry and no manifest row; proposal 11 notes the Motion names beside its types in the primary entry point.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that the four Motion inputs share the types of proposal 2 and that no spec still writes an `nfs-` class as a Motion value (the Toggler, Dropdown, and Responsive Toggle specs do today); that the ADR 0039 State-class clarification lists `html`; and that every Reveal mention elsewhere (Close Button, Triggers, Off-canvas) writes `<dialog nfsReveal>` without a class.

### Gist for Decisions so far

- [Re-run: Reveal spec under the class rule](issues/110-rerun-reveal-class-rule.md) -- the consumer writes `<dialog nfsReveal>` and no class: `.reveal` stays a static host class, the size classes become the closed `size` Variant input (`'tiny' | 'small' | 'large' | 'full'`, so `size="full"` replaces `fullScreen`) and `.collapse` a boolean `collapse`, with no registry or Variant property; `animationIn`/`animationOut` take Motion names (`spin-in` binds `nfs-spin-in`, which joins `nfs-motion`) or the consumer's keyframe classes with a leading dot, typed so misspelt names and `nfs-` class names fail to compile (measured with `ngc` 22.2.0), a shared rule proposed for every Motion input; `overlay` stays an Option, the Scroll lock's `html` classes stay `Renderer2` writes, close buttons are `nfsCloseButton` with a bare `nfsClose` and the 24 px floor, and a copied Foundation class is reported in development; behaviour, ARIA, keys, rendering modes, and Story ids unchanged; impact HIGH, confidence HIGH. Spec: [specs/reveal.md](specs/reveal.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Note, 2026-09-29 (architecture audit)

- 2026-09-29: the fixer items of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) are applied to the spec.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group e, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/reveal.md` was revised in place, and [the group's report](../research/consistency-review-group-e.md) lists every edit.

- R4: the three compile-time contrast checks name the exact WCAG relative-luminance formula of the library's internal contrast helper (the 1.4.11 row, D19, the Sass checks row); `color-luminance()` leaves the reused functions; the canonical sentence S1 joins the Sass subsection. Figures stand (3.42:1, 19.63:1, 3.17:1).
- R25: `NfsReveal` binds `data-nfs-close-button` from `contentChild(nfsCloseButtonToken, {descendants: true})`, the Callout's hook, and `nfs-reveal` rule 8 sets the padding on the close button's side to `max($reveal-padding, <offset> + max(24px, <font size>))` over every close-button size (48 px on Foundation's defaults), because Foundation's own example fails 1.4.12 at 320 px in three engines and the rule removes the overlap (measured by this review); a 1.4.12 WCAG row, D29, the Sass (2) and (5) additions, and tests (48 px padding in `reveal--basic`, the attribute in the SSR smoke, a browser-level hook case, an e2e text-spacing case).
- R52: "consumer rule 3" is "consuming-directive rule 3".
- R57: the `animationIn` row names Application classes that are keyframe animations; "the developer's own keyframe classes" is "the consumer's own".
- Consequential fixes: the mixin's rule count reads eight (Solution, the Sass summary, the compile test, D2's note); the server and hydrated HTML show `data-nfs-close-button=""` on the example dialog; the entry-point bullet says the Reveal imports only `nfsCloseButtonToken` from `ngx-foundation-sites/close-button`; Foundation behaviour changed gains the room; the development-check test counts nine warnings (check 9 was added on 2026-09-28).
- Unchanged (confirmed): R2, R14, R27, R34/R35, R49, R50, R54, R65, R69/R70; CR-A, CR-C, CR-D hold.

Triage: impact LOW (one Library mixin rule and one host attribute before the first release, ADR 0045; wording), confidence HIGH (measured in three engines; the Callout's decided mechanism). Nothing is OPEN FOR HUMAN.
