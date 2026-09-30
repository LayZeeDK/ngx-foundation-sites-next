# 172. Re-run: family checks and misuse warnings specs, spec-shape subsections

Type: grilling
Status: resolved
Blocked by: 160, 161
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md) (M6) found that `specs/family-checks.md` and `specs/misuse-warnings.md` lack the spec-shape subsections the map's Spec shape note and building-blocks 1.14 ask for, which the 55 other specs carry. What do the two specs say in those subsections?

## How to work it

Opus 5.5, AFK. Add to each spec, inside Implementation Decisions and Further Notes as the Spec shape note places them:

- A Foundation contract: what Foundation 6.9's plugins report for the misuses and placements these checks cover, read from Foundation's JavaScript at `d:/projects/github/foundation/foundation-sites` (v6.9.0).
- A Hierarchy and package shape subsection: no directive and no entry point of their own; where each check's code lives; the helpers that are library-internal (`specs/misuse-warnings.md`, its helpers passage).
- A comparison table: Angular Aria's development warnings, Material's removed sanity checks (angular/components commit `54875a3`), and the CDK's `InteractivityChecker` as the one primitive reused.
- For the family checks spec only, one usage example: a check's call site with its inline guard and the F5 helper branch.

The audit's fixers did not touch those sections. Amend [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md) and [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md) with a dated section each, and resolve this ticket with an Answer and a gist.

## Answer

Both specs now carry the spec-shape subsections that the map's Spec shape note and building-blocks 1.14 place inside Implementation Decisions and Further Notes, modelled on the Runtime, build-time, and forgotten-import checks specs. The facts come from Foundation 6.9's JavaScript (`d:/projects/github/foundation/foundation-sites`, `js/` at `337be7a8d`, tag v6.9.0 plus one merge), Angular Aria's and the CDK's sources, and Material's removed sanity checks (angular/components at `708d4c6e2`, and the parent of commit `54875a3`), each cited by file and line in the specs.

### What each spec says

- [specs/family-checks.md](../specs/family-checks.md):
  - Foundation contract, after The kind and its boundary: Foundation's JavaScript reports none of the arrangements. It wraps a drilldown root without its wrapper and a sticky element without its container, generates a missing back item, uses the first two slider handles and clamps a first handle set above the second, and opens every pre-active accordion item; the Accordion Menu keeps only the last pre-open section. Its CSS-only families have no JavaScript. The one report near a family check is the Responsive Toggle's `console.error` for a bar with no menu id.
  - Hierarchy and package shape: no directive and no entry point of its own; each check lives in its directive's file and entry point, with its development-only lookups (F3) and, for F6, two unexported sequence functions; no library-internal helper of this kind; `nfsReportForgottenPeer` is the forgotten-import checks', called only in F5's second form; `InteractivityChecker` injected in development builds only.
  - Comparison with Angular Material, the CDK, Angular Aria, and prior art, before Implementation level and primitives: Aria's `reportViolations` and what it reports; Aria's single-mode report, which never fires because the library keeps Aria's `multiExpandable` at `true`; DOM-only placement; the forgotten peer; Material's removed theme, doctype, and version checks and why they went; `InteractivityChecker` as the one CDK primitive reused; no family check throws.
  - Usage examples, in Further Notes after the design decisions: the Media Object's check 3 at its call site, with its inline guard, its `afterNextRender` read, the F5 helper branch, and the silent form it takes without the forgotten-import checks.
- [specs/misuse-warnings.md](../specs/misuse-warnings.md):
  - Foundation contract, after The first milestone and this spec: every `console.warn`, `console.error`, `console.info`, and `throw` site in `js/`. Foundation reports option values (the Interchange's `type`, the Drilldown's `backButtonPosition`, the Toggler's missing class), one option pair (the Off-canvas' `contentId` without `nested`), breakpoint strings (`MediaQuery` throws where the library warns and answers `false`), method calls on a disabled accordion, and unknown plugins or methods. It reads a copied Foundation class as state and reports no name, focusable host, Scroll region, Motion value, link host, or missing stylesheet.
  - Hierarchy and package shape: no directive and no entry point of its own; each warning lives in its directive's file and entry point, with its `HostAttributeToken` reads and its own tables; the call-time warnings and the two construction-time throws; the three library-internal helpers (S1's matcher, S3's name reader, S4's Scroll region test) in `ngx-foundation-sites/media-query`.
  - Comparison with Angular Material, the CDK, Angular Aria, and prior art: Aria's `reportViolations` and what its violations read; Material's theme marker against S7; `MATERIAL_SANITY_CHECKS` against no switch; `InteractivityChecker` for the Visibility Classes' two checks and the Tooltip's check 2; names; copied classes.
  - Its usage examples were there already.

Correction (2026-09-30, audit 0010): the search listed in the misuse warnings spec missed four sites, which audit 0010's M7 adds to the contract's lead-in.

### Questions asked and settled

1. Where do the misuse warnings' three shared helpers live, when the spec says they are "never exported"? A secondary entry point reaches another's code only through its exports, and the helpers serve directives in most entry points. The bundle has one precedent for exactly this: functions exported from `ngx-foundation-sites/media-query` for library directives only (`nfsVariantCheck`, `nfsDirectiveCheck`, `nfsReportForgottenPeer`). Settled: the helpers sit there, not public API; Implementation level and primitives now says "never exported to consumers". Impact LOW (no consumer-facing API; an import some entry points gain only when a warning lands), confidence MEDIUM (inferred from the bundle's precedent and the entry-point model, not measured).
2. Does Aria's own accordion report make the Accordion's check 4 redundant? No: Aria's pattern reports several initially expanded items only while `multiExpandable` is `false`, and the Accordion spec keeps it at `true` and owns `multiExpand`. Recorded in the family spec's comparison. Impact none, confidence HIGH.
3. Which usage example for the family spec? The ticket asks for a check's call site with its inline guard and the F5 helper branch. The Media Object's check 3 is the shortest check that reads placement from the DOM alone and calls the helper for a parent that carries the attribute without its class. Its message is quoted from the spec. Impact none, confidence HIGH.
4. Should the family checks reuse the misuse warnings' name reader (S3) for the Drilldown's check 3 and the Switch's check 5, which read names by the same rule? Not decided here. The family spec's Out of Scope rejects a shared helper of its own, and a later milestone that builds both kinds can make the call. Left as a note; nothing OPEN FOR HUMAN.

Nothing is OPEN FOR HUMAN. No check, message, test, or decision of either spec changes. The map and the README are untouched.

### Verification

`check.mjs` in the scratchpad (`wave158/172/`) scans both specs and tickets 160, 161, and 172, with a positive control for each scan: no non-ASCII character; no banned word; every relative link resolves (the quoted proposals and gist lines are skipped); every table row has its header's cell count; both specs carry the Foundation contract, Hierarchy and package shape, and comparison headings, and the family spec carries its Usage examples heading.

### Gist for Decisions so far

- [Re-run: family checks and misuse warnings specs, spec-shape subsections](issues/172-rerun-family-and-misuse-specs-spec-shape.md) -- audit 0009 M6 worked. Both later-milestone check specs gain a Foundation contract read from Foundation 6.9's JavaScript: it reports none of the family arrangements, repairing or ignoring them, and only option values and method calls among the misuses. They also gain a Hierarchy and package shape subsection (no directive or entry point of their own; each check in its directive's file; the misuse warnings' three library-internal helpers in `ngx-foundation-sites/media-query`, exported for library directives only) and a comparison with Aria's `reportViolations`, Material's removed `MatCommonModule` sanity checks (`54875a3`), and the CDK's `InteractivityChecker`. The family spec gains one usage example, the Media Object's check 3 with its inline guard and the F5 helper branch. Impact LOW, nothing OPEN FOR HUMAN, no ADR.
