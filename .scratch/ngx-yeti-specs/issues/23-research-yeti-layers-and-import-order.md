# 23. Research: Yeti's cascade layers and stylesheet order, for lazy loading

Type: research
Status: claimed
Blocked by: 04
Labels: wayfinder:research
Map: ../map.md

## Question

What do Yeti's documentation and CSS say about cascade layers and the order in which its stylesheets are imported (`src/layers.css`, the always-loaded group, and the per-part files)? And how can the package keep that order while it loads and unloads component styles lazily?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 33. Be careful to read Yeti's documentation on layers and ordering of imported styleshets and design how it can best be adopted in ngx-yeti with lazy loading/unloading of component styles.

## How to work it

Use a `/research` subagent, starting from [Research: Yeti's styling model, and loading component styles lazily](04-research-yeti-styles-and-lazy-loading.md). Sources:

- `d:/projects/github/foundation/yeti` at `f52d1e8b9`: `src/layers.css`, `src/yeti.css`, `src/guides/install.md` and its sections on order, `src/guides/components.md`, `theming.md`, and each part file's `@layer`;
- the CSS Cascade 5 spec.

Cover, citing `file:line`:

1. Yeti's layer names and order, and which file declares them.
2. Which layer each file writes to, and what the documented import order is.
3. What happens when a part file arrives after the page has rendered, or before its layer is declared.
4. Where a consumer's own unlayered CSS and themes sit.
5. The rules that cross files, which ticket 04 found (the spinner's busy ring, the table of contents' smooth scrolling).

Measure in Chromium, Firefox, and WebKit:

- each candidate insertion point for a lazily loaded part (a `<style>` appended to `<head>`, an Angular component `styleUrl`, a `<link>`), against Yeti's full stylesheet;
- an unload followed by a reload.

Then propose, as options for [Decide: how component styles load and unload](13-decide-style-loading.md), how the package declares the layer order once and loads each part into its layer.

Write `research/yeti-layers-and-import-order.md`, and append an `## Answer`. Decide nothing.
