# 04. Research: Yeti's styling model, and loading component styles lazily

Type: research
Status: open
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

How is Yeti's CSS built and packaged, and how could an Angular package load each component's styles lazily and unload them? The package would need to meet what the old map's lazy-styles work required. In that work, the loading unit was the CSS of one Foundation export mixin, and the requirements were:

- server HTML and hydration with no unstyled frame;
- `@defer`;
- unloading after leave animations;
- enter animations that play;
- cache busting;
- no consumer code.

## How to work it

Use a `/research` subagent against `d:/projects/github/foundation/yeti` (`src/layers.css`, `src/yeti.css`, `src/tokens/`, `src/themes/`, `src/components/*/`, `bin/`, and `package.json` `exports`, with `./css/*` per file). Cover:

1. Per-component files: their layers, their dependencies on base, tokens, and other components, and whether each loads alone. Check that by loading each `dist/css/*` file with only the base and tokens in Chromium, Firefox, and WebKit.
2. Theming: tokens, themes, `light-dark()`, and how a consumer customises them, so that the consumer's settings no longer depend on a compile step.
3. The old map's measured mechanisms, against Yeti's plain CSS. The evidence is in `.scratch/next-foundation-specs/`:
   - the research and prototypes of tickets 182 to 198;
   - the Answers in `issues/18*.md` and `issues/19*.md`;
   - `research/style-loading-consult.md`.
   Then which constraints disappear for Yeti (the consumer's Sass settings, compile steps, Beasties' copy) and which remain (Angular's leave-animation guard, angular/angular#66244).
4. Candidates for Yeti with what each needs from the consumer, including the library's own `styleUrl` with no consumer build, which Foundation 6.9's Sass ruled out.

Write `research/yeti-styles-and-lazy-loading.md`, and append an `## Answer`. Decide nothing; [Decide: how component styles load and unload](13-decide-style-loading.md) chooses.
