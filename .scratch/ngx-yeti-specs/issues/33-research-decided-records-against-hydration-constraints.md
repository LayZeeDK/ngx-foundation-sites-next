# 33. Research: the decided records against Angular's hydration constraints

Type: research
Status: claimed
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Angular's hydration guide sets these constraints:
- the same DOM structure on the server and the client, whitespace and comment nodes included;
- server HTML that is not altered between the server and the client;
- no direct DOM manipulation (`document` queries, `appendChild`, moving or detaching nodes, `innerHTML`);
- valid HTML structure (a `<table>` with `<tbody>`, no `<div>` in `<p>`, no nested `<a>`);
- a consistent `preserveWhitespaces`;
- no content branched on `isPlatformBrowser`;
- third-party scripts deferred until after hydration.

The guide is `adev/src/content/guide/hydration.md:97-135` and `:214-226` in `angular/angular` `5db6fc4453`. Do the decisions this map has already made comply? Check, at least:
- ADR 0060's counted `<link>` service and its adoption at hydration;
- ADR 0021's dialog;
- ADR 0023's fragment links;
- ADR 0024's carousel;
- ADR 0041's navigation close;
- ADR 0042's generated ids;
- ADR 0043's host listeners;
- ADR 0070's attribute mapping, including the unset input that removes a static attribute;
- the `demo` component's `srcdoc` iframe;
- the `table` item's markup;
- `enter`'s `data-once`, which ticket 18 measured hydration restoring;
- static attributes re-applied at hydration (ticket 18).

For each, decide whether it complies, and if not, what the record must change.

## User instruction, 2026-10-03

The user's own message, verbatim:

> 54. Make sure that we always comply with [hydration constraints](https://angular.dev/guide/hydration#constraints).

## How to work it

Use a `/research` subagent that reads the records and the prototypes' measurements. Where the existing prototypes already logged hydration errors or mismatches, cite them; otherwise mark the finding inferred. Write `research/hydration-constraints-audit.md`, one row per record, and append an `## Answer`. Records change only through the orchestrator's dated notes.
