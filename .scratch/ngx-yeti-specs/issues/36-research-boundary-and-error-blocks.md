# 36. Research: what `@boundary` and `@error` could add to ngx-yeti

Type: research
Status: claimed
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Angular 22.2 adds the `@boundary` and `@error` template blocks as a developer preview (angular/angular#70463; the Angular v22 announcement). What do they do?
- What do they catch: errors in rendering, change detection, effects, event handlers, or child component creation?
- What renders in their place?
- How do they interact with SSR, full and incremental hydration, event replay, `@defer`, zoneless change detection, and i18n?

Could they add value to ngx-yeti, given what this map has decided?
- Directives first (ADR 0003); the `demo` component as the only Angular component.
- The rendering-modes contract and the JavaScript-off guarantee (ADR 0011).
- The hydration-constraints ruling.
- Item styles as counted links (ADR 0060).
- Checks deferred to a later milestone (map, Milestones).

For example, could the package use them, recommend them to consumers, document them in the `setup` spec, or test against them? Or do they not apply to a library made of directives? Their developer-preview status also has to be weighed against the release policy (ADR 0017).

## User instruction, 2026-10-03

The user's own message, verbatim:

> 57. Consider whether `@boundary` + `@error` (in `@developerPreview` in Angular 22.2) could add value to ngx-yeti, see https://github.com/angular/angular/pull/70463 and https://blog.angular.dev/announcing-angular-v22-c52bb83a4664.

## How to work it

Use a `/research` subagent. Read the PR, the blog post, and the compiler and runtime source in the local clone `D:/projects/github/angular/angular` (for example `packages/compiler/src/render3/r3_boundaries.ts`). Add a small probe in a ticket 29 workspace if a claim about SSR or hydration needs one. Write `research/boundary-and-error-blocks.md`, and append an `## Answer`. Decide nothing.
