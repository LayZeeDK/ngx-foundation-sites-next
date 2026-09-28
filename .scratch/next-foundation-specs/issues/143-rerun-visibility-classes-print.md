# 143. Re-run: Visibility Classes spec for the print classes

Type: grilling
Status: claimed
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The [Spec: Typography Helpers](106-spec-typography-helpers.md) found that Foundation's `.show-for-print` and `.hide-for-print` have no owner in any published spec, and proposed them as a `print` condition of the `showFor` and `hideFor` inputs of the [Spec: Visibility Classes](104-spec-visibility-classes.md). How does the Visibility Classes spec take the print classes under the class rule (ADR 0039: consumers write no Foundation or NFS class), and what changes in its types, checks, stories, and tests?

## How to work it

Revise `specs/visibility-classes.md` in place and append a dated `### Amendment, 2026-09-28 (print classes)` to the [Spec: Visibility Classes](104-spec-visibility-classes.md) ticket. Read first: the Typography Helpers ticket's Answer (its print-class finding and proposal), the Visibility Classes spec and ticket, ADR 0039, ADR 0040, and building-blocks 1.4 and 1.7. Measure what `.show-for-print` and `.hide-for-print` do under print emulation in Chromium, Firefox, and WebKit, how they combine with the breakpoint and orientation classes the spec already binds, and what server HTML carries. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.
