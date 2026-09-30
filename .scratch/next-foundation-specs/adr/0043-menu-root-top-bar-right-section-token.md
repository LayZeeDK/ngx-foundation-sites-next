---
status: accepted
---

# A menu root learns it sits in a Top Bar's right-hand section through dependency injection, and from the DOM only when projection hides it

Foundation's Dropdown Menu opens its submenus to the left when its root sits inside `.top-bar-right`, which Foundation's JavaScript reads from the DOM; the published Dropdown Menu spec read the same ancestry in the first render callback, so the server HTML carried the wrong side and the side changed at hydration, with a development warning in every such layout. Under the class rule ([ADR 0039](0039-directives-manage-every-foundation-class.md)) the right-hand section is always the `nfsTopBarRight` directive, which dependency injection can find on the server. We decided that `NfsTopBarRight` provides the lightweight `nfsTopBarRightToken`, that the Nested menu root injects it optionally at construction and gives `opens-left` for `alignment: 'auto'` when it is present, so the side is in the server HTML and hydration changes nothing, and that only when no token is found does the root walk the DOM once after hydration, because DI follows the declaration site and misses a menu projected into the section from another template ([Spec: Top Bar](../issues/86-spec-top-bar.md); [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md), measured with Angular 22.2.0 under hydration in three engines).

## Considered options

- The DOM walk alone (the published Dropdown Menu spec's D9 and the Nested menu re-run's D33): it sees a projected menu, but the server HTML is wrong in every Top Bar layout, and the common case needs a warning and a redundant `alignment="right"`.
- The token alone (the Top Bar spec's first proposal): right in the server HTML wherever the menu is declared inside the section, but a projected menu keeps the wrong preferred side in production, with only a development warning.
- Injecting `NfsTopBarRight` by class: every menu bundle would keep the Top Bar's directive class.

## Consequences

- The walk runs only when the token is absent and can only add the section, so the two never disagree; a template declared inside the section and rendered elsewhere keeps the token's answer.
- A projected menu's closed submenus change side at hydration; the menu root warns in development builds, naming `alignment="right"`, which puts the side in the server HTML.
- A root that is itself the right-hand section counts as inside it, where Foundation's `parents()` skipped the root.
- The Nested menu entry point imports the token from the top-bar entry point, as the Openables import `nfsOpenableToken` from the Triggers entry point.
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the menu root's development warning for a menu projected into the right-hand section (the second consequence) is planned for a later milestone ([Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md)); in the first milestone the side still changes at hydration with no report, and `alignment="right"` is the documented fix.
