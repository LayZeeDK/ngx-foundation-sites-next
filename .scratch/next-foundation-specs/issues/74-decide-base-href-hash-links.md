# 74. Decide: `#`-only links that `<base href>` resolves to another document

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

In an Angular application with `<base href="/">`, a bare `href="#section"` on any route other than the root resolves to `/#section`, a different document, so the browser treats it as a cross-document navigation (confirmed by the [Prototype: Smooth Scroll under Router scroll restoration and replay](62-prototype-smooth-scroll-router-restoration.md)). The [Spec: Smooth Scroll](29-spec-smooth-scroll.md) treats a `#`-only `href` as in-page after hydration (Foundation's `a[href^="#"]`), with a development warning, and left it OPEN FOR HUMAN in the trap quadrant; the [Spec: Magellan](30-spec-magellan.md) inherits it. The alternative is to handle only links the browser itself treats as same-document (the resolved URL equals the document URL apart from the fragment), leaving bare `#` links to the browser, and to document the base-href-safe `href` recipe.

Decide it with the panel the map's "Open-decision pass" note prescribes: an evidence dossier, four panelists (Opus and Fable, two adversarial), and a judge. The decision must say exactly what the Smooth Scroll and Magellan specs, ADR 0017 (by a dated pointer or a new ADR), building-blocks, and the README open list change to.

## How to work it

The orchestrator runs the panel. The evidence dossier goes to `research/decision-base-href-hash-links.md`: the HTML standard's URL resolution against `<base>` and the "navigate to a fragment" rule; Angular's guidance on `<base href>`, `RouterLink` with `fragment`, `anchorScrolling`, and `withInMemoryScrolling`; how Angular apps in practice write in-page links (angular.dev's own markup, Angular Material docs, community guidance), and how often a bare `#id` appears in Angular templates; what happens before hydration and with JavaScript disabled for each option (a pre-hydration click is a native navigation either way); Foundation 6.9's Smooth Scroll and Magellan selectors; the prototype's measured behaviour; and the accessibility and progressive-enhancement consequences (focus, history entries, reloads). The judge writes the `## Answer` here.
