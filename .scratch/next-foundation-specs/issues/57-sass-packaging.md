# 57. Sass packaging for the new library

Type: grilling
Status: open
Blocked by: 14
Labels: wayfinder:grilling
Map: ../map.md

## Question

How does the new library ship its Sass next to the consumer's Foundation Sass: how are the per-plugin `_nfs-<plugin>.scss` partials and the `_nfs-motion.scss` keyframe classes packaged and imported, is `foundation-sites` a peer dependency and at which range, and how are `--nfs-breakpoint-*` custom properties emitted from Foundation's `$breakpoints` so the breakpoint token and the Sass stay in sync?

Read first: `building-blocks.md` (the Sass and theming decision and the animation mechanics), `adr/0003-animation-mechanics.md`, `adr/0005-breakpoint-source-of-truth.md`, `research/foundation-utilities-conventions.md` (the breakpoint handshake), and `research/tooling-baseline.md`. Check how Angular Material and CDK ship Sass in `d:/projects/github/angular/components` (package exports for `_index.scss`, `@use` entry points) for the packaging mechanics.

Ownership (per audit 0002 finding M2): this ticket owns how the library Sass emits the `--nfs-breakpoint-*` custom properties from Foundation's `$breakpoints`; the Breakpoint service spec owns the `nfsBreakpointsToken` shape and the dev-mode drift check that compares the token with those properties, and it waits on this ticket.

Run `/grill-with-docs` (self-grilling, both sides). Record the decision log under `## Answer`, write an ADR under `adr/` if the domain-modeling bar is met, and state what every plugin spec's Further Notes must say about its Sass. Runtime theming as a contract is already out of scope per the building-blocks decision.
