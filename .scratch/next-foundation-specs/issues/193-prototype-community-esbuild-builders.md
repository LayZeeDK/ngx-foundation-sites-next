# 193. Prototype: esbuild plugins on Angular CLI through community builders

Type: prototype
Status: claimed
Blocked by: 192
Labels: wayfinder:prototype
Map: ../map.md

## Question

Can a plain Angular CLI workspace, without Nx's executor, run the library's esbuild plugin from proposal A of [Consult: new approaches to loading family styles](192-consult-fable-style-loading.md) through a community builder? Candidates: `@angular-builders/custom-esbuild`, `@analogjs/vite-plugin-angular`, and any other the research finds. And what extension point does each use: `buildApplication`'s `extensions`, which Angular marks as not supported, or something else?

## User question, 2026-10-01

> 9. Is there not a community plugin Angular CLI builder that supports ESBuild plugins, for example `@angular-builders/custom-esbuild` or `@analogjs/vite-plugin-angular`?

## How to work it

For each builder, record with sources:

- its version and maintenance status, and whether it supports Angular 22.2;
- how it passes plugins, with `file:line` in the installed package;
- `ng build`, `ng serve`, SSR, and prerendering support.

Then build proposal A with the strongest one in a fresh Angular CLI 22.2 workspace under `D:/tmp/nfs-proto-193`, and rerun 192's client-only `@defer` and 188's L1-L3 leave scenarios in Chromium, Firefox, and WebKit against a production SSR build. Capture the decisive files under `prototypes/community-esbuild-builders/`, and append an `## Answer`. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
