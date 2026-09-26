# 71. Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback

Type: prototype
Status: open
Blocked by: 23
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Responsive Menu](23-spec-responsive-menu.md) answer. That spec depends on an amendment to the [Spec: Nested menu shared utility](56-spec-nested-menu.md) recorded in [ADR 0035](../adr/0035-responsive-menu-swap-commit.md): the root keeps the mode it displays separate from the mode it is driven to, its `earlyRead` render callback reads the driven mode, `document.activeElement`, and DOM order, and its `write` callback sets the displayed mode and prunes the Open path, so a swap never renders the new mode over a submenu the swap closes; and every ResponsiveMenu instance starts from the Server breakpoint's mode. With the real Breakpoint service and the amended root hosting the three menu roots under `nfsResponsiveMenu="drilldown medium-dropdown large-accordion"`, in Chromium, Firefox, and WebKit, zoneless, on CSR, SSR, and prerendered routes:

1. Does every Mode swap (a resize across each threshold in both directions, a `rules` change, and the first-render handoff) render the new mode and the pruned Open path in the same change-detection pass, with no pass that shows the new root class over a submenu the swap closes (a `MutationObserver` record per pass)? Does focus stay on the same control in the [Prototype: Nested menu directive family with breakpoint mode switching](50-prototype-nested-menu.md) cases F1 to F4, land on the level's first control when a back button held it and the swap leaves drilldown, and stay on a toggle focused before hydration at a 1280 px viewport while the main bundle is held back? This is the case that decides a reopen.
2. Does the root's swap callback commit in the same tick when the service going live and the directive's first-render flag dirty it, so a client-rendered route paints no frame of the Server breakpoint's mode (per-frame recorder), and does a menu inside `@defer (hydrate on viewport)` hydrate as sent (`componentsSkippedHydration === 0`, the Server breakpoint's classes in the hydration frame) before it swaps?
3. Does a swap into dropdown with focus outside the menu close a submenu opened by a static `is-active`, emitting `closed` once and writing `false` back to a two-way `[(expanded)]`?

The spec assumes yes to all three. Fallbacks it names: if question 1 fails, the root records the focused control from `focusin`/`focusout` and restores it in an `afterNextRender` after the swap; if question 2 fails, each instance starts from the Breakpoint service's `current` (ADR 0014), and the spec states the deferred and client-created cases that then skip the swap rule. A failed case reopens the Responsive Menu spec (and the Nested menu amendment) with that fallback; otherwise the verdict is appended to both decision logs.

Read first: `specs/responsive-menu.md` (API, the swap, rendering modes, the fallbacks), `specs/nested-menu.md` (the root, `drive()`, the mode-swap rule, and the amendment the Responsive Menu answer proposes), `adr/0035-responsive-menu-swap-commit.md`, `adr/0014-breakpoint-service-first-render-handoff.md`, `adr/0032-responsive-accordion-tabs-instance-first-render.md`, `specs/breakpoint-service.md` (the handoff and consumer rule 1), `building-blocks.md` 1.5 (the rendered-state rule), the nested-menu prototype's answer and `prototypes/nested-menu/README.md`, and the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](67-rerun-interchange-replaced-timing.md) answer on render-hook ordering.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the nested-menu prototype's plain Angular CLI 22.2 `--ssr` workspace to `D:/tmp/nfs-proto-responsive-menu-swap/` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0), amend its root as ADR 0035 describes, and add a minimal Breakpoint service with the handoff the Breakpoint service spec defines. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in all three engines, with real viewport resizes, a held-back main bundle for the pre-hydration case, and a prerendered route.

Capture it: copy the decisive files into `prototypes/responsive-menu-swap/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, engine, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Responsive Menu and Nested menu specs (per question: confirmed, or the named fallback), `### Triage`, and anything left `OPEN FOR HUMAN`.
