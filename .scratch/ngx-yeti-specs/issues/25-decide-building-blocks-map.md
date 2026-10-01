# 25. Decide: the building-blocks map for every ngx-yeti item

Type: grilling
Status: open
Blocked by: 06, 07, 09, 11, 16, 17, 18, 19, 20, 23
Labels: wayfinder:grilling
Map: ../map.md

## Question

For every item the spec list keeps, which primitive is each directive or component built on? The candidates are the native platform, `@angular/aria`, `@angular/cdk`, Angular Material as a pattern source, or custom Angular. Which of Yeti's JavaScript modules does each replace or keep? And what goes into the ledger of features the package adds that Yeti lacks? The old map's [Building-blocks map and cross-cutting architecture decisions](../../next-foundation-specs/issues/14-building-blocks-map.md) and its `building-blocks.md` are the model for the shape of the answer, as evidence only.

## User instructions, 2026-10-01

The user's own messages to the orchestrator, verbatim:

> 36. Every accessibility/browser spec feature (including WHATWG, WAI-ARIA, WCAG, ARIA APG, and so on) added that isn't supported by Yeti itself must be documented in a ledger or something like that, for example to keep track of which accessibilty checks that is compliant because of ngx-yeti, not because of Yeti itself. The same goes for features added inspired by or for feature parity/overlap with Angular Aria/CDK/Material.
>
> 37. Make sure we utilize Angular Aria and CDK where possible to replace Yeti's JavaScript modules and comply with accessibility standards and best practices.
>
> 38. Make a building blocks audit for every component going into ngx-yeti like we did for Foundation for Sites v6.9 components going into ngx-foundation-sites.

## How to work it

AFK grilling, with `/domain-modeling`, against these inputs:

- the research and prototype tickets this one is blocked by;
- [Research: Yeti against WHATWG, WAI-ARIA, the APG, and Angular Aria, CDK, and Material patterns](17-research-yeti-accessibility-and-standards.md), for each deviation and the building block that fills it;
- [Research: Yeti's JavaScript modules and what Angular adds](03-research-yeti-javascript-and-angular.md);
- [Prototype: Yeti's modules in a single-page Angular app](20-prototype-yeti-in-single-page-apps.md), which found that the modules must be replaced, not loaded;
- the user's ruling that a component with `styleUrl` may replace a directive where lazy styles need it.

Write `building-blocks.md`. It has one row per item:

- the primitive;
- the Yeti module it replaces or keeps;
- the Aria or CDK building block, with its `file:line`;
- the reason for the implementation level;
- the cross-cutting rules.

Also write `ledger.md`. It has one row per feature the package adds that Yeti does not provide:

- the standard or source (WHATWG, WAI-ARIA, WCAG 2.2 criterion, APG pattern, or Angular Aria, CDK, or Material parity);
- the Yeti item;
- what Yeti does;
- what the package adds;
- how it is tested;
- the spec that owns it.

Every spec later adds its rows. Record ADRs for cross-cutting calls. Where Aria or CDK is available but not used, the row says why (map, Standing rulings, item 37).

This is the architecture ticket of the map, so it runs on `fable-high`, as the map's Models note allows for cross-cutting decisions.
