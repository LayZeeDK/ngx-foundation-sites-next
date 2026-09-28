# 144. Re-run: Typography Helpers spec for the print helper classes

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The [Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md) took `.show-for-print` and `.hide-for-print` into the Visibility Classes and left the other two classes of Foundation's `foundation-print-styles`, `.print-break-inside` and `.ir` (a class that mixin's print rule reads), out of that spec as `scope-boundary`, proposing them for the [Spec: Typography Helpers](106-spec-typography-helpers.md). How does the Typography Helpers spec take them under the class rule (ADR 0039: consumers write no Foundation or NFS class) and the Utility directive rule (ADR 0044), and what changes in its directives, types, checks, stories, and tests? If either class should stay out, say why with a category.

## How to work it

Revise `specs/typography-helpers.md` in place and append a dated `### Amendment, 2026-09-28 (print helper classes)` to the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket. Read first: the Answer of the Visibility Classes print re-run, the Typography Helpers spec and ticket, ADR 0039, ADR 0044, and Foundation's `scss/components/_visibility.scss` and `scss/typography/_print.scss`. Measure what the two classes do under print emulation in Chromium, Firefox, and WebKit. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.
