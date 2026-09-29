# 154. Re-run: CSS-only component and free-behaviour family specs, In-family check lines

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that the specs written before ADR 0046 lack the In-family check lines, parent token descriptions, and `strictParents` effects that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a multi-directive family. What does each spec of the CSS-only component and free-behaviour family (`specs/card.md`, `specs/media-object.md`, `specs/table.md`, `specs/sticky.md`, `specs/equalizer.md`) state?

## How to work it

Revise each spec in place and append a dated `### Amendment, 2026-09-29 (in-family check lines)` to the ticket the map's Decisions so far cites last for that spec. The items, evidence, and what to decide are in the audit ticket's Answer, section "Re-run tickets", item R4, and the five points above it that every re-run decides; `specs/forgotten-import-checks.md` (its family rule, the `strictParents` table, and the token-description form) and the Accordion spec's worked example are the model. Run `/grill-with-docs` (self-grilling, both sides) where a point needs deciding, and keep every other part of each spec unchanged. Propose shared-document changes as quoted text in the Answer.

## Answer

Model: Opus 5.5. Resolved 2026-09-29, AFK under the map's override: self-grilled on both sides inline (no `/grill-with-docs` skill is installed in this session, so the rounds are recorded below), then the five specs revised in place, each governing ticket given its dated amendment: [Spec: Card](90-spec-card.md), [Spec: Media Object](91-spec-media-object.md), [Spec: Table](92-spec-table.md), [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md), [Re-run: Equalizer spec under the class rule](126-rerun-equalizer-class-rule.md). Specs: [specs/card.md](../specs/card.md), [specs/media-object.md](../specs/media-object.md), [specs/table.md](../specs/table.md), [specs/sticky.md](../specs/sticky.md), [specs/equalizer.md](../specs/equalizer.md).

Sources: the Answer of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) (Re-run tickets, the five points and R4) with `research/architecture-audit-triage.md` (T1) and the card, equalizer, media-object, sticky, and table findings of `research/architecture-audit-b.md`, `-c.md`, and `-e.md`; `specs/forgotten-import-checks.md` (the In-family checks section and its family rule, the verdict, the one report function and D8, the `strictParents` table, the token-description form M7 and D17, the template-outlet pattern, messages M2 to M8); [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md); building-blocks 1.9 (the parent handle, "Ancestry that projection can hide", the forgotten-imports bullet); the guide's P23 and P24; `specs/accordion.md:156`, the worked example, and the fixer lines X1 to X5, whose lead ("In-family checks (...)") the new bullets use. No experiment was needed: every decision follows from the specs' own hierarchies and the shared spec's text.

Gist: every container of the five families probes its parts, and only `NfsEqualizerWatch` has a parent check, because it is the only part with a parent injection; its old "found no nfsEqualizer" warning becomes the `alone` sentence and it throws under `strictParents`. `nfsEqualizerToken` gets its development description. The two placement checks that read the DOM (the Media Object's check 3, the Sticky's warning 1) stay DOM checks and say nothing for a parent that carries the parent's attribute without its directive, a forgotten import that `strictDirectiveImports` reports once.

### Grilling record

1. Does a Card part get a parent check? For: the rule's item 2 asks each part to state its parent check, and a forgotten `NfsCard` around imported parts would then be reported in-family. Against: the parent check runs from an optional injection's `found`, and the Card injects nothing; a development-only `inject(NfsCard, {optional: true})` would make every legal part outside a card report M5 and throw under `strictParents`, against the spec's own "a part outside a card is not reported" and D10's rejected parent token. Settled: no parent check; a forgotten `NfsCard` is the `strictDirectiveImports` and static checks' report, as the shared spec's "What they cannot see" already says of a forgotten family.
2. Does `NfsTableScroll` probe `NfsTable`, when the spec says the two do not know each other? For: the Accordion probes every DOM-nested child; the table sits in the wrapper's scope; a component that imports `NfsTableScroll` and forgets `NfsTable` is the forgotten-member case the In-family checks exist for, and the probe reports it even with `strictDirectiveImports` off. Against: the table works alone and is optional. Settled: probe. The table being optional only means a plain table carries no attribute and is never probed. `NfsTable` probes nothing (no directive below it). The DI statement stays true (no token, handle, or query) and gains one sentence saying the wrapper's development check names `NfsTable`.
3. What does the Media Object's check 3 say when `NfsMediaObject` is forgotten? The parent `<div nfsMediaObject>` then lacks `.media-object`, and check 3 would say the section "is not a direct child of an nfsMediaObject element" and ask for `hostDirectives`: the wrong fix. (a) Keep the message: rejected by the audit's point 3. (b) A second message naming the import: a second report of one defect, against P23's "once" and the shared spec's D8, and the report function that deduplicates is not open to a family's own check. (c) The auditor's suggestion, the family parent check in place of the DOM read: it needs an injection D10 rejects (projection hides DI, and the section must be a direct child), and the judge kept check 3 a DOM check. (d) Check 3 counts a parent that carries the `nfsMediaObject` attribute as the parent and says nothing, leaving the forgotten import to `strictDirectiveImports` (M1, on by default, naming directive, entry point, and owner) and to the static check. Settled: (d). Its ceiling: with `strictDirectiveImports: false` only the static check in CI reports it, which is the consumer's choice for that report.
4. The Sticky's warning 1 when `NfsStickyContainer` is forgotten has the same shape: the parent carries the attribute, lacks `.sticky-container`, computes `static`, and the warning asks to add the directive already written. Settled as 3 (d), for that parent only: a parent that has the class and still computes `static` keeps the warning as it was.
5. What becomes of the Equalizer's "nfsEqualizerWatch found no nfsEqualizer among the element injectors of its template"? The audit's point 2 makes it the `alone` sentence. Its hint about templates is M4's job now (an `nfsEqualizer` ancestor out of reach), so the sentence says only what the part does alone: "It belongs to no group, so no equalizer sets its min-height." The DI bullet's list of fixes for projected watched elements gains the template-outlet pattern, which `strictParents` needs.
6. Which group probes the element of Foundation's nesting example that carries both `nfsEqualizerWatch` and `nfsEqualizer`? The probe takes the nearest ancestor carrying the part's attribute, and an element is not its own ancestor, so the outer group probes it and the inner group probes the inner watched elements, exactly as `skipSelf` registers them. No extra rule.
7. Does `nfsEqualizerToken` need a description when its one injection is optional and never throws NG0201? For: the shared spec's D17 gives every parent token one, and the audit counts it among the thirteen missing. Against: no NG0201 prints it. Settled: yes, in M7's form, with a clause saying why; it costs production nothing.
8. A card component with `hostDirectives: [NfsCard]` (the Card's user story 9) carries no `nfsCard` attribute, so under the shared probe scope ("nearest ancestor carrying one of this part's own attributes") its hosted `NfsCard` probes nothing in its own template. Nothing is reported falsely (an outer card or the runtime check still reports a forgotten part), so the Card's line does not depend on it; S1 below fixes the scope.
9. How far do the edits go beyond the bullet? Only to statements the call makes false: the Card's "Injection: none, in development builds too", its implementation level's "no ... render callback ... or injection", its before-hydration "no render callback at all", and D10's "No development checks"; the Table's "do not know each other" gains a sentence; the Equalizer's warning bullet and parent-handle bullet; the two DOM checks, D10 of the Media Object, and their tests. Everything else stays.
10. Which tests? The shared spec's layer 2 tests the helper over library fixtures, and the Accordion added none, so a family spec adds tests only where its own checks change: check 3 and warning 1 stay silent for a parent that carries the attribute without its directive; the Equalizer asserts its two reports, the throw, and the pattern.

### Decisions

Card (`specs/card.md`):

1. `NfsCard`: `nfsDirectiveCheck('NfsCard', {children: ['NfsCardDivider', 'NfsCardSection', 'NfsCardImage']})`; no parent check (no injection; grilling 1); probes its three parts; no peers; `strictParents` changes nothing. `NfsCardDivider`, `NfsCardSection`, `NfsCardImage`: the call with their class name and nothing else. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for the call alone. No parent token.
2. The Injection bullet, the implementation level, the before-hydration bullet, and D10 now say that each directive's only development code is that call (grilling 9).

Media Object (`specs/media-object.md`):

3. `NfsMediaObject`: children `['NfsMediaObjectSection']`, a nested media object keeping its own; `NfsMediaObjectSection`: the call alone; no parent check, peers, or `strictParents` effect; the Flexbox Utilities' and Thumbnail's directives beside or inside belong to their own families.
4. Check 3 stays a DOM check and fires only when the parent carries neither `.media-object` nor the `nfsMediaObject` attribute (grilling 3); D10 and the layer-2 development-check case say so.

Table (`specs/table.md`):

5. `NfsTableScroll`: children `['NfsTable']`; `NfsTable`: the call alone; no parent check, peers, or `strictParents` effect; the entry point imports `nfsDirectiveCheck` as the Card's does; the DI bullet notes that only the wrapper's development check names `NfsTable` (grilling 2).

Sticky (`specs/sticky.md`):

6. `NfsStickyContainer`: children `['NfsSticky']`; `NfsSticky`: the call alone (its sentinels carry no directive attribute); no parent check, peers, or `strictParents` effect.
7. Warning 1 is not given for a parent that carries `nfsStickyContainer` without `.sticky-container` (grilling 4); layer 2 asserts it.

Equalizer (`specs/equalizer.md`):

8. `nfsEqualizerToken = new InjectionToken<NfsEqualizer>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsEqualizerToken (provided by NfsEqualizer from 'ngx-foundation-sites/equalizer' on an ancestor element declared in the same template)" : '')` (grilling 7). `nfsEqualizerDefaultsToken` is a Defaults token and gets none.
9. `NfsEqualizer`: children `['NfsEqualizerWatch']`, scoped as in grilling 6; no parent check.
10. `NfsEqualizerWatch`: `parent: {directives: ['NfsEqualizer'], found: this.#equalizer !== null, alone: 'It belongs to no group, so no equalizer sets its min-height.'}`, replacing the old warning (grilling 5); no library directive hosts `NfsEqualizer`; no peers (registration goes through the token).
11. `strictParents`: `NfsEqualizerWatch` throws at construction, on the server as in the browser (the shared table's row); nothing for `NfsEqualizer`. The DI bullet's fixes gain the template-outlet pattern; layer 2 asserts M5 with the sentence, M4, the throw, and registration through the pattern.

All five:

12. No part of the five families sits on `ng-template` or `ng-container`, so every directive calls `nfsDirectiveCheck`. The Equalizer's is the only existing warning for a part outside an optional parent (point 2). No ADR, no glossary term, no prototype.

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| The In-family entries of the twelve directives (decisions 1, 3, 5, 6, 9, 10) | LOW: development-only checks, no public API | HIGH: the shared spec's family rule and each spec's hierarchy | Decided |
| The DOM checks silent for a parent that carries the attribute without its directive (4, 7) | LOW: two development warnings | HIGH: P23's "once", the shared spec's D8 and verdict | Decided |
| `NfsEqualizerWatch` throws under `strictParents` (11) | MEDIUM: an opt-in development throw | HIGH: the shared spec's table and ADR 0046's dated note fix it | Decided |
| `nfsEqualizerToken`'s description and the `alone` sentence (8, 10) | LOW: development strings | HIGH: D17, M5, M7 | Decided |
| S1 and S2 below | LOW | HIGH | Proposed to the orchestrator |

Nothing is `OPEN FOR HUMAN`; no `## Prototype needed`.

### Proposed shared-file changes (for the orchestrator)

S1. `specs/forgotten-import-checks.md`, In-family checks: a part reached through a consumer's `hostDirectives` writes no attribute on its host, so both walks should also count the host record, which already holds hosted directives (the shared spec's host-record bullet). Without it a hosted `NfsCard` probes nothing in its own template, and a part projected out of reach inside a consumer component that hosts its parent reads as standing alone (M5) instead of out of reach (M4).

- In the parent-check bullet, replace "`host.parentElement.closest()` over the parent directives' attributes." with:

  > the nearest ancestor of the host that carries one of the parent directives' attributes or that the host record shows hosting one of them (a directive reached through a consumer's `hostDirectives` writes no attribute on its host).

- In the child-probe bullet, replace "whose nearest ancestor carrying one of this part's own attributes is this host (so a nested instance keeps its own children)" with:

  > whose nearest ancestor that carries one of this part's own attributes, or that the host record shows hosting this part, is this host (so a nested instance keeps its own children, and a part reached through a consumer's `hostDirectives` probes its own: a card component with `hostDirectives: [NfsCard]` probes the sections of its template)

S2. `specs/forgotten-import-checks.md`, In-family checks: after the bullet that begins "- What they cannot see (PEER 7)", add:

  > - A family's own development check that reports placement from the DOM alone (building-blocks 1.9; the Media Object's check 3, the Sticky's warning 1) says nothing for a parent element that carries a parent directive's attribute without its host class: that element is a forgotten import, which `strictDirectiveImports` reports once with the import to add, and the static check in CI, so the placement message never names the wrong fix and the defect is reported once.

### What other specs need

- [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md): the Top Bar's section check reads placement from the DOM (building-blocks 1.9 names it), the question of grilling 3; S2 is the answer this ticket reached. S1's probe scope matters for any probe by an `NfsMenu` that a root hosts, whose `ul` carries the root's attribute, not `nfsMenu`.
- [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md): the XY Grid's check 2 and the Flex Grid's DOM check decide the same message question (R5); S2 gives them this ticket's answer.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that the Top Bar, XY Grid, and Flex Grid placement checks agree with S2, or record why they differ.
- The five specs need nothing from one another: directives written beside each other (`nfsCard` beside `nfsEqualizerWatch`, `nfsSticky` beside a bar, `nfsMediaObjectSection` beside `nfsFlexChild`) each probe only their own family.

### Gist for Decisions so far

- [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](issues/154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md) -- the Card, Media Object, Table, Sticky, and Equalizer specs list their In-family checks per part: each container probes its parts (`NfsCard` its divider, section, and image; `NfsMediaObject` its sections; `NfsTableScroll` an `nfsTable` inside it; `NfsStickyContainer` its `nfsSticky` elements; `NfsEqualizer` its watched elements, the shared nesting element being the outer group's), and only `NfsEqualizerWatch` has a parent check, with `NfsEqualizer` and the sentence "It belongs to no group, so no equalizer sets its min-height." replacing its old warning, and it throws under `strictParents`; `nfsEqualizerToken` gets its development description; the Media Object's check 3 and the Sticky's warning 1 stay DOM checks and say nothing for a parent that carries the parent's attribute without its directive, a forgotten import that `strictDirectiveImports` reports once; the Card and Table entry points import `nfsDirectiveCheck` from `media-query`; two shared-spec proposals (both In-family walks count a part hosted through `hostDirectives`; the rule for DOM placement checks); impact LOW to MEDIUM, confidence HIGH; no ADR.
