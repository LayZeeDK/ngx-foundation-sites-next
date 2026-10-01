# 198. Prototype: what the candidates cost in development, under CSP, with several applications, and at unload

Type: prototype
Status: claimed
Blocked by: 192
Labels: wayfinder:prototype
Map: ../map.md

## Question

The leading candidates are:

- 184's carriers, with 188's owned `<style>`;
- 189's `<link>` loader;
- proposal A of [Consult: new approaches to loading family styles](192-consult-fable-style-loading.md), CSS in the directive's chunk.

What do they cost in the places no ticket has measured? Those places are `ng serve` and HMR, a strict Content Security Policy, several Angular applications on one page, and the unload machinery itself: the `MutationObserver` on `document`, the hold scan for server-rendered instances, and the handling of inlined critical CSS.

## User instruction, 2026-10-01

> 18. Measure this unless you have already done so.

## How to work it

Use copies of the 188, 189, and 192 workspaces under `D:/tmp/nfs-proto-198-*`. Never follow or delete through the junction in 192's copy. Measure in Chromium, Firefox, and WebKit unless noted:

1. Dev server: cold start, rebuild after a Foundation settings edit and after a component edit, and whether the change shows without a full reload (HMR). Use Chromium only if the other engines add nothing.
2. CSP: a strict policy with a nonce (`ngCspNonce` or `CSP_NONCE`) and no `unsafe-inline`. Does each candidate's `<style>` or `<link>` load, on the server and the client? Also test `require-trusted-types-for 'script'` where the engines support it.
3. Several applications on one page: two Angular applications bootstrapped on one document, sharing and not sharing a family. Count the styles, check whether unloading one application removes styles the other uses, and check what each engine's state shows.
4. Unload machinery cost: on a page with 1,000 and 5,000 directive hosts, measure insert and remove time, style recalculation, `MutationObserver` callback time, memory, and long tasks, against a baseline with no loader.

Capture the decisive files under `prototypes/candidate-costs/`, and append an `## Answer` with one table per point. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
