# 79. Triage the out-of-scope Foundation components and variants

Type: grilling
Status: claimed
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The user ruled on 2026-09-27: being CSS-only must not exclude a Foundation for Sites component or variant from scope. An Angular component or directive is the Angular-native way to use a UI component in a website or web app, even when all it does is add a CSS class. Other exclusion reasons must be re-evaluated and presented to the user.

Which Foundation for Sites components and variants do the map, the specs, and the shared documents rule out of scope, and on what grounds? For each one: an exclusion that rests on being CSS-only comes back into scope by the ruling, and the triage says what it becomes (a directive or a component, in which spec). Every other reason is re-evaluated against its sources, and the item is presented to the user with a recommendation. Components the bundle never mentions count as excluded by omission.

## How to work it

1. Evidence, read-only and in parallel: every exclusion in the bundle, with its location and stated reason (`research/out-of-scope-exclusions.md`); Foundation 6.9's component and variant catalogue from the local clone's docs and Sass, with the bundle's coverage of each item (`research/foundation-component-catalogue.md`).
2. Triage: the CSS-only exclusions come back into scope; lens agents re-evaluate every other reason, at least one of them adversarial, and a judge weighs their arguments and records dissent.
3. Present the triage to the user: the decisions it needs from them, each with a recommendation. After their answers, record the result here, update the map's Destination and Out of scope, and graduate the new spec tickets.
