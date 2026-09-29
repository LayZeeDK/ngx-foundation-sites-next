# 168. Re-run: specs without checks, group d

Type: grilling
Status: open
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) has every spec describe, and accept, a library with no checks. What do `specs/nested-menu.md`, `specs/off-canvas.md`, `specs/orbit.md`, `specs/pagination.md`, `specs/progress-bar.md`, `specs/prototyping-utilities.md`, `specs/responsive-accordion-tabs.md`, `specs/responsive-embed.md`, `specs/responsive-menu.md` say without them?

## How to work it

Opus 5.5, AFK under the map's triage rule. For each spec, from its extraction manifest in [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and a full read: remove every check of the five kinds, its messages, its tests and stories, and every sentence that relies on one (a parent check, a probe, `strictParents`, `nfsDirectiveCheck`, a Runtime check, a Library mixin's `@error`); state each rule a check enforced as documented usage, in the spec's API text, usage section, and the JSDoc it asks for; give each injection token its plain name as its description; keep the Library mixins' CSS rules and Variant properties, the required injections, ARIA, typed inputs, and the library's own tests of its components. No spec names a deferred check or links to a deferred spec; a forgotten import, a part outside its parent, or a misuse simply gets no warning. Each changed spec gets a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` in the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.
