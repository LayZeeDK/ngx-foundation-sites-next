---
status: accepted
---

# Every directive and component meets WCAG 2.2 AA, enforced by the story gate and the library's Sass

The user requires WCAG 2.2 AA compliance for every directive and component (map, Standing preferences, restated 2026-09-26). The first specs and prototypes found that Foundation's own defaults fail several 2.2 AA criteria: the slider fill against its track is about 1.3:1 (1.4.11), the 22.4 px slider thumb and the 20 by 16 px title-bar hamburger are under the 24 px target size (2.5.8), the default error colour is 4.49:1 and the selected tab about 3.76:1 (axe reports 3.75) (1.4.3), and a sticky bar can cover the focused element (2.4.11). We decided that WCAG 2.2 AA is a requirement in every spec, never a recommendation: each spec carries a criteria subsection that names the criteria its plugin touches and how each is met; where a Foundation default fails, the spec states the Sass settings the consumer must set or the smallest custom rule the library's `nfs-<plugin>` mixin adds, with the reason Foundation cannot supply it; every axe run names the six tags of the rule set in ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) and the story gate with `parameters.a11y.test = 'error'` is the enforcing check in CI; and where axe has no rule for a criterion (non-text contrast), the mixin checks it at compile time with the unrounded ratio from Foundation's `color-luminance()` and the WCAG contrast formula, never Foundation's `color-contrast()`, which rounds to one decimal (building-blocks 1.10).

## Considered options

- Recommending fixes for failing Foundation defaults and letting consumers opt in: rejected because the library would ship stories and defaults that fail the gate, and a consumer on Foundation's defaults would inherit the failure without a signal.
- Documented per-story exceptions to the axe gate: rejected for compliance failures; an exception exists only for a story that demonstrates a documented anti-pattern, as the Storybook conventions define.
- Runtime dev-mode contrast checks in the directives: rejected as the primary check because computed colours vary by theme and page; the Sass compile has the settings in hand and fails early.

## Consequences

- A consumer who keeps a failing Foundation default (for example the slider fill colours) gets a compile error or warning from the library's mixin that names the setting to change.
- The consistency review checks that every spec carries the criteria subsection and that its Sass subsection names the settings it requires.
- 2026-09-26 (consistency review): checked; all 26 specs carry the criteria subsection and name the settings they require. The Abide spec had no Library mixin, so its placeholder and border settings, which axe does not check, reached consumers without the compile-time signal the first consequence promises; it now has a checks-only `nfs-abide` mixin that emits no CSS ([Consistency review and bundle index](../issues/36-consistency-review.md)).
- Assistive-technology checks the sources cannot replace (screen-reader announcement of `aria-valuetext`, Chromium's orientation announcement for rotated range inputs) stay `OPEN FOR HUMAN` by kind.
- 2026-09-27 (open-decision pass): Chromium's orientation announcement for rotated range inputs is decided from the engines' accessibility trees and published support data by [Decide: Slider vertical orientation](../issues/73-decide-slider-vertical-orientation.md): rotated native inputs with `aria-orientation="vertical"` meet WCAG 2.2 AA (orientation is not a name, role, or user-set value) and stay until vertical form controls are in the Browser target; it is no longer `OPEN FOR HUMAN`.
