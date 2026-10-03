# 37. Prototype: consumer `@boundary` and `@error` blocks around ngx-yeti, under SSR

Type: prototype
Status: claimed
Blocked by: 36
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Research: what `@boundary` and `@error` could add to ngx-yeti](36-research-boundary-and-error-blocks.md) read that a consumer can wrap the package's directives in a `@boundary`, with no package change. It left these open, either unmeasured or only inferred:

1. With SSR, does the server-fallback path log a hydration warning or an `NG05xx` error in a development build? Does it meet the hydration constraints (map, Standing rulings)?
2. Counted style links ([ADR 0060](../adr/0060-item-styles-are-counted-links-to-the-consumers-yeti-build.md)):
   - when the fallback replaces content on the server or the client, are the item's links released, kept, or left behind;
   - after `$reset()`, does an item paint unstyled, and for how many frames;
   - does a fallback rendered on the server leave stray links?
3. Generated ids ([ADR 0044](../adr/0044-generated-ids-count-per-application-and-are-adopted-at-hydration.md)): what does `$reset()` and a server-side swap do to ids and references, and to the `TransferState` seed?
4. A boundary inside and around `@defer (hydrate on ...)` and `hydrate never`, event replay of a click made before hydration, `withI18nSupport()`, and zoneless change detection.
5. The JavaScript-off guarantee ([ADR 0011](../adr/0011-rendering-modes-contract-for-yeti.md)): with SSR and with prerendering, what does the page show with JavaScript off when the server rendered the fallback?
6. Which errors from the package's own directives a boundary catches, in the constructor, host bindings, and effects, and which it misses, in listeners and render callbacks.

So what does a consumer need to know? Which of it belongs in the `setup` spec or in item specs, and does any of it require a package change?

## User instruction, 2026-10-03

The user's own message, verbatim:

> #57 Consider how `@boundary` and `@error` affect consumers using ngx-yeti, especially in SSR scenarios, run the suggested probe(s).

## How to work it

One prototype in the workspace of [Decide: how component styles load and unload](13-decide-style-loading.md) (it has ADR 0060's counted links) or a ticket 29 workspace. Add sketches of the package's directives for one styled item and the ADR 0044 id helper. Use development and production builds, SSR and prerendering, in Chromium, Firefox, and WebKit. Write `prototypes/consumer-boundaries/README.md`; the orchestrator appends the `## Answer`. Decide nothing.
