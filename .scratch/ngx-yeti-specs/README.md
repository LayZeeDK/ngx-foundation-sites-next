# ngx-yeti specs

This bundle holds the specs for `ngx-yeti`, a new Angular package that wraps Yeti, Foundation's version 7 (`yeti-css`): one spec for each of the 49 items in Yeti's manifest, and five shared specs. Beside them are a building-blocks map, recording which Angular, CDK, Aria, or native platform primitive each item is built on, and a ledger of every standards, accessibility, and Angular Aria, CDK, or Material feature the package adds that Yeti itself lacks.

## How to read it

1. **[map.md](map.md)** first. Its Destination and Notes give the scope, the target platform, and the user's standing rulings, quoted verbatim. Its Decisions so far list each resolved ticket with a one-line gist and a link.
2. **The records** next. Each decision lives in one place: its ticket under [issues/](issues/), its ADR under [adr/](adr/), or the cross-cutting documents below. A spec cites the records it depends on in its Deciding records line.
3. **The specs** last, under [specs/](specs/). Each is a `/to-spec` spec: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, and Further Notes.

## Cross-cutting documents

| Document | What it holds |
| --- | --- |
| [building-blocks.md](building-blocks.md) | Part 1, the cross-cutting rules; Part 2, one row per spec with its Angular shape and primitive; the Aria decisions of 2026-10-03 |
| [ledger.md](ledger.md) | Every accessibility and standards gap the package closes that Yeti leaves open, and every Aria, CDK, or Material feature it adds |
| [upstream-bugs.md](upstream-bugs.md) | Bugs found in Yeti, Angular, and other upstreams, with whether each is verified and has a minimal reproduction |
| [architecture-guide.md](architecture-guide.md) | The records restated as testable principles; ranks below every record |
| [CONTEXT.md](CONTEXT.md) | The glossary |
| [adr/](adr/) | The architecture decision records |
| [Decide: the open points of the specs](issues/50-decide-open-points-of-the-specs.md) | Every decision on the specs' open points |

The decisions in [Decide: the open points of the specs](issues/50-decide-open-points-of-the-specs.md) are the orchestrator's, taken under the user's full-AFK ruling (map, Standing rulings), not the user's. Each trap-quadrant decision (HIGH impact, NOT-HIGH confidence) records its options, why each was approved or dismissed, its evidence, and what an implementer would change to overrule it. [Decide: the browser provider and the floor engines for testing](issues/93-decide-testing-at-the-browser-floor.md) is one more such decision.

## The specs

### Shared (5)

| Spec | What it specifies |
| --- | --- |
| [setup](specs/setup.md) | The once-per-application setup: Yeti's build at the pin, its `assets` entry, the layer order, and the providers |
| [generated-ids](specs/generated-ids.md) | Ids that stay equal through hydration: `injectYetiId()` and `provideYetiAriaIds()` |
| [events](specs/events.md) | Each `yeti:*` event as a typed `output()` on the directive that replaces its module |
| [fragment-links](specs/fragment-links.md) | Same-document `href`s for the package's links, and in-page handling of bare `#id` links |
| [navigation-close](specs/navigation-close.md) | `injectCloseOnNavigation()`: open panels close on Router navigation |

### Utilities (7)

| Spec | What it specifies |
| --- | --- |
| [attention](specs/attention.md) | A gesture (pulse, shake) on an element that has just changed |
| [billboard](specs/billboard.md) | Display text that scales to fit its container |
| [enter](specs/enter.md) | An arrival animation when an element scrolls into view |
| [lede](specs/lede.md) | A lead paragraph |
| [lift](specs/lift.md) | A hover and focus affordance: the element rises |
| [print](specs/print.md) | Paper-only or screen-only content |
| [visually-hidden](specs/visually-hidden.md) | Text for assistive technology only |

### Layouts (17)

| Spec | What it specifies |
| --- | --- |
| [box](specs/box.md) | A padded surface, with the any-element border, paint, and text directives |
| [breakout](specs/breakout.md) | A content column whose children can break out to wider tracks |
| [center](specs/center.md) | A centred column with a maximum width |
| [cluster](specs/cluster.md) | A wrapping row of items |
| [columns](specs/columns.md) | Columns that stack below a container width |
| [container](specs/container.md) | A container-query context, with the any-element show and hide directives |
| [cover](specs/cover.md) | One thing centred in the height of the viewport, with optional content above and below |
| [frame](specs/frame.md) | A media frame cropped to an aspect ratio |
| [grid](specs/grid.md) | An auto-fitting or fixed-column grid |
| [icon](specs/icon.md) | An icon aligned with its text |
| [layer](specs/layer.md) | Children stacked in one grid cell |
| [masonry](specs/masonry.md) | A masonry layout with a column-first fallback |
| [overlay](specs/overlay.md) | Content held over a background child |
| [scroller](specs/scroller.md) | A focusable, named, horizontal scroll region |
| [sidebar](specs/sidebar.md) | A sidebar beside main content that wraps below a width |
| [stack](specs/stack.md) | A vertical flow with even spacing |
| [timeline](specs/timeline.md) | An ordered list drawn as a timeline |

### Recipes (3)

| Spec | What it specifies |
| --- | --- |
| [hero](specs/hero.md) | A hero section with text beside or over media |
| [media](specs/media.md) | A figure beside its body text |
| [shell](specs/shell.md) | The application shell: header, navigation, main, and aside regions |

### Components (22)

| Spec | What it specifies |
| --- | --- |
| [accordion](specs/accordion.md) | Disclosure sections on native `details` and `summary` |
| [affix](specs/affix.md) | A control joined to a unit, a symbol, a button, or another control |
| [alert](specs/alert.md) | A dismissible message with a `closed` output |
| [badge](specs/badge.md) | A small status label |
| [breadcrumbs](specs/breadcrumbs.md) | A breadcrumb trail in a `nav` |
| [button](specs/button.md) | Buttons and button-styled links, inputs, and labels |
| [buttons](specs/buttons.md) | A group of buttons as an Aria toolbar |
| [card](specs/card.md) | A bordered surface with an optional stretched link |
| [carousel](specs/carousel.md) | A scroll-snap carousel with link dots and previous and next buttons |
| [demo](specs/demo.md) | An example preview in a sandboxed frame with its code (the only Angular component) |
| [dialog](specs/dialog.md) | A modal on native `dialog`, opened by invoker commands |
| [dropdown](specs/dropdown.md) | A disclosure panel on `popover` |
| [field](specs/field.md) | A form field with hint, error, and validation over Angular forms |
| [nav](specs/nav.md) | A site navigation bar that collapses into a disclosure panel |
| [pagination](specs/pagination.md) | Page links in a `nav` |
| [progress](specs/progress.md) | A progress bar, or a scroll progress indicator |
| [seam](specs/seam.md) | A shaped edge between sections |
| [spinner](specs/spinner.md) | A loading indicator |
| [table](specs/table.md) | A styled data table |
| [tabs](specs/tabs.md) | Tabs on Aria's Tabs; every panel shows with JavaScript off |
| [toc](specs/toc.md) | A table of contents that marks the current section |
| [tooltip](specs/tooltip.md) | A CSS tooltip with Escape to dismiss |
