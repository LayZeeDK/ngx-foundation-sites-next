# 141. Decide: the directive and component architecture guide

Type: grilling
Status: resolved
Blocked by: 140
Labels: wayfinder:grilling
Map: ../map.md

## Question

What guide of directive and component architecture principles does the library adopt, written from the three findings files of [Research: directive and component architecture principles for Angular UI libraries](140-research-directive-component-architecture-principles.md), which test the user's draft ([research/architecture-principles-user-draft.md](../research/architecture-principles-user-draft.md))?

## How to work it

1. An author (Fable 5.1: this ticket makes cross-cutting API-design calls) writes `architecture-guide.md` at the effort root: the principles, the layers, the decision framework, each principle with its rationale, a preferred and an avoided example in this library's `nfs` names, and its sources. Every principle is testable: an auditor can say of a spec whether it meets it.
2. Precedence: the user's rulings recorded in the map's Notes, the ADRs, and building-blocks outrank the draft. The user added the same day that Microsoft Copilot generated the draft with little to no research, and ruled that it is not authoritative: it is inspiration for the type of guide and principles to produce, and any claim of it that the guide adopts must be verified and backed by research. Keeping, qualifying, or dropping a draft principle needs no more justification than the evidence gives; the draft's wording is not a default. Where the research argues that a recorded decision should change, the guide keeps the decision, states the conflict, and the Answer rates it under the map's triage rule; a HIGH impact change without HIGH confidence goes to the user as OPEN FOR HUMAN. Where the draft conflicts with a recorded decision, the recorded decision wins and the guide says so.
3. A critic (Opus 5.5, adversarial) reviews the draft guide against the research, the ADRs, and a sample of five published specs, looking for principles that are untestable, contradict each other, contradict a recorded decision, or would force a change the evidence does not support. The author answers each point and revises.
4. Answer: the guide's path, the critic's points and their resolution, the conflicts with their triage, the shared-file changes (the map's Notes gain the guide's precedence line; README lists the guide), and the map's gist line.

## Answer

Worked 2026-09-28, AFK under the map's override: the author (Fable 5.1) grilled both sides against the three findings files, the map's Notes, the ADRs, and `building-blocks.md`; the critic (Opus 5.5) reviewed the draft against the same records and five sampled specs (`research/architecture-guide-review.md`: 39 points, 6 blockers, 18 majors, 15 minors); the author answered every point and revised. Two constraints from the orchestrator applied: the presentational-attribute rule stays pending [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), and the import array and the release policy stay OPEN FOR HUMAN while the user clarifies them.

### The guide

[architecture-guide.md](../architecture-guide.md), at the effort root. Its shape: a precedence and audit-method header (a finding is recorded once, under the lowest-numbered principle it falls short of); a statement of intent; a table of eight kinds of building block (class directive; Plugin element directive without a Structural class; free behaviour directive; coordinating directive; component; layout-system and utility-family directive in ADR 0044's three shapes; shared service, function, token, or type; Library mixin); an 11-question decision framework with the platform question second, after scope; 26 principles in four groups (Shape P1 to P9, State and API P10 to P15, Platform, accessibility, and styling P16 to P21, Delivery P22 to P26), each with a one-rule Rule, Why, Preferred and Avoided examples in the published specs' `nfs` names and Foundation's real classes, a Decided-by line naming the record it restates or "New", and Sources; a Release policy section outside the audited principles (provisional); an idioms table for authors who know React's headless libraries; a Conflicts section; and the list of what the guide adds.

### The critic's points and their resolution

All 39 points hold on the evidence and are applied; none is rejected. Where a point named a smallest change, the guide takes that wording unless a later point sharpened it.

| # | Severity | Resolution |
| --- | --- | --- |
| 1 | blocker | P9's presentational-attribute clause, its `align` example, and the citation of a rule no record holds are removed; P9 and decision question 9 state the question as pending ticket 139 and cite its evidence file `research/presentational-attribute-inputs.md`; the audit does not rate specs on it |
| 2 | blocker | P9 and the Kinds row state ADR 0044's three shapes: `nfs`-prefixed Utility attributes for standalone families, Foundation's words for families with roles or one effect, and the un-prefixed-input clause of its Consequences |
| 3 | blocker | P10 takes the critic's wording: `effect()` never public, never `history` or timers (1.11 decisions 3 and 4), otherwise 1.5 with its two exceptions (the rendered-state signal, the reverse-link registration); the history-and-timers Avoided lives in P10 only |
| 4 | blocker | P22 takes the critic's wording: tokens for optional parts and ancestors, value imports by package path for required dependencies, Variant registries and types as types only |
| 5 | blocker | P14's drop clause is now "unless building-blocks 1.4 lists it as dropped or the spec's Dropped options give one of 1.4's reasons; each drop is listed with its reason", with 1.4's reasons in the Why |
| 6 | blocker | P2 and question 3 reworded to ADR 0039's own scope (an element whose look nothing in the library changes) plus ADR 0004's case; a Kinds row "Plugin element directive without a Structural class" added (`li[nfsMenuItem]`, `button[nfsSubmenuToggle]`, `a[nfsTab]`, `li[nfsDrilldownBack]`) |
| 7 | major | P2: "never split" now applies to one Structural class, and a directive written beside (P6) is not a split; `nfsFormLabel` beside `nfsAbideLabel` is a Preferred example |
| 8 | major | Kinds row and P6: a free behaviour binds no Structural or Variant class, may bind State, Visibility, and Motion classes for its own state or write a State class with `Renderer2`; a Trigger binds none |
| 9 | major | P11 carries both exceptions: `Renderer2` State classes on elements no directive hosts (ADR 0039, dated note) and `nfs-` classes on library-owned elements inside a Wrapper component (ADR 0033), with the Reveal and Accordion examples |
| 10 | major | P17 names building-blocks 1.10's `inert` exceptions (dialogs and top-layer elements, the closed Off-canvas panel, the Tooltip tip) |
| 11 | major | P7 takes the critic's wording: no subclassing, no wrapping to retype an input; consumer components may host a library directive and implement `NfsOpenable` (ADR 0013) |
| 12 | major | P13's `exportAs` clause is now "where a template needs the instance ... the directive's camelCase name or its family's (Toggler, ADR 0016); none otherwise", marked New and rated below; class names follow building-blocks 1.3 including its named cases, listed |
| 13 | major | P23 and P24: a child outside a parent it may stand without is reported by a development warning; a child that cannot stand alone is a required injection, whose NG0201 is the report; "no check throws" is gone |
| 14 | major | Duplicates removed: `inject(NfsTopBarRight)` stays in P22 only; the `history` effect in P10 only; Shadow DOM in P12 only; `:has()` and `:open` in P16 only; the Switch `checked` model in P20 only; `animate.enter` on a server-rendered element in P19 only; `<div nfsReveal>` dropped from P5; the tie-break sentence is in "How to audit" |
| 15 | major | Kinds row and P18: one Library mixin per Foundation export mixin that needs one, named after it and included after it (ADR 0012, dated note); Top Bar's three mixins as the example |
| 16 | major | P14's trace list adds "a hosted `@angular/aria` input" (`preserveContent` as the example) |
| 17 | major | P14's one-API clause is now "no two public members set or read one state under different names, and no cancelable event exists beside a predicate" |
| 18 | major | P20 takes the critic's wording: a native control the library only styles (Forms, Switch) gets no value API; one whose value the library transforms (the Slider handle) implements one Signal Forms contract |
| 19 | major | P25 restates the record only (DOM-first assertions, the four test layers, Story ids and arg names as the contract between a spec's own test layers, no harness classes in the first specs, the later harness question undecided); the consumer-facing "public test surface" and its semver claim are dropped, not moved: no record or research supports them |
| 20 | major | "What this guide adds" now lists P13's `exportAs` clause, P21, P24's array with its name form, and the release policy, and names P9's question as pending 139; "no check throws" is restated from 1.8 and 1.9's "warns in dev mode"; P24's sibling clause is dropped (1.9 records the ancestor case only); P4's `ngOnInit` is limited to ordered children; the idioms table's union-typed clause is dropped |
| 21 | major | P17 requires ADR 0022's dated note: the exact WCAG formula, never `color-luminance()` or `color-contrast()`; the two sampled specs that still quote `color-luminance()` are listed below for the audit |
| 22 | major | Conflict 2 restated with the map's wording (AGENTS.md's conventions are a design-criteria input; its component code is neither a source nor a constraint; the triage rule and ticket 75 already handled the fallback confirmation); no AGENTS.md edit is proposed; the map's precedence line carries the scoping; conflict 3 (the DI example) added; AGENTS.md dropped from P4's Decided-by |
| 23 | major | P21 states both Slider exceptions (computed `direction` in handlers, 1.5; the non-linear `aria-valuetext` fallback whose locale the spec leaves open, listed below for the audit); the Aria claim is cited to a source reading of `NC/src/aria`; rated below |
| 24 | major | P24: three specs export an array under two naming forms (`NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, `nfsPrototypeClasses`); the name form joins the OPEN FOR HUMAN options; clause 1 limited to TypeScript usage examples; the Aria and Material facts as the critic checked them |
| 25 | minor | Conflict 1 and the proposed 1.5 text keep both exceptions and drop only "(history writes, timers)" |
| 26 | minor | The release policy moved out of the numbered principles into "Release policy (provisional, OPEN FOR HUMAN, not audited)"; its recorded parts (Browser target, peer range, the "when the target moves" notes) are cited as recorded; the example is a neutral rename, not the Reveal's `fullScreen` |
| 27 | minor | `expandAll()` and `collapseAll()` credited to Aria (Material's `openAll()` is the alternative not taken); the token form "keeps the `Token` suffix of `LibHeaderToken`"; the `InjectionToken` form cited to building-blocks 1.9 and ADR 0013 |
| 28 | minor | Citations fixed: `NGP/` key for `packages/core/.../model_signal.ts`; effects on the server to `research/angular-rendering-modes.md:55`; "since Angular 22.0" to `CHANGELOG.md:937` (commit 9c55fcb3e6); `inheritance.md:25`; `storybook-conventions.md:312`; NG8002 described as binding to a property that does not exist |
| 29 | minor | P23: the Storybook half of the e2e layer sees no development check (the fixture half runs a development build) |
| 30 | minor | P19 quotes 1.6 rule 1's timer as recorded; "measure always" is proposed below as a change to 1.6, since the Reveal and Accordion specs already do it |
| 31 | minor | P18: a `--nfs-*` property carries "a runtime value CSS must read (a measurement or an input value)"; the Reveal's offset properties are a Preferred example |
| 32 | minor | P4: ordered children register in `ngOnInit`; an unordered child may register at construction |
| 33 | minor | P8 carries all three clauses of 1.9's binding rule, with `NfsTab`'s `tabindex` as the middle clause's example |
| 34 | minor | P12 takes decision 3's wording (`isPlatformBrowser` and `ngServerMode` are not used) and decision 6's Magellan exception |
| 35 | minor | P26 "Shared baselines the audit checks by section" added: focus, disabled, ids, restoring globals, keys, output payloads, the rendered-state rule, images, requirements on content, member visibility, each cited to its section |
| 36 | minor | The Component row names ADR 0001's dated Tooltip-description exception; the spinner case gets the records' reason (ADR 0001's cases are closed; a loading state is not Foundation's) |
| 37 | minor | P16 cites building-blocks 1.2's CDK list as the test |
| 38 | minor | P3: "with the deltas each spec lists (building-blocks 1.1)" |
| 39 | minor | The coordinating examples are parents children register with (`ul[nfsAccordion]`, `[nfsTabsGroup]`, `[nfsSlider]`, `[nfsProgress]`, `[nfsEqualizer]`, `form[nfsAbide]`); the row says "a token its children or descendants read" |

### Conflicts and their triage

The guide keeps the recorded decision in each case.

1. `effect()` for history writes and timers (`building-blocks.md` 1.5 against its own last bullet and 1.11 decisions 3 and 4). Evidence: `research/angular-rendering-modes.md:55` (effects run on the server); 1.11 decisions 3 and 4; no spec uses an `effect()` for either (the critic's `rg` over `specs/`: effects only for registration, the rendered-state signal, and Interchange's swap, which 1.5's exceptions cover). Impact MEDIUM (a wording fix; no spec changes), confidence HIGH (the two later records already say it): decided; the 1.5 text is proposed below.
2. Implementation order (`AGENTS.md` Implementation Hierarchy against the map's Standing preferences). Evidence: `map.md` Design criteria (AGENTS.md's conventions are an input; its component code is neither a source nor a constraint), the triage rule's human-only fallback confirmation, decided from evidence by [Decide the `@angular/aria` fallback confirmation](75-evidence-aria-fallback-confirmation.md); every spec states the map's order. Impact MEDIUM (no published spec changes), confidence HIGH: decided, the specs follow the map; no edit to `AGENTS.md` from this ticket (outside its shared-file list; the orchestrator decides any); the map's precedence line records the scoping.
3. The DI example (`AGENTS.md`'s `{optional: true, skipSelf: true}` in every child against building-blocks 1.9's required-or-optional-with-a-warning rule and 1.8's `skipSelf` for the Nearest Openable). Evidence: `building-blocks.md` 1.8, 1.9; `specs/accordion.md:151`; `specs/abide.md:155`. Same rating and resolution as conflict 2.

One spec-against-record difference the critic found, rated here because the guide restates the record: 1.6 rule 1 measures the fallback timer only where the Motion class is consumer-chosen or the duration is a consumer Sass setting, while the Reveal (`specs/reveal.md:461`) and the Accordion (`specs/accordion.md:429`) measure always. Evidence: Angular's own `animate.leave` measures the computed duration; a measured value also covers a consumer Sass override of a library duration; the two specs already do it and nothing depends on the declared value. Impact MEDIUM (an internal mechanic; no public API), confidence HIGH: decided in the specs' favour; the 1.6 text is proposed below.

### New decisions and their triage

- P13's `exportAs` clause (the directive's camelCase name, or its family's where two classes share one attribute; none where a template needs no instance). Evidence: every published spec follows it; Aria names its own the same way (`NC/src/aria/accordion/accordion-group.ts:63`); ADR 0016 for the Toggler's family form. Impact MEDIUM (`exportAs` names are public API, but the specs already fixed each one; the rule states the pattern), confidence HIGH: decided; the 1.3 text is proposed below.
- P21, no library strings, direction from `Directionality`, logical properties. Evidence: four spec decisions (Close Button D6, Top Bar D5, Progress Bar D12, Orbit D18), building-blocks 1.5 and 1.10, a source reading of `NC/src/aria` (no default strings), web-features 3.40.0 (`:dir()` widely available only from 2026-06-07). Impact HIGH (every spec's naming and string API), confidence HIGH: decided with the applied default; the 1.10 text is proposed below. The Slider's non-linear `aria-valuetext` fallback (`specs/slider.md:258`) does not state its locale format: a spec finding for the audit, listed below.
- P24's import array and its name form. Evidence: `NG/guide/components/selectors.md:140-143` (the silent failure); three specs export an array under two forms (`NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, `nfsPrototypeClasses`); Angular Aria exports classes and tokens only; Material ships per-component NgModules; ADR 0009 rejected `NFS_ACCORDION` as a token name and keeps exported constants camelCase. Impact HIGH (every entry point's exports; a name pattern the library cannot take back), confidence NOT HIGH (the three precedents disagree, and the two `NFS_*` arrays were carried from specs without a deliberated rule): OPEN FOR HUMAN. Options: (a) one array per entry point, in one form for the whole library: (a1) `NFS_<PLUGIN>`, the two Accordion-family specs' form; (a2) camelCase, `nfs<Plugin>Directives` or the Prototyping Utilities' `nfs<Plugin>Classes`, the form ADR 0009 keeps for every other exported constant; (b) no arrays, per-directive imports only, Aria's shape, with the silent failure documented; (c) both. Recommendation, unchanged in substance: (a), one array per entry point, because it is the only mitigation that reaches a forgotten family member and costs one export; on the form, (a2), so the library's exported constants keep one naming convention, which renames the two `NFS_*` arrays. The user is clarifying this with the orchestrator; the guide marks the array provisional and does not audit it.
- The release policy (deprecation and removal, the major cadence, platform-feature upgrades). Evidence: `NG/reference/releases.md:114-124`; `NC/CODING_STANDARDS.md:72-78`; the version coupling angular/components, NG-ZORRO, and ng-primitives keep; ADR 0002 (an upgrade changes what consumers see); no record states a policy (the critique's search for deprecation, semver, breaking change, and `ng update`). Impact HIGH (a contract), confidence NOT HIGH (the cadence is a precedent-carried default; whether a platform upgrade is breaking is a judgement): OPEN FOR HUMAN. Options: (a) the major tracks Angular's major, deprecations survive at least one major with `@deprecated` and an `ng update` migration, and a behaviour-changing platform upgrade lands only in a major; (b) independent semver with a peer range on Angular; (c) track Angular's major but allow platform upgrades in a minor behind a documented note. Recommendation, unchanged: (a). The user is clarifying this with the orchestrator; the guide's Release policy section is provisional and not audited.
- Considered and not adopted as rules: the headless lens's union-typed state discipline (internal; dropped from the idioms table at the critic's point 20) and a consumer-facing "public test surface" with a semver commitment (no record or research supports it; dropped at point 19).
- Pending another ticket: whether an input may be named after an HTML presentational attribute, and what the Menu family's `align` becomes, is [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md)'s; its evidence file is written and a panel decides next. P9 says so and the audit does not rate specs on it until then.

### Spec findings the critic surfaced, for the audit

For [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), not resolved here:

1. `specs/forms.md:148`, `:440`: the reason given for not hosting `NfsFormLabel` ("writing both attributes throws NG0309") contradicts building-blocks 1.9 and ADR 0041 (a template match discards the host-directive matches) (P8).
2. `specs/accordion.md:311`, `:560`, `:675` and `specs/forms.md:225`: ratios quoted from Foundation's `color-luminance()` against ADR 0022's dated note (P17).
3. `specs/reveal.md:461` and `specs/accordion.md:429`: the fallback timer measured always, against 1.6 rule 1 (P19); resolved if the 1.6 change below lands.
4. `specs/slider.md:258`: the non-linear `aria-valuetext` fallback's locale format is not stated (P21).

### Shared-file changes (proposed; the orchestrator applies)

1. `building-blocks.md` 1.5, the `computed`/`effect` bullet. Replace its first sentence, "`computed` for derived read-only state; `effect` only for side effects that are not DOM (history writes, timers) and never to propagate state between signals (`R:angular` effect guidance), with two exceptions." with:

   > `computed` for derived read-only state; `effect` only for side effects that are not DOM, never `history` or timers (1.11 decisions 3 and 4), and never to propagate state between signals (`R:angular` effect guidance), with two exceptions.

   The rest of the bullet (the rendered-state signal and the reverse-link registration) stays.

2. `building-blocks.md` 1.6 rule 1, the fallback timer. Replace "A fallback timer of the declared duration plus 100 ms (where the Motion class is consumer-chosen, as in Toggler's `animate`, or the length is a Foundation transition whose duration is a consumer Sass setting, as OffCanvas's `$offcanvas-transition-length`, the duration is measured from the host's computed `animation-*` or `transition-*` once the class is bound, Angular's own method for `animate.leave`, and a measured zero completes at once) covers stylesheets that removed the transition (Material's mechanic, `R:material` 0.2), and reduced motion resolves the wait synchronously (this refines the Motion UI prototype's design-time rule: a dropped stylesheet measures zero and completes at once; library-owned animations keep a declared duration)." with:

   > A fallback timer of the measured duration plus 100 ms, the duration read from the host's computed `animation-*` or `transition-*` once the class is bound (Angular's own method for `animate.leave`; a measured zero completes at once), covers stylesheets that removed or changed the transition (Material's mechanic, `R:material` 0.2), and reduced motion resolves the wait synchronously (this refines the Motion UI prototype's design-time rule: a dropped stylesheet measures zero and completes at once; 2026-09-28, [Decide: the directive and component architecture guide](issues/141-decide-directive-component-architecture-guide.md): library-owned animations are measured too, as the Reveal and Accordion specs already do, so a consumer Sass override of a library duration is honoured).

3. `building-blocks.md` 1.3, append a bullet:

   > - `exportAs` (2026-09-28, [Decide: the directive and component architecture guide](issues/141-decide-directive-component-architecture-guide.md)): where a template needs the instance (state, methods, a Trigger target), it is the directive's camelCase name (`nfsReveal`, `nfsAccordionContent`), or its family's where two classes share one attribute (both Toggler classes export `nfsToggler`, ADR 0016), as Aria names its own (`exportAs: 'ngAccordionGroup'`); a directive with no state or method to read has none.

4. `building-blocks.md` 1.10, append a bullet:

   > - Strings and direction (2026-09-28, [Decide: the directive and component architecture guide](issues/141-decide-directive-component-architecture-guide.md)): the library renders no human-readable string of its own; every label, role description, and formatted value comes from consumer markup or a consumer function (the Slider's `displayWith`, Orbit's labels, the names the Close Button, Top Bar, and Progress Bar require), and a directive declares no name input for an element the consumer writes (the Names bullet above). Direction comes from `Directionality.valueSignal` (1.5, with the Slider's handler exception), and library CSS uses logical properties, never `:dir()`, which is outside the Browser target (web-features 3.40.0: widely available only from 2026-06-07).

5. `map.md`, Notes, Standing preferences: append a bullet after the last one:

   > - Architecture guide (2026-09-28): [architecture-guide.md](architecture-guide.md) restates these preferences, the ADRs, and building-blocks as testable principles for the spec audit, and ranks below all three: where it restates a record it cites it, where it adds a rule it says so and [Decide: the directive and component architecture guide](issues/141-decide-directive-component-architecture-guide.md) rated it, and a conflict is settled by the record, never by the guide. Where this repository's `AGENTS.md` differs from the map (its Implementation Hierarchy puts `@angular/aria` first; its DI example injects a parent token optionally with `skipSelf` in every child), the specs follow the map's Implementation order and building-blocks 1.8 and 1.9, because `AGENTS.md`'s conventions are one design-criteria input and its component code is neither a source nor a constraint.

6. `README.md`, How to read the bundle: insert after item 2 (building-blocks) and renumber the rest:

   > 3. [architecture-guide.md](architecture-guide.md): the directive and component architecture principles: 26 testable rules over eight kinds of building block, an 11-question decision framework, an idioms table for authors who know React's headless libraries, and the conflicts the research raised, each principle restating a map ruling, an ADR, or building-blocks (which outrank it) or marked New; [Audit: the specs against the architecture guide](issues/142-audit-specs-against-architecture-guide.md) audits every spec against it, and its provisional parts (the import array, the release policy) are not audited until the user decides them.

   And in the open list "The architecture guide (3 tickets, opened 2026-09-28)", replace item 2's "which writes `architecture-guide.md`." with "which wrote `architecture-guide.md` (resolved 2026-09-28; the import array and the release policy stay OPEN FOR HUMAN, and the presentational-attribute rule waits on item 1's ticket)."

7. `map.md`, Decisions so far: the gist line below.

### Triage

| Item | Impact | Confidence | Verdict |
| --- | --- | --- | --- |
| Conflict 1: `effect()` wording in 1.5 | MEDIUM | HIGH | Decided; text proposed |
| Conflict 2: AGENTS.md Implementation order | MEDIUM | HIGH | Decided; the specs follow the map; precedence line proposed |
| Conflict 3: AGENTS.md DI example | MEDIUM | HIGH | Decided; same line |
| 1.6 rule 1 timer against the Reveal and Accordion specs | MEDIUM | HIGH | Decided; text proposed |
| P13 `exportAs` clause | MEDIUM | HIGH | Decided; text proposed |
| P21 strings and direction | HIGH | HIGH | Decided; text proposed |
| P24 import array and its name form | HIGH | NOT HIGH | OPEN FOR HUMAN; options and recommendation above |
| Release policy | HIGH | NOT HIGH | OPEN FOR HUMAN; options and recommendation above |
| P9 presentational-attribute rule | (ticket 139's) | (ticket 139's) | Pending ticket 139; not audited until it resolves |

### Gist for Decisions so far

- [Decide: the directive and component architecture guide](issues/141-decide-directive-component-architecture-guide.md) -- `architecture-guide.md`: 26 testable principles over eight kinds of building block and an 11-question decision framework, each restating a map ruling, an ADR, or building-blocks with a preferred and an avoided example in `nfs` names; the critic's 39 points all applied; three conflicts settled on the records' side (an `effect()` wording in building-blocks 1.5 corrected, AGENTS.md's Aria-first order and its optional-`skipSelf` DI example scoped to this repository by a precedence line in the map's Notes) and the 1.6 fallback timer changed to measure always; new: the `exportAs` naming and the no-library-strings rule decided, the per-entry-point import array and the release policy OPEN FOR HUMAN; the presentational-attribute rule waits on ticket 139; four spec findings routed to the audit. Guide: [architecture-guide.md](architecture-guide.md).

### User ruling, 2026-09-28 (release policy)

Asked the release-policy question with the three options above, the user chose option (a), the recommendation: the library's major version tracks Angular's major, a public API is removed only after at least one major of deprecation (`@deprecated`, a changelog entry, and an `ng update` migration where one can be written), and a platform-feature upgrade that changes consumer-visible behaviour lands only in a major; `foundation-sites` stays a peer at `^6.9.0`. Recorded in [ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md); the guide's "Release policy" section is no longer provisional and stays out of the audit. P24's import array stays OPEN FOR HUMAN until [Prototype: detecting a forgotten attribute directive import](145-prototype-missing-directive-import-checks.md) reports.

### User ruling, 2026-09-28 (release policy, refined)

The user refined the ruling above the same day: migrations are written as Nx migrations first and reused, partly or fully, as `ng update` migrations; and the library follows the Angular devkit's version scheme, as `@angular-devkit/architect` and `@angular-devkit/build-webpack` do (`0.2202.0` released with Angular CLI 22.2.0), after first proposing a `0.22.x` prerelease. So the version is `0.<Angular major><Angular minor, two digits>.<patch>`; "a major" in the ruling above now means an Angular major (`0.22xx` to `0.23xx`). [ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md) is rewritten to match and lists the replaced choices among its considered options. The orchestrator's reading, flagged to the user: the patch counts the library's own releases rather than mirroring Angular's, and a release declares the Angular packages as peers from the minor it names.
