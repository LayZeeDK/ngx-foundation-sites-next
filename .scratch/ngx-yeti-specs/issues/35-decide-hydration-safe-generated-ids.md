# 35. Decide: hydration-safe generated ids

Type: grilling
Status: claimed
Blocked by: 33, 34
Labels: wayfinder:grilling
Map: ../map.md

## Question

[ADR 0042](../adr/0042-generated-ids-come-from-cdk-idgenerator-through-one-helper.md) takes generated ids from CDK's `_IdGenerator` through one `injectYetiId()` helper, and lets a consumer's own `id` win. [Research: the decided records against Angular's hydration constraints](33-research-decided-records-against-hydration-constraints.md) rated it at risk, on two counts:
- ticket 30 measured that Aria's generated ids change at hydration because of a random infix (`id-generator.ts:24`);
- CDK keeps its counters in module state (`id-generator.ts:18`, read), so a server process keeps counting across requests while each browser starts at 0.

The user requires compliance with the hydration constraints (map, Standing rulings, 2026-10-03). How does the package give every id it generates, and every id Aria generates inside a package directive, the same value on the server and the client? Consider:
- in a full hydration, an incremental `hydrate` block, a `hydrate never` block, an `@defer` block rendered only on the client, and a `@for` that adds items after hydration;
- with zoneless change detection;
- across concurrent SSR requests in one server process.

Candidates include:
- a per-application counter, provided in the application's injector so that it resets per request;
- ids derived from a stable key, such as the host's position or a consumer key;
- Angular's own `TransferState` or the hydration info;
- passing the package's id into Aria's `id` inputs;
- requiring consumer ids inside `hydrate` blocks.

Then what does ADR 0042 become?

## How to work it

AFK grilling under the map's AFK override, with a prototype where a candidate needs one. Use the workspaces of tickets 29 and 30 under `D:/tmp/ngx-yeti-29-*/ws` and development builds, and measure in Chromium, Firefox, and WebKit. Send two concurrent SSR requests to one server process and compare their ids. Record the decision as a dated note on ADR 0042, or as a new ADR from 0044 to 0049, plus the `## Answer` and `### Triage`. Only HIGH impact with NOT-HIGH confidence stays `OPEN FOR HUMAN`.
