# 195. Prototype: PostCSS integration and the static and setting-dependent split in a real Angular build

Type: prototype
Status: claimed
Blocked by: 191
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Research: splitting Foundation's family CSS into structure and theme](191-research-structure-theme-split.md) proposed a split by compile diffing. The library ships the declarations that no setting changes, and a PostCSS plugin removes them from the consumer's compile. It was measured in Node only, and its cascade was checked for two families in Chromium. Does it work in a real Angular 22.2 build? What else could a PostCSS integration do for loading family styles? And can a consumer keep Tailwind with a `postcss.config.json`?

## User questions and instructions, 2026-10-01

> 11. A PostCSS integration, is that an option we have explored?
> 12. What about a split between static styles and styles that depend on SCSS variables?
> 15. If we could add or reference a recipe/generator for adding Tailwind support to the PostCSS config equivalent to Angular's automatic Tailwind setup, that would be acceptable.
> 16. Verify this unless you have already done so.

Item 16 refers to 191's open points: "the plugin hasn't run in a real Angular build, and the cascade order was checked for Button and Dropdown Menu in Chromium only." Item 12 is the split 191 measured: "static" is 191's invariant part.

## How to work it

Work in a copy of a prior workspace under `D:/tmp/nfs-proto-195`.

1. Run 191's filter as a PostCSS plugin through `postcss.config.json` in production, SSR, and `ng serve` builds. Measure the output size, the computed styles against Foundation's single compile for every first-milestone family in Chromium, Firefox, and WebKit (not two families in one engine), and the cascade order with the static part loaded as a library-owned `<style>`.
2. Survey other PostCSS roles for this question, with sources: splitting a family's CSS by layer, writing a manifest the library reads, or rewriting URLs and hashes for the `<link>` loader. Build any that is cheap.
3. Tailwind: what `@angular/build` 22.2.0 does when a Tailwind config exists and no PostCSS config does (`src/utils/postcss-configuration.js` and its caller), and a `postcss.config.json` recipe or generator that restores that setup beside the filter. Verify it with a Tailwind v4 class in the same build.

Capture the decisive files under `prototypes/postcss-split/`, and append an `## Answer`. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
