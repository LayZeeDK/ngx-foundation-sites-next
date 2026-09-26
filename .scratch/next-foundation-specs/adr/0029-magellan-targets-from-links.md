---
status: accepted
---

# Magellan finds its sections from its links' fragments; there is no target directive

Foundation's Magellan requires every section to carry `data-magellan-target` with the same value as its `id`, and the building-blocks sketch turned that into an `[nfsMagellanTarget]` directive registering by id with the container, in the shape of Material's `matSort` headers. But sections are siblings of the navigation, not its descendants, so DI cannot connect them; and long page content is exactly what consumers wrap in `@defer (hydrate on viewport)` or `hydrate never`, where a directive is never constructed and so could never register (building-blocks 1.11 decision 6). We decided that `NfsMagellan` has no target directive: the in-page links inside its host name the sections by fragment, the directive resolves each fragment by id (HTML's indicated part, the resolver Smooth Scroll uses) into an id-keyed map, and it re-resolves missing or disconnected sections after each application render. Because Magellan only observes sections with an `IntersectionObserver` and never writes to them, sections are tracked from their server-rendered elements before and without hydration.

## Considered options

- `[nfsMagellanTarget]` linked to the container by a typed template reference (ADR 0013's Trigger idiom): works across siblings in one template, but adds an attribute and a reference to every section, fails across component boundaries without passing the reference, and still misses sections in dehydrated blocks.
- `[nfsMagellanTarget]` registering by id in a root registry service: the id registry ADR 0013 rejected for Triggers, with the same dehydrated-block gap.
- A document-wide `MutationObserver` to find sections added later: watches every DOM change in the application; the per-render re-resolution of the few unresolved fragments costs less.

## Consequences

- Consumers write only an `id` on each section; a leftover `data-magellan-target` from Foundation markup is ignored.
- A section rendered later (plain `@defer`, `@if`) is picked up after the render that creates it; the check runs after every application render and costs one query of the host's links plus one lookup per unresolved fragment, fine for a navigation of a few dozen links. A registration directive is the upgrade if that ever shows in a profile.
- Magellan's sections are exempt from the one-hydration-boundary rule that applies to registered children; the container and its links still share one boundary.
