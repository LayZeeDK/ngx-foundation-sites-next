# 07. Decide: which standing preferences and user rulings carry over

Type: grilling
Status: claimed
Blocked by: 01, 02, 03
Labels: wayfinder:grilling
Map: ../map.md

## Question

For each standing preference and user ruling in `.scratch/next-foundation-specs/map.md` (Notes: Standing preferences, Design criteria, Spec shape, the out-of-scope triage, the architecture guide note, and the rulings recorded in its tickets), decide whether it is carried over, adapted, or abandoned for Yeti, with the reason. Examples:

- directive over component;
- composition over subclassing;
- the implementation order;
- input naming from `data-*` options;
- signals and OnPush;
- WCAG 2.2 AA with the APG;
- `animate.enter` and `animate.leave`;
- rendering modes;
- testing layers;
- the release policy;
- the milestones;
- the class rule;
- one spec per docs page.

Added 2026-10-01. The user's own message to the orchestrator, verbatim: "21. What about adding CSS classes or setting CSS Custom Properties?" This was a reply to [Research: Yeti's JavaScript modules and what Angular adds](03-research-yeti-javascript-and-angular.md), which found that a wrapper adds only types for most items. The decision covers it as two parts of the class rule's successor:

- whether the package's directives set Yeti's classes, data attributes, and markers from typed inputs, so that the consumer writes none (the old map's ADR 0039 did this for Foundation's classes);
- whether, and how, typed inputs or providers set Yeti's public `--yeti-*` tokens as custom properties, for example per instance through host style bindings or per application through a provider.

The decision also applies the user's ruling that a component with `styleUrl` may replace a directive where that makes lazy styles meet the requirements (map, Standing rulings).

## How to work it

AFK grilling against the research tickets. Abandon what rests on Foundation 6.9's Sass, its jQuery plugins, its class contract, or its browser target, and keep what rests on Angular, accessibility, or the user's own preferences. Example: "Foundation CSS classes and state classes are the styling contract" becomes a question about Yeti's class and attribute contract.

Write the result as a table, with the record, its origin, the verdict, and the reason. Rewrite each kept or adapted item into this map's Notes, with its origin cited. The user's rulings in the old map are the user's own words; an adapted ruling says what changed and why, and never presents the adaptation as the user's words.
