# 38. Spec: Setup (shared spec)

Type: task
Status: claimed
Blocked by: 13, 25, 35
Labels: wayfinder:task
Map: ../map.md

## Question

What does a consumer write once per application to use ngx-yeti, and what does the `setup` spec say? This covers bringing a Yeti build at the pin, the `assets` entry, the global stylesheet with the cascade-layer statement and the always-loaded group, the package's accessibility stylesheet in its `ngx-yeti` layer, `provideYetiStyles()`, `provideYetiFragmentLinks()`, the hydration providers (`provideClientHydration()` with event replay, incremental hydration, and `withI18nSupport()`), the JavaScript-off guarantee under SSR and prerendering, Tailwind v4 coexistence, and the documented interactions with a consumer's `@boundary` once [Prototype: consumer `@boundary` and `@error` blocks around ngx-yeti, under SSR](37-prototype-consumer-boundaries-around-ngx-yeti.md) reports.

## How to work it

Write `specs/setup.md` with the `/to-spec` template and the map's Spec shape note, from the records only: the map's Standing rulings and Inherited preferences, the ADRs, `building-blocks.md`, `architecture-guide.md`, `ledger.md`, `upstream-bugs.md`, and `CONTEXT.md`. The spec decides nothing a record has not decided. Anything it needs and no record settles goes under the ticket's `### Open` for the orchestrator. Append an `## Answer` that links the spec.
