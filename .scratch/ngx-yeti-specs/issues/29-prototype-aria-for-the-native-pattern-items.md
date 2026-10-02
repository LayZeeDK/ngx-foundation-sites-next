# 29. Prototype: Angular Aria for the four items that keep a native pattern

Type: prototype
Status: claimed
Blocked by: 25
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Decide: the building-blocks map for every ngx-yeti item](25-decide-building-blocks-map.md) keeps a native pattern for four items, although an Angular Aria pattern could fit each one:

| Item | Ticket 25's row | Aria candidate |
| --- | --- | --- |
| `accordion` | `<details>` and `<summary>`, Yeti's markup (row 21, ledger A11Y-11) | Aria Accordion (`ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`) |
| `buttons` | `role="group"`, with Aria Toolbar as the consumer's opt-in (row 27, A11Y-12) | Aria Toolbar (`ngToolbar`, `ngToolbarWidget`) |
| `nav` and `dropdown` | disclosure navigation ([ADR 0019](../adr/0019-nav-and-dropdown-are-disclosure-navigation.md), rows 32 and 34) | Aria Menu, Menubar, or Tree |
| `carousel`'s picker | fragment links ([ADR 0024](../adr/0024-carousel-slides-are-not-inert-before-live.md), row 29) | Aria Tabs |

For each item: does building it on the Aria pattern keep Yeti's styles working, unchanged and with no package CSS, and does Aria fully replace the Yeti JavaScript module that applies (`accordion` and `buttons` have none; `nav.js`, `dropdown.js`, and `carousel.js` do)? Then, what does the Aria version cost against ticket 25's row in the rendering-modes contract ([ADR 0011](../adr/0011-rendering-modes-contract-for-yeti.md): JavaScript off, before hydration, `hydrate never`) and in accessibility (axe, the APG pattern, keyboard)?

## User instruction, 2026-10-02

Asked which of the four should stay native, the user answered, verbatim:

> For each item, prototype and analyze whether using Angular Aria would keep Yeti's styles and whether it would fully replace any Yeti JavaScript where applicable.

## How to work it

Four independent prototypes, one per item, each in its own workspace under `D:/tmp/ngx-yeti-29-<item>/`. The Angular 22.2 SSR workspace of [Prototype: Yeti in Angular's rendering modes](18-prototype-yeti-rendering-modes.md) (`D:/tmp/ngx-yeti-18/ws`) is the starting point, plus `@angular/aria` at the version matching Angular 22.2. Load Yeti's CSS the way [ADR 0060](../adr/0060-item-styles-are-counted-links-to-the-consumers-yeti-build.md) does, or link Yeti's built CSS globally where the loading mechanism does not affect the answer. For each item, build both ticket 25's row and the Aria version on Yeti's markup. Then compare in Chromium, Firefox, and WebKit:

- computed styles against Yeti's own `example.html`;
- each behaviour of the Yeti module the item replaces;
- the server HTML with JavaScript off;
- axe and the keyboard against the APG pattern.

Each prototype writes `prototypes/aria-<item>/README.md`, and the orchestrator appends the `## Answer`. Decide nothing: the user decides each row from the findings.
