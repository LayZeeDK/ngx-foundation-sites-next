# 50. Decide: the open points of the specs

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

Every spec ticket lists, under `### Open`, the points that no record settles. Under the user's full-AFK ruling (map, Standing rulings, 2026-10-03), the orchestrator decides each one. This ticket is where those decisions are recorded, one section per batch of specs. Each decision gives its reason and the record it changes. None of them is the user's ruling.

## Decisions: the shared specs (tickets 39 to 42), 2026-10-03

Decided by the orchestrator under full AFK mode.

1. **Scoping the Aria id provider** (ticket 39, point 1, HIGH impact, inferred). `provideYetiAriaIds()` answers only the hosted Aria directive's own id prefixes (`ng-tab-`, `ng-tabpanel-`, `ng-toolbar-widget-`, and whichever others the hosting spec lists). It passes every other call to the parent `_IdGenerator`, so Material, CDK, or Aria content inside the element is not affected. Reason: directive `providers` reach the element's content, and the package must not change ids it does not own. A layer-2 test nests a Material and a CDK id consumer inside a `yetiTabPanel`. Recorded as a note on ADR 0044.
2. **The fixture app's output mode** (ticket 39, point 2). The fixture app builds with `outputMode: 'server'`, with each route marked `RenderMode.Prerender` or `RenderMode.Server`. Each spec's e2e runs against both kinds of route, with JavaScript on and off. Reason: the JavaScript-off ruling covers SSR and prerendering, and the concurrent-request id test needs a running server; one app keeps a single fixture. Recorded as a note on ADR 0014.
3. **When `opened` and `closed` fire** (ticket 40, point 2). After the transition, using the building-blocks 1.6 timer, as the glossary and building-blocks 1.4 say. Reason: a consumer that moves focus or removes content then acts on settled UI, and two records already agree. Part 2 row 31 is corrected.
4. **A package-owned fragment link's `href`** (ticket 41, point 1). The directive reads the consumer's static `href` once through `HostAttributeToken('href')` and never binds `href`. Reason: the hydration rule forbids a static attribute that a directive also binds, and this attribute is never bound, never state, and equal on server and client. This is the one documented case of a consumer's static attribute that a directive reads. Recorded as a note on ADR 0023.
5. **The other open points of tickets 39 to 42** are decided as each writer recommended, for the writer's stated reason:
   - 39: points 3 to 7;
   - 40: points 1, 3, 4, and 5;
   - 41: points 2 to 5;
   - 42: points 1 to 6.

   This includes:
   - the e2e measurements for the first-navigation skip, for bare links in dehydrated blocks, and for fragment-only navigations;
   - the usage rules: no bound `[id]`, no `ngx-yeti-` id prefix in consumer ids, no consumer `id` on Aria-hosting parts, and no `HashLocationStrategy`;
   - renaming the toc's model away from `current`;
   - the `ngx-yeti/events` type-only entry point;
   - the guide's fix: the directive whose host renders an `id` generates it.

## Answer

2026-10-03: the decisions for the shared specs (tickets 39 to 42) are applied. Files changed:

- [ADR 0044](../adr/0044-generated-ids-count-per-application-and-are-adopted-at-hydration.md), [ADR 0014](../adr/0014-testing-stack-for-yeti.md), [ADR 0023](../adr/0023-fragment-links-are-same-document-links.md): a dated note each (decisions 1, 2, 4).
- [building-blocks.md](../building-blocks.md) Part 2 row 31: `opened` and `closed` fire after the transition (decision 3).
- [architecture-guide.md](../architecture-guide.md): the nav example; the directive whose host renders an `id` calls `injectYetiId`.
- [specs/generated-ids.md](../specs/generated-ids.md), [specs/events.md](../specs/events.md), [specs/fragment-links.md](../specs/fragment-links.md), [specs/navigation-close.md](../specs/navigation-close.md): every "(open: see ticket)" mark replaced by the decision.
- Tickets [39](39-spec-generated-ids.md), [40](40-spec-events.md), [41](41-spec-fragment-links.md), [42](42-spec-navigation-close.md): each open point marked decided.
- [ledger.md](../ledger.md) row A11Y-15: "Tested by" is L1 to L4, with the note that CDK's `closeOnNavigation` reacts only to `popstate`.
