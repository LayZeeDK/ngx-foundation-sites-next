# 07. Decide: which standing preferences and user rulings carry over

Type: grilling
Status: open
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

## How to work it

AFK grilling against the research tickets. Abandon what rests on Foundation 6.9's Sass, its jQuery plugins, its class contract, or its browser target, and keep what rests on Angular, accessibility, or the user's own preferences. Example: "Foundation CSS classes and state classes are the styling contract" becomes a question about Yeti's class and attribute contract.

Write the result as a table, with the record, its origin, the verdict, and the reason. Rewrite each kept or adapted item into this map's Notes, with its origin cited. The user's rulings in the old map are the user's own words; an adapted ruling says what changed and why, and never presents the adaptation as the user's words.
