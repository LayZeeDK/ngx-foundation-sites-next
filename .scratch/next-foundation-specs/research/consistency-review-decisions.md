# Consistency review decisions: the class-rule wave

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 1
(the coordinator's decisions), 2026-09-29. Input: the 74 items of
[research/consistency-review-routed-items.md](consistency-review-routed-items.md), the map's Notes, the ADRs (0039,
0040, 0044, 0045, 0046 above all), `building-blocks.md`, `CONTEXT.md`, `architecture-guide.md`,
`storybook-conventions.md`, and the current text of every spec an item touches. Model: Opus 5.5, the coordinator with
ten forked lanes of itself, one per group of items, two of them class sweeps over all 53 specs; the coordinator wrote
the placeholder lane itself, ruled on every point the lanes raised, and merged every overlap between them.

How the next phases use this file:

- Phase 2: six reviewers, one per group of about nine specs, read every spec in full and fix it in place, applying the
  review's checks (the next section) and every item decision below that names their specs. The per-spec index near the
  end lists, for each spec, the items that change it and the items it only confirms. Each reviewer records its edits in
  the spec's own spec ticket (for a re-run spec, its original spec ticket, as the 2026-09-27 class-rule amendments did)
  under `### Amendment, 2026-09-29 (class-rule consistency review)`: the item ids applied, the spec edits, and
  "Unchanged:". Reviewers leave shared documents alone. Correction (2026-09-29, closing pass): the reviewers
  followed their brief, which names the ticket the map's Decisions so far cites last for the spec and the heading
  `### Amendment, 2026-09-29 (consistency review)`; that form is the one kept for every spec (ticket 133's Answer).
- Phase 3: the closing pass applies the shared-document changes collected in the last section (README, the map,
  CONTEXT, building-blocks, storybook-conventions, ADR dated notes).

Conventions of this file:

- Line numbers are locators taken on 2026-09-29 and move; every change quotes the text it replaces. Where a quoted
  sentence no longer matches because another item or ticket 142's audit changed it first, the reviewer applies the
  decision's intent to the current sentence and says so in the amendment.
- "Already holds; confirm" means the reviewer checks the cited text while reading the spec in full and changes nothing
  unless it no longer holds.
- Where two items touch one passage, one of them carries the merged text and the other points to it; the reviewer
  applies the passage once.
- Links inside quoted replacement text are written for the document they go into: `issues/...` and `adr/...` for a
  document at the effort's root (building-blocks, README, storybook-conventions, CONTEXT), `../issues/...` for a spec
  or an ADR. Every other link in this file is relative to `research/`.
- Ratings follow the map's triage rule (map, Notes, Orchestration rules): impact HIGH when the choice is hard to reverse;
  confidence NOT HIGH for a bare default, a value carried from a prototype without deliberation, or anything that
  contradicts the effort's research or ADRs; only HIGH impact with NOT HIGH confidence is OPEN FOR HUMAN.

## Counts

- Routed items: 74, in 64 sections (items that share one decision share a section). Decided: 74. OPEN FOR HUMAN: 0.
- Impact HIGH, confidence HIGH, decided: R60 (the two boolean conventions: ADR 0040's dissent not reopened) and CR-A.
  Every other decision is impact LOW, confidence HIGH.
- The review's own checks: CR-A to CR-C (the three the ticket names) and CR-D (example imports, from ADR 0046), all
  decided.
- Beyond the routed items: seven placeholders the sweep found (A1 to A7; three of them fold into R2, R12, and R56) and
  four findings (X1 decided, X2 left to ticket 142, X3 and X4 fixed under R15 and R40).
- Measured for this phase: Orbit and Switch under forced colours (R15), close-button overlap under text spacing in the
  Reveal and the Off-canvas (R25), text clipping in the Orbit, the Drilldown, and the Off-canvas wrapper (R26), the
  `NfsMotionPair` type (R2), every recomputed contrast figure (R4 and its neighbours), and the two class sweeps.

## Tools and measurements

Throwaway, outside the repository, reusable by the reviewers:

- `D:/tmp/nfs-133/contrast/`: `ratio.mjs`, the exact WCAG 2.2 ratio (sRGB linearisation with the 0.04045 threshold;
  `(L1 + 0.05) / (L2 + 0.05)`), compositing a translucent foreground over its background and a translucent background
  over the page (`#fefefe`); by default every channel is rounded to 8 bits, as the browser paints, and `NFS_FLOAT=1`
  keeps fractional channels, as the library's Sass helper computes.
  - `node ratio.mjs '#fefefe' '#1779ba'`: literal colours.
  - `node ratio.mjs --sass '$anchor-color' '$light-gray'`: Sass expressions after Foundation 6.9.0's settings file;
    `--overrides` adds the Storybook `_settings-overrides.scss` (a copy of storybook-conventions section 5 beside the
    script).
  - `node ratio.mjs --eval '<expr>' ...`: resolved values; `node ratio.mjs --self-check`: its assertions.
  - `batch.mjs <pairs.txt> [--overrides]`: one `label | fg | bg [| page]` line per pair; the `pairs-*.txt` files (the
    Tools section R4 refers to) are the evidence of R4's corrected figures.
- `D:/tmp/nfs-133/forced/` (R15): `compile.mjs`, `measure.mjs`, `summarise.mjs` (`measure-out.json`),
  `orbit-active-states.mjs`, `backplate.mjs`, `switch.mjs` (`switch-out.json`), `switch-debug.mjs`,
  `switch-debug2.mjs`.
- `D:/tmp/nfs-133/containers/` (R25, R29, R30): `overlap.mjs`, `overlap-fixed.mjs` and their outputs; `pairs-r25.txt`,
  `pairs-r29.txt`, `pairs-r30.txt`, `pairs-r30b.txt`.
- `D:/tmp/nfs-133/utilities/` (R26, R34): `clip.mjs`, `clip-fix.mjs` (`clip-out.json`, `clip-fix-out.json`),
  `same-element.mjs`.
- `D:/tmp/nfs-133/motion/pair-probe.ts` (R2), `D:/tmp/nfs-133/triggers/hosts.mjs` (R65), and the sweeps'
  `D:/tmp/nfs-133/sweep-am/` and `D:/tmp/nfs-133/sweep-nz/` (`crd.mjs` for CR-D, `cssfences.mjs` or `css.mjs` for
  recipe CSS, `ctx.mjs`, `crb.mjs`).
- Sass 1.104.1 and Playwright 1.63 resolve through `createRequire('D:/tmp/nfs-ct-prototype/package.json')`; Foundation's
  Sass is the local 6.9.0 clone. No server was left running.

## The review's own checks

The ticket names three checks: no consumer-written Foundation or NFS class in any spec's examples; every Structural
class bound by its directive, every Variant class by a typed input, every State class by a host binding; placeholder
names replaced by the final names their specs chose. They are decided as rules CR-A to CR-C, with one check derived
from ADR 0046 (CR-D). Every reviewer applies all four to every spec it reads, whether or not an item below names the
spec.

### CR-A: no consumer-written class

- **Rule.** A spec's consumer code carries no Foundation class and no `nfs-` class: every Usage example, the
  consumer-markup half of Rendered HTML, every recipe, and every story, fixture, or test template the spec quotes or
  describes, and every inline example of what a consumer writes. Not in `class`, `[class]`, `[class.x]`, `[ngClass]`,
  or `routerLinkActive`, and not as an input value: a Motion value is a Motion name without `nfs-` or the dot form of
  Application classes; `templateClasses`, `toggler`, `parentClass`, and the Motion dot form take Application classes
  only. Text that contains Foundation or library class names is compliant only as:
  - (a) rendered output (server HTML, hydrated DOM, a "renders" comment), labelled as output;
  - (b) the input of a copied-class development check, of an example shown failing to compile (a Foundation or `nfs-`
    class as a value), or of a test case that proves either (stripped, reported, rejected, or deliberately not
    reported), labelled as such; a copied-class block inside Rendered HTML is compliant when its own comment says the
    class is copied and names the report, and the reviewer adds such a comment where one is missing;
  - (c) Foundation's own markup or source quoted as the Foundation contract and labelled as Foundation's, including a
    labelled pair of Foundation's markup beside its library form inside a Usage example (the Menu's and the Top Bar's
    "Foundation's markup and its library form");
  - (d) library code: Library mixin Sass and CSS, the Storybook `preview.scss`, and library directive source a spec
    quotes (host metadata, code sketches such as `host: {class: 'dropdown-pane'}`);
  - (e) an Anti-pattern story that follows storybook-conventions section 6 and is listed in its spec;
  - (f) prose that names a class ("binds `.callout`").
  A consumer CSS recipe selects elements, attributes (library `data-nfs-*` hooks included), or Application classes
  only (building-blocks 1.1). Anything else is a violation, fixed with the directive attribute, Variant input, Utility
  attribute, or binding that sets the class, under the owning spec's published name.
- **Evidence.** ADR 0039 (the rule and its 2026-09-27 note on class names as input values); building-blocks 1.1;
  storybook-conventions sections 6 and 8. The two sweeps (all 53 specs: 1,113 class-attribute hits, 127 input values
  that take class names, every `css` and `scss` fence) found no violation; every hit is (a) to (f) or an Application
  class (sweep scripts under `D:/tmp/nfs-133/sweep-am/` and `D:/tmp/nfs-133/sweep-nz/`). R3, R22, R24, R27, R28, R30,
  R39, R40, R50, R51, R57, R65, R71, and R72 below confirm the per-family class lists.
- **Per-spec changes.** One: [responsive-toggle](../specs/responsive-toggle.md), the "bar and menu of the developer's
  own" example in Rendered HTML (near line 325), whose bar copies `hide-for-medium`: add on that element's line the
  comment `<!-- hide-for-medium is copied from Foundation's markup: stripped, and reported in development builds -->`,
  as the Top Bar's copied-class block does. Every reviewer reruns
  `rg -n 'class="|\[class|ngClass|routerLinkActive=|animate\.(enter|leave)=' specs/<slug>.md` after its own edits.
- **Rulings on the sweeps' questions.** No spec needs a sentence of its own saying its stories follow the class rule;
  storybook-conventions carries the rule, and four menu specs without such a sentence comply.
- **Rating.** Impact HIGH (it is the ticket's contract for every example); confidence HIGH (ADR 0039's text; two full
  sweeps). Decided.

### CR-B: class mapping completeness

- **Rule.** Each spec's CSS class mapping (building-blocks 1.14 item 2) has one row for every Structural class with the
  directive that binds it, every Variant class family with its Variant input (alias, registry or "closed", value
  shape, class per value, Variant property), every Utility class family with its Utility attribute or input, and every
  State class with its host binding (or, for an element no library directive hosts, the owning directive's `Renderer2`
  write under ADR 0039's 2026-09-27 note); plus a row for every class the spec drops (reported, or
  `deprecated-upstream`) and each tag-styled element that gets no directive. Another family's classes that the spec's
  markup or its Foundation docs page uses get one row per owning family, in the Equalizer's form (the classes, "another
  family's", the element, the owning directive and input, the owning spec). Classes a spec already tabulates elsewhere
  (the Nested menu's per-mode host tables) need a mapping row that points at that table, not a second copy.
- **Evidence.** building-blocks 1.14 item 2; ADR 0039, Consequences ("a row for every Structural class ..."); the
  sweeps' gaps noticed in passing: [dropdown](../specs/dropdown.md) has no row for `.is-opening` (reported by dev
  check 7, dropped by the Anchored pane); [media-object](../specs/media-object.md) none for `.thumbnail`;
  [forms](../specs/forms.md) (`.text-right`, the floats, the grid, `label.button`), [button](../specs/button.md) and
  [button-group](../specs/button-group.md) (`.show-for-sr`, `.align-*`, the grouped buttons' `.dropdown` and
  `.arrow-only`), [float-classes](../specs/float-classes.md) and
  [flexbox-utilities](../specs/flexbox-utilities.md) (the docs examples' `.button`, `.callout`, grid, `.middle`,
  `.button-group`) name other families' classes in prose only.
- **Per-spec changes.** The rows above, plus any the reviewer finds. For the Dropdown:
  `| .is-opening | Dropped (superseded): the Anchored pane measures after .is-open and before paint; a copied one is reported (dev check 7) | Foundation's measuring class ([Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md)) |`
  (with the table's code spans). For the Nested menu: a pointer row to its per-mode host tables if none exists.
- **Rating.** Impact LOW (documentation rows; the bindings exist); confidence HIGH. Decided.

### CR-C: placeholder names

- **Rule.** Every name a spec wrote while the owning spec was unpublished, or qualified with "placeholder", "until
  that spec names it", "once their specs publish", "if their final names differ", "aligned by the class-rule
  consistency review", "the name the triage gave it", or a similar deferral to this review or to another ticket that
  has since resolved, is replaced by the owning spec's published name, and the qualifier is removed or replaced by a
  plain statement of fact that cites the owning spec.
- **Evidence and changes.** R1, R7 to R12, R18, R23, R38, R43, R44 below, and the additional placeholders found by the
  sweep (the section after the items). Search each spec with
  `rg -n -i "placeholder|until (that|the|its|their) [a-z ]*spec|publish|class-rule consistency review|final names? differ|stands? for|named here|the triage (gave|named)"`
  and read each hit (the input `placeholder` attribute, `::placeholder`, `$input-placeholder-color`, the placeholder
  link, `@placeholder`, and message templates' "placeholders in angle brackets" are other things).
- **Rating.** Impact LOW (names in examples; every final name is published); confidence HIGH. Decided.

### CR-D: example imports (derived from ADR 0046)

- **Rule.** Every `@Component` usage example lists in `imports` every library directive its template writes, and no
  library directive it does not use: the documented-API static check of
  [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) would report the
  library's own example otherwise, and Angular's extended diagnostic reports an unused standalone import. An example
  whose template is elided (`...`) or in a `templateUrl` is checked against the markup it cites; an example that leaves
  an import out on purpose to show a report (forgotten-import-checks.md near line 506) says so.
- **Evidence.** ADR 0046; the sweeps' import check (`crd.mjs` in both sweep folders) over every `@Component` example.
- **Per-spec changes.** [forms](../specs/forms.md), the `app-donate` example (near line 462): drop `NfsFormLabel` from
  `imports` (its template writes no `nfsFormLabel`). [interchange](../specs/interchange.md): R13 adds
  `imports: [NfsTable]`. Examples that R32/R64 give `ngSrc` import `NgOptimizedImage`. No other gap.
- **Rating.** Impact LOW; confidence HIGH. Decided.

## Item decisions

### R1: `nfsShowForSr` qualifiers

- **Decision.** Already applied: no spec qualifies `nfsShowForSr` as a placeholder any more. The reviewer
  confirms, and additionally checks the one part of ticket 104's proposal 7 that is a separate rule: every
  `@Component` usage example whose template writes `nfsShowForSr` lists `NfsShowForSr` in its `imports` (CR-D
  generalises this).
- **Evidence.** `rg -n "names it|a placeholder\)|stands for|left out until"` over specs finds no hit beside
  `nfsShowForSr`; orbit.md:612, button-group.md:297 and :396, button.md:317 carry ticket 104's replacement sentence;
  drilldown-menu.md:125, :241, :541, :584; responsive-menu.md:129, :618; abide.md:113, :703; badge.md:77, :195;
  label.md:204 cite the Visibility Classes spec plainly. Component examples whose template uses it and whose
  `imports` list it: orbit.md:571-575, responsive-menu.md:623-627, badge, drilldown-menu, dropdown, button-group.
- **Per-spec changes.**
  - [abide](../specs/abide.md), [button-group](../specs/button-group.md), [badge](../specs/badge.md),
    [label](../specs/label.md), [drilldown-menu](../specs/drilldown-menu.md),
    [responsive-menu](../specs/responsive-menu.md), [orbit](../specs/orbit.md): Already holds; confirm, and apply
    CR-D to every component example.
  - [visibility-classes](../specs/visibility-classes.md): Already holds (the directive is named `nfsShowForSr`);
    confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (wording in examples); confidence HIGH (the texts are measured by search). Decided.

### R2: the four Motion inputs share one pair type, one dot form, and one development check

- **Decision.** The four Motion inputs already share the types: Reveal's `animationIn`/`animationOut` take
  `NfsMotionIn`/`NfsMotionOut`, and the three one-string pairs (the Toggler's, the Dropdown pane's, and the Responsive
  Toggle menu's `animate`) take `NfsMotionPair`, mapped by `nfsMotionPairClasses`, all from the primary entry point
  (building-blocks 1.6 rule 4). The consumer's own classes take the dot form everywhere; the Toggler draft's object
  form is gone. No spec writes an `nfs-` class as a Motion value in consumer code (the sweep below). What still differs
  is the wording, which the review aligns:
  1. One development check for the pair inputs (Toggler check 4, Responsive Toggle check 4, Dropdown pane check 5),
     in the Reveal's and the Dropdown pane's shape: three cases with three messages, because the fixes differ. The
     Toggler and Responsive Toggle say that a value `nfsMotionPairClasses` cannot read is reachable "only" by a cast;
     measured, `NfsMotionPair` admits `'.a .b .c'`, `'.a fade-in'`, and `'.a .b fade-out'` without a cast, because
     `NfsMotionIn` includes `` `.${string}` ``, which matches any string that starts with a dot.
  2. `nfsMotionPairClasses` maps a value that does not split into at most one entering and one leaving token to no
     class in either direction (the counterpart of `nfsMotionClasses` mapping "anything else" to none), and the
     development check reports it.
  3. A pair half holds one class. The compound dot form (`.a.b`) that ticket 109 asked about is not added: several
     keyframe classes on one element do not compose (the later `animation` declaration wins), so a half needs one
     class, and a compound form is additive later. A single-direction input (Reveal) keeps `.a .b` for several
     classes, as its spec and tests say, because nothing else shares its string.
  4. The Motion name set stays "every default a spec needs" (building-blocks 1.6 rule 4, eleven names with
     `spin-in`); `nfs-motion` does not emit Motion UI's thirty. A name outside the set is written as the consumer's
     own keyframe class in the dot form, as the Reveal's Out of Scope says; every Motion spec's Out of Scope says the
     same. Widening the unions later is additive (ADR 0045: additive API in a minor).
  5. The examples that left the Toggler's Motion input out "until the Toggler re-run names its values" (Triggers,
     Callout, Close Button) now write the names: `animate="fade-out"` for Foundation's default `data-closable` fade,
     `animate="slide-out-right"` where Foundation's docs write `data-closable="slide-out-right"`, and
     `animate="fade-in fade-out"` on the Triggers' focus hint, as tickets 109 and 130 proposed.
- **Evidence.** BB 1.6 rule 4 (building-blocks.md:118). Types: specs/reveal.md:168-174, specs/toggler.md:139-148
  (`NfsMotionPair` defined there), specs/dropdown.md:176-181, specs/responsive-toggle.md:149-160. Dot form, one per half:
  specs/toggler.md:466 (D18), specs/responsive-toggle.md:347; Reveal several classes: specs/reveal.md:523, :542. Checks:
  specs/toggler.md:217, specs/responsive-toggle.md:200, specs/dropdown.md:281, specs/reveal.md:269. Sweep (CR-A):
  `rg -n '(animate|animationIn|animationOut|animate\.enter|animate\.leave)="[^"]*nfs-' specs/*.md` finds only
  specs/reveal.md:74 (a user story naming the failing value), specs/toggler.md:349 and specs/triggers.md:430 (prose),
  all CR-A (f); `rg -n "'nfs-(fade|slide|spin|hinge)|\"nfs-(fade|slide|spin|hinge)" specs/*.md` finds only prose, test
  cases (CR-A (b)), and the Dropdown's development-check message; the one `animate.leave` in consumer code,
  specs/triggers.md:520, takes the Application class `app-fade-out`. Glossary: CONTEXT.md already carries the Triggers
  re-run's **Motion class** (proposal 6), the Reveal's **Motion name**, the Toggler's **Class mode**, and the Tooltip's
  **Application class** (holds). Sources of the open points: issues/109:150 (compound form, thirty names, glossary),
  issues/110:162, issues/116:125, issues/118:160-163, issues/130:122-131 (Callout and Close Button wording, Triggers
  examples). Foundation's docs: `docs/pages/callout.md:124,132` and `docs/pages/close-button.md:50,56` (the first
  callout bare `data-closable`, the second `data-closable="slide-out-right"`). Measurement: D:/tmp/nfs-133/motion/pair-probe.ts.
- **Per-spec changes.**
  - [toggler](../specs/toggler.md), Development checks, item 4 (near line 217): replace `a value `nfsMotionPairClasses`
    cannot read (only a cast reaches it), or a dot-form class that starts with `nfs-`: "animate="fade-out" started no
    animation: include nfs-motion, or give your own class @keyframes; write a Motion name, not an nfs- class". The phase
    still completes as before.` with `a dot-form class that starts with `nfs-`: "write the library's Motion name without
    its prefix: animate="fade-in""; and a value that does not split into one entering and one leaving value (three or more
    tokens, or a leaving value before an entering one), which the type admits only through a value that starts with a dot
    (`'.a .b .c'`, `'.a fade-in'`): "animate takes one entering and one leaving value". The first case reads
    "animate="fade-out" started no animation: include nfs-motion, or give your own class @keyframes". The phase still
    completes as before.` (the first case's parenthesis stays as written).
  - [toggler](../specs/toggler.md), API block (near line 148): the comment `// each half through nfsMotionClasses` becomes
    `// each half through nfsMotionClasses; a value that does not split into one entering and one leaving token maps to none in either direction`.
  - [toggler](../specs/toggler.md), browser-level Motion names case (near line 401): replace `a value of another shape reached
    through `$any()` animates nothing.` with `a value of another shape, reached through `$any()` or through a value that
    starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing and warns once (check 4).`
  - [toggler](../specs/toggler.md), Out of Scope (near line 435): replace `- Motion UI transition classes and the
    `motion-ui` package (ADR 0003).` with `- Motion UI transition classes, the `motion-ui` package, and the `fast`/`slow`
    speed modifiers (ADR 0003); Motion UI names outside the `nfs-motion` set, which a consumer writes as its own keyframe
    class in the dot form.`
  - [responsive-toggle](../specs/responsive-toggle.md), Development checks, item 4 (near line 200): the same replacement as
    the Toggler's, with its own value in the first message (`animate="hinge-in-from-top spin-out" started no animation:
    include nfs-motion, or give your own class @keyframes`), and "The phase still completes at once. This is the Toggler's
    check 4 and the Reveal's check 3 in this plugin's words." kept.
  - [responsive-toggle](../specs/responsive-toggle.md), browser-level Motion values case (near line 397): replace `a value of
    another shape reached through `$any()` animates nothing and warns once (check 4).` with `a value of another shape,
    reached through `$any()` or through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing
    and warns once (check 4).`
  - [responsive-toggle](../specs/responsive-toggle.md), Out of Scope: add the Toggler's new Out of Scope bullet above (the
    spec has no Motion line there today).
  - [dropdown](../specs/dropdown.md), Development checks, check 5 (near line 281): replace `and more than two tokens, which
    only dot-form classes can reach past the type: "animate takes one entering and one leaving value"` with `and a value
    that does not split into one entering and one leaving value (three or more tokens, or a leaving value before an
    entering one), which the type admits only through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`):
    "animate takes one entering and one leaving value"`.
  - [dropdown](../specs/dropdown.md), Out of Scope (near line 559): the Toggler's new Out of Scope bullet replaces
    `- Motion UI transition classes and the `motion-ui` package (ADR 0003).`
  - [reveal](../specs/reveal.md): Already holds (types lines 168-174, dot form with several classes line 523, check 3 line
    269, Out of Scope line 577); confirm.
  - [triggers](../specs/triggers.md), Usage examples (near lines 514-541): the focus-replacement hint becomes
    `<div nfsCallout color="secondary" nfsToggler #formHint="nfsToggler" animate="fade-in fade-out" hidden id="form-hint">`;
    `data-closable replacement 2` becomes `<div nfsCallout nfsToggler animate="fade-out" (closed)="nextHeading.focus()">`;
    the "Both at once" example becomes `<div nfsCallout nfsToggler animate="fade-out" (closed)="dismiss()">`. In the
    paragraph after them, replace `The Toggler's typed Motion input, which animates replacement 2 and the last example,
    takes the name form the [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md)
    decides, so the examples leave it out.` with `The Toggler's `animate` takes Motion names ([Spec: Toggler](../issues/17-spec-toggler.md),
    D18): `fade-in fade-out` fades the hint in and out, and `fade-out`, a leaving name alone, is the counterpart of
    Foundation's default `data-closable` fade and its `fadeOut()` and animates only the close; Foundation's
    `data-closable="slide-out-right"` becomes `animate="slide-out-right"` (building-blocks 1.6 rule 4).` (R65's
    Triggers examples are these; R65 adds only `type="button"` near line 123.)
  - [callout](../specs/callout.md), after the Rendered HTML block (near line 246): replace `The Toggler's Motion input
    animates the closing callout under the name form its [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md)
    decides.` with `The Toggler's `animate` animates the closing callout with a leaving Motion name alone:
    `animate="slide-out-right"` is Foundation's `data-closable="slide-out-right"` ([Spec: Toggler](../issues/17-spec-toggler.md), D18).`
  - [callout](../specs/callout.md), Animation (near line 250): replace `a removed one animates through `animate.leave` on
    its `@if` block, in the typed form the [Re-run: Triggers (shared utility) spec under the class rule](../issues/130-rerun-triggers-class-rule.md)
    decides for Foundation's `data-closable` replacements, because no library class name may appear in consumer code
    (ADR 0039). Until then the removal recipe animates with the consumer's own keyframe class or not at all.` with `a
    removed one leaves at once, animates through `animate.leave` with the consumer's own keyframe class, or, to play a
    library Motion, hides through a Toggler and is removed in its `closed` output: the `data-closable` replacements of
    the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) (D17), because no library class name may appear
    in consumer code (ADR 0039).` (ticket 130's proposal, not yet applied).
  - [callout](../specs/callout.md), Out of Scope, the Closing bullet (near line 319): `and the typed leave animation of the
    `@if` recipe belong to` becomes `and the `@if` recipe's animation belong to` (ticket 130's proposal).
  - [callout](../specs/callout.md), story `callout--closable` (near line 276): `the second closing with a Motion class
    through the Toggler's own input` becomes `the second closing with `animate="slide-out-right"`, Foundation's
    `data-closable="slide-out-right"` as a leaving Motion name on the Toggler's own input`.
  - [close-button](../specs/close-button.md), Animation (near line 234): replace `(a Toggler's Motion classes,
    `animate.leave` on an `@if` block)` with `(a Toggler's typed Motion input, or `animate.leave` with the consumer's
    own keyframe class on an `@if` block, the Triggers spec's D17)` (ticket 130's proposal, not yet applied).
  - [close-button](../specs/close-button.md), story `close-button--closable` (near line 258): `the second closing with a
    Motion class through the Toggler's own input` becomes `the second closing with `animate="slide-out-right"`,
    Foundation's `data-closable="slide-out-right"` as a leaving Motion name on the Toggler's own input`.
  - [breakpoint-service](../specs/breakpoint-service.md), consumer table (near lines 262 and 272): the Options cell
    ``animate`` of the ResponsiveToggle and Dropdown pane rows becomes ``animate` (`NfsMotionPair`)` (ticket 116's note).
- **Shared-document changes.** `building-blocks.md` 1.6 rule 4: after "split at whitespace into one token per direction,
  each mapped by `nfsMotionClasses`" insert: ", so a pair half holds one class (a compound form such as `.a.b` is not
  supported); a value that does not split so, which the type admits only through a value that starts with a dot
  (`'.a .b .c'`, `'.a fade-in'`; measured with `tsc` 6.0.3 by the [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md)),
  maps to no class in either direction and is reported in development". No change to CONTEXT.md (the four terms hold)
  or to `specs/variant-declaration-tooling.md` (its primary-entry-point sentence already names `NfsMotionPair` and
  `nfsMotionPairClasses`, line 27).
- **Rating.** Impact LOW: development messages, examples, and the mapping of values the type was meant to reject; the
  public types are unchanged, and a compound form or more Motion names are additive later. Confidence HIGH: the pair
  type and dot form were decided by the Toggler and Dropdown re-runs (HIGH/HIGH there), the escape through `.${string}`
  is measured, and the example values are Foundation's own. Decided.

### R3: menu-family class rule and the roots' hosted Menu inputs

- **Decision.** Holds, with two stale deferrals to replace. No menu spec's consumer markup, recipe, or story
  writes `menu`, `vertical`, `nested`, `is-active`, `align-*`, `dropdown`, `drilldown`, `accordion-menu`,
  `submenu-toggle-text`, `js-drilldown-back`, `show-for-sr`, or a `.top-bar*` class: every hit in the six specs
  is rendered output (CR-A (a)), a copied-class case labelled as such (CR-A (b)), or Foundation's markup labelled
  as Foundation's (CR-A (c)). `NfsMenu` has six inputs (`orientation`, `expanded`, `simple`, `nested`, `align`,
  `iconPosition`); the three plugin roots expose the same five under the Menu's own names (all but `nested`,
  which only a submenu uses), `NfsSubmenu` exposes `align` and `iconPosition` and binds `nested` and `vertical`
  itself (Menu D5), and `NfsResponsiveMenu`'s `hostDirectives` entries list no Menu input, because the one
  merged `NfsMenu` arrives through the three roots and Angular's mapping check rejects a Menu input in a root's
  entry (Responsive Menu D19). The static `is-active` seed is gone from every menu spec (Nested menu D29,
  Accordion Menu D21, Drilldown D26, Responsive Menu D21), Hybrid links in every Router example carry
  `{exact: true}`, and the Nested menu re-run's change 9 reached the Menu spec (its check 1, last sentence).
  The three roots and the responsive root agree that a copied mode class is not reported (Accordion Menu D24,
  Drilldown D28, Dropdown Menu D22, Responsive Menu D22); two roots still word that as a future decision of the
  Responsive Menu spec.
- **Evidence.** `specs/menu.md:123-125`, `:160-165`, `:181`, `:420` (D5); `specs/accordion-menu.md:132-133`,
  `:153`, `:434`, `:512`; `specs/dropdown-menu.md:122`, `:144-145`, `:452`, `:520`;
  `specs/drilldown-menu.md:142-143`, `:162`, `:421`, `:494`, `:583`; `specs/responsive-menu.md:142-150`, `:168`,
  `:608` (D19), `:611` (D22); `specs/nested-menu.md:156-158`, `:295-298`, `:677` (D29). Class sweep:
  `rg -n 'class="[^"]*"|\[class[.\]]|routerLinkActive="'` over the six specs, each hit read in context; no
  `routerLinkActive="<class>"` anywhere.
- **Per-spec changes.**
  - [accordion-menu](../specs/accordion-menu.md): D24 (near line 512), replace `and that spec decides whether its
    root reports it` with `and the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) does not report
    it either (its D22)`.
  - [dropdown-menu](../specs/dropdown-menu.md): the `.dropdown` row of the class mapping (near line 122), replace
    `and that spec decides whether it is reported (D22)` with `and the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md)
    does not report it either (its D22; D22 here)`.
  - [menu](../specs/menu.md), [drilldown-menu](../specs/drilldown-menu.md), [responsive-menu](../specs/responsive-menu.md),
    [nested-menu](../specs/nested-menu.md): Already holds; confirm under CR-A and CR-B.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (wording of two decision rows; the behaviour is already decided alike); confidence HIGH
  (read in every spec). Decided.

### R4: the exact-luminance helper in every contrast check, and the ratio rule

- **Decision.** Every spec whose Library mixin checks a contrast pair states that the ratio comes from the
  library's internal helper with the exact WCAG formula, never from Foundation's `color-luminance()` or
  `color-contrast()`, and no spec presents a figure computed with `color-luminance()` as its own. This is
  building-blocks 1.10's rule since the [Spec: Top Bar](../issues/86-spec-top-bar.md) (its proposal 4, already
  applied to building-blocks 1.10 and ADR 0022's dated note of 2026-09-28); what remains is spec wording and
  figures. Ten specs still name `color-luminance()` as their computation (Accordion, Abide, Button, Button Group,
  Callout, Close Button, Forms, Responsive Accordion Tabs, Reveal, Tabs); the other specs with checks already use
  the exact formula. Every figure within 0.1 of 3:1 or 4.5:1 in the 17 listed specs, and every figure of the ten
  stale specs, was recomputed; the corrections are listed per spec. The two named figures hold: the Slider's fill
  1.31:1 (1.3133) and thumb 3.76:1 (3.7554) against the track, and the menus' 4.65:1 (4.6473) for
  `$primary-color` on `$body-background`, which every menu spec quotes (Foundation's function's 4.59:1 appears only
  labelled as such, in the Menu, Nested menu, and Drilldown Menu specs); the unlabelled 4.59:1 is in the Button and
  Button Group specs only.

  Canonical Sass sentence (S1), placed in the Sass subsection's list of rules or checks of every spec whose Library
  mixin checks a contrast pair, unless the subsection already says the same in words that name the exact WCAG
  formula, the library's internal helper, and both Foundation functions as not used:

  > Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula
  > by the library's internal contrast helper (`math.pow`), which composites a translucent colour over
  > `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose
  > approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.

  Canonical figure sentence (S2), replacing the sentence that opens a WCAG 2.2 AA subsection or row with "Ratios
  were computed with Foundation 6.9.0's own `color-luminance()`":

  > Ratios are the exact WCAG 2.2 relative-luminance ratio, unrounded, on Foundation 6.9.0's default settings
  > (<the spec's list of settings stays>), as the library's contrast helper computes them (building-blocks 1.10).

  Ratio rule, for every figure a spec states as its own computation or measurement:

  1. Recompute it with `ratio.mjs` in the default mode (8-bit channels, as painted) and with `NFS_FLOAT=1`
     (unrounded channels, as the helper computes). It stands when it equals either value at the precision it is
     written in; otherwise it takes the default-mode value at the same precision. The two modes differ by at most
     about 0.03 on the pairs checked (for example the Callout's required link on `$light-gray`: 4.858 and
     4.867), and the effort already uses both (the Card's 4.858:1, the Table's 6.02:1), so neither is imposed.
  2. A failing figure is written so that it stays below its threshold: 4.498:1, never 4.50:1 or 4.5:1. A spec that
     states that it floors its figures (the Switch) keeps that.
  3. A bound ("at least 4.86:1 on every callout") is recomputed over the whole set it bounds.
  4. A figure labelled as axe's ("axe reports 4.49") stays as measured and never carries a pass or fail on its
     own. A figure from Foundation's `color-luminance()` or `color-contrast()` stays only where the text shows its
     false pass or its rounding, and names the function.
  5. A figure written with "about" stands within 0.05.
  6. A compile test whose verdict rests on one pair uses a pair that is on the same side of the threshold in both
     modes, and says which way it goes.

  Clauses to replace (a mechanical rule): every clause that names `color-luminance()` as the source of a ratio or
  a check ("computed from Foundation's `color-luminance()` with the WCAG formula", "the unrounded
  `color-luminance()` ratio", "measured with Foundation 6.9.0's `color-luminance()`", "ratios from Foundation's
  `color-luminance()` and the WCAG formula") says "the exact WCAG relative-luminance formula" instead, followed in a
  check by "by the library's internal contrast helper"; `color-luminance()` leaves every list of reused Foundation
  functions (the helper is the library's own). A clause that names `color-luminance()` or `color-contrast()` only
  to say it is not used, or to quote a false pass, stays.

- **Evidence.** [Spec: Top Bar](../issues/86-spec-top-bar.md), Answer, proposal 4 and "What other specs need"
  (issues/86:110-114, 219-220); building-blocks 1.10, first bullet (already carries the text); ADR 0022, dated note
  of 2026-09-28 ("the class-rule consistency review rechecks every ratio a spec quotes"); the routed sources
  issues/95:187, 112:128 (the menus' 4.65:1), 115:108 (every ratio in the menu specs exact), 124:105 (Slider
  1.31:1 and 3.76:1). `rg 'color-luminance' specs/` on 2026-09-29: 31 specs mention it; the stale clauses are at
  accordion.md:312, 561, 676, 678; abide.md:343, 573, 713, 719; button.md:250; button-group.md:174; callout.md:182,
  451, 452; close-button.md:183, 403, 404; forms.md:225, 447, 516, 524; responsive-accordion-tabs.md:759;
  reveal.md:373, 610, 767, 769; tabs.md:346, 738 (twice). Every other mention is a "never" clause or a labelled
  false pass. Recomputed figures: the pair files named in the Tools section.
- **Per-spec changes.**
  - [accordion](../specs/accordion.md): the stale clauses at 312, 561, 676, 678 by the rule; S1 in the Sass
    subsection. Figures (the spec computed "white" as `#ffffff`, but `$accordion-background` is `$white`,
    `#fefefe`): line 312 `(4.69:1 on white passes)` becomes `(4.65:1 on `$accordion-background`, `$white`
    `#fefefe`, passes)`, and `6.0:1 on white` becomes `6.01:1 on `$white``; line 313 `4.69:1 (default) or 4.86:1
    and 6.0:1 (fixed)` becomes `4.65:1 (default) or 4.86:1 and 6.01:1 (fixed)`. 3.76:1, 4.86:1, 1.25:1 stand (the
    border is 1.2375, "1.25" is `about`-close; write `1.24:1`).
  - [abide](../specs/abide.md): the stale clauses at 343 (1.4.3 row), 573 (D21: "measured with Foundation's
    `color-luminance()`" becomes "computed with the exact WCAG formula"), 713 (Sass checks), and 719 by the rule;
    S1 in the Sass subsection.
    Figures: `2.31:1` (lines 515, 573; `#8b1a10` against `$black`) becomes `2.12:1` (2.1241; the test still fails
    it); `1.53:1` for Abide's invalid colour against Foundation's default focus border (lines 515, 573, 733)
    becomes `1.54:1` (1.5351); unlabelled `4.49:1` (line 9 and line 724) becomes `4.498:1`, and line 723 keeps
    `4.49:1 on #fefefe (axe `color-contrast`)` as axe's figure. 5.25:1, 3.74:1, 1.31:1, 3.93:1, 4.55:1 (4.5554 and
    4.5497, both passing), 4.70:1, 3.42:1, 19.63:1, 5.73:1 stand; 16.2:1 takes R30's conditioned wording.
  - [accordion-menu](../specs/accordion-menu.md): already exact (274, 620); figures stand (4.65:1, 2.94:1); confirm
    S1 or its equivalent.
  - [button](../specs/button.md): line 250 `Contrast ratios were computed with Foundation 6.9.0's own
    `color-luminance()` from its default settings (...) and are unrounded:` becomes S2 with the same settings
    list; S1 in the Sass subsection's item (2) after "...fails 1.4.3, 1.4.11, or 1.4.1;". Figures (line 255):
    `4.59:1 (hover 5.90:1)` becomes `4.65:1 (hover 6.01:1)`; `.primary 4.59:1` and `hollow and clear .primary
    4.59:1` become `4.65:1`; `(hover 6.85:1)` for solid warning becomes `(hover 6.84:1)`; `success 5.28:1` becomes
    `success 5.36:1`; `(hover 7.32, 7.21, 8.04:1)` becomes `(hover 7.34, 7.39, 8.04:1)`. Line 256: `(at least
    4.50:1)` becomes `(at least 4.498:1, alert)`. Line 261: `.primary 3.29:1` becomes `3.32:1`; `(3.61 to 4.08:1
    for the three changed entries)` becomes `(3.62 to 4.08:1 ...)`. Standing: 4.50:1 (4.504), 4.498:1, 10.91:1,
    7.88:1 (unrounded 7.881), 10.66:1, 1.80:1, 1.84:1, 5.25:1, 5.88:1, 2.49:1 (unrounded 2.491), 2.87:1, 3.31:1,
    3.19:1, 11.0:1, 1.53:1, 1.57:1. Plus R6.
  - [button-group](../specs/button-group.md): line 174 `unrounded with Foundation's `color-luminance()`` becomes
    `unrounded with the exact WCAG formula`; `4.59:1 or more in solid groups` becomes `4.50:1 or more in solid
    groups (secondary, 4.504:1)`; `1.15:1 in a solid alert group` becomes `1.13:1`; `(4.59:1 primary, 5.25:1
    alert, 5.28:1 success on the page)` becomes `(4.65:1 primary, 5.25:1 alert, 5.36:1 success on the page)`. The
    group has no check of its own (Sass item (2)), so no S1. Plus R6.
  - [callout](../specs/callout.md): line 182 `Ratios were computed by this spec's ticket with Foundation 6.9.0's
    own `color-luminance()` and the WCAG formula from its default settings, unrounded` becomes `Ratios are the
    exact WCAG 2.2 relative-luminance ratio of Foundation 6.9.0's default settings, unrounded`; line 451 `each ratio
    from Foundation's `color-luminance()` with the WCAG formula, unrounded` becomes S1's wording; line 452 drops
    `and `color-luminance()`` (keeps `color-pick-contrast()`). Figures: line 9 `3.78:1 to 4.20:1` becomes `3.83:1
    to 4.26:1`; line 186 `primary 3.80, secondary 3.85, success 4.20, warning 4.20, alert 3.78:1; default 4.63:1
    passes` becomes `primary 3.85, secondary 3.90, success 4.25, warning 4.26, alert 3.83:1; default 4.69:1
    passes`, `(at least 4.78:1)` becomes `(at least 4.87:1)`, and `links reach at least 4.86:1 on every callout
    (alert is the lowest), hover at least 6.02:1, and 5.90:1 on the page` becomes `links reach at least 4.95:1 on
    every callout (alert is the lowest), hover at least 6.18:1, and 6.01:1 on the page`; line 342 `at 90 percent
    links still reach only 4.05:1 on alert` becomes `4.10:1`, `(at least 4.86:1)` becomes `(at least 4.95:1)`,
    `page links to 5.90:1` becomes `6.01:1`. Line 297 is a verdict flip: `with `purple: #5b2a86` and the required
    settings the compile stops naming `$anchor-color` on purple (4.425:1)` becomes `with `purple: #4b0082` and the
    required settings the compile stops naming `$anchor-color` on purple (4.02:1; `#5b2a86` passes at 4.51:1)`.
    Standing: 2.82 to 2.87:1, 3.45, 3.13, 3.14, 16.16:1, 3.71:1, 4.50:1, 3.01 and 3.22:1, 4.498:1, 4.686:1,
    4.858:1, 3.64:1, "about 4.85" and "about 3.63".
  - [close-button](../specs/close-button.md): line 183 `ratios were computed with Foundation's own
    `color-luminance()` and the WCAG formula, unrounded` becomes `ratios are the exact WCAG relative-luminance
    ratio, unrounded`; line 403 `each computed from Foundation's `color-luminance()` with the WCAG formula;
    Foundation's `color-contrast()` is not used, because it rounds to one decimal.` becomes S1's wording; line 404
    `, `$body-background`, and Foundation's `color-luminance()`.` becomes `, and `$body-background`; the ratios come
    from the library's internal contrast helper.`. Every figure stands (3.42, 2.82 to 2.87, 3.45, 3.13, 3.14, 2.77,
    3.71, 16.16, 2.30).
  - [dropdown-menu](../specs/dropdown-menu.md): already exact (334, 535, 724); figures stand.
  - [forms](../specs/forms.md): line 225 `Ratios were computed with Foundation 6.9.0's own `color-luminance()`
    from its default settings` becomes `Ratios are the exact WCAG 2.2 relative-luminance ratio of Foundation
    6.9.0's default settings`; line 447 `with the unrounded `color-luminance()` ratio` becomes `with the exact
    unrounded ratio`; line 516 `with ratios from Foundation's `color-luminance()` and the WCAG formula compared
    unrounded, never through Foundation's `color-contrast()`, which rounds to one decimal (building-blocks 1.10)`
    becomes S1's wording; line 524 `measured with Foundation 6.9.0's `color-luminance()` against its default
    `#fefefe` backgrounds` becomes `computed with the exact WCAG formula against its default `#fefefe`
    backgrounds`. Every figure stands (1.63, 4.70, 3.42, 2.11, 19.63, 5.73, 15.86).
  - [menu](../specs/menu.md): already exact (228, 519; 4.65:1 and the labelled 4.59:1); add S1 where the Sass
    subsection's checks (519) do not name the helper. 4.484:1 for `#787878` stands (the pick is `$black`).
  - [off-canvas](../specs/off-canvas.md): already exact (381, 549, 625, 742); figures stand.
  - [orbit](../specs/orbit.md): already exact (643, 660); figures stand (3.68:1 is the unrounded composite,
    3.6835; 5.21:1; 2.94 and the labelled 3.01).
  - [progress-bar](../specs/progress-bar.md): already exact (261, 367, 413); figures stand.
  - [responsive-accordion-tabs](../specs/responsive-accordion-tabs.md): line 759 `, `color-luminance()` (the
    `nfs-accordion` checks compare the unrounded ratio, as the Accordion spec states),` becomes `, (the
    `nfs-accordion` checks compare the exact unrounded ratio, as the Accordion spec states),` ; line 380 `6.0:1 on
    white` becomes `6.01:1 on `$white``. Other figures stand. Plus R45.
  - [responsive-menu](../specs/responsive-menu.md), [responsive-toggle](../specs/responsive-toggle.md),
    [top-bar](../specs/top-bar.md): already exact; figures stand.
  - [reveal](../specs/reveal.md): the stale clauses at 373, 610, 767 by the rule; line 769 drops `and
    `color-luminance()``; S1 in the Sass subsection. Figures stand (3.42, 19.63, 3.17 as painted: 3.165).
  - [slider](../specs/slider.md): already exact (345, 464, 585, 672, 688); 1.31:1 and 3.76:1 stand.
  - [tabs](../specs/tabs.md): line 346 and line 738 `by the unrounded `color-luminance()` ratio` becomes `by the
    exact unrounded ratio of the library's internal contrast helper`; line 738 `, `$primary-color`, and
    Foundation's `color-luminance()`,` becomes `, and `$primary-color`,`; S1 in the Sass subsection. Figures stand
    (3.76, 1.24, 4.65, 5.92, 5.06 as unrounded 5.058, 4.78, "about 4.2"). Plus R45.
  - Every other spec whose Library mixin checks contrast (badge, breadcrumbs, card, drilldown-menu, label,
    nested-menu, pagination, prototyping-utilities, switch, table, typography-helpers): already exact; the
    reviewer confirms S1 or its equivalent and applies the ratio rule to any figure it touches. The Nested menu's
    1.4.1 row (408: "4.65:1, computed exactly (Foundation's `color-luminance()` gives 4.59:1)") and the Drilldown
    Menu's design row (585) quote 4.59:1 as Foundation's labelled false pass, which rule 4 keeps. The Forms'
    D11 (447) is in the Forms line above.
- **Shared-document changes.**
  - building-blocks 1.10, first bullet, after "...or only checks it.": append
    > A spec quotes a ratio as that exact formula gives it on the colours as painted (8 bits per channel) or as the
    > helper computes it (unrounded channels), writes a failing ratio with enough decimals to stay below its
    > threshold (4.498:1, never 4.50:1), and quotes axe's figures as axe's.
  - building-blocks 1.10, Callout bullet: `(links are 3.78:1 to 4.20:1 on five of Foundation's six callouts)`
    becomes `(links are 3.83:1 to 4.26:1 on five of Foundation's six callouts)`.
  - storybook-conventions.md section 5, the `$anchor-color` comment: `$anchor-color links are 3.78:1 to 4.20:1 on
    five` becomes `$anchor-color links are 3.83:1 to 4.26:1 on five` (axe's "3.82 to 4.25" stays).
  - storybook-conventions.md section 5, the Abide comment: `the alert colour is 4.49:1 on #fefefe` becomes `the
    alert colour is 4.498:1 on #fefefe`.
  - ADR 0022: none (its dated note of 2026-09-28 already states the rule and this recheck).
- **Rating.** Impact LOW (wording and figures; the helper, the checks, and every verdict but the Callout's purple
  test colour are unchanged); confidence HIGH (building-blocks 1.10 and ADR 0022 already decide the helper;
  figures recomputed with the tools above). Decided.

### R5: which palettes a `$foundation-palette` merge reaches

- **Decision.** A merge of `$foundation-palette` in an overrides file imported after Foundation's settings reaches
  only the classes that Foundation's mixins loop over `$foundation-palette` at their include: the Callout's palette
  classes (`_callout.scss:96`), the Progress Bar's (`_progress-bar.scss:45`), and the native progress element's
  (`forms/_progress.scss:70`). It does not reach `$button-palette`, `$badge-palette`, or `$label-palette`, which
  the settings file assigned from the old map (`settings/_settings.scss:275, 316, 482`), nor `$alert-color` and
  the settings assigned from it (Abide's error colours, `$meter-fill-bad`), which `add-foundation-colors()` set.
  The three palette overrides reach their own palette only; the Button Group reads `$button-palette`, so the
  Button's line reaches it too. The Badge, Label, and Progress Bar specs already say this; the Storybook comments
  and the Button spec say it incompletely.
- **Evidence.** `rg '\$foundation-palette' scss/` in the Foundation 6.9.0 clone (above);
  storybook-conventions.md section 5 (the `$foundation-palette` comment names callouts, badges, labels, and
  buttons, not the native progress element or `$alert-color`); progress-bar.md:524 (the `add-foundation-colors()`
  sentence); badge.md:271 and label.md:283 (a merge alone still fails their compile); button-group Sass item (6)
  (reads `--nfs-button-palette`).
- **Per-spec changes.**
  - [progress-bar](../specs/progress-bar.md): after the sentence ending "...merges the map and leaves
    `$alert-color` alone." (near line 524) add: `The merge reaches every class Foundation's mixins loop over
    `$foundation-palette` at their include: the progress bars, the native progress element's palette classes, and
    the callouts (an alert callout's background becomes about `#f7e1dd`, still passing, the [Spec: Callout](../issues/89-spec-callout.md)'s Notes); it does not reach `$button-palette`, `$badge-palette`, or
    `$label-palette`, which Foundation's settings file assigned from the old map, so the Button, Badge, and Label
    specs require lines of their own.`
  - [button](../specs/button.md): in the Sass subsection, after the required `$button-palette` setting, add:
    `The line sets `$button-palette` itself, because Foundation's settings file assigned it from
    `$foundation-palette` before any overrides file, so a `$foundation-palette` merge does not reach buttons or
    button groups.`
  - [badge](../specs/badge.md), [label](../specs/label.md): already hold (271, 283; building-blocks 1.10); confirm.
  - [callout](../specs/callout.md): already holds (line 475 notes the alert background under the Progress Bar's
    override); confirm.
- **Shared-document changes.** storybook-conventions.md section 5:
  - the `$foundation-palette` comment, `it also recolours alert callouts in every story (still passing); badges,
    labels, and buttons keep the palettes Foundation's settings file assigned before this file, so their specs add
    lines of their own` becomes `it reaches every class Foundation's mixins loop over $foundation-palette at their
    include, so it also recolours alert callouts in every story (still passing) and the native progress element;
    badges, labels, buttons, and button groups keep the palettes Foundation's settings file assigned before this
    file, and $alert-color and the settings assigned from it keep #cc4b37, so the Badge, Label, Button, and Abide
    specs add lines of their own`;
  - the `$button-palette` comment: append `It reaches buttons and button groups only.`
- **Rating.** Impact LOW (comments and one sentence per spec); confidence HIGH (read in Foundation's source).
  Decided.

### R6: `color-pick-contrast()` positions

- **Decision.** The Badge and the Label correct Foundation's wrong pick with one rule per entry (their D9s,
  building-blocks 1.10); that holds. The Button checks the pick as Foundation emits it and does not correct it, and
  the Button Group, whose palette classes make the same pick over `$button-palette`
  (`_button-group.scss:244-253`, `button-fill-style($filling, $color, auto, auto)`), takes the Button's position
  through `nfs-button`'s checks. Measured: Foundation's pick between `$button-color` and `$button-color-alt` is the
  better candidate by the exact formula for every entry of Foundation's default palette and of the Button's
  required palette (primary, secondary, alert, and the required `#bf3f2c`, `#177a3d`, `#8a5a00` pick `$white`;
  success and warning pick `$black`); it is wrong for a consumer colour such as the Badge's `#e10f69` (`$black`
  4.218:1 where `$white` reaches 4.654:1). A correction for buttons would need rules for the solid label, its hover
  and focus states, and the group's palette classes, where a badge or a label needs one; a failing wrong pick
  already stops the compile, so the Button's error message names the other candidate instead.
- **Evidence.** `color-pick-contrast()` in `util/_color.scss:77-95` (compares `color-contrast()` ratios, first
  candidate on a tie); `_button.scss:190`; `_button-group.scss:244-253`; the pick table computed with
  `ratio.mjs` (evalSass of `color-pick-contrast(<entry>, ($button-color, $button-color-alt))` against both exact
  ratios); badge.md:321 (D9), label.md:421.
- **Per-spec changes.**
  - [button](../specs/button.md): in the 1.4.3 row (near line 255), after "the label colour Foundation picks
    (`color-pick-contrast()` between `$button-color` and `$button-color-alt`) on the entry and on its hover
    colour", add: `; the checks read the pick as Foundation emits it and do not correct it: on Foundation's
    defaults and the required palette it is the better candidate for every entry (measured by the exact formula),
    and where a consumer's entry gets the worse one and fails, the `@error` names the entry, the picked colour and
    its ratio, and the other candidate's ratio, so the consumer changes the colour or the candidates`; add a design
    decision row (next free D number): `| D<n> | `nfs-button` checks Foundation's `color-pick-contrast()` label
    colour as emitted and names the better candidate in its error, and does not correct the pick | The pick is
    right for every default and required entry (measured); a correction would need rules for the solid label, its
    hover and focus, and the Button Group's palette classes, where the Badge and Label need one; a failing wrong
    pick already stops the compile | A correcting rule per entry, as `nfs-badge` and `nfs-label` emit |`.
  - [button-group](../specs/button-group.md): in the Sass subsection's item (2), after "every label, arrow, and
    disabled pair in a group is one `nfs-button` checks (D13)", add: `, including the label colour that
    Foundation's `color-pick-contrast()` picks for a group's palette class, the same pick as a button's for that
    entry, checked as emitted and not corrected (the [Spec: Button](../issues/37-spec-button.md)'s position).`
  - [badge](../specs/badge.md), [label](../specs/label.md): already hold (D9, Sass rule (a)); confirm.
- **Shared-document changes.** building-blocks 1.10, first bullet: `each spec that relies on the pick decides
  whether its mixin corrects it, as `nfs-badge` and `nfs-label` do, or only checks it.` becomes `each spec that
  relies on the pick decides whether its mixin corrects it, as `nfs-badge` and `nfs-label` do, or only checks it,
  as `nfs-button` does for buttons and button groups, whose error then names the other candidate's ratio.`
- **Rating.** Impact LOW (an error message and a stated position; no rule, API, or setting); confidence HIGH
  (measured on every default and required entry; Foundation's source read). Decided.

### R7: Equalizer's neighbour names and the gutters

- **Decision.** Every name the Equalizer spec uses matches its owning spec, so only the qualifier goes. The
  gutters come back where the Equalizer's examples port a Foundation example that has them: Foundation's docs put
  `grid-margin-x` on the basic example's grid (`docs/pages/equalizer.md:21`, `:71`) and `grid-padding-x` on the
  by-row block grid (`:117`, `:125`), so the ported grids carry `gridMarginX` and `gridPaddingX`, and their rendered
  output carries `grid-margin-x` and `grid-padding-x`. The CSS answer's first example ports the basic example
  (`gridMarginX`); the block-grid example and `equalizer--css-block-grid-rows` port the by-row example
  (`gridPaddingX`); `equalizer--docs-markup` gets `gridMarginX`.
- **Evidence.** specs/equalizer.md:117-124 (mapping rows already name `NfsGridX`'s `gridMarginX` and
  `gridPaddingX`, `NfsFlexContainer`, `NfsFlexChild`, `NfsCard`, `NfsCardDivider`, `NfsCardSection`, `NfsRow`,
  `NfsColumn`); :128 (the qualifier); :252-266, :421-437 (grids without gutters); issues/126:87 (the ask); XY Grid
  mapping specs/xy-grid.md:199 (the four gutter booleans).
- **Per-spec changes.**
  - [equalizer](../specs/equalizer.md), the names paragraph (near line 128): replace "`NfsCard`, `NfsCardDivider`,
    and `NfsCardSection` are the out-of-scope triage's. The XY Grid, Flexbox Utilities, Float Grid, and Card specs
    own those names, and the class-rule consistency review aligns this spec's examples if their final names
    differ." with "`NfsCard`, `NfsCardDivider`, and `NfsCardSection` are the [Spec: Card](../issues/90-spec-card.md)'s."
  - [equalizer](../specs/equalizer.md), Rendered HTML CSS answer (near line 252): `<div nfsGridX>` becomes
    `<div nfsGridX gridMarginX>`, and its server-HTML block's `<div class="grid-x">` becomes
    `<div class="grid-x grid-margin-x">`; the Usage example's first grid (near line 421) becomes
    `<div nfsGridX gridMarginX>`; the block grid (near line 434) becomes
    `<div nfsGridX gridPaddingX [up]="{small: 1, medium: 2, large: 4}">`; in the sentence after it (near line
    440) replace "`nfsGridX` and `nfsCell` with `size` and `up` render `.grid-x`, `.cell`, `.medium-4`, and
    `.small-up-1.medium-up-2.large-up-4`;" with "`nfsGridX` and `nfsCell` with `size`, `up`, `gridMarginX`, and
    `gridPaddingX` render `.grid-x`, `.cell`, `.medium-4`, `.small-up-1.medium-up-2.large-up-4`,
    `.grid-margin-x`, and `.grid-padding-x`;"; the `equalizer--docs-markup` and `equalizer--css-flex-cells` stories
    carry `gridMarginX` and `equalizer--css-block-grid-rows` carries `gridPaddingX`. Nothing else changes (a gutter
    changes spacing, not equal heights: mapping row near line 119).
- **Shared-document changes.** None.
- **Rating.** Impact LOW (examples); confidence HIGH (names read from the owning specs; Foundation's markup read).
  Decided.

### R8: Abide's Callout and grid names

- **Decision.** The names are the published ones (`[nfsCallout]` with `color`, `ngx-foundation-sites/callout`;
  `nfsShowForSr`; `nfsGridX`, `nfsCell`); only the qualifier sentence remains.
- **Evidence.** specs/abide.md:403 (qualifier), :585 (import comment), :683 (grid names already cited to the XY
  Grid spec), :703 (`nfsShowForSr` already plain); specs/callout.md:104 (entry point); issues/123:109.
- **Per-spec changes.**
  - [abide](../specs/abide.md), near line 403: replace "`nfsCallout` and its `color` input stand for the directive of
    the [Spec: Callout](../issues/89-spec-callout.md), named here after the triage's selector and building-blocks 1.4
    (`color` for a palette) until that spec publishes;" with "`nfsCallout` and its `color` input are the
    [Spec: Callout](../issues/89-spec-callout.md)'s, from `ngx-foundation-sites/callout`;".
  - [abide](../specs/abide.md), near line 585: drop the trailing comment "// the Callout spec's entry point and
    name".
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R9, R23: Forms' and Pagination's grid and alignment names

- **Decision.** Already applied: both specs carry ticket 106's replacement sentences and the published XY Grid
  names. The Pagination's class check (no `current`, `disabled`, `ellipsis`, `pagination-previous`,
  `pagination-next`, `text-center` written) is CR-A and is confirmed by the class sweep.
- **Evidence.** specs/forms.md:246 ("`nfsGridX` and `nfsCell` with `size` are the [Spec: XY Grid]'s. `nfsTextAlign`
  is the [Spec: Typography Helpers]'s text-alignment attribute (`NfsTextAlignment`)."); specs/pagination.md:98,
  :224, :257, :315.
- **Per-spec changes.** [forms](../specs/forms.md), [pagination](../specs/pagination.md): Already holds; confirm.
  [typography-helpers](../specs/typography-helpers.md), [xy-grid](../specs/xy-grid.md): none.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R10: Media Object's names, the Menu's `align`, and the 1.13 refinement

- **Decision.** (1) `nfsThumbnail`, `NfsThumbnail`, `nfsFlexAlign`, and `alignY` are the owning specs' names; the
  qualifier goes. (2) The Menu's `align` is settled by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md): the Menu keeps `align` and
  `NfsMenu` binds `'[attr.align]': 'null'` (Menu D15), so a static `align="right"` never reaches the DOM and a
  menu's look does not change; the Media Object's D3 stands with ticket 139's dated amendment (its `alignment` is
  building-blocks 1.4 rule 3's name). Nothing more to decide here. (3) The 1.13 refinement (two families one flag
  gates in opposite directions share one property) is in building-blocks 1.13 already.
- **Evidence.** specs/media-object.md:440; issues/91:111-113, :152; issues/139:353-357 (the Media Object amendment),
  :213 (Menu D15); building-blocks.md 1.13 ("two families that one flag gates in opposite directions share one
  property ... `nfs-media-object` writes `--nfs-media-object-section`").
- **Per-spec changes.**
  - [media-object](../specs/media-object.md), near line 440: replace "`nfsThumbnail`, `NfsThumbnail`, `nfsFlexAlign`,
    and `alignY` are the names the [Spec: Thumbnail](../issues/97-spec-thumbnail.md) and the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) give; the class-rule consistency review aligns this spec's
    examples if they differ." with "`nfsThumbnail` (`NfsThumbnail`) is the [Spec: Thumbnail](../issues/97-spec-thumbnail.md)'s
    directive, and `nfsFlexAlign` with `alignY` the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s."
  - [menu](../specs/menu.md), [thumbnail](../specs/thumbnail.md), [flexbox-utilities](../specs/flexbox-utilities.md):
    none for this item.
- **Shared-document changes.** None (building-blocks 1.13 already carries the refinement; confirm in the closing
  pass).
- **Rating.** Impact LOW; confidence HIGH (ticket 139 decided the `align` question with measurements). Decided.

### R11: Sticky decision 9's neighbour names

- **Decision.** Every neighbour name in the Sticky spec is the owning spec's (`nfsGridX` and `nfsCell` with
  `size`, `img[nfsThumbnail]`, `nfsCallout`, `nfsTitleBar` with `nfsTitleBarLeft`, `nfsTopBar`,
  `nfsOffCanvasWrapper`, `button[nfsButton]`); D19's rationale drops the deferral. The overflow clause of D19
  belongs to R41, and the reviewer applies R41's wording for that clause in the same edit.
- **Evidence.** specs/sticky.md:115, :244, :409, :422 (names in use); issues/120:45 (decision 9), :145; the names
  checked against specs/xy-grid.md, thumbnail.md:100, callout.md:104, top-bar.md.
- **Per-spec changes.**
  - [sticky](../specs/sticky.md), D19's rationale cell (near line 409): replace "`nfsGridX` and `nfsCell` are the
    [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s; `nfsThumbnail` is the [Spec: Thumbnail](../issues/97-spec-thumbnail.md)'s
    name; the names of the Magellan and Toggler specs are building-blocks 1.3's, aligned by the class-rule
    consistency review;" with "`nfsGridX` and `nfsCell` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s,
    `nfsThumbnail` the [Spec: Thumbnail](../issues/97-spec-thumbnail.md)'s, `nfsCallout` the
    [Spec: Callout](../issues/89-spec-callout.md)'s, and `nfsTitleBar`, `nfsTitleBarLeft`, and `nfsTopBar` the
    [Spec: Top Bar](../issues/86-spec-top-bar.md)'s;" and the clause "and the Prototyping Utilities spec has not
    named its directive" takes R41's wording.
  - [xy-grid](../specs/xy-grid.md), [thumbnail](../specs/thumbnail.md), [magellan](../specs/magellan.md),
    [toggler](../specs/toggler.md): none for this item. [thumbnail](../specs/thumbnail.md) near line 377 is an
    additional placeholder (A7).
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R12: Smooth Scroll's Menu and Top Bar names

- **Decision.** The names match the published specs: `NfsMenu` (`ul[nfsMenu]`, entry point
  `ngx-foundation-sites/menu`) with its `orientation` Variant input, and `NfsTopBar` (`[nfsTopBar]`,
  `ngx-foundation-sites/top-bar`). Only the deferral sentence changes (CR-C).
- **Evidence.** `specs/menu.md:123`, `:160`; `specs/top-bar.md:118-119`, `:149`; `specs/smooth-scroll.md:108-112`,
  `:236-258`, `:309`, `:404-408`.
- **Per-spec changes.**
  - [smooth-scroll](../specs/smooth-scroll.md): near line 112, replace `The names `NfsMenu`, `orientation`, and
    `NfsTopBar` are the ones the out-of-scope triage and building-blocks 1.4 give; the Menu and Top Bar specs own
    them, and the class-rule consistency review aligns this spec's examples if their final names differ.` with
    `The names are the published ones: `NfsMenu` (`ul[nfsMenu]`) and its `orientation` Variant input from the
    [Spec: Menu](../issues/85-spec-menu.md), and `NfsTopBar` (`[nfsTopBar]`) from the [Spec: Top Bar](../issues/86-spec-top-bar.md).`
- **Shared-document changes.** None.
- **Rating.** Impact LOW (one sentence); confidence HIGH. Decided.

### R13: the Interchange `httpResource` table

- **Decision.** Show the Table's `hover` there, and give the table the caption the Table spec requires of every
  `nfsTable` host (its development name check, D9). The component then lists `NfsTable` in `imports` (CR-D).
- **Evidence.** specs/interchange.md:544-555 (plain `<table>...</table>`, no `imports`); specs/table.md:88 (`hover`
  Variant input), :107 (entry point `ngx-foundation-sites/table`), :148 (no-name warning), :164-166; issues/127:110.
- **Per-spec changes.**
  - [interchange](../specs/interchange.md), the `app-product-table` example (near line 544): replace
    `selector: 'app-product-table',` + the template's `<table>...</table>` with:
    ```ts
    @Component({
      selector: 'app-product-table',
      imports: [NfsTable],
      template: `
        @if (products.hasValue()) {
          <table nfsTable hover>
            <caption>Products</caption>
            ...
          </table>
        }
      `,
    })
    ```
    and add after the block: "`NfsTable` comes from `ngx-foundation-sites/table`; `hover` is the
    [Spec: Table](../issues/92-spec-table.md)'s Variant input for Foundation's `.hover`, and the caption names the
    table, as that spec requires."
  - [table](../specs/table.md): none.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (one example); confidence HIGH (names from the published Table spec). Decided.

### R14: every close button's 2.5.8 row points to the `nfs-close-button` floor

- **Decision.** The six rows already hold for the close button: each names the `nfs-close-button` floor (building-blocks
  1.10, Close Button bullet) and none of the six Library mixins adds a close-button target-size rule. The Callout's
  `data-nfs-close-button` room rule is a 1.4.12 padding rule, not a target-size rule (it is R25's). One stale clause
  sits in the Triggers row beside the close button: it gives the menu icon a "hit area" in `nfs-top-bar`, where the
  Top Bar spec (D6) and ADR 0012's 2026-09-28 note give it a 24 by 24 px border box in `nfs-menu-icon`, and a
  pseudo-element hit area is the technique building-blocks 1.10 rejects. The same stale words recur three more times
  in the Triggers spec. All four are corrected here.
- **Evidence.** callout.md:195, reveal.md:380 and D28 (:619), toggler.md:276, button.md:254, off-canvas.md:389 and
  D20 (:612), :743 ("Removed by the class-rule revision: the panel-scoped `.close-button` 24 px rule"), triggers.md:260;
  no `.close-button` size rule in the Library mixin sections of reveal, off-canvas, callout, toggler (`rg` over
  `\.close-button` with `min-|24|size|target`). Menu icon: top-bar.md:251, D6 (:477); adr/0012:29 ("The menu icon's
  24 px box moves from `nfs-responsive-toggle` to `nfs-menu-icon`, not to the `nfs-top-bar` the triage expected");
  building-blocks 1.10, Target size bullet ("A transparent hit-area pseudo-element is not used"); stale text at
  triggers.md:260, :344, :486, :583.
- **Per-spec changes.**
  - [callout](../specs/callout.md), [reveal](../specs/reveal.md), [toggler](../specs/toggler.md),
    [button](../specs/button.md), [off-canvas](../specs/off-canvas.md): Already holds (lines above); confirm.
  - [triggers](../specs/triggers.md):
    - 2.5.8 row (near line 260): replace `an `nfsMenuIcon` host through the 24 by 24 px hit area the [Spec: Top Bar](../issues/86-spec-top-bar.md) gives every menu icon in its Library mixin (`nfs-top-bar` in the out-of-scope triage and ADR 0012's dated note, which move it there from `nfs-responsive-toggle`), with or without ResponsiveToggle and inside or outside a title bar.`
      with `an `nfsMenuIcon` host through the 24 by 24 px border box that the `nfs-menu-icon` Library mixin gives every menu icon, a transparent border around Foundation's unchanged 20 by 16 px drawing ([Spec: Top Bar](../issues/86-spec-top-bar.md), D6), with or without ResponsiveToggle and inside or outside a title bar.`
    - Layer 1 paragraph (near line 344): replace `among them `nfs-close-button` and the Top Bar spec's, whose floor and hit area those hosts need.`
      with `among them `nfs-close-button` and `nfs-menu-icon`, whose 24 px boxes those hosts need.`
    - OffCanvas usage comment (near line 486): replace `nfsMenuIcon and nfsCloseButton bring their own 24 px hit area and floor`
      with `nfsMenuIcon and nfsCloseButton bring their own 24 px boxes`.
    - Sass subsection, item (5) (near line 583): replace `a missing `nfs-close-button` or Top Bar include takes the 24 px floor or hit area off those hosts`
      with `a missing `nfs-close-button` or `nfs-menu-icon` include takes the 24 px box off those hosts`.
- **Shared-document changes.** None (building-blocks 1.10 and ADR 0012 already say this).
- **Rating.** Impact LOW (wording of one spec; the rule is recorded); confidence HIGH (Top Bar D6, ADR 0012's note, and
  building-blocks 1.10 agree). Decided.

### R15: Orbit's bullets under forced colours, and one statement of the forced-colours findings

- **Decision.**
  1. Orbit gets a forced-colours rule for its bullets, in the Switch's form: `nfs-orbit` emits, inside
     `@media (forced-colors: active)`, `.orbit-bullets button { border: 1px solid CanvasText; }` and
     `.orbit-bullets button.is-active { background-color: Highlight; }`, with no `forced-color-adjust`. The
     arrows and the caption get no rule: the browser forces their text to `CanvasText` and they stay readable.
  2. The Switch's rule (b) has the defect the Top Bar's re-run warned of, in its own form: Foundation's more
     specific focus selectors win the cascade and the browser then forces their author colour to Canvas. Its
     knob and on-track selectors also name Foundation's `:focus-visible` forms (per-spec changes below).
  3. One shared statement of the forced-colours findings goes into building-blocks 1.10 as a new bullet
     (quoted below). It fixes where a Library mixin repaints (a control whose only drawing forced colours
     remove), which system colours it uses, when `forced-color-adjust: none` is set, the every-selector rule
     (in both forms), the transparent-border fact, the WebKit skip and its reason, and what e2e assertions may
     assert: pixel equality with a reference swatch, or "differs from" a swatch or Canvas; never a contrast
     ratio that involves `Highlight`, and every read taken after any transition on the element has finished.
  4. The Slider's, the Switch's, and the Progress Bar's WebKit skip reasons take the shared wording; the Slider's
     rule 13 already gives a system colour to every selector through which Foundation or the library colours
     its thumbs and fill (confirmed against Foundation's `forms/_range.scss`: the thumb is coloured only on its
     pseudo-elements, the focus ring only by rule 6), and the Top Bar's D16 is the source of the statement, so
     neither changes otherwise. The Progress Bar keeps D16 (no rule).
- **Evidence.**
  - Orbit bullets, `foundation` variant, forced colours on: Chromium paints every bullet Canvas on Canvas
    (centre and ring 1:1 against the page) and the selected bullet equals the others (1:1), light and dark;
    Firefox paints them ButtonFace, 1.211:1 against its Canvas, and the selected one equals the others (1:1).
    So the bullets, one of the two pointer ways to pick a slide and the only selected-slide indicator, vanish
    (`measure-out.json`). Outside forced colours the same CSS gives the spec's figures (inactive 3.423:1 on the
    page, active 5.735:1 from inactive), a control on the measurement.
  - `forced-a`: Chromium shows every bullet with a ring (17.756 to 19.296:1 against the page at the ring's top
    pixel) and the selected one filled `Highlight` (15.134:1 on Canvas in the light palette, 14.371:1 in the
    dark one); Firefox shows the ring (19.562 to 20.117:1), the selected one `Highlight` (2.941:1 on Canvas, its
    emulation palette) and unselected ones ButtonFace (2.429:1 from the selected one). The selected bullet stays
    `Highlight` while hovered and while keyboard-focused in both engines (`orbit-active-states.mjs`); the 24 by
    24 px box is unchanged (border-box). `forced-b` draws the same in Chromium and draws unselected bullets
    Canvas in Firefox, at the cost of overriding the theme's button colour and a rule per Foundation selector
    (rest, `:hover`, `.is-active`); `forced-a` covers every Foundation selector without that: Foundation's rest
    and `:hover` colours are forced away by the browser, and the library's `.is-active` rule has the same
    specificity as Foundation's and comes later.
  - Arrows and caption, `foundation` variant, forced colours on: the arrow band resolves to Canvas at the band's
    alpha over the image in Chromium (rgb(127,127,127) or rgb(128,128,128) over the opposite extreme, so a
    `CanvasText` glyph keeps at least 3.95:1 on it) and to an opaque ButtonFace in Firefox (glyph 17.343:1); the
    caption band keeps its alpha in both engines, and its `CanvasText` text measures 7.371:1 over a black image
    and 21:1 over white in the light palettes, 21:1 and 5.742:1 in Chromium's dark palette. Chromium also paints
    a Canvas backplate behind text runs (1,341 of 6,720 pixels of the first caption line over the white half
    are exactly Canvas while the band there is rgb(102,102,102); `backplate.mjs`). No rule is needed there, the
    same reasoning as the Progress Bar's D16 (the information survives).
  - WebKit: `(forced-colors: active)` matches under emulation and nothing is forced (every WebKit row keeps the
    author colours); `forced-a` there paints the selected bullet WebKit's `Highlight` beside the author's
    `$dark-gray` bullets (1.093:1 apart), which no Safari user meets, because Safari has no forced-colours mode.
    This is the Top Bar's finding (issues/148:109-115) confirmed on a second component.
  - Firefox's emulation palette ignores the colour scheme: Canvas is rgb(255,255,255) in both (every Firefox row;
    `backplate.mjs`), so its "dark" runs repeat the light one.
  - Switch, spec's rule (b), forced colours on (`switch.mjs`, Chromium and Firefox, both schemes): at rest the
    off knob is `CanvasText` and the on track `Highlight` (as the spec measured); after a real Tab the focused
    off switch's knob is Canvas on its Canvas track and the focused on switch's track is Canvas, so a focused
    switch shows only its ring and border and its state cannot be seen. Cause: Foundation's
    `input:focus-visible ~ .switch-paddle::after` (specificity 0,2,2) beats the library's `.switch-paddle::after`
    (0,1,1), and `input:checked:focus-visible ~ .switch-paddle` (0,3,1) beats `.switch-input:checked ~
    .switch-paddle` (0,3,0); the browser forces the winning author colour. The `fixed` variant keeps the knob
    `CanvasText` and the on track `Highlight` while focused, in both engines and schemes. The spec's e2e case
    checks the ring after a Tab, not the knob or the track, so it did not see this.
  - The Switch's and Slider's forms (system colours without `forced-color-adjust`, and `forced-color-adjust:
    none` where the browser would drop the drawing) both hold where every relevant selector is covered: an
    author system colour survives forced colours in Chromium and Firefox (`switch-debug2.mjs`: a
    `background: Highlight` on a `div` and on the paddle both compute to the palette's Highlight).
- **Per-spec changes.**
  - [orbit](../specs/orbit.md):
    - Sass (1), the sentence before the rules table: replace `plus the additions for WCAG 2.2 AA and the
      scrollbar (rules 0a, 0b, 9 to 12)` with `plus the additions for WCAG 2.2 AA, the scrollbar, forced
      colours, and long caption words (rules 0a, 0b, 9 to 14)` (rule 14 is R26's).
    - Sass (1), a new last row of the rules table: `| 13 | Inside @media (forced-colors: active): .orbit-bullets
      button; .orbit-bullets button.is-active | border: 1px solid CanvasText; the selected bullet
      background-color: Highlight | Foundation draws the bullets, borderless buttons, with a background only,
      which forced colours replace with Canvas (Chromium) or ButtonFace (Firefox), so every bullet and the
      selected state vanish (measured, D27); CanvasText on Canvas is the pair CSS Color 4 guarantees; Highlight is
      the system colour of a selection; no forced-color-adjust, because the browser keeps an author system colour
      and the rest of the bullet then follows the user's theme; the library's .is-active selector has
      Foundation's specificity and comes after it, and Foundation's rest and hover colours are forced away, so no
      Foundation selector keeps an author colour |` (written with the table's backtick code spans).
    - Sass (5), Missing include: after `the arrow glyphs sit on the bare image,` insert `the bullets disappear
      under forced colours,`.
    - WCAG table: after the 1.4.11 row, add `| 1.4.11 Non-text Contrast, forced colours | Under forced-colors:
      active the bullets take Canvas in Chromium (1:1 against the page) and ButtonFace in Firefox (1.211:1), and
      the selected bullet matches the others (1:1), measured in both engines with the light and dark palettes;
      rule 13 draws a CanvasText ring on every bullet and fills the selected one with Highlight (15.134:1 and
      14.371:1 on Canvas in Chromium's palettes, 2.941:1 in Firefox's emulation palette, 6.799 to 11.806:1 in the
      four Windows 11 contrast themes). The arrows and the caption need no rule: the browser forces their text to
      CanvasText over a band that keeps its alpha (at worst 7.371:1 for the caption and 3.95:1 for an arrow
      glyph, over the opposite image extreme), and Chromium paints a Canvas backplate behind the text | e2e under
      forcedColors 'active' in Chromium and Firefox; not run in WebKit (the shared reason, building-blocks 1.10) |`.
    - Playwright e2e, Storybook half: add the bullet `- Forced colours (Chromium and Firefox,
      page.emulateMedia({forcedColors: 'active'}) with colorScheme 'light' and 'dark'; skipped in WebKit, see the
      WCAG table): in orbit--basics, the pixel at the top of each bullet's ring differs from the page's Canvas, the
      selected bullet's centre equals a Highlight reference swatch the test adds (forced-color-adjust: none), and
      every other bullet's centre differs from it; after ArrowRight the second bullet's centre equals it.`
    - Node-level Sass compile test: replace `including the 24 px bullet floor and the arrow background from
      $orbit-control-background-hover,` with `including the 24 px bullet floor, the arrow background from
      $orbit-control-background-hover, and rule 13's forced-colours block,`.
    - Design decisions: add `| D27 | Rule 13: under forced-colors: active, nfs-orbit gives every bullet a 1 px
      CanvasText border and the selected bullet a Highlight background, without forced-color-adjust (2026-09-29,
      class-rule consistency review) | Measured in Chromium and Firefox, light and dark palettes: Foundation's
      bullets vanish and the selected one matches the others (1:1); with the rule every bullet shows its ring and
      the selected one Highlight, hovered and focused included; the arrows' and caption's text survives (forced to
      CanvasText over a band that keeps its alpha, 7.371:1 at worst for the caption), so they get no rule, as the
      Progress Bar's D16 reasons; the Switch's D12 form | No rule (the only selected-slide indicator and a pointer
      alternative to swiping vanish) (platform-or-a11y); the Slider's form with forced-color-adjust: none and
      system colours on rest, :hover, and .is-active (measured to draw the same, but it overrides the theme's
      button colour and needs a rule for every Foundation selector) (platform-or-a11y) |`.
    - Foundation behaviour changed or dropped: add `- Under forced colours the bullets keep a CanvasText ring and
      the selected bullet a Highlight fill, where Foundation's disappear (D27).`
  - [switch](../specs/switch.md):
    - Sass 1 (b): replace `` `.switch-paddle::after { background: CanvasText; }` `` with ``
      `.switch-paddle::after, .switch-input:focus-visible ~ .switch-paddle::after { background: CanvasText; }` ``,
      and `` `.switch-input:checked ~ .switch-paddle { background: Highlight; color: HighlightText; }` `` with ``
      `.switch-input:checked ~ .switch-paddle, .switch-input:checked:focus-visible ~ .switch-paddle { background:
      Highlight; color: HighlightText; }` ``, keeping the checked knob rule after the knob rule (equal
      specificity, so order decides). At the end of (b)'s Reason add: `Each state selector also names
      Foundation's more specific focus form (input:focus-visible ~ .switch-paddle::after, 0,2,2;
      input:checked:focus-visible ~ .switch-paddle, 0,3,1), because Foundation's author colour would otherwise
      win there and the browser forces it to Canvas: measured in Chromium and Firefox, a keyboard-focused off
      switch lost its knob and a focused on switch its Highlight track.` (as code spans).
    - D12: append to the Why cell: `Every selector through which Foundation colours the track or the knob gets
      its system colour, the :focus-visible forms included (measured, 2026-09-29, class-rule consistency
      review; building-blocks 1.10, forced colours).`
    - Playwright e2e, forced colours bullet: replace `(Chromium and Firefox; WebKit renders no forced colours)`
      with `(Chromium and Firefox; not run in WebKit, which matches the query under emulation but forces no
      colour, and Safari has no forced-colours mode)`, and replace `and after a Tab the ring pixel differs from
      Canvas.` with `and after a Tab the ring pixel differs from Canvas while the focused off switch's knob and
      the focused on switch's track keep the pixels they have at rest. Each read waits until the paddle's
      transition ($switch-paddle-transition, 0.25 s on Foundation's defaults) has finished, or the test emulates
      reducedMotion 'reduce', under which rule (c) shortens it to 1 ms.`
    - Layer 2 or 3 compile test (the line beginning `With the two required lines the include compiles and emits
      exactly`): holds; the forced-colours block it names is the revised (b).
  - [slider](../specs/slider.md): the WCAG row `1.4.11 Non-text Contrast, forced colours`, last cell: replace
    `Not run in WebKit: Playwright cannot emulate forced colours there, and Safari has no forced-colours mode to
    meet` with `Not run in WebKit: Playwright's WebKit matches (forced-colors: active) under emulation but forces
    no colour (measured by the [Re-run: Top Bar spec, out-of-scope survivors](../issues/148-rerun-top-bar-out-of-scope-survivors.md)
    and the class-rule consistency review), so rule 13 would apply over the author palette, and Safari has no
    forced-colours mode to meet`. Rule 13's selectors already cover every selector that colours the thumbs and
    fill: confirm, no change.
  - [progress-bar](../specs/progress-bar.md): the e2e forced colours bullet: replace `(Chromium and Firefox,
    which Playwright can emulate; WebKit renders no forced colours)` with `(Chromium and Firefox; not run in
    WebKit, which matches the query under emulation but forces no colour, and Safari has no forced-colours
    mode)`. D16 holds.
  - [top-bar](../specs/top-bar.md): holds (its D16 and e2e bullet are the source of the shared statement);
    confirm.
- **Shared-document changes.**
  - `building-blocks.md` 1.10: a new bullet after the Switch bullet:
    > - Forced colours (2026-09-29, [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md); not a WCAG 2.2 AA criterion, but 1.4.11 and 1.4.1 hold in every colour mode): a control whose only drawing forced colours remove, backgrounds and `box-shadow`s that the browser replaces with Canvas or drops, is drawn again by its Library mixin inside `@media (forced-colors: active)`, in system colours: `CanvasText` on `Canvas`, the one pair CSS Color 4 guarantees to contrast, for shapes and edges; `Highlight` for a selected or on state; `GrayText` for a disabled one (the Switch, the Slider's thumbs and fill, the menu icon's bars, the Orbit's bullets). A graphic whose information is also in text the browser forces to `CanvasText` gets no rule (the Progress Bar's meter, the Orbit's arrows and caption, measured). The browser keeps a system colour the author writes, so a rule sets `forced-color-adjust: none` only where the browser would otherwise drop the drawing (the menu icon's `box-shadow` bars, the Slider's `appearance: none` thumbs), never on a container, because it is inherited and keeps the author's colours over the user's theme (the Slider's D20). In either form, every selector through which Foundation or the library colours the element gets its system colour, more specific ones included, because the most specific author colour wins the cascade and is then forced to Canvas, or kept as authored under `forced-color-adjust: none` (measured: the Top Bar's `.menu-icon.dark::after` kept `$black`; the Switch's `:focus-visible` forms made a focused switch lose its knob or its on track). A transparent border is drawn in the forced border colour (`CanvasText` in Chromium, grey in Firefox), so a box grown with one gets a visible frame unless the rule paints it `Canvas`. Tests run in Chromium and Firefox under `emulateMedia({forcedColors: 'active'})`; WebKit is not run, because Playwright's WebKit matches the query under emulation but forces no colour, so a rule gated on it applies over the author palette, and Safari has no forced-colours mode (macOS and iOS contrast settings are `prefers-contrast`). An assertion compares a pixel with a reference swatch the test adds (`forced-color-adjust: none` with a system colour) or asserts that it differs from one or from Canvas, never a contrast ratio that involves `Highlight`: Firefox's emulation palette puts `Highlight` on `Canvas` at 2.941:1 and ignores the colour scheme, where Chromium's emulated palettes give 15.134:1 and 14.371:1 and the four Windows 11 contrast themes 6.799 to 11.806:1. A read waits until any transition on the element has finished (Foundation's switch paddle transitions `all`).
  - `README.md`: no change to the Orbit row (the spec records the measurement).
- **Rating.** Orbit rule 13: impact LOW (a Library mixin rule inside a media query, no API, additive), confidence
  HIGH (measured in two engines and both schemes, the Switch's existing form). Switch rule (b) fix: impact LOW,
  confidence HIGH (measured, cause identified by specificity and confirmed by the fixed variant). Shared
  statement and wording: impact LOW (documentation of measured facts and test rules), confidence HIGH. Decided.

### R16: the `hidden`-attribute notes

- **Decision.** One shared sentence, carried by every spec whose Foundation class sets `display` over normalize's
  `[hidden]`, with its own classes filled in, and pointing at the others, the Toggler's `.is-hidden`, and
  building-blocks 1.10. The three hiding means are the ones building-blocks 1.10 already names: `@if`, a Toggler in
  Visibility mode, and the Visibility Classes' always-hide form (`nfsVisibility` with a bare `hideFor`, which sets
  `.hide`). The Thumbnail's notes lack the third; the XY Grid and Flex Grid notes (not in the routed list, same
  rule) already carry it. The Float Grid's note stays as it is: there `hidden` does hide (measured by its ticket).
- **Evidence.** specs/thumbnail.md:13, :25, :303 (D9: `@if` or a Toggler); specs/float-classes.md:13, :308;
  specs/flexbox-utilities.md:13, :382, :515; specs/xy-grid.md:591; specs/flex-grid.md:562; specs/float-grid.md:583;
  specs/toggler.md:109, :451 (D3: `hidden` plus `.is-hidden`); specs/visibility-classes.md:109, :287 (bare `hideFor`
  sets `.hide`); building-blocks.md 1.10, hidden bullet; research/out-of-scope-triage-2.md:136.
- **Per-spec changes.** The shared sentence, template (fill `<element>` and `<classes>`):
  "The `hidden` attribute alone does not hide <element>: Foundation's <classes> set `display` after normalize's
  `[hidden] { display: none }` at equal specificity (measured in Chromium, Firefox, and WebKit), as building-blocks
  1.10 records. Remove it with `@if`, or hide it with a Toggler in Visibility mode, which binds Foundation's
  `.is-hidden` ([Spec: Toggler](../issues/17-spec-toggler.md), D3), or with `nfsVisibility` and a bare `hideFor`
  ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)); the Thumbnail, Float Classes, Flexbox
  Utilities, XY Grid, and Flex Grid specs state the same rule for their classes."
  - [thumbnail](../specs/thumbnail.md): the note that carries the rule (Further Notes, or the Out of Scope line
    nearest D9) takes the sentence with "a thumbnail" and "`.thumbnail` sets `display: inline-block`"; near line 25
    replace "the hiding rule (`@if`, or a Toggler, which binds Foundation's `.is-hidden`)" with "the hiding rule
    (`@if`, a Toggler, which binds Foundation's `.is-hidden`, or `nfsVisibility` with a bare `hideFor`)"; D9's
    decision cell (near line 303) "A thumbnail is hidden with `@if` or with a Toggler in visibility mode, never with
    a bare `hidden`" becomes "A thumbnail is hidden with `@if`, a Toggler in visibility mode, or `nfsVisibility` with
    a bare `hideFor`, never with a bare `hidden`".
  - [float-classes](../specs/float-classes.md) near line 308, [flexbox-utilities](../specs/flexbox-utilities.md)
    near line 515, [xy-grid](../specs/xy-grid.md) near line 591, [flex-grid](../specs/flex-grid.md) near line 562:
    each such note becomes the shared sentence with its own element and classes (`.float-center`'s `display: block`;
    `.flex-container` and `.grid-x`; `.grid-x`, `.grid-y`, `.cell-block-container`; the Flex Grid's `.row`), keeping
    its measured detail (which plain classes stay hidden) as a following sentence.
  - [toggler](../specs/toggler.md): none (D3 is the reference).
- **Shared-document changes.** building-blocks.md 1.10, hidden bullet: replace "the specs hide such an element with
  `@if`, a Toggler in Visibility mode (which binds `.is-hidden`), or the Visibility Classes' hide directive
  ([Spec: Flexbox Utilities](issues/103-spec-flexbox-utilities.md), Notes)." with "the specs hide such an element
  with `@if`, a Toggler in Visibility mode (which binds `.is-hidden`), or `nfsVisibility` with a bare `hideFor`
  (Foundation's `.hide`), measured for `.thumbnail`, `.float-center`, `.flex-container`, `.grid-x`, `.grid-y`,
  `.cell-block-container`, and the Flex Grid's `.row` by the [Spec: Thumbnail](issues/97-spec-thumbnail.md),
  [Spec: Float Classes](issues/105-spec-float-classes.md), [Spec: Flexbox Utilities](issues/103-spec-flexbox-utilities.md),
  [Spec: XY Grid](issues/99-spec-xy-grid.md), and [Spec: Flex Grid](issues/101-spec-flex-grid.md)."
- **Rating.** Impact LOW (wording; the three means exist already); confidence HIGH (each spec measured its classes).
  Decided.

### R17: `exportAs` on the Button family and the Forms directives; `size` on a grouped button

- **Decision.** Building-blocks 1.3's `exportAs` rule (2026-09-28) decides: a directive has an `exportAs` only where a template needs the instance (state, methods, a Trigger target); "a directive with no state or method to read has none". `NfsButton` and `NfsCloseButton` have no model, output, method, or state of their own: their only members are the consumer's own inputs, which the template already holds. Every other directive whose members are only inputs has no `exportAs` (Button Group D12, Forms D8, the grids, the Prototyping Utilities: "no `exportAs` (it has no state or method to read)"), so the two are the outliers (correction, 2026-09-29, closing pass: they are not the only ones; `NfsBadge`, `NfsLabel`, `NfsCallout`, `NfsResponsiveEmbed`, `NfsDrilldownWrapper`, `NfsDrilldownBack`, `NfsMenu`, `NfsTopBar`, `NfsMenuIcon`, `NfsVisibility`, `NfsTabsGroup`, and `NfsEqualizer` also exported a name with only inputs and outputs, and the closing pass extends this decision to them), and their stated reasons ("exposes the nine input signals", "parity with `nfsButton` at no code cost", ticket 83 Q14) are the reading the rest of the bundle rejects. Both drop `exportAs`. Adding one later is additive (Button Group D12), and ADR 0045's deprecation policy starts at the first release, so the removal costs no deprecation. No spec writes `#x="nfsButton"` or `#x="nfsCloseButton"` (swept: no hit in `specs/`). `nfsButtonGroup` and the Forms directives keep none, now for the same reason. The second check holds: no spec's example sets `size` on an `nfsButton` inside `nfsButtonGroup`; the three `size` hits are a button inside a Dropdown pane placed after the group (button-group.md near line 412, dropdown.md near line 657) and the labelled development-warning example (button-group.md near line 433, CR-A (b)).
- **Evidence.** building-blocks.md 1.3 `exportAs` bullet (line 56); architecture-guide.md P13 (line 200, "none otherwise"; line 204 preferred "no `exportAs` on `NfsCardDivider`"); button.md lines 135, 173, 218; close-button.md lines 103, 120; button-group.md line 116 and D12 (line 391); forms.md line 182 and D8 (line 444); prototyping-utilities.md line 196; issues/83-spec-close-button.md line 60 (Q14: "Against `exportAs`: nothing needs it today"); `rg '="nfsButton"|="nfsCloseButton"' specs/` finds nothing; `rg -A15 nfsButtonGroup specs/*.md | rg size` finds only the three hits named above.
- **Per-spec changes.**
  - [button](../specs/button.md): near line 135 replace "`exportAs: 'nfsButton'`; standalone" with "no `exportAs`; standalone". Near line 173 replace the bullet "`exportAs: 'nfsButton'` exposes the nine input signals to template references (for example a sibling Tooltip reading `button.disabled()`)." with "No `exportAs`: the directive owns no state or method a template could read, only the consumer's own inputs (building-blocks 1.3); adding one later is additive." In the Material comparison (near line 218) the `exportAs` row's last cell becomes "None (building-blocks 1.3: no state or method to read)".
  - [close-button](../specs/close-button.md): near line 103 replace "`exportAs: 'nfsCloseButton'`; standalone" with "no `exportAs`; standalone". Near line 120 replace "`exportAs: 'nfsCloseButton'` exposes the two input signals to template references, as `nfsButton` does." with "No `exportAs`: the directive owns no state or method a template could read (building-blocks 1.3), as `nfsButton` has none; adding one later is additive." Any design-decision row or Material row that restates the `exportAs` follows.
  - [button-group](../specs/button-group.md): D12 (near line 391), rejected alternative: replace "`exportAs: 'nfsButtonGroup'` for parity with `nfsButton` and `nfsCloseButton`" with "`exportAs: 'nfsButtonGroup'` (building-blocks 1.3: a directive with no state or method to read has none; `nfsButton` and `nfsCloseButton` have none either)". Size check: already holds; confirm.
  - [forms](../specs/forms.md): already holds (line 182, D8); confirm.
  - [dropdown](../specs/dropdown.md): the split-button pane's `size="small"` button sits after the group; already holds; confirm.
- **Shared-document changes.** None (building-blocks 1.3 already states the rule; P13 already says "none otherwise").
- **Rating.** Impact LOW (two `exportAs` names removed before the first release; restoring one is additive and needs no deprecation under ADR 0045); confidence HIGH (the later record states the rule, and every other input-only directive in the bundle follows it). Decided.

### R18: Button Group's `nfsAlign`

- **Decision.** Already applied as ticket 103 proposed: the group's alignment is `nfsFlexAlign` with `alignX`,
  written beside `nfsButtonGroup`.
- **Evidence.** specs/button-group.md:100, :293, :388 (D9); issues/103:157-166.
- **Per-spec changes.** [button-group](../specs/button-group.md): Already holds; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R19: Aria's Toolbar unused by the Button Group

- **Decision.** The spec already lists it with the right reason: Implementation level (button-group.md line 164: "This is a different pattern, not a fallback from an Aria building block (D10)"), D10 (line 389), and Out of Scope (line 365). Nothing changes in the spec. The README's "`@angular/aria` building blocks not used" section lists the fallbacks ticket 75 decided and then says "No available Aria pattern was declined elsewhere", which the 25 new specs have made false: three specs decline Aria's `Toolbar`, the Menu declines `ngMenuBar`/`ngMenu`/`ngToolbar`, and three decline Aria's `Grid`, each as a different pattern and not a fallback. The closing pass replaces that paragraph so the list the `AGENTS.md` confirmation rule relies on is complete.
- **Evidence.** button-group.md lines 164, 365, 389; top-bar.md D14 (line 485); pagination.md D14 (line 385) and line 176; menu.md Implementation level (line 203); table.md D14 (line 399); xy-grid.md D13 (line 476); flex-grid.md D13 (line 453); float-grid.md line 457 (no grid roles, no Aria named); README.md line 198.
- **Per-spec changes.**
  - [button-group](../specs/button-group.md): already holds (lines 164, 365, 389); confirm.
- **Shared-document changes.** README.md, section "`@angular/aria` building blocks not used", replace the paragraph "No available Aria pattern was declined elsewhere: `@angular/aria` 22.2 ships accordion, combobox, grid, listbox, menu, tabs, toolbar, and tree, and has nothing for Button, the Breakpoint service, the Anchored pane, Reveal, Off-canvas, Tooltip, Toggler, Responsive Toggle, Slider, Abide, Interchange, Equalizer, Sticky, Smooth Scroll, or Magellan." with:

  > The specs of the class-rule wave decline three more Aria patterns, each a different pattern from the component's own and not a fallback from a building block that fits it, so none needs the confirmation `AGENTS.md` asks for: Aria's `Toolbar` for the [Spec: Button Group](issues/82-spec-button-group.md) (D10: a composite with one tab stop and arrow keys, which Foundation's Button Group does not have; the APG keeps toolbars for three or more controls, and a split button has two; `nfsButton` on an `ngToolbarWidget` host fights its `disabled` and `aria-disabled` bindings), and for the [Spec: Top Bar](issues/86-spec-top-bar.md) (D14) and the [Spec: Pagination](issues/87-spec-pagination.md) (D14), because a toolbar's roving tab stop does not suit site navigation ([ADR 0004](adr/0004-menus-use-disclosure-navigation.md)); `ngMenuBar`, `ngMenu`, and `ngToolbar` for the [Spec: Menu](issues/85-spec-menu.md) (Implementation level, ADR 0004, as item 6); and Aria's `Grid` for the [Spec: Table](issues/92-spec-table.md) (D14: an interactive composite, which a static table is not) and the [Spec: XY Grid](issues/99-spec-xy-grid.md) and [Spec: Flex Grid](issues/101-spec-flex-grid.md) (D13: a CSS layout grid is not the APG Grid composite). No other available Aria pattern was declined: `@angular/aria` 22.2 ships accordion, combobox, grid, listbox, menu, tabs, toolbar, and tree, and has nothing for Button, Close Button, Switch, Callout, Progress Bar, the other CSS-only components, layout systems, and utility families, the Breakpoint service, the Anchored pane, Reveal, Off-canvas, Tooltip, Toggler, Responsive Toggle, Slider, Abide, Interchange, Equalizer, Sticky, Smooth Scroll, or Magellan.
- **Rating.** Impact LOW (an index sentence; no API); confidence HIGH (each spec's own decision row is quoted). Decided.

### R20: the Slider's and the Switch's focus rings

- **Decision.** Align them on the Switch's source and check. Both are form controls whose native focus ring
  Foundation removes (the Slider's `input[type='range']:focus { outline: 0 }`) or hides (the Switch's
  `opacity: 0` input), and Foundation's one focus setting for form controls is `$input-border-focus`
  (`settings/_settings.scss:466`, used by `forms/_text.scss` and `forms/_select.scss`; Foundation has no slider
  or switch focus setting). The Slider's rule 6 becomes `outline: $input-border-focus; outline-offset: 2px` on
  its focused thumbs (2 px stays a literal, because Foundation has no slider spacing setting; the Switch keeps
  `$switch-paddle-offset`, Foundation's own switch spacing), and `nfs-slider`'s rule 0a gains the Switch's check:
  `@error` when the colour of `$input-border-focus`, read with Foundation's `get-border-value()`, is under 3:1
  against `$body-background`. Width follows the setting (1 px under the Forms spec's required `1px solid $black`),
  as the Switch's and Foundation's field focus borders do. Under forced colours nothing changes: rule 13 already
  sets `outline-color: CanvasText` on focused thumbs.
- **Evidence.** The Switch's D9 already rejected the Slider's ring as its alternative: "the Slider's `2px solid
  $black` ring, offset 2 px (a library colour no dark theme can change)" (`specs/switch.md`, D9). The Slider's
  rule 0a checks the fill and thumb against the track only (`specs/slider.md`, rule 0a), so a consumer who sets a
  dark `$body-background` compiles an invisible `$black` ring with no error: 2.4.7 then fails silently, which the
  map's accessibility preference forbids (a failing default gets a setting or a check, never advice), and axe
  checks no focus ring. Building-blocks 1.13 item (2) asks each rule to read the consumer's settings; the
  Switch's ring does, from Foundation's form focus setting, and its check covers the dark page. The Switch
  measured `outline: $input-border-focus` as a 1 px ring in three engines; the Slider's rule 6 mechanism (an
  outline on the thumb pseudo-elements) is unchanged, only its value.
- **Per-spec changes.**
  - [slider](../specs/slider.md):
    - Sass (1) rule 6, Declarations: replace `outline: 2px solid $black; outline-offset: 2px` with `outline:
      $input-border-focus; outline-offset: 2px`; Why cell: append `; the ring takes Foundation's focus setting
      for form controls, as the Switch's does, so a dark theme changes it and rule 0a checks it`.
    - Sass (1) rule 0a: after the thumb clause, add `, or when the colour of $input-border-focus, read with
      Foundation's get-border-value(), is below 3 against $body-background (the focus ring of rule 6, WCAG 2.4.7
      and 1.4.11)`.
    - Sass (2): add `$input-border-focus` and Foundation's `get-border-value()` to the settings and functions
      reused.
    - WCAG row 2.4.7: replace `the Library mixin draws a 2 px $black outline, offset 2 px, on the focused thumb
      (rule 6), and CanvasText under forced colours (rule 13), where $black would vanish on a dark theme` with
      `the Library mixin draws $input-border-focus as an outline, offset 2 px, on the focused thumb (rule 6),
      stops the compile when its colour is under 3:1 against $body-background (rule 0a), and draws it CanvasText
      under forced colours (rule 13)`; in its test cell, replace `the pixel just outside the focused thumb is the
      outline colour` with `the pixel just outside the focused thumb, at the outline offset plus half the outline
      width, is the outline colour`.
    - The e2e forced colours bullet: `the outline pixel just outside the focused thumb` stays; confirm the
      offset wording matches the 2.4.7 row.
    - Node-level Sass compile test: add `with $input-border-focus: 1px solid $black and $body-background:
      #0a0a0a (and passing slider colours) the compile stops naming $input-border-focus; with Foundation's
      default $input-border-focus it compiles (3.422:1 on #fefefe)`. Correction (2026-09-29, closing pass): the
      exact figure is 3.4230 in both modes, so the Slider, which does not floor, writes 3.42:1; 3.422:1 is the
      Switch's floored figure.
    - Design decisions: add `| D26 | Rule 6 draws $input-border-focus, offset 2 px, around a focused thumb, and
      rule 0a checks its colour at 3:1 against $body-background (2026-09-29, class-rule consistency review) |
      Foundation's one focus setting for form controls; a dark theme changes it; the Switch's D9 ring and check;
      the earlier 2px solid $black ring had no check and vanished on a dark page | The library's 2px solid $black
      (a library colour no dark theme can change, and no check covered it) (other) |`.
  - [switch](../specs/switch.md): D9's Rejected cell: replace `the Slider's 2px solid $black ring, offset 2 px
    (a library colour no dark theme can change) (other)` with `a library colour such as 2px solid $black, which
    no dark theme can change (the Slider's first ring, aligned on $input-border-focus by the class-rule
    consistency review) (other)`. Nothing else changes.
- **Shared-document changes.** `building-blocks.md` 1.10, the Forms bullet: append `The Switch's and the
  Slider's focus rings, which their Library mixins draw because Foundation hides or removes the native one, take
  the same setting (outline: $input-border-focus), and each mixin stops the compile when its colour is under 3:1
  against $body-background.` (as code spans). Table B's Slider row names no ring; no change there.
- **Rating.** Impact LOW (one Library mixin rule's value and one compile check; no API; the ring stays a
  1.4.11-checked outline), confidence HIGH (the Switch's recorded D9 reasoning, the factual dark-page gap, and
  Foundation's settings). Decided.

### R21: the Switch's Table D row, README row, and overrides lines

- **Decision.** All three hold against the Switch spec as it stands after
  [Re-run: Switch spec, out-of-scope survivors](../issues/147-rerun-switch-out-of-scope-survivors.md); the README
  row gains the re-run as a measurement source, as the Top Bar's row gained its re-run.
- **Evidence.** Table D's Switch row (`building-blocks.md`, Table D) lists the five directives, the development
  checks including "radio switches that no named group holds" (147's proposal 1, applied), and `nfs-switch`'s
  ring, forced colours, reduced motion, `@error`, and `@warn`, matching `specs/switch.md` checks 1 to 6 and
  Sass (a) to (d). The building-blocks 1.10 Switch bullet matches the spec's required settings and ratios
  (1.625:1, 2.015:1). `storybook-conventions.md` section 5 has `$switch-background: #767676;` and
  `$switch-background-focus: scale-color($switch-background, $lightness: -10%);` with the spec named, and the
  `@include nfs-switch;` line names the ring, forced colours, reduced motion, and checks; their comments round
  the spec's 1.625:1 and 2.015:1 to 1.63:1 and 2.02:1, which stand under R4's ratio rule (each equals the value at its written precision). R15's
  change to Sass (b) keeps every one of these texts true ("forced-colours system colours").
- **Per-spec changes.** [switch](../specs/switch.md): none for R21.
- **Shared-document changes.** `README.md`, the CSS-only table's Switch row, last cell: replace `None needed;
  contrast, focus, forced colours, reduced motion, names, and geometry measured in [Spec: Switch](issues/84-spec-switch.md)` with `None needed; contrast, focus, forced colours, reduced motion, names,
  and geometry measured in [Spec: Switch](issues/84-spec-switch.md), the radio-group condition in the [Re-run: Switch spec, out-of-scope survivors](issues/147-rerun-switch-out-of-scope-survivors.md)`. Table D and the
  overrides lines: none.
- **Rating.** Impact LOW (index wording), confidence HIGH (compared line by line). Decided.

### R22, R53: Top Bar, Title Bar, and menu-icon classes; the submenu companion; `nfs-responsive-toggle`

- **Decision.** Holds, except four Triggers sentences that still name the menu icon's 24 px box as a "hit area" in
  `nfs-top-bar` or "the Top Bar include" and cite `nfs-responsive-toggle` as its old home. No spec writes
  `.top-bar`, `.top-bar-*`, `.title-bar`, `.title-bar-*`, `.menu-icon`, or `dark` as a class outside rendered
  output, a labelled copied-class case, Foundation's labelled markup, or Library mixin CSS. Every
  `$topbar-background: $white` line or requirement where a Top Bar holds submenus carries
  `$topbar-submenu-background: $topbar-background;` (Dropdown Menu, Nested menu, Responsive Menu, Responsive
  Toggle, Top Bar, storybook-conventions section 5); Magellan's, Sticky's, and Smooth Scroll's Top Bars show no
  submenus, so they need no companion (ticket 86 said so for Magellan). No spec includes `nfs-responsive-toggle`
  without an argument or for a menu icon; the Off-canvas spec says in its 2.5.8 row, D32, and Sass subsection
  that the box is `nfs-menu-icon`'s, and its panel-scoped close-button rule is recorded as removed. The menu
  icon's box is a transparent border on a content box, not a hit area (building-blocks 1.10, Target size
  bullet, which rejects a hit-area pseudo-element), and it lives in `nfs-menu-icon` (Top Bar D6, D7), not
  `nfs-top-bar`.
- **Evidence.** `rg -n 'class="[^"]*\b(top-bar|title-bar|menu-icon)'` and `rg -n 'class="[^"]*\bdark\b'` over
  `specs/`, each hit read (`specs/top-bar.md:294-372`, `:518-521`; `specs/responsive-toggle.md:293-317`,
  `:582`; `specs/triggers.md:306`, `:600`; `specs/dropdown-menu.md:437-443`; `specs/sticky.md:284`);
  `rg -n 'topbar-background|topbar-submenu-background'`; `rg -n 'nfs-responsive-toggle'` (specs clean apart from
  `specs/triggers.md:260`); `specs/top-bar.md:477-478` (D6, D7); `building-blocks.md` 1.10 Target size bullet;
  `specs/off-canvas.md:389`, `:624`, `:737`, `:743`.
- **Per-spec changes.**
  - [triggers](../specs/triggers.md):
    - The 2.5.8 row (near line 260), the story-gate paragraph (near line 344), the Off-canvas usage comment (near
      line 486), and the Sass paragraph (near line 583): R14's four replacements, which this item found too; R14's
      wording governs.
    - D13 (near line 426), replace `` `nfsMenuIcon` (by the out-of-scope triage) `` with `` `nfsMenuIcon` (the
      [Spec: Top Bar](../issues/86-spec-top-bar.md)) ``.
  - [top-bar](../specs/top-bar.md), [responsive-toggle](../specs/responsive-toggle.md),
    [off-canvas](../specs/off-canvas.md), [dropdown-menu](../specs/dropdown-menu.md): Already holds; confirm.
- **Shared-document changes.** None (building-blocks 1.10 and Table B already name `nfs-menu-icon`).
- **Rating.** Impact LOW (wording; the mixin is decided); confidence HIGH. Decided.

### R24: Breadcrumbs examples, the named `nav`, and the landmark check

- **Decision.** No consumer markup in the spec writes `breadcrumbs`, `disabled`, `current`, or `show-for-sr` as a class: every such hit is rendered output (breadcrumbs.md lines 244, 247, 260, 272), Foundation's docs markup quoted and labelled as such (lines 430-433), or the labelled input of the copied-class check (line 279), all compliant under CR-A (a), (b), (c). The landmark check's condition and wording already match the Pagination's word for word apart from the component name and the example's `aria-label` (pagination.md line 149, breadcrumbs.md line 152), which is the intended difference; no change. One trail is not in a named `nav`: the Router example of the Rendered HTML (line 267) and its output (line 272) are bare `ol` elements, which development check 1 would report. Both are wrapped in `<nav aria-label="Breadcrumb">`.
- **Evidence.** breadcrumbs.md lines 152, 196, 235-280, 307 ("Every trail in a story sits in a named `nav`"), 397-440; pagination.md lines 149, 188; `rg -B1 "<(ul|ol) nfsBreadcrumbs" specs/` shows the one trail without a `nav` (line 267).
- **Per-spec changes.**
  - [breadcrumbs](../specs/breadcrumbs.md): in Rendered HTML, under the comment `<!-- The Router marks the current page (server HTML rendered at /features/cloning) -->` (near line 266), wrap the consumer `<ol nfsBreadcrumbs>...</ol>` in `<nav aria-label="Breadcrumb">` and `</nav>`, indenting its lines by two spaces, and wrap the output `<ol class="breadcrumbs">...</ol>` that follows (near line 272) the same way, as the two blocks above it are. Everything else already holds; confirm.
  - [pagination](../specs/pagination.md): already holds (line 149); confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (one example's markup); confidence HIGH (the spec's own check 1 and its line 307 rule). Decided.

### R25: the `$anchor-color` override, the two closable stories, and close-button room under 1.4.12

- **Decision.**
  1. Link figures. Every quoted link ratio names the settings it holds for. A ratio on Foundation's defaults
     (with only the spec's own required settings) says "on Foundation's defaults"; it is the figure that
     justifies a required setting or a compile-time check, and it stays. A sentence about what a story shows or
     asserts uses the Storybook settings overrides, where `$anchor-color` is
     `scale-color($primary-color, $lightness: -15%)` (`#14679e`: 6.012:1 on `$body-background`, 4.858:1 on
     `$light-gray`) and `$anchor-color-hover` is 14 percent darker again (6.063:1 on `$light-gray`); the overrides
     only raise link contrast. The one spec sentence that states a story fact with the default figure is the
     Off-canvas's (below); the Storybook overrides comment for Off-canvas quotes a wrong figure (4.87:1; exact
     4.858:1).
  2. The two closable stories port two different Foundation examples: the Close Button docs page's "Making
     Closable" pair is a default and a success callout (`docs/pages/close-button.md:50-62`), the Callout docs
     page's is an alert and a success callout (`docs/pages/callout.md:124-138`). Both stories are right; each
     names its page. They share the hide, focus-move, and 24 px floor assertions; only `callout--closable`
     asserts the reserved 48 px padding, the Callout's own rule. The Close Button spec's claim that its stories
     need no override line stays true, but the stories render the Callout's required `$closebutton-color:
     #767676`, which the overrides carry. (R2 rewrites both examples' Motion values; nothing else
     differs.)
  3. Close-button room. No container spec other than the Callout adds a room rule, but the Reveal meets the same
     1.4.12 failure: measured at 320 by 800 CSS px with the text spacing on every element, the heading of
     Foundation's own Reveal example ("Awesome. I Have It.") runs 16.6 by 27 px under the close button's box in
     Chromium, Firefox, and WebKit, and not without the spacing (`overlap-out.txt`). Foundation's `.reveal` padding
     is `$reveal-padding` (1rem) and the medium close button sits 1rem from the edge, the Callout's geometry. The
     Reveal takes the Callout's mechanism: `NfsReveal` queries `nfsCloseButtonToken` and binds
     `data-nfs-close-button`, and `nfs-reveal` reserves the room on the button's side; measured, the rule removes
     the overlap in three engines (`overlap-fixed-out.txt`). The Off-canvas's docs example does not overlap
     (its menu links end before the button, measured in three engines), so the Off-canvas adds no rule and
     states the measured pass and its condition.
- **Evidence.** issues/89:173; storybook-conventions.md:196-210; specs/off-canvas.md:385; specs/callout.md:188,
  276, 343-344, 451 (D9, D10, rule 1(a)); specs/close-button.md:251, 258; specs/reveal.md:373-382 (no 1.4.12 row,
  "`nfs-reveal` adds no WCAG rule"), :754-770 (rules 1 to 7); Foundation `scss/components/_reveal.scss:77, 167-170`
  (`padding: $reveal-padding`, `.collapse` removes it); ratios `pairs-r25.txt`.
- **Per-spec changes.**
  - [off-canvas](../specs/off-canvas.md), the 1.4.3 row (near line 385): replace "which brings links to 4.65:1" with
    "which brings Foundation's `$anchor-color` links to 4.65:1 (6.01:1 with the Callout's required
    `$anchor-color`, which the Storybook overrides carry)". Add a 1.4.12 row after the 1.4.10 row: "| 1.4.12 Text
    Spacing | No panel text runs under the close button | Passes for Foundation's example: at 320 CSS px with the
    text spacing, the menu links end before the absolutely positioned button in Chromium, Firefox, and WebKit
    (measured by [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md));
    a panel whose first content is running text starts it below the button, as the recipes do | e2e: the text
    spacing case of `off-canvas--default` at 320 px asserts no text rectangle intersects the close button |" (the
    reviewer uses the spec's own default Story id if it differs).
  - [reveal](../specs/reveal.md):
    - API, `NfsReveal` host bindings: add "`[attr.data-nfs-close-button]`: `''` while `contentChild(nfsCloseButtonToken,
      {descendants: true})` finds a close button, else `null` (the Callout's hook, [Spec: Callout](../issues/89-spec-callout.md) D10);
      `nfsCloseButtonToken` comes from `ngx-foundation-sites/close-button`".
    - WCAG table, a 1.4.12 row after the 1.4.10 row: "| 1.4.12 Text Spacing | No dialog text runs under its close
      button: while `data-nfs-close-button` is on the dialog, `nfs-reveal` sets the padding on the button's side to
      `max($reveal-padding, <offset> + max(24px, <font size>))` over every close-button size (48 px on Foundation's
      defaults) | Fails for Foundation's own example: at 320 by 800 CSS px with the text spacing, its heading runs
      16.6 by 27 px under the button in Chromium, Firefox, and WebKit (measured by the class-rule consistency
      review) | e2e at 320 by 800 px with the text-spacing stylesheet: no text rectangle of `reveal--basic`
      intersects the close button's box; the dialog's right padding is 48 px |".
    - The sentence "The `nfs-reveal` mixin adds no WCAG rule: Foundation's defaults pass every check above" (near
      line 382) becomes "The `nfs-reveal` mixin adds one WCAG rule, the close-button room for 1.4.12 (rule 8):
      Foundation's defaults pass every other check above".
    - Sass subsection, rules table: add "| 8 | `.reveal[data-nfs-close-button]:not(.collapse)` | `padding-<side>:
      max($reveal-padding, <room>)`, where `<side>` is `nth($closebutton-position, 1)` and `<room>` lists, for each
      key of `$closebutton-size`, `calc(<that size's horizontal offset> + max(24px, <that size's font size>))` |
      1.4.12: Foundation positions the close button absolutely over the dialog's content box and has no setting
      that keeps text clear of it (the Callout's rule 1(a) and D9; a physical side because
      `$closebutton-position` is physical; `.collapse` keeps its zero padding) |"; item (2) adds
      `$reveal-padding`, `$closebutton-position`, `$closebutton-size`, `$closebutton-offset-horizontal`; item (5)
      adds "dialog text can run under its close button (1.4.12)".
    - Design decisions: a new row after D28: "| D29 | 1.4.12: the Callout's close-button hook and room rule on the
      Reveal (rule 8) | Measured: Foundation's own example fails under text spacing at 320 px in three engines, and
      the rule removes every overlap; the hook keeps dialogs without a close button unchanged | No rule (a WCAG
      failure left to content); padding on every dialog (changes dialogs without a close button) |".
    - Testing Decisions: `reveal--basic` asserts the 48 px right padding; the SSR smoke asserts
      `data-nfs-close-button` on the basic fixture's dialog; a browser-level case asserts the attribute is absent on
      a dialog without a close button.
  - [callout](../specs/callout.md), `callout--closable` (near line 276): replace "Foundation's Making Closable
    pair, an alert callout and a success callout" with "the Callout docs page's Making Closable pair, an alert
    callout and a success callout".
  - [close-button](../specs/close-button.md), `close-button--closable` (near line 258): replace "Foundation's
    "Making Closable" pair, a default callout and a success callout" with "the Close Button docs page's "Making
    Closable" pair, a default callout and a success callout (the Callout's `callout--closable` ports the Callout
    page's alert and success pair)"; the story intro (near line 251): after "so the Storybook settings overrides
    need no line for this spec" add "; the stories render the `$closebutton-color: #767676` the overrides carry for
    the Callout, which passes on both".
- **Shared-document changes.**
  - storybook-conventions.md section 5, the Off-canvas comment: replace "they would pass on $light-gray (3.64:1 and
    4.87:1)" with "they would pass on $light-gray (3.64:1 and 4.86:1)" (R4's ratio rule: 3.639:1 and 4.858:1 exact).
  - storybook-conventions.md section 5, the `$anchor-color` comment: append "// It changes the link colour of
    every story, only raising contrast, so a spec's figures for Foundation's default $anchor-color hold for
    Foundation's defaults, not for its stories."
  - building-blocks.md 1.10, the Callout bullet's last sentence (the 1.4.12 hook): append "; the Reveal has the
    same hook and rule, because Foundation's own Reveal example fails the same way ([Spec: Reveal](issues/18-spec-reveal.md),
    D29), while the Off-canvas panel's example passes".
- **Rating.** (1), (2): impact LOW (wording); confidence HIGH (exact ratios; Foundation's two docs pages read).
  (3): impact LOW (one library rule and one host attribute in one spec, before the first release, ADR 0045);
  confidence HIGH (measured in three engines, the fix measured, and the Callout's decided mechanism reused).
  Decided.

### R26: containers that clip text under 1.4.12

- **Decision.** Per container:
  - Card: done (`nfs-card`'s `overflow-wrap: anywhere`). What remains is its routed housekeeping: the stories
    ported from Foundation's card examples restore the margin gutter (`gridMarginX`), because Foundation writes
    `grid-margin-x` on every card grid and the Card's measured 1.4.12 case is that grid; the Storybook override
    comment and the `nfs-card` include (Card proposal 7) are in storybook-conventions section 5 (lines 118,
    205-206): confirm.
  - XY Grid frame and Responsive Embed: measured by their own specs (XY Grid 1.4.12 row, line 268; Responsive Embed
    1.4.12 row, line 194, and D8). No change.
  - Orbit: `nfs-orbit` gains `.orbit-caption { overflow-wrap: break-word; }` (a URL in a caption runs 187.8 px past
    its slide at 320 px, 320.3 px with the text spacing, in Chromium and WebKit; none with the rule, three engines).
    A caption taller than its image is cut off at its top by the container (`overflow-y` stays `hidden`): a 40-word
    caption on a 16:9 image loses 48.5 to 49 px with the spacing in all three engines, and no `overflow-wrap` value
    helps. So the Orbit states a requirement, as the Responsive Embed does for its fallback: a caption is short
    enough to stay on its image at 320 CSS px with the 1.4.12 spacing (Foundation's docs captions pass: 0 px lost),
    with an e2e case.
  - Drilldown (and Responsive Menu in drilldown mode): rule 9 of the Nested menu (`nfs-drilldown`, the Drilldown's
    rule 5) gains `overflow-wrap: break-word` beside `overflow: clip`: in a 250 px panel (Foundation's
    `$offcanvas-size`), a 27-letter label loses 31.3 px with the spacing in all three engines, none with the rule;
    the wrapper's measured height takes the extra line. Full width at 320 px loses nothing.
  - Off-canvas wrapper: rule (b) gains `overflow-wrap: break-word`: the clip turns a word wider than the viewport,
    which the page would otherwise scroll to, into lost text (a URL loses 171.8 px, 304.3 px with the spacing, in
    Chromium and WebKit; the same markup without the wrapper scrolls the page instead; none with the rule).
  - Why `break-word` and not the Card's `anywhere`: `break-word` acts only on a word that overflows its line and
    leaves every min-content size alone (CSS Text 3), and it fixed every measured case; `anywhere` also shrinks the
    min-content width of flex items, grid items, and table cells, which the Card wanted for its grid cells and the
    page-wide Off-canvas wrapper must not impose. The Card's value stands (its own measured choice).
  - Callout's `$light-gray` figure: already corrected in specs/callout.md:474 (links 4.858:1; glyph 3.64:1, exact
    3.639:1). The Off-canvas block of storybook-conventions section 5 says "(3.64:1 and 4.87:1)": exact
    3.639:1 and 4.858:1 (`ratio.mjs`), so under R4's ratio rule "4.87:1" becomes "4.86:1" and the rest stands
    ("3.76:1" is 3.755:1 and "2.77:1" is 2.766:1); R25 carries that edit.
- **Evidence.** `D:/tmp/nfs-133/utilities/clip-out.json` and `clip-fix-out.json` (the per-engine table: control
  cases reproduce the Card's clipping: a 20-letter heading word loses 18.1 px, 61.3 px with the spacing, in all three
  engines); Foundation `scss/components/_orbit.scss:59-65, 91-101`, `_drilldown.scss:74-77`, `_off-canvas.scss:135-138`;
  specs/orbit.md:647 (rule 3 keeps `overflow-y: hidden`), specs/nested-menu.md:825, specs/drilldown-menu.md:723,
  specs/off-canvas.md:741; issues/90:136-148.
- **Per-spec changes.**
  - [card](../specs/card.md): `card--sizing` (near line 243) becomes "Foundation's Sizing example, three `article`
    cards in a block grid with margin gutters (`nfsGridX` with `gridMarginX` and `[up]="{small: 2, medium: 3}"`,
    each card in an `nfsCell`)"; `card--long-words` (near line 244) "two cards in a two-up block grid" becomes "two
    cards in a two-up block grid with margin gutters (`gridMarginX`), the Card's measured 1.4.12 case"; the two grid
    recipes in Usage examples (near lines 318, 338) carry `gridMarginX`, as every Foundation card grid does.
  - [orbit](../specs/orbit.md): Sass rules table, new row "| 14 | `.orbit-caption` | `overflow-wrap: break-word` |
    A word wider than the slide (a URL) would run past the caption band into the next slide, cut off by the scroll
    snap (measured at 320 CSS px: 187.8 px, 320.3 px with the 1.4.12 spacing, in Chromium and WebKit); `break-word`
    breaks it and changes no min-content size (WCAG 1.4.10, 1.4.12) |"; the rules' lead-in takes R15's and this item's additions together: "plus the additions for WCAG
    2.2 AA, the scrollbar, forced colours, and long caption words (rules 0a, 0b, 9 to 14)"; WCAG table, a row "| 1.4.12 Text Spacing | A caption stays on its image
    with the text spacing at 320 CSS px: captions are short (the docs' one-line captions lose nothing), because the
    band is absolutely positioned over the image and the container clips what rises above it; rule 14 breaks long
    words | Measured: a 40-word caption on a 16:9 image loses 48.5 to 49 px at its top in three engines | e2e |";
    e2e, a case "Text spacing (1.4.12): at 320 by 640 with the text-spacing stylesheet, in `orbit--basics`, every
    caption's text rectangles lie inside its slide."; the Sass subsection's rules list gains rule 14 (R15 adds rule 13).
  - [nested-menu](../specs/nested-menu.md) rule 9 (near line 825): declarations "`overflow: clip`" become "`overflow:
    clip; overflow-wrap: break-word`"; reason appends "; `overflow-wrap: break-word` because the clip cuts off a
    label word wider than the wrapper (measured: a 27-letter word in a 250 px panel loses 31.3 px with the 1.4.12
    spacing in three engines), and the ResizeObserver height takes the extra line".
  - [drilldown-menu](../specs/drilldown-menu.md) rule 5 [9] (near line 723): the same declarations and reason; the
    1.4.4/1.4.12 row (near line 337) appends "; a word wider than the wrapper breaks (Library mixin rule 5)".
  - [responsive-menu](../specs/responsive-menu.md): none beyond its 1.4.12 row's existing "the drilldown wrapper
    re-measured", which reads "the drilldown wrapper re-measured and its long words broken".
  - [off-canvas](../specs/off-canvas.md) rule (b) (near line 741): "`.off-canvas-wrapper { overflow: clip; display:
    flow-root; }`" becomes "`.off-canvas-wrapper { overflow: clip; display: flow-root; overflow-wrap: break-word; }`",
    and its reason appends "`overflow-wrap: break-word`: the clip cuts off a word wider than the viewport that the
    page would otherwise scroll to (measured at 320 CSS px: a URL in the content loses 171.8 px, 304.3 px with the
    1.4.12 spacing, in Chromium and WebKit); `break-word`, not the Card's `anywhere`, because the wrapper holds the
    whole page and `anywhere` would lower the min-content width of every flex item, grid item, and table cell on
    it."; the Sass summary (near line 501) and D19 name the added declaration; the 1.4.10 row gains "a word wider
    than the viewport breaks inside the wrapper (rule (b))".
  - [callout](../specs/callout.md): Already holds (line 474); confirm.
  - [xy-grid](../specs/xy-grid.md), [responsive-embed](../specs/responsive-embed.md): Already hold; confirm.
- **Shared-document changes.**
  - building-blocks.md 1.10, a bullet after the Card bullet: "- Clipping containers (2026-09-29, [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md)): a Foundation container that
    clips cuts off a word wider than itself, which axe does not see. Measured at 320 CSS px in three engines, with and
    without the 1.4.12 spacing: a URL in an Orbit caption or in the Off-canvas wrapper's content (Chromium and
    WebKit), and a long label in a Drilldown wrapper 250 px wide (all three), are cut off; `overflow-wrap:
    break-word` on the clipping element (`nfs-orbit` on `.orbit-caption`, `nfs-drilldown` on `.is-drilldown`,
    `nfs-off-canvas` on `.off-canvas-wrapper`) breaks such words and changes no min-content size, where the Card's
    `anywhere` also narrows its grid cells' content. A caption taller than its image is cut off at its top by the
    Orbit container, so captions stay short, as the Responsive Embed's fallback does; the XY Grid frame and the
    Responsive Embed measured their own cases."
  - storybook-conventions.md section 5, the Off-canvas block: R25's figure edit.
- **Rating.** Impact LOW (three reversible CSS declarations in existing rules, one stated requirement, test and
  story edits); confidence HIGH (measured in three engines, the controls reproduce the Card's published case).
  Decided.

### R27: Table classes, the Names wording, the 1.13 exception, and the stacked-header override

- **Decision.** (a) No spec writes `.hover`, `.unstriped`, `.striped`, `.stack`, `.scroll`, or `.table-scroll` in
  consumer code; every hit is rendered output or a dev-check case (CR-A (a), (b)). (b) building-blocks 1.10's
  Names bullet carries ticket 92's proposal 3, and every spec agrees with it (the Reveal, Orbit, Tabs, Slider,
  Progress Bar, and Table names are the consumer's own attributes; only Responsive Accordion Tabs has `label` and
  `labelledBy`, the stated exception), but the bullet's first sentence still says "inputs" and contradicts its
  appended sentence: it is reworded. (c) The Table's 1.13 exception is in building-blocks 1.13; the one other
  restatement of the flag rule, the Variant declaration tooling spec's, lacks it and takes it. ADR 0012's dated
  note states the flag rule without either refinement and gets a pointer. (d) The overrides carry
  `$show-header-for-stacked: true` (storybook-conventions.md section 5).
- **Evidence.** `rg 'class="[^"]*\b(hover|unstriped|striped|stack|scroll|table-scroll)\b'` over specs: table.md:256,
  269, 279, 292 (rendered), :38, :151, :333, :397 (dev-check text), media-object.md:259, :296, :338 (`stack-for-small`,
  rendered and dev-check), prototyping-utilities.md:371 (rendered); building-blocks.md 1.10 Names bullet;
  specs/reveal.md:324, :348; specs/tabs.md:303; specs/responsive-accordion-tabs.md:246-247;
  specs/variant-declaration-tooling.md:128; adr/0012-sass-packaging.md:26; issues/92:121-128, :179.
- **Per-spec changes.**
  - [variant-declaration-tooling](../specs/variant-declaration-tooling.md), the flags bullet (near line 128): after
    "as `--nfs-media-object-section`)" insert "; a flag that only chooses which of two opposite classes exists,
    where the absent class's look is already the default, needs none (the Table's `striped` and `unstriped` under
    `$table-is-striped`, [Spec: Table](../issues/92-spec-table.md), D5)".
  - [table](../specs/table.md), [reveal](../specs/reveal.md), [orbit](../specs/orbit.md), [tabs](../specs/tabs.md):
    Already hold; confirm.
- **Shared-document changes.**
  - building-blocks.md 1.10, Names bullet, first sentence: replace "are named through `aria-labelledby` inputs
    pointing at visible text, `aria-label` as the fallback input; the spec's rendered HTML shows both." with "are
    named through `aria-labelledby` pointing at visible text, with `aria-label` as the fallback; the spec's rendered
    HTML shows both."
  - adr/0012-sass-packaging.md, the Variant properties consequence (line 26): append "Building-blocks 1.13 refines
    the flag clause: two families one flag gates in opposite directions share one property, and a flag that only
    chooses between two opposite classes whose absent look is the default needs none." (a dated note in the
    closing pass's form).
- **Rating.** Impact LOW (wording in shared text and one spec); confidence HIGH (texts read). Decided.

### R28, R29: Badge and Label classes, the link host, Custom Colors, and other `a` hosts

- **Decision.** (a) No spec writes `.badge`, `.label`, or a palette class on either in consumer code (every hit is
  rendered output or a dev-check case). (b) The Badge adopts the Label's link-host check, as ticket 94 recommends:
  the failure is measured for the badge too (`<a class="badge" href>` turns `#1468a0` on hover and focus, 1.274:1
  on `#1779ba`, in three engines, issues/94:152; 1.614:1 under the Storybook overrides, `pairs-r29.txt`), and the
  Badge's D12 reason ("axe `target-size` and name queries") does not reach a hover colour. (c) No spec quotes
  Foundation's Custom Colors with `!default` or a parenthesised `map-remove`; but Foundation's Badge and Button docs
  pages carry the same two faulty forms as the Label's (`docs/pages/badge.md:70`, `button.md:109`), and Foundation's
  settings file assigns `$badge-palette` and `$button-palette` from `$foundation-palette` as it does `$label-palette`
  (`scss/settings/_settings.scss:275, 316, 482`), so both specs state the working forms. (d) Neither other `a` host
  meets the Label's failure: an uncoloured callout on a link takes `$anchor-color-hover` on hover (5.970:1 on the
  default callout, 4.873:1 at worst on the alert tint, on Foundation's defaults), which `nfs-callout` already checks
  on every callout background; a coloured callout keeps its colour (`.callout.<name>` outranks `a:hover`); and
  `.thumbnail` sets no colour and holds no text (building-blocks 1.10, Thumbnail bullet). No check is added.
- **Evidence.** badge.md:199-218 (consumer then rendered), :260, :299, :324 (D12); label.md:138 (check 3), :338 (D12),
  :343 (D17), :436-442; issues/93:157, issues/94:152, :158; `pairs-r29.txt`.
- **Per-spec changes.**
  - [badge](../specs/badge.md), API `NfsBadge`, after development-mode check 2, add: "3. On a link (D12): the host
    is an `a` element: "nfsBadge: a badge is not a link's look; on a link, Foundation's link hover and focus colour
    replaces an uncoloured badge's text colour (1.27:1 on Foundation's defaults, WCAG 1.4.3), which axe does not
    test. Put the badge inside the link instead: <a href="..."><span nfsBadge>...</span></a>"."; D12's decision cell:
    replace "documented, not checked" with "the directive warns in development when its host is an `a` element
    (measured in the [Spec: Label](../issues/94-spec-label.md) ticket: the hover and focus colour is 1.27:1)"; the
    Out of Scope bullet (near line 299) "A development warning for a badge on a link or button (D12)" becomes "A
    development warning for a badge on a button (D12)"; browser-level cases gain "an `a` host warns once; a badge
    inside a link does not"; the development-check count goes up by one wherever the spec states it.
  - [badge](../specs/badge.md), Sass subsection, after the paragraph "In a consumer's own copy of Foundation's
    settings file ..." (near line 412), add: "Foundation's Custom Colors examples for `$badge-palette` have the two
    faults the [Spec: Label](../issues/94-spec-label.md) measured for `$label-palette` (D17): after the settings file
    a `!default` assignment does nothing, and `map-remove` with a parenthesised key list removes no key. The forms
    that work from an overrides file, keeping the required alert: `$badge-palette: map-merge(map-remove($foundation-palette,
    primary, secondary), (alert: #bf3f2c));` and `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c,
    purple: #bb00ff));`."
  - [button](../specs/button.md), Sass subsection, after the required `$button-palette` setting: add "Foundation's
    Custom Colors examples for `$button-palette` have the two faults the [Spec: Label](../issues/94-spec-label.md)
    measured for `$label-palette` (D17): a `!default` assignment after the settings file does nothing, and
    `map-remove` with a parenthesised key list removes no key; the working forms are the Label's, with
    `$button-palette` and this spec's three required entries."
  - [label](../specs/label.md): Already holds; confirm. [callout](../specs/callout.md), [thumbnail](../specs/thumbnail.md):
    none.
- **Shared-document changes.** building-blocks.md 1.10, the Badge bullet: append "; a badge is never written on a
  link, and `NfsBadge` warns in development, as `NfsLabel` does".
- **Rating.** Impact LOW (a development warning and documentation); confidence HIGH (measured in three engines by
  ticket 94; the same Sass semantics read in the settings file). Decided.

### R30: Progress Bar classes and Visible values, the one-writer exception, the alert override's reach

- **Decision.** (a) No spec writes `.progress`, `.progress-meter`, `.progress-meter-text`, or a palette class on
  `<progress>` in consumer code (progress-bar.md:288-298 are rendered output; :51, :417 dev-check text). (b) Every
  Progress Bar story asserts its Visible value except `progress-bar--right-to-left`, which gains it. (c) The
  one-writer exception reads the same in building-blocks 1.13 and ADR 0040 (whose dated notes run in order); the
  Variant declaration tooling spec still calls `$foundation-palette` "the one exception" although the legacy grids
  take the same exception two lines later, and it ends with a stale deferral ("The legacy grid and Button Group
  specs name theirs."). (d) The overrides' `$foundation-palette` alert merge recolours the alert callout in every
  story from a `#cc4b37` tint to a `#bf3f2c` tint (`pairs-r30.txt`: links 4.842:1, hover links 6.042:1, glyph
  3.627:1, text 15.809:1, all passing), which the Callout and Abide stories render; the Callout spec does not say
  so, and the Abide quotes its alert figure without a condition. Badges and labels keep their own palette lines
  (the storybook comment says so already).
- **Evidence.** `rg 'class="[^"]*\bprogress'`; progress-bar.md:340-346; building-blocks.md 1.13;
  adr/0040-variant-input-types.md:57, :60; specs/variant-declaration-tooling.md:166; specs/callout.md:267;
  specs/abide.md:735 ("measures 16.2:1"; exact 16.159:1 on defaults, 15.809:1 under the overrides, `pairs-r30b.txt`);
  storybook-conventions.md:212-216.
- **Per-spec changes.**
  - [progress-bar](../specs/progress-bar.md), `progress-bar--right-to-left` (near line 346): replace "a `dir="rtl"`
    wrapper with an `nfsProgress` bar at 25 and a native progress element at 25. The meter's right edge equals its
    track's right edge." with "a `dir="rtl"` wrapper with an `nfsProgress` bar at 25 and a native progress element
    at 25, each named and with its Visible value ("25%") beside it. The meter's right edge equals its track's right
    edge, and each Visible value is present."
  - [variant-declaration-tooling](../specs/variant-declaration-tooling.md), the known-mixins bullet (near line 166):
    replace "(the one exception to one writer per property: `$foundation-palette` belongs to no entry point)" with
    "(the exception to one writer per property for a setting no entry point owns, which the legacy grids' shared
    settings below also take), and `nfs-callout` writes `--nfs-callout-sizes` alone"; replace "The legacy grid and
    Button Group specs name theirs." with "`nfs-button-group` writes none: it reads `nfs-button`'s ([Spec: Button Group](../issues/82-spec-button-group.md), D11)."
  - [callout](../specs/callout.md), story intro (near line 267): replace "The Storybook settings overrides carry this
    spec's two required settings (Sass subsection), and the preview includes `nfs-callout`." with "The Storybook
    settings overrides carry this spec's two required settings (Sass subsection) and the Progress Bar's
    `$foundation-palette` alert merge, which turns the alert callout's tint from `#cc4b37`'s to `#bf3f2c`'s in every
    callout story (links 4.842:1, hover links 6.042:1, the glyph 3.627:1, text 15.809:1, all passing); the preview
    includes `nfs-callout`."
  - [abide](../specs/abide.md), near line 735: replace "measures 16.2:1 and needs nothing" with "measures 16.159:1
    on Foundation's defaults (15.809:1 in the stories, whose overrides recolour the palette's alert to `#bf3f2c`)
    and needs nothing".
  - [badge](../specs/badge.md), [label](../specs/label.md): Already hold; confirm.
- **Shared-document changes.** None (building-blocks 1.13 and ADR 0040 agree).
- **Rating.** Impact LOW; confidence HIGH (exact ratios; texts read). Decided.

### R31: Responsive Embed's fixture route, its proposals 1 to 10, and the Card's note

- **Decision.** Already holds. The fixture route with counted embed requests is in the spec's e2e (fixture half,
  "Against the prerendered fixture app, on the Responsive Embed route, with every embed pointed at a route the
  test fulfils and counts through `page.route`"); every one of ticket 96's proposed shared-file changes 1 to 10 is
  applied (Table D row; the 1.10 Responsive Embed bullet; 2.4.7 in the 1.10 first bullet; the "axe cannot enforce"
  focus-outline wording; the 1.11 hydration-writes-`src` bullet; the two CONTEXT terms; the README row; the
  `preview.scss` include; the Card's Notes bullet, card.md:403; the tooling spec's `uses` bullet, :168). One glossary
  line is stale: CONTEXT's **Fixture app** says "one route per Plugin", but every CSS-only component, layout
  system, and utility family spec with a fixture half has a route too (52 specs name the fixture app).
- **Evidence.** specs/responsive-embed.md:325, :360 (D10), :362 (D12); building-blocks.md 1.10, 1.11, Table D:360;
  README.md:59; storybook-conventions.md:119; specs/card.md:403; specs/variant-declaration-tooling.md:102, :168;
  CONTEXT.md:576; issues/96:103-150.
- **Per-spec changes.** [responsive-embed](../specs/responsive-embed.md), [card](../specs/card.md): Already hold;
  confirm.
- **Shared-document changes.** CONTEXT.md, **Fixture app**: replace "The prerendered Angular application, one route
  per Plugin, that the Playwright e2e layer drives to test the Rendering modes." with "The prerendered Angular
  application, one route per entry point whose spec tests the Rendering modes there, at `/<entry point>`, that the
  Playwright e2e layer drives to test the Rendering modes."
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R32, R64: images in examples (the image rule), and thumbnails inside plain links

- **Decision.** Ticket 97's proposal 6 is applied (card.md:401; sticky.md:115; Sticky D19's wording is
  R11's). No spec puts a thumbnail inside a plain link (the Media Object's list comment claims a linked photo that
  its markup does not have and is corrected). The image rule of building-blocks 1.2 (Interchange D18, ticket 127's
  proposal 5, adopted) is applied mechanically:
  1. Consumer code (Usage examples, the consumer half of Rendered HTML, story, fixture, and test templates): every
     `<img>` that is not the `<img>` of an art-directed `<picture>` and has no `data:` or `blob:` URL writes `ngSrc`
     (or `[ngSrc]`) with `width` and `height` (or `fill`), never `src` or `[src]`, beside any library directive on
     the same `<img>`; a component example that has one lists `NgOptimizedImage` in `imports` (CR-D).
  2. No `loading` attribute or `[attr.loading]` binding: `NgOptimizedImage` lazy-loads every image that is not
     `priority` and sets `loading` itself; the image that is likely the largest contentful paint takes `priority`,
     static or bound to a value that never changes after the first render (Angular 22.2 reports a later change of
     `priority` or `loading` in development: `packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts:537-548`).
  3. Rendered output: the `<img>` of an `NgOptimizedImage` example shows `width`, `height`, `alt`, and the library's
     classes, and no `src`, `srcset`, `loading`, or `fetchpriority`; the lead-in says `NgOptimizedImage`'s own
     attributes are left out (the Thumbnail's form, thumbnail.md:176). Where an example gives no size (`src="..."`),
     the reviewer writes `width="600" height="400"`.
- **Evidence.** building-blocks.md 1.2 (Images in specs); `rg '<img\b' specs/*.md | rg -v ngSrc` (list below);
  interchange.md:259-265, :458-473 (the `<picture>` exception, compliant); issues/97:122-128, :139; issues/127:113.
- **Per-spec changes.**
  - [card](../specs/card.md): near lines 177, 208, 321, `<img src=` becomes `<img ngSrc=`; the rendered lines near
    186 and 210 drop `src="/assets/rectangle-1.jpg" `; the Rendered HTML lead-in (near line 170) adds ", and
    `NgOptimizedImage` its own image attributes (`src`, `loading`, `fetchpriority`, and the like)" before "which the
    resulting DOM below leaves out"; the sentence near line 213 "An `NgOptimizedImage` image (`ngSrc`) renders the
    same way, because no card directive sits on the image." becomes "The images use `NgOptimizedImage`
    (building-blocks 1.2); no card directive sits on an image."
  - [media-object](../specs/media-object.md): near lines 234, 254, 256, 280, 285, 404, 415, `<img nfsThumbnail src=`
    becomes `<img nfsThumbnail ngSrc=`; the rendered lines near 244, 260, 262, 292 drop their `src="..."`; the
    lead-in near line 228 adds "and `NgOptimizedImage` its own image attributes" to what the resulting DOM leaves
    out; the comment near line 400 "A list of posts, each a media object whose photo and heading link to the post"
    becomes "A list of posts, each a media object whose heading links to the post".
  - [toggler](../specs/toggler.md), the usage component (near lines 476-504): `imports` gains `NgOptimizedImage`;
    each of the three thumbnails becomes `<img nfsThumbnail nfsToggler #thumbN="nfsToggler" animate="hinge-in-from-top
    spin-out" ngSrc="0N.jpg" width="300" height="200" alt="...">` (the Thumbnail spec's size).
  - [sticky](../specs/sticky.md): near line 244 `<img nfsThumbnail src="..." alt="...">` becomes `<img nfsThumbnail
    ngSrc="..." width="600" height="400" alt="...">`; near line 422 `<img nfsThumbnail src="assets/rectangle-3.jpg"
    alt="Product photo">` becomes `<img nfsThumbnail ngSrc="assets/rectangle-3.jpg" width="600" height="400"
    alt="Product photo">`; the rendered lines near 258 and 273 replace `src="..."` with `width="600" height="400"`.
  - [equalizer](../specs/equalizer.md): near lines 423 and 429, `<img src=` becomes `<img ngSrc=` (sizes kept).
  - [orbit](../specs/orbit.md): near lines 366 and 591, `<img nfsOrbitImage [src]="slide.src" [alt]="slide.alt"
    width="1200" height="500" [attr.loading]="first ? null : 'lazy'" />` becomes `<img nfsOrbitImage
    [ngSrc]="slide.src" [alt]="slide.alt" width="1200" height="500" [priority]="first" />`; the usage component's
    `imports` (near line 571) gains `NgOptimizedImage`; after the usage block add "The first slide's image is
    `priority`, the others lazy-load (`NgOptimizedImage`'s default); `first` never changes because the slide list is
    constant, which `priority` requires."; the rendered line near 394 drops `src="..."`.
  - [float-classes](../specs/float-classes.md), near line 209, and [prototyping-utilities](../specs/prototyping-utilities.md),
    near line 376 (rendered output): drop `src="/voyager.jpg" ` and `src="/logo.svg" `.
  - [interchange](../specs/interchange.md), [thumbnail](../specs/thumbnail.md): Already hold; confirm.
- **Shared-document changes.** None (building-blocks 1.2 holds the rule).
- **Rating.** Impact LOW (examples); confidence HIGH (the rule is recorded; `NgOptimizedImage`'s constraint read in
  the 22.2 source). Decided.

### R33: `nfs-abide` and `nfs-forms` check different settings; the Forms spec in the README index

- **Decision.** Already holds. `nfs-forms` checks the resting field (`$input-placeholder-color` on `$input-background`; the `$input-border` colour or `$input-background` on `$body-background`; the `$input-border-focus` colour on `$body-background` and `$input-background-focus` and against the `$input-border` colour; `$select-triangle-color` on `$select-background`); `nfs-abide` checks the invalid state (`$input-error-color` and `$form-label-color-invalid` on `$body-background`; `$input-background-invalid` on its 10% tint and on `$body-background`; the `$input-border-focus` colour against `$input-background-invalid`). `$input-border-focus` appears in both, but in different pairs (against the page, the focus background, and the resting border in `nfs-forms`; against the invalid border in `nfs-abide`, D21), so no pair is checked twice, and D22 keeps the two mixins separate, both included by an Abide form. building-blocks 1.10's Forms and Abide bullets say the same. The README's CSS-only table already has the Forms row. Two neighbouring points for other clusters: both specs still say their ratios come "from Foundation's `color-luminance()`" (abide.md lines 343, 713, D21; forms.md line 516, D11), which building-blocks 1.10 now forbids: that is R4's rewrite. `nfs-switch` also checks the `$input-border-focus` colour against `$body-background`, the same pair `nfs-forms` checks (forms.md line 532); a Switch-only application includes no `nfs-forms`, so the duplicate is harmless and stays.
- **Evidence.** abide.md lines 711-740 (Sass subsection), D21 (line 573), D22 (line 574); forms.md lines 514-536 (Sass subsection), D11 (line 447); building-blocks.md 1.10 Forms (line 170) and Abide (line 171) bullets; README.md Forms row (line 59).
- **Per-spec changes.**
  - [abide](../specs/abide.md): already holds; confirm (the `color-luminance()` wording is R4's).
  - [forms](../specs/forms.md): already holds; confirm (the `color-luminance()` wording is R4's).
- **Shared-document changes.** None (the README row exists; the closing pass still updates the README's spec count, which reads 34).
- **Rating.** Impact LOW; confidence HIGH (the text of both Sass subsections). Decided.

### R34, R35: same-element input names; the Reveal's names beside the Float Grid

- **Decision.** Holds. No spec writes two library directives on one element that declare one input name with
  different types: every multi-directive element in every spec's code blocks was scanned (79 elements); each shared
  name there belongs to one directive only (`nfsCell size` beside `nfsFlexContainer direction` or `nfsFlexChild
  order`; `nfsButton color` beside a Trigger or `nfsTooltip position`; `nfsMenu expanded` beside `nfsToggler`), and
  the families that share names nest. The Float Grid's and Flex Grid's shared-name lists agree (issues/100:119-127,
  specs/flex-grid.md:21, :49). R35: Foundation's `.reveal.collapse` is a compound on the Reveal and `.reveal .column
  { min-width: 0 }` is a descendant rule that reaches a Float Grid column inside a Reveal and changes nothing
  (`min-width: auto` already resolves to 0 for a float column, and the Flex Grid sets `min-width: 0` itself,
  Foundation `scss/grid/_flex-grid.scss:84`); a Reveal (`dialog[nfsReveal]`) and a Row never share an element, so
  their `collapse` inputs never meet. The Float Grid's sentence "always scoped under those components' own classes,
  which no row or column carries" is true of the compounds and needs the descendant rule named. Building-blocks 1.9
  lists only three shared names; the scan found four more that rely on the same nesting rule, and the list grows so
  a later spec sees them.
- **Evidence.** `D:/tmp/nfs-133/utilities/same-element.mjs` (its run: 79 elements, no clash);
  building-blocks.md 1.9 ("Two library directives written on one element must not declare an input of the same name
  with different types"); specs/float-grid.md:112; Foundation `scss/components/_reveal.scss:89-92`; input types read
  in specs/progress-bar.md, badge.md, label.md, button-group.md, callout.md (`color`), off-canvas.md, dropdown.md
  (`position`), media-object.md, dropdown.md, dropdown-menu.md (`alignment`).
- **Per-spec changes.**
  - [float-grid](../specs/float-grid.md), near line 112: after "always scoped under those components' own classes,
    which no row or column carries" insert "(the Reveal's `.reveal .column { min-width: 0 }` reaches a column inside
    a Reveal and changes nothing, because a float column's `min-width` already resolves to 0)".
  - [xy-grid](../specs/xy-grid.md), [flex-grid](../specs/flex-grid.md), [card](../specs/card.md),
    [equalizer](../specs/equalizer.md), [reveal](../specs/reveal.md): Already hold; confirm.
- **Shared-document changes.** building-blocks.md 1.9, "Hosting a class directive" bullet: replace "(`size` on cells,
  columns, callouts, buttons, close buttons, and dropdown panes; `collapse` on rows and reveals; `expanded` on rows,
  buttons, button groups, and menus)" with "(`size` on cells, columns, callouts, buttons, close buttons, and dropdown
  panes; `collapse` on rows and reveals; `expanded` on rows, buttons, button groups, and menus; `color` on buttons,
  button groups, callouts, badges, labels, and progress bars; `position` on off-canvas panels, dropdown panes, and
  tooltips; `alignment` on dropdown menus, dropdown panes, tooltips, and media object sections; `offset` and `up` on
  cells, columns, grids, and rows)".
- **Rating.** Impact LOW (confirmation and one wording line); confidence HIGH (scanned and read). Decided.

### R36: storybook-conventions section 8, the demo-scaffolding list

- **Decision.** Replace the demo-scaffolding bullet with the final names. The other asks of tickets 100, 101, and
  103 already hold: section 3 has the five title groups (`Utilities/`, `Layout systems/`), section 5 puts
  `foundation-grid` before `foundation-everything` and describes the Flex Grid's second configuration, and section
  11's checklist line is the new one. The inline-style bullet names the two overflow values that stay inline (R41,
  R42).
- **Evidence.** storybook-conventions.md:43 (groups), :95-97 and :133 (preview order, second configuration), :318
  (the bullet), :319 (inline styles), :351 (checklist); issues/100 proposal 6, issues/101 proposal 6, issues/103
  proposal 6, issues/102 proposal 9, issues/104 proposal 6, issues/105 proposal 4; entry points and names read in the
  owning specs (xy-grid.md:132, float-grid.md:161, flexbox-utilities.md:127, typography-helpers.md:157, :436,
  visibility-classes.md:134, float-classes.md:109, prototyping-utilities.md:165-186).
- **Per-spec changes.** The specs' own story texts already use these names, except the Sticky and Anchored pane
  values of R41 and R42 and one inline width:
  - [float-classes](../specs/float-classes.md): the `float-classes--float-center` story (near line 269) and the
    Rendered HTML consumer line (near line 207) write the box's width with the Prototyping Utilities' `nfsWidth="50"`
    (`NfsPrototypeSizing`, listed in the story's `moduleMetadata.imports`) in place of `style="width: 50%"`, because
    Foundation's default `$prototype-sizes` has `.width-50` and section 8 keeps inline styles for values without a
    class; the rendered line near 210 becomes `<div class="float-center width-50">...</div>`. The story still shows a
    percentage width, the spec's correction of the docs (near line 12).
- **Shared-document changes.** storybook-conventions.md section 8: replace the whole bullet that begins "- Demo
  scaffolding (wrappers, spacing, lists, filler content) uses Foundation's own CSS:" and ends "colour comes from
  Foundation components." with:

  > - Demo scaffolding (wrappers, layout, spacing, lists, filler content) takes its look from Foundation's CSS
  >   through the library's directives, never through a class written in the story (ADR 0039); each directive is
  >   imported from its entry point and listed in `moduleMetadata.imports`:
  >   - containers and filler: the CSS-only components' own directives (`nfsCallout` with `color` and `size`,
  >     `nfsCard` with `nfsCardDivider` and `nfsCardSection`, `nfsButton`);
  >   - layout: the XY Grid's `nfsGridContainer`, `nfsGridX`, `nfsGridY`, and `nfsCell` (`ngx-foundation-sites/xy-grid`);
  >     the Float Grid's `nfsRow` and `nfsColumn` (`ngx-foundation-sites/float-grid`) only in the stories that show
  >     that grid (`float-grid--*`, `equalizer--float-grid`), and the Flex Grid's only in its own configuration
  >     (section 5);
  >   - flex layout: the Flexbox Utilities' `nfsFlexContainer` (`direction`), `nfsFlexAlign` (`alignX`, `alignY`,
  >     `alignCenterMiddle`), and `nfsFlexChild` (`alignSelf`, `order`) (`ngx-foundation-sites/flexbox-utilities`);
  >     scaffolding never sets `order` or a reverse `direction`, which change only the visual order
  >     (building-blocks 1.10);
  >   - text and lists: the Typography Helpers' `nfsTextAlign`, `nfsSubheader`, `nfsLead`, `nfsStat`,
  >     `nfsHeadingSize`, and `nfsNoBullet` on a `ul` or `ol` (`ngx-foundation-sites/typography-helpers`);
  >   - visibility: `nfsVisibility` (`showFor`, `hideFor`, `invisible`, `visible`), `nfsShowForSr`, and
  >     `nfsShowOnFocus` (`ngx-foundation-sites/visibility`);
  >   - floats: the Float Classes' `nfsFloat` and `nfsClearfix` (`ngx-foundation-sites/float-classes`);
  >   - spacing, sizing, display, overflow, position, borders, and text: the Prototyping Utilities' Utility
  >     attributes (`nfsMargin*`, `nfsPadding*`, `nfsWidth`, `nfsHeight`, `nfsDisplay`, `nfsOverflow*`,
  >     `nfsPosition`, `nfsListStyleType`, `nfsTextTruncate`, and the rest of that family,
  >     `ngx-foundation-sites/prototyping-utilities`), compiled by `foundation-everything($prototype: true)` from
  >     Foundation's default lists.
  >
  >   They go on scaffolding only, never on an element of the component a story demonstrates, whose look must be
  >   Foundation's component CSS unaltered, except in the stories of the family that owns them. The `.text-primary`-style
  >   colour classes in this repo's AGENTS.md are not Foundation classes (Foundation 6.9's Sass defines no such class)
  >   and are not used; colour comes from Foundation components.

  And the next bullet: replace "values Foundation has no class for (a scroll container height, a tall page), and
  nothing else." with "values Foundation's default lists have no class for (a scroll container height, a tall page,
  `overflow: auto` and `overflow: clip`, which `$prototype-overflow` lacks), and nothing else."
- **Rating.** Impact LOW (a conventions list; every name is the owning spec's); confidence HIGH. Decided.

### R37: beside or hosted, against Flexbox Utilities decision 8

- **Decision.** Holds. Decision 8 leaves beside or hosted to each Flex parent's or Flex child's spec and forbids
  own inputs for the family's classes; every spec chose beside and declares none: XY Grid D15, Flex Grid D15, Media
  Object D4, Button Group D9, the Equalizer and Card examples. The one hosting is inside the family
  (`NfsFlexContainer` hosts `NfsFlexAlign`, building-blocks 1.9). The Float Grid correctly takes no part: a float row
  is not a Flex parent (specs/float-grid.md:158).
- **Evidence.** specs/flexbox-utilities.md:400 (D8); specs/xy-grid.md:478; specs/flex-grid.md:455; specs/media-object.md:384;
  specs/button-group.md:388; building-blocks.md 1.9 (the Flexbox Utilities sentence).
- **Per-spec changes.** [flexbox-utilities](../specs/flexbox-utilities.md), [xy-grid](../specs/xy-grid.md),
  [flex-grid](../specs/flex-grid.md), [media-object](../specs/media-object.md): Already hold; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R38: the Flexbox Utilities' three placeholders

- **Decision.** The three placeholders of ticket 103's table (`nfsFlexContainer` with `direction`, `nfsFlexChild`,
  `nfsAlign`) lived in the Equalizer, Card, and Button Group specs, not in the Flexbox Utilities spec; all three are
  replaced (Equalizer and Card by the re-run, Button Group by R18), apart from the Equalizer's last qualifier (R7).
  The Flexbox Utilities spec itself carries two placeholder remarks of its own (A1, A2). Section 8's
  scaffolding list is R36's.
- **Evidence.** issues/103:155-168; specs/equalizer.md:120-121; specs/card.md:338-340; specs/button-group.md:293.
- **Per-spec changes.** [flexbox-utilities](../specs/flexbox-utilities.md): A1 and A2 (Additional placeholders).
- **Shared-document changes.** None here (section 8 is R36).
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R39: Visibility classes, placements, and one naming rule for the utility families

- **Decision.** (1) Holds: every Visibility class written in a spec is rendered output (CR-A (a)), a copied-class
  check input (b), or Foundation's markup quoted as the contract (c). (2) No placeholder qualifier remains (R1). (3) No spec puts `nfsVisibility` on a Responsive Toggle bar or menu or on a Drilldown level: its placements
  are an `aside` (Breakpoint service), Off-canvas Triggers (`nfsButton nfsVisibility hideFor="large"`), and prose.
  (4) The wave's utility-family directive names follow one rule, building-blocks 1.3's three shapes (per export
  mixin; per role; one effect), with two refinements that the specs decided and building-blocks 1.3 does not yet
  state: a class the mixin qualifies by element for both lists with one rule gets one directive for both elements
  (`NfsNoBullet`, Typography Helpers D3), and a one-effect family's class with another contract gets a directive
  named after that class (`NfsShowForSr`, `NfsShowOnFocus`, Visibility Classes D1). Building-blocks 1.3 records
  both, so the rule is one text.
- **Evidence.** `rg 'class="[^"]*\b(show-for-...|hide-for-...|hide|invisible|visible|show-on-focus)\b'` over specs:
  hits in badge.md:201-218, button.md:313, button-group.md:288, top-bar.md:336-367, orbit.md:388, :403,
  pagination.md:475-478, breadcrumbs.md:433, drilldown-menu.md:400-413, responsive-menu.md:413-443,
  nested-menu.md:462-472, breakpoint-service.md:715, visibility-classes.md:281-340 (server HTML or Foundation's
  markup), responsive-toggle.md:325 and :404, drilldown-menu.md:494, visibility-classes.md:386 (copied-class cases);
  `nfsVisibility` in menu.md:534, breakpoint-service.md:714, off-canvas.md:290, :678, :687; typography-helpers.md:436
  (D3); visibility-classes.md:456 (D1); ADR 0044 Consequences.
- **Per-spec changes.** [visibility-classes](../specs/visibility-classes.md), [responsive-toggle](../specs/responsive-toggle.md),
  [drilldown-menu](../specs/drilldown-menu.md), [flexbox-utilities](../specs/flexbox-utilities.md),
  [float-classes](../specs/float-classes.md), [typography-helpers](../specs/typography-helpers.md),
  [prototyping-utilities](../specs/prototyping-utilities.md): Already hold; confirm.
- **Shared-document changes.** building-blocks.md 1.3, utility-families bullet:
  - replace "or one per element where the mixin qualifies its classes by element (`ul[nfsListStyleType]`,
    `ol[nfsListStyleType]`)" with "or, where the mixin qualifies a class by element, a directive whose selector names
    those elements: one per element where the qualified classes differ (`ul[nfsListStyleType]`,
    `ol[nfsListStyleType]`), one for both where one rule qualifies both (`NfsNoBullet`, `ul[nfsNoBullet],
    ol[nfsNoBullet]`, [Spec: Typography Helpers](issues/106-spec-typography-helpers.md), D3)";
  - after "names its directive after the docs page and its inputs with Foundation's words (1.4)" insert ", and binds
    each class of the family that has another contract through a directive named after that class (`NfsShowForSr`
    for `.show-for-sr`, `NfsShowOnFocus` for `.show-on-focus`, [Spec: Visibility Classes](issues/104-spec-visibility-classes.md),
    D1)".
- **Rating.** Impact LOW (records names already published); confidence HIGH. Decided.

### R40, R41, R42: Sticky classes and containers; `nfsOverflow` and `nfsPosition` in stories

- **Decision.**
  - R40: No spec writes `.sticky`, `.sticky-container`, or a Sticky State class outside rendered output, and none
    sends consumer CSS to `.is-stuck` (visibility-classes.md:94 quotes Foundation's CSS, CR-A (c)). Every
    `nfsStickyContainer` spans more than its sticky element (Top Bar usage, top-bar.md:526-529, now holds `main`;
    Magellan's `nfsCell` container stretches to its row) except the Visibility Classes' two sticky examples
    (visibility-classes.md:315-320 and :500-505), where the container holds only the sticky element, so the Sticky
    range (the parent, ADR 0019) is the element itself, it never sticks, and the e2e case at :418 ("scrolling until
    the Sticky element carries `.is-stuck`") cannot pass. Both get content after the sticky element, and the story
    gets a tall body.
  - R41: `sticky--overflow-hidden-ancestor`'s first value becomes `nfsOverflow="hidden"` (Foundation's
    `.overflow-hidden`, in its default `$prototype-overflow`); `overflow: clip` stays inline (no Foundation class).
    This is section 8 as rewritten (R36).
  - R42: in `anchored-pane--fixture`, the `relative` and `scroll` containing blocks take `nfsPosition="relative"`
    (Foundation's `.position-relative`, in its default `$prototype-position`); the scrollers' `overflow: auto`, the
    pane width, the trigger coordinates, and the body height stay inline.
- **Evidence.** Foundation `scss/settings/_settings.scss:659-674` (`$prototype-overflow: visible, hidden, scroll`;
  `$prototype-position: static, relative, absolute, fixed`); specs/prototyping-utilities.md:119-120, :172-173;
  specs/sticky.md:328, :409 (D19); specs/anchored-pane.md:416; specs/visibility-classes.md:315-325, :376, :418,
  :498-505; issues/102:122-123; issues/120:145.
- **Per-spec changes.**
  - [visibility-classes](../specs/visibility-classes.md): the "Inside a Sticky element" consumer block (near line
    315) and its server-HTML block (near line 322) gain a sibling after the sticky element, `<main>...</main>`,
    under a comment "<!-- The container also holds the content the element scrolls past: the Sticky range is the
    sticky element's parent (ADR 0019) -->"; the usage example "A compact title while the bar is stuck" (near line
    500) gains the same `<main>...</main>` sibling; `visibility--sticky` (near line 376) becomes "Foundation's sticky
    example inside `nfsStickyContainer` and `nfsSticky`, the container also holding a tall body (an inline height,
    Storybook conventions section 8); before any scroll the `hideFor="sticky"` title is displayed and the
    `showFor="sticky"` one is not."
  - [sticky](../specs/sticky.md), `sticky--overflow-hidden-ancestor` (near line 328): replace "inside an ancestor
    with an inline `overflow: hidden`" with "inside an ancestor written `nfsOverflow="hidden"`", and "Both values are
    inline because the overflow value is what the story compares, Foundation has a class for only one of them, and
    its `.overflow-hidden` Prototype class is not written under the class rule while the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md) has not named its directive (D19)." with "The first
    ancestor's value comes from the Prototyping Utilities' `nfsOverflow="hidden"` (`NfsPrototypeOverflow`, from
    `ngx-foundation-sites/prototyping-utilities`), which sets Foundation's `.overflow-hidden`; `overflow: clip`
    stays inline, because Foundation has no class for it (D19)."; the story's `moduleMetadata.imports` lists
    `NfsPrototypeOverflow`.
  - [sticky](../specs/sticky.md), D19 (near line 409), the overflow clause R11 leaves to this item: in the
    decision cell replace "`sticky--overflow-hidden-ancestor` sets `overflow: hidden` and `overflow: clip` inline"
    with "`sticky--overflow-hidden-ancestor` writes its first ancestor with `nfsOverflow="hidden"` and sets
    `overflow: clip` inline on the second"; in the rationale cell replace "the overflow story compares two values,
    Foundation has a class for one, and the Prototyping Utilities spec has not named its directive" with "the
    overflow story compares two values: Foundation's `.overflow-hidden` comes from the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md)'s `nfsOverflow="hidden"`, and `overflow: clip` has no
    Foundation class, so it stays inline (Storybook conventions, section 8)"; in the rejected-alternatives cell
    replace "a guessed Prototyping Utilities directive name" with "`overflow: hidden` inline (a value Foundation has
    a class for, against Storybook conventions section 8)".
  - [anchored-pane](../specs/anchored-pane.md), `anchored-pane--fixture` (near line 416): replace "each geometric arg
    is an inline style on the story's scaffolding or on the test pane, never a class)" with "the `relative` and
    `scroll` containing blocks take `nfsPosition="relative"` of the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md),
    which sets Foundation's `.position-relative`; every other geometric arg (the scrollers' `overflow: auto`, which
    Foundation's default `$prototype-overflow` lacks, the pane width, the trigger coordinates, the body height) is an
    inline style on the story's scaffolding or on the test pane, never a class)".
  - [top-bar](../specs/top-bar.md), [magellan](../specs/magellan.md), [prototyping-utilities](../specs/prototyping-utilities.md):
    Already hold; confirm.
- **Shared-document changes.** None beyond R36.
- **Rating.** Impact LOW (story and example markup); confidence HIGH (the Sticky range rule is ADR 0019; the class
  lists are Foundation's defaults). Decided.

### R43: XY Grid D3's rejected alternative

- **Decision.** Apply ticket 102's replacement: the Prototyping Utilities' sizing attribute is `nfsWidth`, so a
  `width` enum on `NfsGridContainer` would not collide; D3 stands on its other reason.
- **Evidence.** issues/102:125; specs/xy-grid.md:466 (D3); specs/prototyping-utilities.md (Utility attributes are
  `nfs`-prefixed, ADR 0044).
- **Per-spec changes.**
  - [xy-grid](../specs/xy-grid.md), D3's rejected-alternative cell (near line 466): replace "(an invented name for
    two classes that come from no setting or loop, and one the Prototyping Utilities' sizing family is likely to use
    for `.width-*`, which would collide on one element)" with "(an invented name for two classes that come from no
    setting or loop)".
  - [prototyping-utilities](../specs/prototyping-utilities.md): none.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R44: the Tabs' XY Grid names and the recipe-CSS convention

- **Decision.** Already holds: the Tabs examples write `nfsGridX` and `nfsCell` with a `size` rules object, and
  storybook-conventions section 5 carries ticket 108's change 6 as its "Recipe CSS" bullet (the `.account-tabs` and
  `.equal-heights` recipes on the consumer's own classes).
- **Evidence.** specs/tabs.md:402-409, :631-639, :438, :490-491; storybook-conventions.md section 5, "Recipe CSS".
- **Per-spec changes.** [tabs](../specs/tabs.md): Already holds; confirm. [xy-grid](../specs/xy-grid.md): none.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R45: `nfs-tabs` checks the plain strip's pairs

- **Decision.** Yes. `nfs-tabs` adds compile-time checks for the pairs Tabs D17 requires on every strip and stops
  the compile, so a consumer who keeps a failing Foundation default gets the signal ADR 0022's first consequence
  promises, as every other Library mixin with a required colour setting does. Every application with a tab strip
  therefore includes `nfs-tabs`, not only one that sets `simple` or `primary`; the Responsive Accordion Tabs
  includes it whenever its rules have a tabs mode. The checks, each an `@error` naming the setting (building-blocks
  1.10: a pair that carries state or text the component always draws stops the compile, the Top Bar's Q9):
  `$tab-color` under 4.5:1 against `$tab-background` (unselected text); `scale-color($tab-color, $lightness:
  -14%)` under 4.5:1 against `$tab-item-background-hover` (hovered text, Foundation's `tabs-title` rule);
  `$tab-active-color` under 4.5:1 against `$tab-background-active` (selected and focused text); and
  `$tab-background-active` under 3:1 against `$tab-background` (the selected look, 1.4.11 and 1.4.1); on a
  `primary` bar, besides D23's check, the text Foundation picks, `color-pick-contrast($primary-color)`, under 4.5:1
  against `$primary-color` or `smart-scale($primary-color)` (the bar's other tabs at rest and on hover or focus,
  checked as emitted, as R6 decides for picks). On Foundation's defaults the selected text (3.755:1) and the
  selected look (1.237:1) stop the compile; with D17's settings every pair passes (4.647, 5.920, 4.647, 4.647; the
  bar 4.647 and 5.052 or unrounded 5.058).
- **Evidence.** [Re-run: Tabs spec under the class rule](../issues/108-rerun-tabs-class-rule.md) (issues/108:149,
  the gap and the question); tabs.md D17 (575), D23 (581), Sass subsection (738: "plain strips are unaffected" by a
  missing include); ADR 0022, first consequence; building-blocks 1.10 (Target size and non-text contrast bullet:
  `@error` for colour pairs that carry state) and the Top Bar's Q9 (issues/86:48); precedents that stop on
  Foundation's defaults: `nfs-top-bar`, `nfs-switch`, `nfs-breadcrumbs`, `nfs-forms`, `nfs-button`; Foundation's
  `_tabs.scss:80-106, 165-176` (the hover colour and the primary bar's pick). Figures: `pairs-tabs.txt`,
  `pairs-tabs2.txt`.
- **Per-spec changes.**
  - [tabs](../specs/tabs.md): Sass subsection item (1), after the D23 check sentence ("...naming both
    settings."), add: `It also stops the compile with `@error` on every strip, naming the setting: `$tab-color`
    under 4.5:1 against `$tab-background`, `scale-color($tab-color, $lightness: -14%)` under 4.5:1 against
    `$tab-item-background-hover`, `$tab-active-color` under 4.5:1 against `$tab-background-active`, and
    `$tab-background-active` under 3:1 against `$tab-background` (D17, D26); and on a `primary` bar when
    `color-pick-contrast($primary-color)` is under 4.5:1 against `$primary-color` or
    `smart-scale($primary-color)`. Foundation's defaults stop it (selected text 3.76:1, selected look 1.24:1).`;
    item (2) adds `$tab-background`, `$tab-item-background-hover`, `$tab-background-active`, `$tab-active-color`,
    Foundation's `color-pick-contrast()` and `smart-scale()`; item (5) `plain strips are unaffected` becomes `on a
    plain strip the compile-time checks do not run, so a failing tab colour compiles with no signal; every
    application with a tab strip includes `nfs-tabs``; the 1.4.3 and 1.4.11 rows (345, 346) name the new checks;
    the Sass compile test (517) adds "Foundation's default tab colours stop the compile naming
    `$tab-active-color` and `$tab-background-active`; D17's settings compile"; new design decision `| D26 |
    `nfs-tabs` checks the plain strip's pairs and every tab strip includes it (2026-09-29, class-rule consistency
    review) | ADR 0022's first consequence: a consumer who keeps a failing default gets a compile-time signal;
    building-blocks 1.10's `@error` for pairs that carry state | No check (the gap the Tabs re-run recorded); a
    `@warn` |`; D17's row adds "checked by `nfs-tabs` (D26)".
  - [responsive-accordion-tabs](../specs/responsive-accordion-tabs.md): line 30 `plus the `nfs-tabs` Library
    mixin when `simple` or `primary` is set` becomes `plus the `nfs-tabs` Library mixin`; line 728 `@include
    nfs-tabs; // required once any instance sets simple or primary` becomes `@include nfs-tabs; // required for
    tabs mode: the tab contrast checks, and the simple and primary looks`; D20 (630) `and `nfs-tabs` covers the
    `simple` and `primary` looks (D22)` becomes `and `nfs-tabs` covers the tab contrast checks and the `simple`
    and `primary` looks (D22)`; the Sass subsection's (5) (765) adds that without `nfs-tabs` the tab contrast
    checks do not run.
- **Shared-document changes.** building-blocks 1.13, the Tabs paragraph: `Tabs has an `nfs-tabs` Library mixin
  with two Variant rules, a 24 by 24 px minimum for `simple` titles and the selected tab's colours on a `primary`
  bar, and a compile-time contrast check of that bar pair; ... The [Spec: Responsive Accordion Tabs](issues/19-spec-responsive-accordion-tabs.md) needs it only when its `simple` or `primary` input is set.`
  becomes `Tabs has an `nfs-tabs` Library mixin with two Variant rules, a 24 by 24 px minimum for `simple` titles
  and the selected tab's colours on a `primary` bar, and compile-time contrast checks of every strip's text and
  selected look and of the `primary` bar's pairs, so every application with a tab strip includes it; ... The
  [Spec: Responsive Accordion Tabs](issues/19-spec-responsive-accordion-tabs.md) includes it for its tabs mode.`
  (the nav-bar recipe sentence between them stays). building-blocks 1.10, the colour-alone bullet: `and its
  compile-time check covers the pair against the bar)` becomes `and its compile-time checks cover the plain
  strip's pairs and the pair against the bar)`.
- **Rating.** Impact LOW (a library-internal Sass check and an include line; no API, type, or vocabulary, and the
  first release has not shipped, ADR 0045); confidence HIGH (ADR 0022's first consequence and building-blocks
  1.10 decide it; every sibling mixin with a required colour setting already checks it). Decided.

### R46: Responsive Accordion Tabs against the Tabs spec

- **Decision.** Holds: `simple` and `primary` have the Tabs spec's names, types (`input<boolean,
  NfsVariantBoolean>`), and `nfs-tabs` rules, reached by binding `NfsTabs`' inputs of the same names; dev check 7 is
  building-blocks 1.4's rule (ticket 111's proposal 4 is in the initial-state bullet), so it is no departure. The
  equal-heights recipe gets one sentence that ties its selectors to the documented structure.
- **Evidence.** specs/responsive-accordion-tabs.md:24, :138, :149-150, :223-224, :635 (D25), :734-748; specs/tabs.md:138-139,
  :182-183, :206-207, :580; building-blocks.md 1.4 ("A component whose host binds no class reads the host's static
  `class` the same way ... Responsive Accordion Tabs, dev check 7"); issues/111:85.
- **Per-spec changes.** [responsive-accordion-tabs](../specs/responsive-accordion-tabs.md), after the equal-heights
  recipe's CSS (near line 748): add "The selectors rely on the tabs-mode structure the Rendered HTML section
  documents (the host's one child holds the tab list followed by the content box, whose children are the panels);
  a change to that structure is a breaking change to this recipe." [tabs](../specs/tabs.md): none.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R47: the Top Bar right-hand section and the Base side

- **Decision.** One source holds: the Nested menu spec's Base-side rule (`specs/nested-menu.md:214`, D33) is the
  rule, and ADR 0043 is the revised text of the Dropdown Menu re-run's change 5, word for word. No spec
  describes the right-hand section as a DOM walk alone or a token alone: the Dropdown Menu (D9, its hierarchy,
  its `alignment` row), the Top Bar (D9, its hierarchy), `building-blocks.md` (1.9, Table B DropdownMenu, Table C
  Nested menu), CONTEXT's **Base side**, and `research/out-of-scope-triage.md` (change 6, applied) all say token
  at construction, DOM walk after hydration only when no token was found. Two sentences need a fix: the Top Bar's
  D9 tells the projected case it can be "fixed with `alignment="right"` or a provided token", which contradicts
  its own hierarchy note (a provided token has no good value, since the token's value is the section's directive
  instance) and the Nested menu's check 6 (which names `alignment="right"` only); and the Responsive Menu cites
  two specs as defining the source. ADR 0042's "told apart" holds in the accessibility tree always
  (`aria-current` against `aria-expanded`), and in the look on the top level and for button parents, but not for
  an open nested Hybrid item's link in dropdown mode, which keeps Foundation's `.menu .is-active > a` fill, the
  Current link look, as Foundation's own markup draws an open nested parent (measured by the Dropdown Menu
  re-run, Q10; kept by the Dropdown Menu spec's D15). No rule changes: suppressing Foundation's fill would
  restyle Foundation's open-parent look, which the effort reuses, and the open state also shows through the
  toggle's `aria-expanded` and the visible submenu; the ADR gets a dated qualifier and the Nested menu's 1.4.1
  row a sentence.
- **Evidence.** `adr/0043-menu-root-top-bar-right-section-token.md` against
  `issues/113-rerun-dropdown-menu-class-rule.md:172-191` (identical); `specs/nested-menu.md:214`, `:289`
  (check 6), `:323`, `:681` (D33); `specs/dropdown-menu.md:171`, `:213`, `:584` (D9), `:590` (D15);
  `specs/top-bar.md:142`, `:480` (D9); `specs/responsive-menu.md:169`; `CONTEXT.md:452`;
  `research/out-of-scope-triage.md:43`; `issues/113-rerun-dropdown-menu-class-rule.md:43` (Q10);
  `adr/0042-menu-current-page-aria-current.md` (Consequences, first bullet); rendered HTML
  `specs/nested-menu.md:483-501` (accordion mode binds `is-active` on the submenu `ul`, dropdown mode on the
  parent `li`, so only dropdown mode's `li.is-active > a` matches).
- **Per-spec changes.**
  - [top-bar](../specs/top-bar.md): D9 (near line 480), replace `is reported in development by the menu root and
    fixed with `alignment="right"` or a provided token.` with `is reported in development by the menu root and
    fixed with `alignment="right"`; a provided token has no value to give (Hierarchy and DI shape).`
  - [responsive-menu](../specs/responsive-menu.md): the Base side bullet (near line 169), replace `the same root
    reads that section, as the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) and the
    [Spec: Top Bar](../issues/86-spec-top-bar.md) define the source, so dropdown mode opens to the left there
    too.` with `the same root learns the section through `nfsTopBarRightToken` at construction, or through one
    DOM walk after hydration when projection hid the token, by the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)'s
    Base-side rule ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)), so dropdown mode opens to
    the left there too.`
  - [nested-menu](../specs/nested-menu.md): the 1.4.1 row (near line 408), after `and its check covers a set
    `$dropdownmenu-background` (the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), D21).` insert `An
    open nested Hybrid item's link in dropdown mode takes the same fill, Foundation's `.menu .is-active > a`
    highlight for an open nested parent, which the Dropdown Menu spec keeps (its D15); on that level the fill marks
    either the current link or the open parent, as in Foundation, and the open parent also shows its state
    through its toggle's `aria-expanded` and the visible submenu ([ADR 0042](../adr/0042-menu-current-page-aria-current.md),
    dated note).`
  - [dropdown-menu](../specs/dropdown-menu.md): Already holds (D9, D15); confirm.
- **Shared-document changes.** `adr/0042-menu-current-page-aria-current.md`, Consequences, append:
  `- 2026-09-29 ([Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)):
  the current page and an open parent are told apart in the accessibility tree always (`aria-current` against
  the toggle's `aria-expanded`), and in their look on a menu's top level and for button parents. An open nested
  Hybrid item's link in dropdown mode keeps Foundation's `.menu .is-active > a` fill, the Current link look, as
  Foundation's own markup draws an open nested parent; its open state also shows through its toggle's
  `aria-expanded` and the visible submenu (measured by the [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md),
  Q10; [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), D15).`
- **Rating.** Impact LOW (a qualifier and two sentences; no rule or API changes); confidence HIGH (ADR text
  compared word for word; Q10 measured in three engines). Decided.

### R48: Magellan's names, the State-class reading, and stale duplicate-directive claims

- **Decision.**
  1. Names: Magellan's `NfsMenu`, `orientation`, `expanded`, `simple`, `NfsTopBar`, `NfsTopBarRight`, `NfsGridX`,
     `NfsCell`, and `size` match the published Menu, Top Bar, and XY Grid specs. The guide example dropped
     Foundation's `grid-margin-x` "until that spec names its input" (ticket 122, What other specs need); the XY
     Grid spec names it `gridMarginX` on `NfsGridX` (a closed boolean through `nfsVariantBoolean`), so the gutter
     is restored.
  2. The State-class reading of ADR 0039 (Magellan decision 6, the user's decision of 2026-09-27) holds in every
     re-run: `Renderer2` writes a State class only on an element no library directive hosts, for state with no
     first-paint value (Reveal `html`, Off-canvas `body`, Magellan's links and list items); every other State
     class is a host binding (Orbit says so explicitly; Triggers D18 and the Dropdown's dropped `.hover` apply
     it to Trigger hosts; Sticky rejects a `Renderer2` `.sticky-container` because it has a first-paint value).
  3. Ticket 122's Menu item (b), dropping the list-item half of Magellan's marker: not done. ADR 0039's
     user-confirmed note names "Magellan's `.is-active` on the consumer's links and list items"; Magellan D11
     already weighs link-only (invisible in a Menu without `nfs-menu`); with `nfs-menu` both rules give the same
     look (the Menu spec's own note). No change.
  4. Stale duplicate-directive claims: since Angular 22.0 a template match discards host-directive matches of the
     same directive (building-blocks 1.9, measured with Angular 22.2.0 in the Menu ticket). Smooth Scroll D13,
     the Magellan D17 paragraph and row, ticket 121 (its Correction, 2026-09-27), and `map.md`'s Smooth Scroll
     line are already corrected. Still stale: the Forms spec (three places) and the Abide spec (three places),
     which cite NG0309 as a reason for not hosting `NfsFormLabel` or `NfsCallout`, and the records behind them
     (ticket 98's decision 3 and triage row, ticket 123's decision 7 and triage row). The other reasons stand
     (two spellings of `middle`, a forced callout look, one entry point importing another), so every decision
     stays; only the reason is removed. Ticket 141 also routed the Forms sentences to the architecture audit
     ([Audit: the specs against the architecture guide](../issues/142-audit-specs-against-architecture-guide.md));
     if its survivor lands first, the reviewer confirms instead of editing twice.
- **Evidence.** `specs/magellan.md:123-131`, `:145`, `:491` (D11), `:497` (D17), `:505-538`;
  `specs/xy-grid.md:104`, `:184`; `issues/122-rerun-magellan-class-rule.md:39-40`, `:116-122`, `:128-130`;
  `adr/0039-directives-manage-every-foundation-class.md` (2026-09-27 Magellan note); `specs/orbit.md:146`;
  `specs/triggers.md:431`; `specs/dropdown.md:118`; `specs/sticky.md:130`, `:391`; `specs/reveal.md:127`,
  `:139`; `specs/off-canvas.md:137`, `:152`. Sweep: `rg -n -i 'NG0309|duplicate[- ]directive|matches multiple
  times|match(es|ed)? (the directive )?twice'` over the whole effort; hits in `specs/forms.md:148`, `:203`,
  `:440`, `specs/abide.md:154`, `:570`, `:571`, `issues/98-spec-forms.md:76`,
  `issues/123-rerun-abide-class-rule.md:39`, `:67`; the rest are corrected text or history
  (`issues/30`, `issues/85`, `issues/121`, `issues/122`, `issues/141`, `research/architecture-guide-review.md`).
- **Per-spec changes.**
  - [magellan](../specs/magellan.md):
    - Guide usage example (near line 511), replace `<div nfsGridX>` with `<div nfsGridX gridMarginX>`.
    - The sentence after it (near line 538), replace `` `nfsGridX` and `nfsCell` with `size` render `.grid-x`,
      `.cell`, `.large-3`, and `.large-9` `` with `` `nfsGridX` with `gridMarginX` and `nfsCell` with `size` render
      `.grid-x`, `.grid-margin-x`, `.cell`, `.large-3`, and `.large-9` ``.
    - Class mapping row (near line 127): add `.grid-margin-x` to the first cell and, in the directive cell, write
      `` `NfsGridX` (`[nfsGridX]`) with its `gridMarginX` Variant input and `NfsCell` (`[nfsCell]`) with its
      `size` Variant input (`[size]="{large: 3}"`) ``.
    - Names sentence (near line 131), replace `` `NfsGridX`, `NfsCell`, and `size` are `` with `` `NfsGridX`,
      `gridMarginX`, `NfsCell`, and `size` are ``.
  - [forms](../specs/forms.md):
    - Near line 148, replace `` `NfsAbideLabel` does not host `NfsFormLabel`: a consumer who also wrote
      `nfsFormLabel` would match the directive twice, which Angular rejects at run time (NG0309, "Directive ...
      matches multiple times on the same element"), and `middle` would be spelt through a different directive on
      validated and unvalidated labels. `` with `` `NfsAbideLabel` does not host `NfsFormLabel`: `middle` would be
      spelt through a different directive on validated and unvalidated labels, and the Abide entry point would
      import the Forms one. (A consumer who also wrote `nfsFormLabel` beside a hosting directive would get one
      instance, not an error: since Angular 22.0 a template match discards the host-directive match of the same
      directive, building-blocks 1.9.) ``
    - Fallback (near line 203), replace `Nothing depends on unverified behaviour; the one measured risk (a directive
      matched twice on one element) is avoided by keeping the Forms and Abide label directives separate.` with
      `Nothing depends on unverified behaviour.`
    - D4, rejected cell (near line 440), replace `(writing both attributes throws NG0309, and `middle` would be
      spelt through two directives)` with `(`middle` would be spelt through two directives, and Abide would import
      Forms; writing both attributes would not be an error, building-blocks 1.9)`.
  - [abide](../specs/abide.md):
    - Neighbouring directives bullet (near line 154), replace `No Abide directive hosts one of them through
      `hostDirectives`: a consumer who also wrote the hosted attribute would match the directive twice, which
      Angular rejects at run time (NG0309), the hosted look would be forced on every host` with `No Abide
      directive hosts one of them through `hostDirectives`: the hosted look would be forced on every host`, and
      after `and the Abide entry point would import theirs (D18, D19).` add `(A consumer who also wrote the hosted
      attribute would get one instance, not an error: since Angular 22.0 a template match discards the
      host-directive match of the same directive, building-blocks 1.9.)`
    - D18, rejected cell (near line 570), replace `(a written `nfsCallout` would match twice, NG0309; the Abide
      entry point would import Callout's)` with `(the callout look forced on every Form alert; the Abide entry
      point would import Callout's)`.
    - D19, rejected cell (near line 571), replace `(a written `nfsFormLabel` would throw NG0309, and `middle`
      would be spelt through two directives)` with `(`middle` would be spelt through two directives, and Abide
      would import Forms)`.
  - Amendments (phase 2): the Forms amendment in [Spec: Forms](../issues/98-spec-forms.md) and the Abide
    amendment in [Spec: Abide](../issues/31-spec-abide.md) each state that the NG0309 reason in ticket 98
    (decision 3, triage row "Validation State classes stay with Abide") and in [Re-run: Abide spec under the class rule](../issues/123-rerun-abide-class-rule.md) (decision 7, triage row "Neighbouring directives beside,
    not hosted") is superseded by building-blocks 1.9, and that the decisions stand on their other reasons. The
    records themselves are not rewritten. Correction (2026-09-29, closing pass): in ticket 98 the reason sits in
    grilling question 5, decision 4, and the triage row "Validation State classes stay with Abide; sets side by
    side (4)", not in a decision 3; and the Abide amendment is in [Re-run: Abide spec under the class rule](../issues/123-rerun-abide-class-rule.md),
    the ticket the map cites last for the Abide spec, not in [Spec: Abide](../issues/31-spec-abide.md).
  - [smooth-scroll](../specs/smooth-scroll.md), [menu](../specs/menu.md), [top-bar](../specs/top-bar.md),
    [xy-grid](../specs/xy-grid.md): Already hold for this item; confirm.
- **Shared-document changes.** None (ADR 0039's note, building-blocks 1.1 and 1.4, and `map.md` already carry
  ticket 122's changes 1 to 4 and 7).
- **Rating.** Impact LOW (the gutter is one example attribute; the NG0309 fixes change reasons, not decisions;
  item (b) keeps what the user confirmed); confidence HIGH (published names read; the Angular fact measured and
  recorded in building-blocks 1.9). Decided.

### R49: ADR 0039's State-class note lists `html`

- **Decision.** Already holds. ADR 0039's 2026-09-27 dated note names "the Reveal's `is-reveal-open` and
  `zf-has-scroll` on `html` (the Reveal spec's Scroll lock, D27)" beside `body` and Magellan's links; building-blocks
  1.1 ("such as `html` (the Reveal's Scroll lock), `body`, or the links and list items of a Magellan navigation") and
  1.5 ("the Reveal Scroll lock on `html`") say the same, and the Reveal's class mapping row matches.
- **Evidence.** adr/0039:31; building-blocks.md 1.1 (:14) and 1.5 (:103); reveal.md:127 (`html.is-reveal-open`,
  `html.zf-has-scroll`: "Written on the document element with `Renderer2` by the Scroll lock, from a render callback");
  architecture-guide.md P11 (:176) cites the note without listing elements.
- **Per-spec changes.**
  - [reveal](../specs/reveal.md): Already holds (line 127); confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH (the text is there). Decided.

### R50: every Reveal mention elsewhere writes `<dialog nfsReveal>` without a class

- **Decision.** Already holds in every spec. Outside the Reveal spec, every Reveal host is `<dialog nfsReveal ...>`
  with no `class`; no spec writes `class="reveal"` in consumer code (the Off-canvas hits are its own `.reveal-for-*`
  classes in rendered output and copied-class check inputs).
- **Evidence.** `rg "<[a-z]+[^>]*\bnfsReveal\b"` outside reveal.md: dropdown.md:708, triggers.md:284, :461, :557,
  close-button.md:335, all `<dialog nfsReveal>` without `class`. `rg 'class="[^"]*\breveal\b'`: only reveal.md (rendered
  output :404-439, copied-class story 49 and D26) and off-canvas.md :457, :468, :531 (rendered output and copied-class
  inputs, CR-A (a) and (b)). The Reveal's own application class `class="dim-backdrop"` (reveal.md:694) is an
  Application class.
- **Per-spec changes.**
  - [close-button](../specs/close-button.md), [triggers](../specs/triggers.md), [off-canvas](../specs/off-canvas.md),
    [dropdown](../specs/dropdown.md): Already holds (lines above); confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH (measured by sweep). Decided.

### R51: no consumer-written `class="dropdown-pane"`

- **Decision.** Compliant under CR-A. Every remaining `class="dropdown-pane"` in the four specs is rendered output
  (server or hydrated HTML), the labelled input of the Dropdown's copied-class development check 7, or a browser-level
  test case of that check. No Usage example, story, or recipe writes it. The Tooltip's `class="right"` (tooltip.md:400)
  and the Off-canvas's copied classes (off-canvas.md:468) are the same labelled check-input form. The Dropdown usage
  comment "Foundation's class="dropdown-pane top small" becomes inputs" (dropdown.md:623) names Foundation's markup as
  prose (CR-A (c), (f)). The ticket-131 note "(done here; DRP's check)" is accurate; the routed table's "disputed" flag
  is closed.
- **Evidence.** anchored-pane.md:371, :374 ("server and closed", "hydrated, after opening"), :382-384 (Tooltip output);
  the consumer lines :366-368 and :377 carry no class. dropdown.md:385-393, :405-411, :418-420, :424-426 (output under
  "server" and "hydrated" comments); :429-430 (labelled "Foundation markup copied as is: ... dev check 7 warns once");
  :512-513 (browser-level "Classes" and "Copied classes (dev check 7)" cases). tooltip.md:346-406 output and the
  labelled check-6 input at :399-400; :498-500 test cases. triggers.md:278-306 output. Library code sketches
  (anchored-pane.md:518-526, :606: `host: {class: 'dropdown-pane', ...}`) are library directive metadata.
- **Per-spec changes.**
  - [anchored-pane](../specs/anchored-pane.md), [tooltip](../specs/tooltip.md), [triggers](../specs/triggers.md),
    [dropdown](../specs/dropdown.md): Already holds; confirm, applying CR-A to any `class=` the reviewer meets.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH (every hit read in context). Decided.
- Library directive metadata in a spec's code sketches (`host: {class: 'dropdown-pane'}`, `host: {class: 'tooltip'}`)
  is CR-A (d), as ruled in the checks section.

### R52: "consumer" means the application in the shared-utility specs

- **Decision.** The Anchored pane's renamed headings stand, and no spec cites the old ones: "What each consumer maps"
  and "ARIA requirements it imposes on consumers" occur only in resolved tickets (26, 27, 55) and research, which are
  records and stay as written. The vocabulary of ticket 131's decision 3 applies to all four shared-utility specs:
  "consumer" is the application and its developer, as ADR 0039 uses it; a library directive or spec built on a utility
  is a "consuming directive" or "consuming spec" (a Plugin, where the text lists Plugins). The Anchored pane spec
  already follows it; the Breakpoint service, Triggers, and Nested menu specs still use "consumer" for the library side
  in headings, table headers, and the Breakpoint service's numbered rules, which other specs cite as "consumer rule N".
  That label collides inside one phrase ("binds no consumer Motion class, consumer rule 3": the first is the
  application's class, the second the Plugin's rule), so it is renamed "consuming-directive rule N" wherever it is
  cited. "Test consumer" (the Anchored pane's test-only directives and hosts, also in storybook-conventions section 2)
  stays: ticket 131 kept it, and it names test code that uses the entry point as an application's own anchored element
  does (the Anchored pane's D23).
- **Evidence.** issues/131:35, :54 (decision 3), :73, :104; anchored-pane.md:274, :325 (renamed headings); `rg` for the
  old headings finds only issues/26:177, issues/27:185, issues/55:102, :218, research/out-of-scope-exclusions-2.md:69.
  Library-side "consumer": breakpoint-service.md:256, :258 ("Consumers and what each reads", "| Consumer |"), :304
  (heading), :308 (rule 1, "a consumer records whether focus is inside the widget"), :317 (table header), :319-:321
  ("The requirement on consumers", "no consumer makes the page scroll horizontally", "any consumer's swap callback");
  triggers.md:264 ("Consumers table"), :433 ("### Consumers: what each Openable spec provides"); nested-menu.md:152
  ("consumers (other specs):"), :293 ("| Consumer |" under "What each consuming spec maps"). "consumer rule N" cited at
  building-blocks.md:119, breakpoint-service.md:262, :272, :321, :325, off-canvas.md:281, :313,
  responsive-toggle.md:219, :350, responsive-menu.md:340, :576, reveal.md:462, dropdown.md:445, :589,
  responsive-accordion-tabs.md:370, :602, interchange.md:238, toggler.md:350.
- **Per-spec changes.**
  - [anchored-pane](../specs/anchored-pane.md): Already holds (headings at lines 274 and 325; "test consumers" stays);
    confirm.
  - [breakpoint-service](../specs/breakpoint-service.md):
    - heading `### ARIA requirements imposed on consumers` becomes `### ARIA requirements imposed on consuming directives`;
    - `Consumers and what each reads (building-blocks Part 2 and Part 3):` becomes `Consuming directives and what each reads (building-blocks Part 2 and Part 3):`, and that table's header cell `Consumer` becomes `Consuming directive`;
    - the WCAG table header `Requirement imposed on consumers, and what the service provides` becomes `Requirement imposed on consuming directives, and what the service provides`, and `Test each consumer spec inherits` becomes `Test each consuming spec inherits`;
    - every `consumer rule <n>` becomes `consuming-directive rule <n>` (lines 262, 272, 321, 325);
    - rule: elsewhere in the spec, "consumer" or "consumers" that names a library directive or spec built on the service (rule 1's "a consumer records whether focus is inside the widget", the WCAG rows' "The requirement on consumers", "no consumer makes the page scroll horizontally", "any consumer's swap callback", "the consumer's stories", "the consumer's mode") becomes "consuming directive(s)" or "consuming spec('s)"; it stays "consumer" where it names the application (its Sass, `$breakpoints`, Variant declaration file, unit tests, callback, client-hint recipe, `@defer` block, or own `@if` branches); where a sentence holds for any code that injects the service (the `current` signal row, "Consumers memoise"), write "a directive or application".
  - [triggers](../specs/triggers.md): heading `### Consumers: what each Openable spec provides` becomes `### What each Openable spec provides`; in the 2.4.3 row (near line 264) `(a requirement every Openable spec inherits, Consumers table)` becomes `(a requirement every Openable spec inherits, What each Openable spec provides)`. Every other "consumer" in the spec names the application (checked: lines 54, 86, 97, 101, 106, 121, 124, 152, 207, 217-218, 242, 259-260, 264, 270, 321, 333, 403, 406, 414-430, 482, 518, 548, 550, 583, 587, 598).
  - [nested-menu](../specs/nested-menu.md): in the family diagram (near line 152) `consumers (other specs):` becomes `consuming specs:`; under "What each consuming spec maps" (near line 293) the header cell `Consumer` becomes `Consuming spec`. The other uses name the application (checked: lines 89-863).
  - [off-canvas](../specs/off-canvas.md) (281, 313), [responsive-toggle](../specs/responsive-toggle.md) (219, 350), [responsive-menu](../specs/responsive-menu.md) (340, 576), [reveal](../specs/reveal.md) (462), [dropdown](../specs/dropdown.md) (445, 589), [responsive-accordion-tabs](../specs/responsive-accordion-tabs.md) (370, 602), [interchange](../specs/interchange.md) (238), [toggler](../specs/toggler.md) (350): every `consumer rule <n>` becomes `consuming-directive rule <n>`; nothing else changes.
- **Shared-document changes.** `building-blocks.md` 1.6 rule 5: replace `The Breakpoint service spec's consumer rule 3 names this exception` with `The Breakpoint service spec's consuming-directive rule 3 names this exception`, in the same edit as R54's change to that rule. Records (resolved tickets, research, audits) stay as written.
- **Rating.** Impact LOW (wording and a citation label; no API or contract); confidence HIGH (ticket 131's decision 3,
  HIGH/LOW there, and ADR 0039's usage; the label collision is in the text). Decided.

### R54: "bind no Motion class" under reduced motion covers the library's mapped classes too

- **Decision.** Two reduced-motion paths stay, as audit 0004's unrecorded departure 8 confirmed: the Reveal and the
  Toggler rely on `nfs-motion`'s 1 ms override and the consumer's own rule; the Responsive Toggle and the Dropdown pane
  bind no Motion class at all while `reducedMotion()` is true and complete in the same tick. The records say "bind no
  consumer Motion class", written before Motion names mapped to library classes; both specs already bind neither kind
  (specs/responsive-toggle.md:350, specs/dropdown.md:445). The wording becomes "bind no Motion class", naming both kinds
  where the rule is defined.
- **Evidence.** building-blocks.md:119 (1.6 rule 5); specs/breakpoint-service.md:310 (consumer rule 3), :262, :272;
  specs/responsive-toggle.md:350, :399, :422, :466, :591; specs/dropdown.md:370, :445, :535, :589 (D21), :727;
  specs/toggler.md:350; specs/reveal.md:462 (already "bind no Motion class"); building-blocks.md:376 (Part 3, already
  "bind no Motion class"). Source: issues/116:125.
- **Per-spec changes.**
  - [breakpoint-service](../specs/breakpoint-service.md), consumer rule 3 (near line 310; R52 renames the label
    "consuming-directive rule 3"): replace `a directive may bind no
    consumer Motion class while `reducedMotion` is true and complete the change in the same tick, which also covers a
    consumer keyframe class that carries no reduced-motion rule of its own` with `a directive may bind no Motion class
    while `reducedMotion` is true, neither the library's class mapped from a Motion name nor the consumer's own class in
    the dot form, and complete the change in the same tick, which also covers a consumer keyframe class that carries no
    reduced-motion rule of its own`.
  - [breakpoint-service](../specs/breakpoint-service.md), consumer table, ResponsiveToggle row (near line 262): `(binds no
    consumer Motion class, consumer rule 3)` becomes `(binds no Motion class, consuming-directive rule 3)` (R52's label).
  - [toggler](../specs/toggler.md), Animation, Reduced motion (near line 350): `lets a directive bind no consumer Motion
    class while `reducedMotion` is true` becomes `lets a directive bind no Motion class while `reducedMotion` is true`.
  - [dropdown](../specs/dropdown.md), Animation (near line 445): `names for directives that bind consumer Motion classes)`
    becomes `names for directives that bind no Motion class under reduced motion)`.
  - [responsive-toggle](../specs/responsive-toggle.md): Already holds (line 350: "no Motion class is bound"); confirm.
  - [reveal](../specs/reveal.md): Already holds (line 462); confirm.
- **Shared-document changes.** `building-blocks.md` 1.6 rule 5: replace "A directive may in addition bind no consumer
  Motion class while `reducedMotion()` is true" with "A directive may in addition bind no Motion class while
  `reducedMotion()` is true, neither the library's class mapped from a Motion name nor the consumer's own class in the
  dot form,". The rest of the rule stands.
- **Rating.** Impact LOW (wording of an exception two specs already implement); confidence HIGH (the specs' own text and
  audit 0004's confirmation). Decided.

### R55: a Story id for the Responsive Toggle's 2.4.11 e2e case

- **Decision.** Add one story, `responsive-toggle--sticky-title-bar` (export `StickyTitleBar`, `layout: 'fullscreen'`),
  named for its scenario (storybook-conventions section 3), and point the 2.4.11 row and the e2e case at it. It follows
  the precedent of `smooth-scroll--sticky-offset`: the bar is held by an inline `position: sticky; top: 0`, because the
  scenario is the consumer's own sticky layout that the spec's 2.4.11 row describes ("`nfsSticky` beside
  `nfsTitleBar`, or `position: sticky`"), not the Sticky plugin, and the Prototyping Utilities have no sticky position
  class. No existing story fits: the five listed stories have no sticky bar or scroller.
- **Evidence.** specs/responsive-toggle.md:267 (2.4.11 row), :378 (Story ids), :424 (the case without an id);
  specs/smooth-scroll.md:317, :349 (precedent); storybook-conventions.md sections 3, 4 (`layout: 'fullscreen'`), 8 (inline
  style only for values Foundation has no class for; Prototyping Utilities' `nfsOverflowY` for scaffolding);
  specs/prototyping-utilities.md:37 (`nfsOverflowY="scroll"`). Source: issues/116:125.
- **Per-spec changes.**
  - [responsive-toggle](../specs/responsive-toggle.md), Story ids sentence (near line 378): after
    ``responsive-toggle--close-on-navigate`` insert `, `responsive-toggle--sticky-title-bar` (`hideFor="xxlarge"`;
    a scroller, a `div` with `nfsOverflowY="scroll"` and an inline height and `scroll-padding-top: 3rem`, holds the
    bar, held at its top by an inline `position: sticky; top: 0`, the open menu, and filler content, so tabbed menu
    items scroll under the bar's edge)`.
  - [responsive-toggle](../specs/responsive-toggle.md), layer 1 list: add `- `responsive-toggle--sticky-title-bar`: a
    click on the menu icon sets `aria-expanded="true"` and displays the menu; the bar's computed `position` is
    `sticky`. Whether a focused item is obscured is the e2e case, in three engines.`
  - [responsive-toggle](../specs/responsive-toggle.md), e2e list (near line 424): replace `focus not obscured (2.4.11) in
    a story variant with a sticky title bar and `scroll-padding-top`, each tabbed menu item's rectangle clear of the
    bar.` with `focus not obscured (2.4.11) on `responsive-toggle--sticky-title-bar`: with the menu open, after each Tab
    through its items, the focused item's rectangle does not intersect the bar's.`
  - [responsive-toggle](../specs/responsive-toggle.md), 2.4.11 row (near line 267), last cell: `in a story with a sticky
    title bar and `scroll-padding-top`` becomes `on `responsive-toggle--sticky-title-bar``.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (one additive story id); confidence HIGH (the conventions fix the id form; the Smooth Scroll
  precedent fixes the layout). Decided.

### R56: every Off-canvas panel binds `position`; the Zero-breakpoint report

- **Decision.** Every Off-canvas panel written in any spec's examples binds `position` (12 panels, in the
  Off-canvas, Triggers, and Accordion Menu specs). Two texts still defer: the Accordion Menu calls `position` the
  input the Off-canvas re-run "names", and the Top Bar's `top-bar--title-bar` story does not say its story panels
  are Off-canvas panels with `position` (ticket 117 asked for both). The Top Bar's `stackedFor` and the Off-canvas
  `revealOn` and `inCanvasOn` agree on the Zero breakpoint (no class, a development warning), but only the
  Off-canvas spec says what the Runtime check receives for it (`needs` `[]`, so one mistake makes one report);
  the Top Bar says the same in its Runtime checks paragraph.
- **Evidence.** `rg -n 'nfsOffCanvas(Absolute)?\b'` over `specs/` (every panel line carries `position`);
  `specs/off-canvas.md:127-128`, `:235-236`, `:291` (check 7), `:298`, `:598` (D6); `specs/top-bar.md:103`,
  `:199` (check 6), `:202`, `:399`; `specs/accordion-menu.md:588-591`;
  `issues/117-rerun-off-canvas-class-rule.md:149`, `:157`.
- **Per-spec changes.**
  - [accordion-menu](../specs/accordion-menu.md): near line 588, replace `(markup owned by that spec;
    `position="left"` stands for Foundation's `.position-left`, whose input the [Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md) names)` with `(markup owned by the [Spec: Off-canvas](../issues/25-spec-off-canvas.md); `position="left"` is its required `position` Variant input, which
    sets Foundation's `.position-left`, its D6)`.
  - [top-bar](../specs/top-bar.md):
    - Story list (near line 399), replace `` `[nfsOpen]` Triggers on story panels) `` with `` `[nfsOpen]` Triggers
      on two story Off-canvas panels, `nfsOffCanvas` with `position="left"` and `position="right"`, imported from
      `ngx-foundation-sites/off-canvas` as scaffolding) ``.
    - Runtime checks paragraph (near line 202): the Zero-breakpoint `needs` wording is part of R59's one merged
      replacement of that paragraph's opening; apply it there.
  - [off-canvas](../specs/off-canvas.md), [triggers](../specs/triggers.md): Already hold; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (wording; the Runtime check contract is the Breakpoint service spec's and unchanged);
  confidence HIGH. Decided.

### R57: the Tooltip's dropped legacy classes, one term for Application classes, and what each such input reports

- **Decision.**
  1. Building-blocks 1.4 already lists the Tooltip's legacy position classes as dropped (the Tooltip re-run's proposal 2
     is applied, with its proposals 1 and 3), and the Anchored pane's `position` row says both consumers drop them.
     Holds.
  2. The term is the glossary's **Application class** (already in CONTEXT.md). Every spec writes it capitalised, as
     the glossary's terms are written ("application class" appears lowercase in 21 specs); "the consumer's own class",
     the paraphrase building-blocks 1.6 and CONTEXT's **Motion class** use, stays allowed in running prose; "the
     developer's own class" (Toggler, Tooltip, Responsive Toggle, Off-canvas, Equalizer, Flexbox Utilities, Reveal,
     Close Button) becomes "the consumer's own class", so one paraphrase remains. The API table row of each input that
     takes such classes (`toggler`, `templateClasses`, `parentClass`, `animate`, `animationIn`, `animationOut`) names
     them "Application class(es)".
  3. What each input reports is a confirmed difference, not a misalignment, and each spec already states its set:
     every one reaches `nfs-` (the Toggler's check 3, the Tooltip's filter and check 7, the Motion dot form's `nfs-`
     case; a `parentClass` naming an `nfs-` class matches no ancestor and trips the Dropdown's check 4), and each
     reports the Foundation names that would change its own element: `toggler` the hiding classes, `expanded`, and
     every `is-` name (its host's owner binds State classes); `templateClasses` the `foundation-tooltip` mixin's
     classes, and no `is-` name, because the tip binds none and filtering one would drop the consumer's class in
     production (the Tooltip re-run's grilling question 6); the Motion dot form Motion UI's transition classes, through
     "started no animation"; `parentClass` none, because it is a lookup that changes no look, and a Foundation class
     there is documented as not allowed (Dropdown D6). Each keeps its Foundation Option's format: the dot form for
     Motion inputs and `toggler` (leading dots stripped), plain names for `templateClasses` and `parentClass`. The
     Tooltip spec states the `is-` reason, which today only its ticket holds.
  4. No spec's consumer CSS recipe selects `.tooltip`, a pip class, `.has-tip`, or an `nfs-` class: the only `.nfs-`
     selector in any spec is the Accordion's Library mixin rule (CR-A (d)); the Tooltip's D25 fixes the rule. Holds.
- **Evidence.** building-blocks.md:88 (1.4, "the Tooltip's legacy position classes (dropped by ...)"), :93 (Dropped
  options, `templateClasses`), :308 (Table A Tooltip row); specs/anchored-pane.md:86, :510 (D22); CONTEXT.md:245-247;
  `rg -o -i "application class(es)?" specs/*.md` (21 specs, lowercase); `rg -o "developer's own [a-z]+" specs/*.md`;
  specs/toggler.md:198, :216 (check 3), :468 (D20); specs/tooltip.md:95, :116, :196, :229, :570 (D7), :588 (D25);
  specs/dropdown.md:249, :574 (D6); issues/119:43 (grilling question 6), :126; `rg -n "\.has-tip|\.tooltip\b" specs/*.md`
  (no recipe outside the Tooltip spec's prose); `rg -n "\.nfs-[a-z-]+ *[{,]" specs/*.md` (accordion.md:673 only, a Library
  mixin rule).
- **Per-spec changes.**
  - Every spec: write "application class(es)" as "Application class(es)", and "the developer's own class(es)" or "the
    developer's own keyframe class(es)" as "the consumer's own class(es)" / "the consumer's own keyframe class(es)"
    wherever the phrase names a CSS class (not "the developer's own anchored element", "stylesheet", "rules", "names",
    or "id"). Found today in: accordion, anchored-pane, breadcrumbs, button, button-group, drilldown-menu, dropdown,
    interchange, media-object, menu, nested-menu, responsive-accordion-tabs, responsive-menu, responsive-toggle, tabs,
    toggler, tooltip, top-bar, triggers (lowercase term); toggler, tooltip, responsive-toggle, off-canvas, equalizer,
    flexbox-utilities, reveal, close-button (developer's own class).
  - [toggler](../specs/toggler.md), `toggler` row (near line 198): `The developer's own class names, never a Foundation or
    library class` becomes `Application class names, never a Foundation or library class`.
  - [tooltip](../specs/tooltip.md), `templateClasses` rows (near lines 95, 116, 196): `the developer's own classes only`
    and `The developer's own classes (application classes)` become `Application classes only` and `Application classes`.
    D7 (near line 570), Rationale cell: append `; `is-` names are neither filtered nor reported, because the tip binds no
    `is-` class and filtering one would drop the consumer's own class in production (the Toggler's check 3 reports them,
    because its host's owner binds State classes)`.
  - [dropdown](../specs/dropdown.md), `parentClass` row (near line 249): `It names one of the consumer's own classes, never
    a Foundation or library class` becomes `It names an Application class, never a Foundation or library class`.
  - [reveal](../specs/reveal.md), `animationIn` row (near line 222): `the consumer's own keyframe classes each with a leading
    dot` becomes `Application classes that are keyframe animations, each with a leading dot`; the Toggler's, Dropdown
    pane's, and Responsive Toggle's `animate` rows name their dot-form classes the same way.
- **Shared-document changes.** None (building-blocks 1.4, Table A, the ADR 0039 note, and CONTEXT.md hold).
- **Rating.** Impact LOW (vocabulary in prose and one rationale sentence; no API changes); confidence HIGH (the glossary
  term and each input's report set are recorded decisions). Decided.

### R58: the Equalizer's 320 px case

- **Decision.** The 1.4.10 e2e case moves from "every story" to one new story in the layout the spec recommends,
  because the stories keep breakpoint-independent layouts for the 414 px test runner (`size="4"`, three columns at
  every width), which the spec's own 1.4.10 row calls failing ("a fixed multi-column grid at every width would
  fail"), so they cannot be reflow evidence. New Story id `equalizer--reflow`: Foundation's docs example in the
  breakpoint-aware form (`nfsGridX gridMarginX nfsEqualizer equalizeOn="medium"`, three `nfsCell [size]="{medium:
  4}"` cells, each an `nfsCallout nfsEqualizerWatch`, one holding a long word); its play function at 414 px asserts
  the cells stack and no `min-height` is written.
- **Evidence.** specs/equalizer.md:239 (1.4.10 row), :318 (stories' layouts), :366 (the case); issues/126:87.
- **Per-spec changes.** [equalizer](../specs/equalizer.md): add `equalizer--reflow` to the Story id list (near line
  318) and to the play-function list with the assertion above; replace the e2e case (near line 366) "- WCAG 1.4.10:
  every story at a 320 px viewport:" with "- WCAG 1.4.10: `equalizer--reflow` at a 320 px viewport:", and append
  "The other stories keep breakpoint-independent layouts for the 414 px test runner and are not reflow evidence.";
  the 1.4.10 row's test cell "in every story" becomes "in `equalizer--reflow`".
- **Shared-document changes.** None.
- **Rating.** Impact LOW (one story and one test's scope); confidence HIGH (the spec's own reflow claim decides it).
  Decided.

### R59: every directive with a Variant property reports through `nfsVariantCheck`, lists no flag-gated property, and tests the missing property in its own file

- **Decision.** One rule for every directive whose Variant inputs read a Variant property, applied in each spec's Runtime check bullet and its browser-level Runtime check case:
  1. The bullet names the handle call with its argument, `nfsVariantCheck('<selector name>')` (the directive class's camelCase for a directive several attributes create, ADR 0044), and the exact `include('<mixin>', [<settings>])` call with the condition under which it runs: on every run whether or not a value is bound, or, where the property is read only for a value that may stay unbound and the directive's own mixin holds nothing it needs, only while such a value is bound (the Breakpoint service spec's rule, breakpoint-service.md line 434).
  2. `include()` lists only properties its mixin never leaves empty on Foundation's defaults, never a flag-gated one (the Media Object's shared opposite-direction property is the recorded exception, building-blocks 1.13).
  3. The browser-level case in which the property is absent and `strictVariantProperties` reports sits "in a test file of its own", or the spec says "one test file per case", because reads and reports are once per realm (breakpoint-service.md line 509).
  The sweep found 20 specs with such directives. Every `include()` a spec states lists no flag-gated property. Nine specs already meet all three points; eleven need wording. building-blocks 1.4 and the Breakpoint service's consumer table still describe `include()` as unconditional, which the "only while bound" exception (Off-canvas, Top Bar, Visibility Classes, the three grids, Flexbox Utilities, Typography Helpers, Media Object) contradicts; both get the exception.
- **Evidence.** building-blocks.md 1.4 (line 77); breakpoint-service.md lines 274, 434, 435, 509, 757; issues/129-rerun-breakpoint-service-class-rule.md lines 109-114 (the three checks and the `include()` calls for Button, Close Button, Menu); per spec, the Runtime check bullet and case cited below. Specs whose families are all closed or who have none, and so make no call (confirmed by their Sass item (6) or Runtime check line): abide, accordion, accordion-menu, anchored-pane, breadcrumbs, card, drilldown-menu, dropdown-menu, equalizer, float-classes, forms, interchange, magellan, nested-menu, orbit, pagination, responsive-accordion-tabs, responsive-menu, responsive-toggle, reveal, slider, smooth-scroll, sticky, switch, table, tabs, thumbnail, toggler, tooltip, triggers. The menu Plugin roots and `NfsSubmenu` host `NfsMenu`, whose one instance per element makes the call, so their specs rightly write "none of its own".
- **Per-spec changes.**
  - Already hold; confirm: [badge](../specs/badge.md) (lines 132, 262), [label](../specs/label.md) (lines 139, 274), [progress-bar](../specs/progress-bar.md) (lines 166, 204, 356), [visibility-classes](../specs/visibility-classes.md) (lines 183, 390), [xy-grid](../specs/xy-grid.md) (lines 214, 417), [float-grid](../specs/float-grid.md) (lines 238, 419), [flex-grid](../specs/flex-grid.md) (lines 204, 402), [flexbox-utilities](../specs/flexbox-utilities.md) (lines 189, 349), [typography-helpers](../specs/typography-helpers.md) (lines 200, 384), [off-canvas](../specs/off-canvas.md) (lines 298, 540). Where one of these writes the handle as `nfsVariantCheck()` without its argument (badge line 98, label line 104, progress-bar line 116, xy-grid line 131, float-grid line 160, flex-grid line 131, flexbox-utilities line 126, prototyping-utilities line 191), the reviewer writes the argument (`nfsVariantCheck('nfsBadge')`, one per directive).
  - [prototyping-utilities](../specs/prototyping-utilities.md): holds (lines 266, 435); near line 266 replace "`include('nfs-prototyping-utilities', ['prototype-spacers-count', <its own registry settings>])`" with "`include('nfs-prototyping-utilities', ['prototype-spacers-count', <its own registry settings>])`, never a `prototype-<flag>-breakpoints` flag property, which is empty while its flag is off,".
  - [button](../specs/button.md): the Variant check bullet (near line 194) opens "Variant check: in development builds, and in production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`, `NfsButton` reports its bound Variant values to the Runtime checks after the first render." Replace that sentence with "Variant check: `NfsButton` creates the handle `nfsVariantCheck('nfsButton')` (development builds, and production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`) and, in its `afterRenderEffect` read phase, calls `include('nfs-button', ['button-palette', 'button-sizes'])` on every run, never the flag-gated `button-responsive-expanded`, then `value()` for each bound `color`, `size`, and responsive `expanded`." In the browser-level Runtime check case (near line 371) replace "with no style block, one `strictVariantProperties` report names `@include nfs-button;`" with "in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-button;`".
  - [button-group](../specs/button-group.md): the Variant check bullet (near line 160) opens "`NfsButtonGroup` reports its bound `color` and `size` to the Runtime checks after the first render." Replace with "`NfsButtonGroup` creates the handle `nfsVariantCheck('nfsButtonGroup')` and, in its read phase, calls `include('nfs-button', ['button-palette', 'button-sizes'])` on every run, naming `nfs-button`, the one writer of both properties (D11), then `value()` for a bound `color` and `size`." In the case near line 342 replace "with no style block, one `strictVariantProperties` report names `@include nfs-button;`" with "in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-button;`".
  - [close-button](../specs/close-button.md): near line 136 replace "at its first render `NfsCloseButton` requests `closebutton-size` from the Runtime check whether or not `size` is bound (D10)." with "`NfsCloseButton` creates the handle `nfsVariantCheck('nfsCloseButton')` and, from its first render on, calls `include('nfs-close-button', ['closebutton-size'])` on every run whether or not `size` is bound, then `value('size', ...)` for a bound size (D10)." Near line 269 replace "with the property absent, a close button with no `size` reports once" with "in a test file of its own, with the property absent, a close button with no `size` reports once".
  - [callout](../specs/callout.md): near line 139 replace "at its first render `NfsCallout` requests `callout-sizes` from the Runtime check whether or not an input is bound, and reports its bound values (D12)." with "`NfsCallout` creates the handle `nfsVariantCheck('nfsCallout')` and, from its first render on, calls `include('nfs-callout', ['callout-sizes'])` on every run whether or not an input is bound, then `value()` for a bound `color` (need on `foundation-palette`) and `size` (need on `callout-sizes`) (D12)." Near line 288 replace "with `--nfs-callout-sizes` absent, a callout with no input bound reports" with "in a test file of its own, with `--nfs-callout-sizes` absent, a callout with no input bound reports".
  - [dropdown](../specs/dropdown.md): holds for the call (line 280); near line 514 replace "with the property absent, a pane with no `size` bound reports" with "in a test file of its own, with the property absent, a pane with no `size` bound reports".
  - [responsive-embed](../specs/responsive-embed.md): holds for the call (line 137); near line 302 replace "with the property absent, a box with no `ratio` bound reports" with "in a test file of its own, with the property absent, a box with no `ratio` bound reports".
  - [media-object](../specs/media-object.md): holds for the call (line 168); near line 341 replace "with the property absent and `alignment` bound, `strictVariantProperties` reports once" with "in a test file of its own, with the property absent and `alignment` bound, `strictVariantProperties` reports once".
  - [menu](../specs/menu.md): the Runtime checks paragraph (near line 185) names no call. After "whose spec defines how a directive reports):" insert "`NfsMenu` creates the handle `nfsVariantCheck('nfsMenu')` and, only while an `orientation` rules key or an `expanded` query names a Class breakpoint above the Zero breakpoint, calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value()` for those values, because `nfs-breakpoint-properties` holds nothing else the Menu needs (the Top Bar's rule);". Near line 374 replace "a missing `--nfs-breakpoint-classes` reports once under `strictVariantProperties`, naming `nfs-breakpoint-properties`." with "in a test file of its own, with the property absent and an `orientation` rules key above the Zero breakpoint bound, `strictVariantProperties` reports once, naming `nfs-breakpoint-properties`; a menu with no responsive value requests nothing."
  - [top-bar](../specs/top-bar.md): near line 202 replace "whose spec defines how a directive reports): while `stackedFor` is bound, `strictVariantNames` reports" with "whose spec defines how a directive reports): `NfsTopBar` creates the handle `nfsVariantCheck('nfsTopBar')` and, only while `stackedFor` is bound, calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('stackedFor', value, needs)` with `needs` `[{setting: 'breakpoint-classes', name: value}]` for a Class breakpoint above the Zero breakpoint and `[]` for the Zero breakpoint (development check 6 reports that one, so one mistake makes one report), as the Off-canvas panel does for `revealOn` and `inCanvasOn` (R56); `strictVariantNames` reports". Near line 422 replace "with the property absent and `stackedFor` bound, `strictVariantProperties` reports once" with "in a test file of its own, with the property absent and `stackedFor` bound, `strictVariantProperties` reports once".
  - [breakpoint-service](../specs/breakpoint-service.md): in the consumer table row near line 274 replace "`include()` at its first render, whether or not a value is bound, and `value()` for each rendered Variant value (Runtime checks)." with "`include()` from its first render on, whether or not a value is bound (or only while a value that reads the property is bound, where its own mixin holds nothing it needs, as the Runtime checks section says), and `value()` for each rendered Variant value; its missing-property browser-level case sits in a test file of its own (Runtime checks)."
- **Shared-document changes.** building-blocks.md 1.4, "Defaults and binding" bullet: replace "it calls `include(mixin, settings)` on every run, bound value or not, naming only properties its mixin never leaves empty on Foundation's defaults, then `value(input, value, needs)` for each rendered value, with `needs` from the same mapping that sets its classes." with "it calls `include(mixin, settings)` on every run, bound value or not (or, where the property is read only for a value that may stay unbound and its own mixin holds nothing it needs, only while such a value is bound: the Off-canvas `revealOn`, the Top Bar `stackedFor`, the grids' counts), naming only properties its mixin never leaves empty on Foundation's defaults and never a flag-gated one, then `value(input, value, needs)` for each rendered value, with `needs` from the same mapping that sets its classes; the spec names the call as `nfsVariantCheck('<directive>')`, and its missing-property browser-level case sits in a test file of its own, because reads and reports are once per realm ([Spec: Breakpoint service (shared utility)](issues/53-spec-breakpoint-service.md), Runtime checks)." (Check the exact current sentence before replacing; line 77.)
- **Rating.** Impact LOW (spec wording and test-file placement; the contract is the Breakpoint service spec's, unchanged); confidence HIGH (the rule is quoted from breakpoint-service.md and ticket 129; the sweep lists every spec). Decided.

### R60: `NfsButton` and `NfsSlider` carry both boolean conventions

- **Decision.** The case exists as stated, and both specs already say so (button.md line 544; slider.md line 223): `disabled`, `disabledInteractive`, and the Slider's `clickSelect` are Options through `booleanAttribute`, while `dropdown`, `arrowOnly`, `expanded`, and the Slider's `vertical` are Variant inputs through `nfsVariantBoolean`. The dissent recorded in ticket 81 reopens only "if the consistency review finds the two boolean conventions ... confuse consumers enough to extend the typed transform to Options". The review does not find that, so ADR 0040 is not reopened and building-blocks 1.4 keeps Options on `booleanAttribute`. Reasons: (1) every value a consumer is meant to write (the bare attribute, `"true"`, `"false"`, a bound boolean) behaves the same under both transforms; only a misspelt string differs (`dropdown="flase"` fails to compile, `disabled="flase"` compiles and disables), so nothing a correct template does shows the difference; (2) one convention cannot be reached anyway: an `@angular/aria` boolean a wrapper exposes through `hostDirectives` keeps Aria's `booleanAttribute`, because a wrapper cannot change a hosted input's transform (the Accordion's `AccordionGroup.disabled`, `src/aria/accordion/accordion-group.ts:90`), so extending the typed transform to the library's own Options would leave a third, mixed state; (3) `booleanAttribute` is what Angular Material and Aria use for every boolean, the shape consumers already know. The two specs' existing sentences are the documentation; nothing changes in them.
- **Evidence.** issues/81-decide-typed-variant-inputs-open-sass-maps.md line 418 (the dissent and its trigger), line 60 (J09), line 137; adr/0040-variant-input-types.md line 38; building-blocks.md 1.4 (line 60 Options, line 61 Variant inputs); button.md lines 159-167, 544; slider.md lines 214-217, 223; accordion.md line 136 (`hostDirectives: AccordionGroup (inputs: disabled)`); `d:/projects/github/angular/components/src/aria/accordion/accordion-group.ts:90`, `accordion-trigger.ts:82`; `d:/projects/github/angular/components/src/material/button/button-base.ts:101-139`.
- **Per-spec changes.**
  - [button](../specs/button.md): already holds (line 544); confirm.
  - [slider](../specs/slider.md): already holds (line 223); confirm.
- **Shared-document changes.** ADR 0040, Consequences, append:

  > - 2026-09-29 ([Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)): the dissent that reopens `booleanAttribute` for boolean Variant inputs, if the two boolean conventions confuse consumers, is not reopened. `NfsButton` and `NfsSlider` carry both (Options `disabled`, `disabledInteractive`, and `clickSelect` through `booleanAttribute`; Variant inputs `dropdown`, `arrowOnly`, `expanded`, and `vertical` through `nfsVariantBoolean`), and each spec states the difference. Every value a consumer is meant to write behaves the same under both; only a misspelt string differs. One convention is out of reach, because an `@angular/aria` boolean that a wrapper exposes through `hostDirectives` keeps Aria's `booleanAttribute` (the Accordion's `disabled`).
- **Rating.** Impact HIGH (the transform of every boolean Option in every spec is public API; narrowing it after the first release would need an Angular major under ADR 0045); confidence HIGH (the ADR's panel decided it with this dissent recorded; the trigger's condition is not met on the evidence, and the alternative cannot give one convention). Decided.

### R61, R63: the Orbit's class-only directives and Table A's Orbit row

- **Decision.** Both hold in substance. The five class-only directives (`[nfsOrbitWrapper]`, `[nfsOrbitControls]`,
  `figure[nfsOrbitFigure]`, `img[nfsOrbitImage]`, `figcaption[nfsOrbitCaption]`) have the Slider fill's shape
  everywhere they are cited: a static host class, no inputs or `exportAs`, nothing injected in production, an
  optional development-only parent lookup that warns outside the parent, and in the forgotten-import spec a
  `strictParents` throw. One wording gap: the Orbit's hierarchy block calls them "(class only)" where the Slider's
  names the development-only lookup; it is aligned. Table A's Orbit row carries ticket 125's proposal 1 (directives
  cell, "one per Structural class", and the Primitives clause), and Table B's DI cell carries proposal 2.
- **Evidence.** orbit.md:120-127, :143, :153-161, :219-223, :251, :255, :561 (D23); slider.md:152, :236;
  forgotten-import-checks.md:239-240; building-blocks.md Table A:298, Table B:327; issues/125:128-139, :162.
- **Per-spec changes.**
  - [orbit](../specs/orbit.md), the hierarchy block (near lines 153-161): each "(class only)" becomes "(class only;
    in development builds only: optional nfsOrbitToken, dev check 8)", as the Slider's `NfsSliderFill` line reads.
  - [slider](../specs/slider.md): none.
- **Shared-document changes.** None (Table A and Table B already agree).
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R62: translucent colours over images

- **Decision.** The Orbit re-run's proposal 3 is adopted: building-blocks 1.10's first bullet composites a
  translucent colour painted over an image over `#fff` and over `#000` (the Orbit's caption and arrow bands), and
  the Orbit spec does (D17; lines 341, 448, 644). No other spec's Library mixin checks a translucent colour over an
  image: the Reveal's and the Off-canvas's overlays dim the page and are checked over `$body-background`; the Card's
  translucent divider sits on the card background; the Thumbnail's shadow is drawn outside the image; the
  Interchange's background story puts its text on a solid `nfsCallout`. The Interchange's 1.4.3 row allows "a
  solid or overlay background that meets it" for consumer text over a background image, which is the one other
  place the rule applies, as consumer guidance.
- **Evidence.** building-blocks 1.10, first bullet; [Re-run: Orbit spec under the class rule](../issues/125-rerun-orbit-class-rule.md) (issues/125:141, 165); `rg 'rgba\(|transluc|over images'
  specs/` (above); interchange.md:249, 361, 495.
- **Per-spec changes.**
  - [interchange](../specs/interchange.md): in the 1.4.3 row (near line 249), `or sits on a solid or overlay
    background that meets it` becomes `or sits on a solid background that meets it, or on a translucent overlay
    that meets it composited over `#fff` and over `#000`, the lightest and darkest colours an image can hold
    (building-blocks 1.10)`.
  - [orbit](../specs/orbit.md): already holds; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R65: Trigger hosts carry no class; no library Motion class in consumer `animate.*`

- **Decision.** Already holds for the sweep: no spec writes `animate.enter` or `animate.leave` with an `nfs-*` class in
  consumer code, and every Trigger host in every spec is `nfsButton` (57), `nfsCloseButton` (23), `nfsMenuIcon` (13), a
  link (8), or a native button (6), none with a `class`. The check reads "a Trigger host carries no consumer-written
  class; any class on it comes from a library directive written beside the Trigger", because a class directive other
  than the three (the Thumbnail's `<button type="button" nfsThumbnail [nfsOpen]="lightbox">`) is equally compliant (Triggers
  D16, D18). The Top Bar and Off-canvas names in the Triggers spec match their published specs (`nfsTitleBar`,
  `nfsTitleBarLeft`, `nfsTitleBarTitle`, `button[nfsMenuIcon]`; `nfsOffCanvas` with the required `position`). The
  CONTEXT **Motion class** definition already is ticket 130's proposal 6, word for word. Two changes remain: the
  Toggler re-run has named its Motion values, so the Triggers' deferral ("the examples leave it out") ends and its
  in-place `data-closable` examples take `animate="fade-out"` (a leaving name alone, the counterpart of Foundation's
  bare `data-closable` and its `fadeOut()`; `data-closable="slide-out-right"` becomes `animate="slide-out-right"`,
  Toggler user story 44), as ticket 130 asked; and the one prose Trigger without `type` gets it (building-blocks 1.8:
  Triggers are native `<button type="button">`).
- **Evidence.** Sweep: `D:/tmp/nfs-133/triggers/hosts-out.txt` (107 hosts in 16 specs; zero with `class` or `[class`;
  zero hosts outside the five kinds; the six native buttons: thumbnail.md:326, triggers.md:123, :283, :297, :309,
  :510). `rg 'animate\.(enter|leave)\s*=\s*"[^"]*nfs-'` finds nothing; the only `nfs-` Motion values in consumer-style
  text are the fails-to-compile examples at reveal.md:74 and toggler.md:349. issues/130:61 (decision 4), :65, :112-114
  (proposal 6), :127, :129, :131; CONTEXT.md:274 (Motion class, identical to proposal 6); top-bar.md selector counts
  (`nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarTitle`, `nfsMenuIcon`); off-canvas.md:33, building-blocks 1.4
  (`position` required); toggler.md:72 (story 44), building-blocks 1.6 rule 4 (`NfsMotionPair`: "a leaving name alone,
  whose name tells its direction"); triggers.md:528-546, :548.
- **Per-spec changes.**
  - [triggers](../specs/triggers.md):
    - The three Usage examples near lines 514-541 (the focus hint, `data-closable` replacement 2, "Both at once") and
      the paragraph after them take R2's text, which already carries this item's `animate="fade-out"` values and
      the `slide-out-right` sentence; apply them once.
    - Nearest Openable bullet (near line 123): `<button nfsClose nfsTooltip="Close">` becomes `<button type="button" nfsClose nfsTooltip="Close">`.
  - [thumbnail](../specs/thumbnail.md), [dropdown](../specs/dropdown.md), [off-canvas](../specs/off-canvas.md), [reveal](../specs/reveal.md), [toggler](../specs/toggler.md), [top-bar](../specs/top-bar.md), [responsive-toggle](../specs/responsive-toggle.md), [close-button](../specs/close-button.md), [callout](../specs/callout.md), [button](../specs/button.md), [button-group](../specs/button-group.md), [tooltip](../specs/tooltip.md), [anchored-pane](../specs/anchored-pane.md), [accordion-menu](../specs/accordion-menu.md), [responsive-menu](../specs/responsive-menu.md): Already holds (sweep); confirm, and apply the check to any Trigger the reviewer adds. The Callout's and Close Button's dismissible examples and stories take R2's Motion values (the Motion input stays optional; hiding at once is allowed).
- **Shared-document changes.** None: CONTEXT's Motion class line is already proposal 6, and building-blocks 1.6 rule 2
  already carries ticket 130's proposal 5.
- **Rating.** Impact LOW (examples and one sentence; the contract is Triggers D16 to D18 and the Toggler's published
  input); confidence HIGH (sweep; Toggler story 44 and building-blocks 1.6 rule 4 define the value). Decided.

### R66: every static-class read follows building-blocks 1.4's initial-state rule

- **Decision.** Ticket 107's proposal 1 is adopted as building-blocks 1.4's "Initial state is bound, never read from a
  class" bullet, and all ten re-run specs apply it: none seeds state or a Variant from a static Foundation class; each
  directive that binds a Foundation class dynamically reads its host's static `class` through `HostAttributeToken` in
  development builds only and warns once naming the input; redundant Structural classes merge unreported; the Toggler
  still reads the consumer's own class in Class mode. Two patterns the specs share are not yet worded in building-blocks
  1.4, and it takes them: (a) a plugin root's class that its directive binds `true` whenever the root stands alone and
  that a Responsive Menu binds per Menu mode (`accordion-menu`, `drilldown`, `dropdown`) is treated as a redundant
  Structural class, stripped only in the modes that are not live and never reported (Accordion Menu D24, Dropdown Menu
  D22, Drilldown Menu D28, Responsive Menu D22); (b) a Foundation class no directive binds but that Foundation's CSS or
  JavaScript reads on that element is reported the same way (the Tooltip's legacy position classes; the Slider Handle's
  `slider-handle`, whose Foundation rules still reach the input). The bullet's list of re-runs also gains the Off-canvas
  resolution, the one entry without its parenthesis.
- **Evidence.** Proposal 1: issues/107:58-60; building-blocks.md:88. Per spec: nested-menu.md:284 (check 1), :148;
  accordion-menu.md:202, :512 (D24); drilldown-menu.md:156, :251 (check 7); dropdown-menu.md:111, :124, :129-134, :236,
  :452, :520, :597 (D22); responsive-menu.md:105, :120-134, :260, :524, :529, :611 (D22); toggler.md:109, :208, :214
  (check 1), :452 (D4), :467 (D19); slider.md:73, :137, :154, :163 (check 5); tooltip.md:130, :229 (check 6); off-canvas.md:76,
  :145, :153 (binding rule, development check 1), :177, :235, :294 (check 10); button.md:130, :437 (D22).
- **Per-spec changes.**
  - [nested-menu](../specs/nested-menu.md), [accordion-menu](../specs/accordion-menu.md),
    [drilldown-menu](../specs/drilldown-menu.md), [dropdown-menu](../specs/dropdown-menu.md),
    [responsive-menu](../specs/responsive-menu.md), [toggler](../specs/toggler.md), [slider](../specs/slider.md),
    [tooltip](../specs/tooltip.md), [off-canvas](../specs/off-canvas.md), [button](../specs/button.md): Already hold (lines
    above); confirm. No spec text changes.
- **Shared-document changes.** `building-blocks.md` 1.4, the "Initial state is bound" bullet:
  1. After "Structural classes written redundantly merge with the directive's static `host` class and are not
     reported." insert: "So does a plugin root's class that its directive binds `true` whenever the root stands alone
     and that a Responsive Menu binds per Menu mode (`accordion-menu`, `drilldown`, `dropdown`): a copy is stripped
     only in the modes that are not live and is not reported ([Spec: Responsive Menu](issues/23-spec-responsive-menu.md),
     D22). A Foundation class that no directive binds but that Foundation's CSS or JavaScript reads on that element is
     reported the same way, naming what replaces it (the Tooltip's legacy position classes; the Slider Handle's
     `slider-handle`, whose Foundation rules still reach the input, [Spec: Slider](issues/32-spec-slider.md), development
     check 5)."
  2. Replace "the Off-canvas position classes," with "the Off-canvas position classes (stripped by the panel's class
     record and reported by development check 1 of the [Re-run: Off-canvas spec under the class rule](issues/117-rerun-off-canvas-class-rule.md)),".
- **Rating.** Impact LOW (the specs already hold; the shared text records what four specs decided); confidence HIGH
  (each spec's text, cited). Decided.

### R67: README item 5 and the tooling spec after ticket 137

- **Decision.** Ticket 137 is resolved and the tooling spec already carries its verdict (the generated file ends
  with `declare global {}`, D28; Storybook checks no template or story types; the unit-test builders see the file),
  so only README item 5 changes.
- **Evidence.** issues/137 Status resolved, Answer section 1; specs/variant-declaration-tooling.md:288, :298, :382,
  :434, :593 (D28); ADR 0040, 2026-09-28 dated note; README.md:155; issues/136:132.
- **Per-spec changes.** [variant-declaration-tooling](../specs/variant-declaration-tooling.md): Already holds; confirm.
- **Shared-document changes.** README.md, the class-rule wave item 5: replace ": resolved; its prototype,
  [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](issues/137-prototype-variant-declaration-tooling.md),
  is open." with ": resolved; its prototype, [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](issues/137-prototype-variant-declaration-tooling.md), is resolved: the generated file ends with an empty
  `declare global {}`, so a running dev server re-checks templates after every rewrite, and Vitest under the
  unit-test builders and `@storybook/angular-vite` reopen nothing ([ADR 0040](adr/0040-variant-input-types.md),
  dated note)."
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R68: the Dropdown pane's and the Off-canvas panel's static `autoFocus`

- **Decision.** Confirm the difference; no edit. Building-blocks 1.4 kind 3 (`insertion`) requires the bound form and a
  development report only "where the host can take focus when it is inserted"; both hosts bind
  `'[attr.autofocus]': 'null'`. The Dropdown pane can take focus once the application gives it a `tabindex` (D13,
  measured), and building-blocks 1.4 itself names its check 6 as the pattern, so its report stays. The Off-canvas
  panel is never focusable: the library never focuses it (building-blocks 1.10), gives it no `tabindex`, and drops
  Foundation's `tabindex="-1"` on the content; its `autoFocus` is a string union whose natural form is static
  (`autoFocus="first-heading"`), and the rendered `autofocus` does nothing there (measured in ticket 139: a closed
  `aside autofocus` leaves a later `autofocus` its turn), so its static form stays supported. Ticket 139 already
  called the report a floor, not a ceiling.
- **Evidence.** dropdown.md:253, :281 (check 6), :581 (D13); off-canvas.md:237, :608 (D16), :661, :766;
  building-blocks.md 1.4, inputs named like HTML attributes, kind 3; issues/139:366; research/presentational-attribute-
  inputs.md:153, :209 (row 28), :214 (row 33).
- **Per-spec changes.**
  - [dropdown](../specs/dropdown.md), [off-canvas](../specs/off-canvas.md): Already holds; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW (ticket 139's rating; a development report only); confidence HIGH (building-blocks 1.4's own
  condition and the measured rows). Decided.

### R69, R70: rendered `align` and `autofocus`; the Slider's kept attributes; README item 7; the guide

- **Decision.** Holds everywhere. No spec's Rendered HTML or server-HTML comment shows an `align` or `autofocus`
  attribute that a directive removes: every `align="right"` in the specs is consumer markup (`specs/menu.md:268`,
  `:318`, `:477`; `specs/nested-menu.md:508`, `:797`; `specs/responsive-menu.md:702`), and no rendered block
  carries `autofocus`. The Slider's Rendered HTML intro lists only `vertical=""` and
  `positionvaluefunction="log"` as kept static input attributes and says a static container `disabled` and a
  Handle `readonly` are removed (the `disabled=""` in its vertical example is the native input's, an `output`
  binding). README's class-rule item 7 already carries the resolved text of ticket 139's change 8. The
  architecture guide's P9 states the decided rule, and question 9 of its decision framework asks the kind of each
  input named like an HTML attribute; neither says the question is pending.
- **Evidence.** `rg -n 'autofocus=|autofocus[ >]| align="|disabled=""|readonly=""'` over `specs/`;
  `specs/slider.md:353`, `:386-395`; `README.md:157`; `architecture-guide.md:39`, `:148-158`.
- **Per-spec changes.**
  - [slider](../specs/slider.md), [menu](../specs/menu.md), [nested-menu](../specs/nested-menu.md),
    [responsive-menu](../specs/responsive-menu.md), [tabs](../specs/tabs.md), [reveal](../specs/reveal.md),
    [dropdown](../specs/dropdown.md), [off-canvas](../specs/off-canvas.md): Already hold; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R71, R72: print classes and `ir`

- **Decision.** Holds: `show-for-print`, `hide-for-print`, and `print-break-inside` appear as classes only in
  server-HTML blocks (visibility-classes.md:311-312, typography-helpers.md:332-334) and in copied-class check inputs
  (visibility-classes.md:386, typography-helpers.md:198); no spec writes `ir` as a class anywhere.
- **Evidence.** `rg 'show-for-print|hide-for-print|print-break-inside|class="[^"]*\bir\b'` over specs, each hit read
  in context.
- **Per-spec changes.** [visibility-classes](../specs/visibility-classes.md), [typography-helpers](../specs/typography-helpers.md):
  Already hold; confirm.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R73: the typography greys

- **Decision.** Already holds. Every spec that quotes the Typography Helpers' greys quotes `#666666` (5.693:1 on
  the page; 4.601:1 at worst on a light container, `$light-gray`; 4.686:1 on the alert callout tint): the
  Typography Helpers spec (10, 27, 250, 456, 539-548), the Callout (325), the Card (286), building-blocks 1.10 (the
  Typography Helpers bullet), and storybook-conventions section 5. `#737373` remains only as the Forms' placeholder
  (`$input-placeholder-color`, 4.701:1 on the field) and the Breadcrumbs' disabled step
  (`$breadcrumbs-item-color-disabled`, 4.7015:1 on the page), their own settings on the page, and in the Typography
  Helpers spec's comparison of the two values, which is correct as written (3.799:1 on a card divider, 3.870:1 to
  4.307:1 on the callout tints, 4.465:1 on a table head, 4.198:1 on a striped row, 4.014:1 under the pointer, all
  recomputed). The Table spec quotes no grey.
- **Evidence.** `rg '#666666|#737373' specs/ building-blocks.md storybook-conventions.md`; `pairs-greys.txt`.
- **Per-spec changes.** [typography-helpers](../specs/typography-helpers.md), [callout](../specs/callout.md),
  [card](../specs/card.md), [forms](../specs/forms.md), [breadcrumbs](../specs/breadcrumbs.md),
  [table](../specs/table.md): confirm; no change.
- **Shared-document changes.** None.
- **Rating.** Impact LOW; confidence HIGH. Decided.

### R74: the image-`alt` limit of name checks that read text content

- **Decision.** One reading for every development check that reads a name or text from content: it reads it as
  accessible-name computation does, text outside `aria-hidden="true"` subtrees (visually hidden text included)
  and an embedded image's text alternative, the non-blank `alt` of an `img` or the non-blank `aria-label` of an
  element with `role="img"`, so no check reports a missing name or text that assistive technology has. This is
  the Thumbnail's check 2 reading ("no image there with a non-blank `alt` or `aria-label`"). The Switch's stated
  limit (an image-only label or legend reported as unnamed) goes: its checks 1, 2, and 5 take the reading. Checks
  that read only attributes (the Pagination's and Breadcrumbs' landmark check: `aria-label` or
  `aria-labelledby` present) are outside the rule and state nothing.
- **Evidence.** The Switch's own measurement: "Chromium and Firefox name the group from the `alt`, and check 5
  reports it" (`specs/switch.md`, Notes), so check 5's message, "have no named group around them, so assistive
  technology announces no question", is false there, and 147 recorded it as a limit, not a rule (its decision 8,
  "a stated limit of the shared text reading"). The Thumbnail already counts an image's `alt` in its name check
  (`specs/thumbnail.md`, check 2). The other text-reading checks count text nodes only and state no limit, so an
  `<img alt="Close">` in a close button, a menu icon, a caption, a label, a badge, or an element that
  `aria-labelledby` references would be reported as unnamed: Close Button checks 1 and 2 ("text outside
  `aria-hidden="true"` subtrees"), Top Bar `NfsMenuIcon` checks 1 and 2 (the same), Label and Badge check 1 (D5,
  "text nodes outside any element with `aria-hidden="true"`"), Table check 1 ("the `<caption>`'s text"), Progress
  Bar check 1 and the progress element's and meter's checks ("the text of the elements `aria-labelledby`
  references", "the text of the element's `labels`"), and Responsive Embed check 1 (`aria-labelledby` "an id of
  an element with text"). Breadcrumbs check 1 and Pagination check 1 test only that `aria-label` or
  `aria-labelledby` is present. Counting the text alternative is what HTML-AAM and accname do for an embedded
  image in name-from-content and in a referenced element's text; a development warning that fires where a name
  exists misleads (architecture guide P23: every misuse reported, costing production nothing, never a false
  report of a correct one). The alternative, stating the limit in every spec, keeps false reports and adds eight
  Notes lines.
- **Per-spec changes.** In each check definition named here, the text source gains `, or the non-blank alt of an
  img or the non-blank aria-label of an element with role="img"` (as code spans) after the text-node clause, and
  its browser-level test list gains one silent case with an image-only name source:
  - [switch](../specs/switch.md): checks 1, 2, and 5 (the `labels` text, the paddle's text, the first `legend`
    child's text); replace the Notes bullet `Checks 1, 2, and 5 read text content and ARIA attributes, not an
    image's alt: a label or legend that holds only an image reports as unnamed (checks 1 and 5), and an image in
    the paddle does not trip check 2. Measured for the legend: Chromium and Firefox name the group from the alt,
    and check 5 reports it. The fix is text, which also serves the sighted user the visible label is for.` with
    `Checks 1, 2, and 5 read text as accessible-name computation does, an image's non-blank alt included
    (building-blocks 1.10, Names): a label or legend that holds only an image with alt text names its switch or
    group and is silent (Chromium and Firefox name the group from the alt, measured), and an image with alt text
    in the paddle trips check 2, because it joins the name. Every example still writes text, which also serves
    the sighted user the visible label is for.`; in the Measured groups paragraph, replace `It reports one pattern
    both engines name, a legend that holds only an image's alt (Notes).` with `A legend that holds only an
    image's alt, which both engines name, is silent (Notes).`; add to the check 5 case list `a fieldset whose
    legend holds only an img with alt text is silent`.
  - [close-button](../specs/close-button.md): checks 1 and 2 (`text outside aria-hidden="true" subtrees`).
  - [top-bar](../specs/top-bar.md): `NfsMenuIcon` checks 1 and 2 (`text inside the button`).
  - [label](../specs/label.md) and [badge](../specs/badge.md): check 1 (D5), and D5's decision cell `a label with
    no text outside aria-hidden subtrees` (Badge: `a badge with no text ...`) gains `, an image's alt counting as
    text`.
  - [table](../specs/table.md): check 1 (`the <caption>'s text`).
  - [progress-bar](../specs/progress-bar.md): check 1's `the text of the elements aria-labelledby references`,
    and the progress element's and meter's checks' `the text of the element's labels`.
  - [responsive-embed](../specs/responsive-embed.md): check 1's `an id of an element with text` gains `(an
    image's alt counting as text)`.
  - [thumbnail](../specs/thumbnail.md): already holds (check 2); confirm.
  - [breadcrumbs](../specs/breadcrumbs.md), [pagination](../specs/pagination.md): no change (attribute-only
    checks); confirm.
  - Any other spec: a reviewer who finds a development check whose condition reads the text of an element (its
    own, a referenced one, a `label`, `legend`, or `caption`) applies the same clause; `rg -n -i "text outside|text
    nodes|text of the elements|element with text|caption>.s text" specs/<slug>.md` finds the ones known.
- **Shared-document changes.** `building-blocks.md` 1.10, the Names bullet: append
  > A development check that reads a name or text from content (the host's, a referenced element's, a `label`'s, a `legend`'s, a `caption`'s) reads it as accessible-name computation does: text outside `aria-hidden="true"` subtrees, visually hidden text included, and an embedded image's text alternative, the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`, so it never reports a name or text that assistive technology has (the [Spec: Thumbnail](issues/97-spec-thumbnail.md)'s check 2; Chromium and Firefox name a group from an image-only `legend`'s `alt`, measured by the [Re-run: Switch spec, out-of-scope survivors](issues/147-rerun-switch-out-of-scope-survivors.md); 2026-09-29, [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md)).
- **Rating.** Impact LOW (development warnings only, no API, no production code), confidence HIGH (accname and
  HTML-AAM, 147's own measurement, and the Thumbnail's existing reading). Decided; it reverses 147's LOW
  "stated limit" for the Switch, recorded in the Switch ticket's amendment.

## Additional placeholders found (CR-C)

The CR-C search over all 53 specs found these deferrals beyond the routed items. Each is decided here; impact LOW
(wording and one code comment), confidence HIGH (names read from the owning specs). Decided.

- A1. [flexbox-utilities](../specs/flexbox-utilities.md), near line 487: replace "the grid and media object names are
  placeholders until their specs publish." with "`NfsGridX` and `NfsCell` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s,
  and `NfsMediaObject` and `NfsMediaObjectSection` the [Spec: Media Object](../issues/91-spec-media-object.md)'s."
- A2. [flexbox-utilities](../specs/flexbox-utilities.md), near line 437, the code comment "(the Media Object spec names
  its directives)": replace with "(NfsMediaObject and NfsMediaObjectSection, from ngx-foundation-sites/media-object)".
- A3. [smooth-scroll](../specs/smooth-scroll.md), near line 112: R12.
- A4. [accordion-menu](../specs/accordion-menu.md), near line 588 (`position="left"` "stands for" the input the Off-canvas
  re-run "names"): R56.
- A5. [close-button](../specs/close-button.md), near line 230: replace "`nfsCallout` is the name the triage gave it
  ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md)),
  and the Callout spec fixes it." with "`nfsCallout` is the [Spec: Callout](../issues/89-spec-callout.md)'s directive."
- A6. [callout](../specs/callout.md), near lines 246 and 250 (deferrals to the resolved Toggler and Triggers re-runs):
  R2.
- A7. [thumbnail](../specs/thumbnail.md), near line 377: replace "Every placeholder use of `img[nfsThumbnail]` in the
  Card, Sticky, and Toggler specs is this directive on the image form, with its final name." with "The Card, Sticky,
  Toggler, and Media Object specs write this directive on the image form, `img[nfsThumbnail]`."

## Findings outside the routed items

- X1. The Accordion's contrast checks are `@warn` (Accordion D19) where the sibling mixins with a required colour setting
  stop the compile, and R45 now makes `nfs-tabs` stop it too. Decision: no change. ADR 0022's first consequence
  promises "a compile error or warning", so the Accordion's `@warn` meets the record; the Top Bar's Q9 rule for
  `@error` is that spec's reasoning, not a building-blocks rule; changing D19 would re-decide a published decision
  that no ticket routed here. Impact LOW; confidence HIGH (ADR 0022's text). Decided.
- X2. The Orbit and Slider specs carry no `nfsDirectiveCheck` or `strictParents` line for the parts that
  forgotten-import-checks.md (near lines 239-240) lists. Ticket 142 checks exactly this (its step 4), so it is left
  to [Audit: the specs against the architecture guide](../issues/142-audit-specs-against-architecture-guide.md); a
  reviewer who meets the gap before that ticket's fix lands applies the forgotten-import spec's line form. Not decided
  here.
- X3. R15's measurement found a defect in the Switch's forced-colours rule (a keyboard-focused switch loses its knob
  or its on track); it is fixed under R15.
- X4. R40 found that the Visibility Classes' two sticky examples could never stick (the container held only the sticky
  element); it is fixed under R40.

## Per-spec index

What each reviewer applies to each spec, beyond CR-A to CR-D, which every spec takes. "Changes" lists the items that
edit the spec, with the places; "Confirm" lists the items whose text the reviewer checks while reading and leaves
alone if it holds. The item sections above hold the quoted text.

| Spec | Changes | Confirm |
| --- | --- | --- |
| [abide](../specs/abide.md) | R4 (the `color-luminance()` clauses near 343, 573, 713, 719; S1; 2.31:1 to 2.12:1, 1.53:1 to 1.54:1, unlabelled 4.49:1 to 4.498:1); R8 (the Callout sentence near 403, the import comment near 585); R30 (the Form alert's 16.2:1 near 735); R48 (the NG0309 reason in the Neighbouring directives bullet, D18, D19; amendment note) | R1, R33 |
| [accordion](../specs/accordion.md) | R4 (clauses near 312, 561, 676, 678; S1; 4.69:1 on white to 4.65:1 on `$white`, 6.0:1 to 6.01:1, 1.25:1 to 1.24:1); R57 (term) | X1 (D19 stands) |
| [accordion-menu](../specs/accordion-menu.md) | R3 (D24's deferral); R56 (the Off-canvas paragraph near 588); R57 (term) | R4, R65, R66 |
| [anchored-pane](../specs/anchored-pane.md) | R42 (`anchored-pane--fixture` takes `nfsPosition="relative"`); R57 (term) | R51, R52, R65 |
| [badge](../specs/badge.md) | R28/R29 (development check 3 for an `a` host, D12, Out of Scope, cases; the Custom Colors forms in Sass); R59 (handle argument); R74 (check 1, D5) | R1, R4, R5, R6, R30 |
| [breadcrumbs](../specs/breadcrumbs.md) | R24 (the Router example and its output wrapped in a named `nav`); R57 (term) | R4, R73, R74 |
| [breakpoint-service](../specs/breakpoint-service.md) | R2 (Options cells name `NfsMotionPair`); R52 (heading, table headers, "consuming-directive rule", library-side "consumer"); R54 (rule 3, the ResponsiveToggle row); R59 (the consumer table row) | - |
| [button](../specs/button.md) | R4 (S2 near 250; S1; figures near 255, 256, 261); R5 (the palette-reach sentence); R6 (the pick position in the 1.4.3 row, a new D row); R17 (no `exportAs`: API line, bullet, Material row); R29 (the Custom Colors sentence); R57 (term); R59 (handle and `include()`, own-file case); CR-B (`.show-for-sr` row) | R14, R60, R65, R66 |
| [button-group](../specs/button-group.md) | R4 (line near 174: wording and figures); R6 (the pick sentence in Sass (2)); R17 (D12's rejected alternative); R57 (term); R59 (handle and `include()`, own-file case); CR-B (`.show-for-sr`, `.align-*`, the grouped buttons' Button classes) | R1, R18, R19, R65 |
| [callout](../specs/callout.md) | R2 (the sentences near 246 and 250, the Out of Scope Closing bullet, `callout--closable`); R4 (near 182, 451, 452; figures near 9, 186, 342; the purple compile test near 297); R25 (`callout--closable` names its docs page); R30 (the story intro's alert override); R59 (handle and `include()`, own-file case) | R5, R14, R26, R28/R29, R65, R73 |
| [card](../specs/card.md) | R26 (margin gutters in `card--sizing`, `card--long-words`, and the grid recipes); R32/R64 (`ngSrc`, rendered lines, lead-in, the sentence near 213) | R4, R31, R34/R35, R73 |
| [close-button](../specs/close-button.md) | R2 (the Animation parenthesis, `close-button--closable`); R4 (near 183, 403, 404); R17 (no `exportAs`); R25 (`close-button--closable` names its docs page; the story intro); R57 ("developer's own class"); R59 (handle and `include()`, own-file case); R74 (checks 1 and 2); A5 (the `nfsCallout` sentence near 230) | R14, R50, R65 |
| [drilldown-menu](../specs/drilldown-menu.md) | R26 (rule 5 gains `overflow-wrap: break-word`; the 1.4.4/1.4.12 row); R57 (term) | R1, R3, R4, R39, R66 |
| [dropdown](../specs/dropdown.md) | R2 (check 5's third case, the Out of Scope Motion bullet); R52 (label near 445, 589); R54 (the Animation parenthesis near 445); R57 (`parentClass` and `animate` rows, term); R59 (own-file case); CR-B (the `.is-opening` row) | R17, R50, R51, R65, R68, R69/R70 |
| [dropdown-menu](../specs/dropdown-menu.md) | R3 (the `.dropdown` row's deferral) | R4, R22/R53, R47, R66 |
| [equalizer](../specs/equalizer.md) | R7 (the names paragraph near 128; gutters restored); R32/R64 (`ngSrc` near 423, 429); R57 ("developer's own class"); R58 (`equalizer--reflow`, the 1.4.10 case and row) | R34/R35 |
| [flex-grid](../specs/flex-grid.md) | R16 (the `hidden` note); R59 (handle argument) | R34/R35, R37 |
| [flexbox-utilities](../specs/flexbox-utilities.md) | R16 (the `hidden` note); R57 ("developer's own class"); R59 (handle argument); CR-B (rows for the docs examples' other-family classes); A1, A2 | R10, R37, R38, R39 |
| [float-classes](../specs/float-classes.md) | R16 (the `hidden` note); R32/R64 (the rendered `src` near 209); R36 (`nfsWidth="50"` in `float-classes--float-center` and the Rendered HTML); CR-B (other-family rows) | R39 |
| [float-grid](../specs/float-grid.md) | R34/R35 (the `.reveal .column` parenthesis near 112); R59 (handle argument) | - |
| [forgotten-import-checks](../specs/forgotten-import-checks.md) | - | CR-D (the deliberate omission near 506 stays) |
| [forms](../specs/forms.md) | R4 (near 225, 447, 516, 524); R48 (the NG0309 reason near 148, 203, 440; amendment note); CR-B (other-family rows); CR-D (drop `NfsFormLabel` from `app-donate`'s `imports`) | R9/R23, R17, R33, R73 |
| [interchange](../specs/interchange.md) | R13 (`app-product-table`: `imports`, `nfsTable hover`, caption); R52 (label near 238); R57 (term); R62 (the 1.4.3 row's overlay clause) | R32/R64 (the `<picture>` exception) |
| [label](../specs/label.md) | R59 (handle argument); R74 (check 1, D5) | R1, R4, R5, R6, R28/R29, R30 |
| [magellan](../specs/magellan.md) | R48 (`gridMarginX` in the guide example, its sentence, the mapping row, the names sentence) | R40 |
| [media-object](../specs/media-object.md) | R10 (the names sentence near 440); R32/R64 (`ngSrc`, rendered lines, lead-in, the list comment near 400); R57 (term); R59 (own-file case); CR-B (the `.thumbnail` row) | R37 |
| [menu](../specs/menu.md) | R4 (S1 where the checks do not name the helper); R57 (term); R59 (handle and conditional `include()`, own-file case) | R3, R10, R48, R69/R70 |
| [nested-menu](../specs/nested-menu.md) | R26 (rule 9 gains `overflow-wrap: break-word`); R47 (the 1.4.1 row's open-Hybrid sentence); R52 (diagram label, table header); R57 (term); CR-B (a pointer row to the per-mode host tables if none) | R3, R4, R66, R69/R70 |
| [off-canvas](../specs/off-canvas.md) | R25 (the 1.4.3 row's link figures; a 1.4.12 row); R26 (rule (b) gains `overflow-wrap: break-word`, the Sass summary, D19, the 1.4.10 row); R52 (label near 281, 313); R57 ("developer's own class") | R4, R14, R22/R53, R50, R56, R59, R65, R66, R68, R69/R70 |
| [orbit](../specs/orbit.md) | R15 (rule 13 for forced colours: Sass (1) and (5), a WCAG row, e2e, the compile test, D27, the behaviour list); R26 (rule 14 for caption words, the 1.4.12 row, e2e); R32/R64 (`[ngSrc]` with `[priority]="first"`, `imports`, the sentence after the example, the rendered line); R61/R63 (the hierarchy block's "(class only)") | R1, R4, R62 |
| [pagination](../specs/pagination.md) | - | R4, R9/R23, R24, R74 |
| [progress-bar](../specs/progress-bar.md) | R5 (the palette-reach sentence); R15 (the WebKit reason); R30 (`progress-bar--right-to-left` shows its Visible value); R59 (handle argument); R74 (the name checks) | R4 |
| [prototyping-utilities](../specs/prototyping-utilities.md) | R32/R64 (the rendered `src` near 376); R59 (no flag property in `include()`; handle argument) | R4, R39, R41/R42, R43 |
| [responsive-accordion-tabs](../specs/responsive-accordion-tabs.md) | R4 (near 759; 6.0:1 to 6.01:1 near 380); R45 (`nfs-tabs` for tabs mode near 30, 630, 728, 765); R46 (the equal-heights sentence); R52 (label near 370, 602); R57 (term) | - |
| [responsive-embed](../specs/responsive-embed.md) | R59 (own-file case); R74 (check 1) | R26, R31 |
| [responsive-menu](../specs/responsive-menu.md) | R26 (the 1.4.12 row); R47 (the Base side bullet); R52 (label near 340, 576); R57 (term) | R1, R3, R4, R65, R66, R69/R70 |
| [responsive-toggle](../specs/responsive-toggle.md) | R2 (check 4, the Motion values case, the Out of Scope Motion bullet); R52 (label near 219, 350); R55 (`responsive-toggle--sticky-title-bar`, the 2.4.11 row, the e2e case); R57 (term, "developer's own class"); CR-A (the copied-class comment near 325) | R4, R22/R53, R39, R54, R65 |
| [reveal](../specs/reveal.md) | R4 (near 373, 610, 767, 769; S1); R25 (the close-button hook, rule 8, a 1.4.12 row, D29, tests); R52 (label near 462); R57 (`animationIn` row, "developer's own class") | R2, R14, R27, R34/R35, R49, R50, R54, R65, R69/R70 |
| [slider](../specs/slider.md) | R15 (the WebKit reason); R20 (rule 6, rule 0a, Sass (2), the 2.4.7 row, the compile test, D26) | R4, R60, R61/R63, R66, R69/R70 |
| [smooth-scroll](../specs/smooth-scroll.md) | R12 (the names sentence near 112) | R48 |
| [sticky](../specs/sticky.md) | R11 (D19's rationale); R32/R64 (`ngSrc` near 244, 422; rendered near 258, 273); R41 (`sticky--overflow-hidden-ancestor`, its imports, D19's overflow clause) | R40 |
| [switch](../specs/switch.md) | R15 (Sass (b)'s selectors, D12, the e2e case); R20 (D9's rejected cell); R74 (checks 1, 2, 5, Notes, Measured groups, tests) | R21 |
| [table](../specs/table.md) | R74 (check 1) | R4, R13, R27, R73 |
| [tabs](../specs/tabs.md) | R4 (near 346, 738; S1); R45 (the plain-strip checks, D26, D17's row, the compile test, the 1.4.3 and 1.4.11 rows); R57 (term) | R27, R44, R46, R69/R70 |
| [thumbnail](../specs/thumbnail.md) | R16 (the `hidden` note, near line 25, D9); A7 (near 377) | R10, R11, R28/R29, R32/R64, R65, R74 |
| [toggler](../specs/toggler.md) | R2 (check 4, the API comment, the Motion names case, Out of Scope); R32/R64 (the usage images, `imports`); R52 (label near 350); R54 (the reduced-motion sentence near 350); R57 (the `toggler` row, term, "developer's own class") | R11, R14, R16, R65, R66 |
| [tooltip](../specs/tooltip.md) | R57 (the `templateClasses` rows, D7's rationale, term, "developer's own class") | R51, R65, R66 |
| [top-bar](../specs/top-bar.md) | R47 (D9's token clause); R56 (the `top-bar--title-bar` panels); R59 (the merged Runtime checks opening near 202, own-file case); R57 (term); R74 (`NfsMenuIcon` checks 1 and 2) | R4, R15, R22/R53, R40, R48, R65 |
| [triggers](../specs/triggers.md) | R2 (three Usage examples and the paragraph after them); R14 (the 2.5.8 row, the story-gate paragraph, the usage comment, Sass (5)); R22/R53 (D13); R52 (heading, the 2.4.3 row's citation); R57 (term); R65 (`type="button"` near 123) | R50, R51, R56 |
| [typography-helpers](../specs/typography-helpers.md) | - | R4, R9/R23, R39, R59, R71/R72, R73 |
| [variant-declaration-tooling](../specs/variant-declaration-tooling.md) | R27 (the flags bullet near 128); R30 (the known-mixins bullet near 166) | R67 |
| [visibility-classes](../specs/visibility-classes.md) | R40 (the two sticky examples gain content after the sticky element; `visibility--sticky`) | R1, R39, R59, R71/R72 |
| [xy-grid](../specs/xy-grid.md) | R16 (the `hidden` note); R43 (D3's rejected alternative); R59 (handle argument) | R9/R23, R11, R26, R34/R35, R37, R44, R48 |

Order inside a spec: apply R4's ratio rule last, after every item that adds or moves a figure (R15, R20, R25, R26,
R30, R45), so each new figure is written to the same rule.

## Shared-document changes for the closing pass

Each change's quoted text is in the item section named; where two items change one passage, apply them in one edit in
the order given. Reviewers in phase 2 leave these documents alone.

### building-blocks.md

1. 1.3, the utility-families bullet: R39's two replacements (`NfsNoBullet`; `NfsShowForSr` and `NfsShowOnFocus`).
2. 1.4, "Defaults and binding": R59's `include()` sentence (the "only while bound" exception, no flag-gated property,
   the handle's argument, the own-file case).
3. 1.4, "Initial state is bound, never read from a class": R66's two insertions (the mode root class; a class no
   directive binds but Foundation reads) and the Off-canvas parenthesis.
4. 1.6 rule 4: R2's pair sentence (one class per pair half; a value that does not split maps to none and is reported).
5. 1.6 rule 5: R54's "bind no Motion class, neither the library's class mapped from a Motion name nor the consumer's own
   class in the dot form", then R52's label, "consuming-directive rule 3".
6. 1.9, "Hosting a class directive": R34's longer list of shared input names.
7. 1.10, first bullet: R4's ratio-quoting sentence, then R6's pick sentence.
8. 1.10, Names bullet: R27's first-sentence rewording, then R74's appended sentence on reading names from content.
9. 1.10, the hidden bullet: R16's replacement of its last clause.
10. 1.10, Callout bullet: R4's figures (3.83:1 to 4.26:1), then R25's appended Reveal sentence.
11. 1.10, Badge bullet: R29's appended link-host sentence.
12. 1.10, Forms bullet: R20's focus-ring sentence.
13. 1.10, a new Forced colours bullet after the Switch bullet: R15's quoted bullet.
14. 1.10, a new Clipping containers bullet after the Card bullet: R26's quoted bullet (it names `nfs-orbit`'s rule on
    `.orbit-caption`, rule 14 of the Orbit spec).
15. 1.10, the colour-alone bullet: R45's clause.
16. 1.13, the Tabs paragraph: R45's replacement.

### storybook-conventions.md

1. Section 5, `$anchor-color` comment: R4's figures (3.83:1 to 4.26:1; axe's "3.82 to 4.25" stays), then R25's
   appended sentence.
2. Section 5, the Abide comment: R4's 4.498:1.
3. Section 5, the `$foundation-palette` comment and the `$button-palette` comment: R5's texts.
4. Section 5, the Off-canvas comment: R25's "(3.64:1 and 4.86:1)".
5. Section 8: R36's replacement of the demo-scaffolding bullet and of the inline-style bullet's clause.

### CONTEXT.md

1. **Fixture app**: R31's replacement ("one route per entry point whose spec tests the Rendering modes there").

### ADRs (dated notes; no decision changes)

1. ADR 0040, Consequences: R60's 2026-09-29 note (the two boolean conventions; the dissent not reopened).
2. ADR 0042, Consequences: R47's 2026-09-29 note (where the current page and an open parent are told apart).
3. ADR 0012, the Variant properties consequence: R27's pointer to building-blocks 1.13's flag refinements, as a dated
   note.

### README.md

1. "`@angular/aria` building blocks not used": R19's replacement paragraph.
2. The CSS-only table's Switch row: R21's last cell.
3. The class-rule wave list, item 5: R67's replacement; item 7 already carries ticket 139's resolved text (R70).
4. The spec count and index: "34 published specs" becomes 53, and every spec has a row. Ten specs have none today:
   flexbox-utilities, flex-grid, float-classes, float-grid, media-object, menu, pagination, prototyping-utilities,
   typography-helpers, xy-grid; each takes the README row its spec ticket proposed (for example ticket 91's proposed
   Media Object row), in the table of its kind. Correction (2026-09-29, closing pass): no spec ticket proposed a
   README row (ticket 91's row is building-blocks Table D's); the closing pass wrote the ten rows from the specs.
5. The ADR count: 46 decision records (44 accepted; 0010 and 0034 superseded), with 0039 to 0046 in the index.
6. The Orbit row: no change (the spec records R15's measurement).

### map.md

1. Decisions so far: the orchestrator's line for this ticket, when phase 3 resolves it.
