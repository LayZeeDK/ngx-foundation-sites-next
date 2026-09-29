# 158. Decide: checks move to a later milestone

Type: grilling
Status: resolved
Blocked by: 150, 156, 157
Labels: wayfinder:grilling
Map: ../map.md

## Question

The specs give the library many checks: the four forgotten-import checks of [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), each family's development checks between its parts, each directive's development warnings about how the consumer used it, the Runtime checks of [ADR 0040](../adr/0040-variant-input-types.md), the `@error` checks in the Library mixins, and the Variant declaration tooling's CI sync check. Which of them belong in the first milestone of the repository that implements the specs?

## Answer

### User ruling, 2026-09-29

The user, in order:

1. "The reason I include so many different types of check is that I want to analyze how each works in practice and evaluate trade-offs. However, all checks should be deferred to a later milestone because at the core of it, this is an issue Angular should correct, not 3rd-party Angular component libraries."
2. "By deferring, I didn't mean to defer their specs, only that in the repo that implements the specs, their planning and implementation is deferred to a later milestone which implies that the other specs cannot depend on them being present or mention them in their specs. They should describe and accept a version where no checks for missing imports are in place."
3. "I was thinking that family/peer/parent/similar checks should be specced but deferred like missing import checks. Is there a WCAG requirement to include it? I'm thinking it's up to the consumer to include components/directives as documented, at least in the initial version. I want to keep the initial milestone simpler and smaller in scope."
4. Asked which kinds to defer, the user chose all four offered: family, peer, and parent checks; own-misuse warnings; Runtime checks; Sass compile checks. Then: "Defer it too then start the wave", for the Variant declaration tooling's CI sync check.

### What was weighed

- WCAG. Its conformance requirements apply to web pages, the content the consumer ships, not to the library or tool that builds them; a development warning adds nothing to conformance. The one W3C guideline that asks a tool to check an author's work, ATAG 2.0 (B.3.1.1, "accessibility checking for that success criterion is provided"), is for authoring tools, and WAI's list of them (WYSIWYG editors, CMS and LMS, document converters, multimedia authoring tools, sites that let users add content) does not include a component library; WAI does not describe ATAG as required by law or by WCAG. The library's own bar is the repository's AGENTS.md: its components, used as documented, pass axe and WCAG AA, which its own stories and their accessibility tests prove.
- What the consumer then carries. Some checks warn about consumer misuse that fails WCAG on the consumer's page (the Orbit's check 1: `autoPlay` without a rotation control, 2.2.2). Without them, each spec states the rule as documented usage, and a consumer who ignores it fails WCAG on their own page. The user accepts this for the first milestone.

### Decision

1. Five kinds of check are specified but planned and implemented in a later milestone of the implementing repository:
   - Forgotten-import checks: the four checks of ADR 0046 (the In-family checks with their parent checks, child probes, and out-of-reach report; `strictDirectiveImports`; `strictParents`; the static `missing-imports` builder), `nfsDirectiveCheck`, the host record, the Selector manifest, the development-only token descriptions (M7), and `nfsReportForgottenPeer` ([Decide: family checks report a forgotten peer themselves](157-decide-family-checks-report-forgotten-peers.md)).
   - Family checks: a family's own development check that reads another part of its family (its parent, a child, or a peer): registration checks, DOM-only placement checks, order checks, and the outside-the-parent warnings of building-blocks 1.9.
   - Misuse warnings: a directive's own development warning that reads only its host, its inputs, its content, or the page (a copied Foundation class, a missing accessible name, a value it cannot use).
   - Runtime checks: ADR 0040's checks (a Variant value with no class in the compiled CSS, missing Variant properties, Breakpoint drift), with `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and the `NfsRuntimeChecks` keys.
   - Build-time checks: the `@error` and `@warn` checks in the Library mixins (contrast checks, registry and name checks, presence markers read only by a check), and the Variant declaration tooling's check mode (the CI sync check and its messages, including the one for a stylesheet with no Variant properties).
   The forgotten-import checks keep [specs/forgotten-import-checks.md](../specs/forgotten-import-checks.md); each other kind gets its own spec. Each deferred spec holds the full design, copied from the specs as they stand at this ticket, so the later milestone can weigh the kinds against each other in practice.
2. No other spec, and no shared document other than the map, the README, the glossary, and the records that must say where the design went, depends on a deferred check, names one, or links to a deferred spec. Each spec describes, and accepts, a library with none of them: a forgotten import renders without its directive; a part outside its parent, or a misuse, gets no warning; each rule a check enforced is stated as documented usage in the spec (its API text, its usage section, and the JSDoc it asks for), for example "`autoPlay` requires an `nfsOrbitRotation` control (WCAG 2.2.2)".
3. Not checks, so in the first milestone: required parent injections (Angular's NG0201 is Angular's report, not the library's), ARIA and focus behaviour, typed inputs and their compile errors, the Library mixins' CSS rules and the Variant properties they write, the Variant declaration tooling's generate mode, and the library's own tests (its stories with their accessibility checks, its unit and e2e tests), which prove its components pass axe and WCAG AA as documented.
4. A Library mixin loses its checks and keeps its CSS rules and its Variant properties. An injection token keeps its name as its description (`new InjectionToken<NfsOrbit>('nfsOrbitToken')`); the development-only description naming the provider moves with M7.
5. T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) stays OPEN FOR HUMAN. Its main argument for one Library mixin per export mixin, that each check runs only for a component the consumer compiles, now belongs to the later milestone; in the first milestone the choice decides only which CSS rules a consumer includes. The ticket gains a dated note saying so.

This supersedes, for the first milestone, the parts of ADR 0040 (its Runtime checks), ADR 0046 (its four checks; its ruling of no import arrays stands on its own, for the unused-imports diagnostic and migration), building-blocks 1.9's development warnings, and every spec's checks; each record keeps a dated pointer here.

### The wave

| Ticket | Kind | Blocked by |
| --- | --- | --- |
| [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) | task, AFK (Sonnet sweeps) | this ticket |
| [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md) | grilling (Opus) | 159 |
| [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md) | grilling (Opus) | 159 |
| [Spec: Runtime checks (later milestone)](162-spec-runtime-checks-later-milestone.md) | grilling (Opus) | 159 |
| [Spec: build-time checks (later milestone)](163-spec-build-time-checks-later-milestone.md) | grilling (Opus) | 159 |
| [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md) | grilling (Opus) | 159 |
| [Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md) to [group f](170-rerun-specs-without-checks-group-f.md) | grilling (Opus) | 159 |
| [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md) | task, AFK (Sonnet) | 160 to 170 |

Then the wave audit (map, Audits).

### Triage

A user ruling, so no triage decides it. The orchestrator's calls inside it, each impact LOW and confidence HIGH: the five kinds' boundaries and the classification rule above (a check lands in exactly one deferred spec, by what it reads); the token descriptions moving with M7; the Library mixins keeping their Variant properties, because the Variant declaration tooling's generate mode reads them. Nothing new is OPEN FOR HUMAN.

### Gist for Decisions so far

- [Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md) -- the user ruled that every check is specified but planned and implemented in a later milestone of the implementing repository: the forgotten-import checks, family checks, misuse warnings, Runtime checks, and build-time checks (the Library mixins' `@error` checks and the Variant declaration tooling's CI sync check), each in its own spec; every other spec describes and accepts a library with none, stating each rule as documented usage, because WCAG binds the consumer's pages, not the library's diagnostics, and ATAG's checking criteria are for authoring tools; required injections, ARIA, typed inputs, CSS rules, and the library's own tests stay in the first milestone.
