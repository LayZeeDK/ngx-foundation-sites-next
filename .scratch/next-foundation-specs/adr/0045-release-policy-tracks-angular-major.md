---
status: accepted
---

# The library's major version tracks Angular's, and a visible platform upgrade or a removal waits for a major

No record covered how the library versions its releases or retires a public API, so the [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md) ticket left its release policy provisional and asked the user, who chose on 2026-09-28 to track Angular's major. The library's major version follows Angular's major (`ngx-foundation-sites` 22.x supports `@angular/*` 22.x), and its Browser target moves with Angular's, as the map already records. Minor and patch releases carry fixes and additive API only. A public API is removed only after it has been deprecated for at least one major: it keeps working, annotated `@deprecated` with its replacement, the changelog gives the update path, and an `ng update` migration rewrites it where one can be written. A platform-feature upgrade that changes what consumers see (for example a Dropdown pane moving to native popover and escaping `overflow` clipping, ADR 0002) lands only in a major, announced with its spec's "when the target moves" note. `foundation-sites` stays a peer at `^6.9.0` (ADR 0012).

## Considered options

- Independent semver with a range of supported Angular majors: breaking changes on the library's own schedule and two Angular majors at once, at the cost of a compatibility table consumers must read.
- Track Angular's major but let a visible platform upgrade land in a minor with a release note: upgrades reach consumers sooner, but a minor release can change what their pages look like.

## Consequences

- A consumer upgrades the library with Angular, and `ng update` runs both packages' migrations in one step; angular/components, NG-ZORRO, and ng-primitives keep the same coupling (the ecosystem lens of [Research: directive and component architecture principles for Angular UI libraries](../issues/140-research-directive-component-architecture-principles.md)).
- Each spec's "when the target moves" note names upgrades that wait for the next major; a spec that adopts one says which major.
- The policy starts with the first published release: a rename decided before it, such as the one [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md) may make, needs no deprecation. After it, a renamed input keeps its old name, deprecated, until the next major.
- A breaking change the library itself needs waits for Angular's next major, and one that Angular forces lands in the same major, so the library has no majors of its own between Angular's.
