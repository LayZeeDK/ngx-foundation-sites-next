---
status: accepted
---

# The library follows the Angular devkit's version scheme, and a visible platform upgrade or a removal waits for Angular's next major

No record covered how the library versions its releases or retires a public API, so the [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md) ticket left its release policy provisional and asked the user. On 2026-09-28 the user chose to track Angular's major, then refined the choice the same day: follow the version scheme of the `@angular-devkit` packages that stay below 1.0 (for example `@angular-devkit/architect` and `@angular-devkit/build-webpack`, released as `0.2202.0` on 2026-09-23, the day of Angular CLI 22.2.0, and `0.2201.0` with 22.1.0), and write migrations as Nx migrations first.

- Version: `0.<Angular major><Angular minor, two digits>.<patch>`. The middle number names the Angular minor a release is built and tested against (`0.2202.x` for Angular 22.2); the patch counts the library's own releases on that minor, which, unlike the devkit's, do not mirror Angular's patches. The first published release is `0.22<mm>.0` for Angular 22's current minor.
- Breaking changes, removals, and platform-feature upgrades that change what consumers see (for example a Dropdown pane moving to native popover and escaping `overflow` clipping, ADR 0002) land only when the Angular major changes (`0.22xx` to `0.23xx`), as the devkit packages break only with Angular's majors. A release for a new Angular minor carries fixes and additive API only.
- A public API is removed only after it has been deprecated for at least one Angular major: it keeps working, annotated `@deprecated` with its replacement; the changelog gives the update path; and a migration rewrites it where one can be written.
- Migrations are written as Nx migrations first (the package's `migrations.json` for `nx migrate`) and reused, partly or fully, as `ng update` migrations, as the effort's generators are wrapped as Angular CLI schematics (ADR 0040).
- `foundation-sites` stays a peer at `^6.9.0` (ADR 0012).

## Considered options

- Semver with the major tracking Angular's (`22.x` for Angular 22): the user's first choice, replaced the same day by the devkit scheme.
- A `0.22.x` prerelease with the minor carrying Angular's major, then a stable `<Angular major>.0.0`: raised by the user, then replaced by the devkit scheme.
- Independent semver with a range of supported Angular majors: breaking changes on the library's own schedule, at the cost of a compatibility table consumers must read.
- Track Angular's major but let a visible platform upgrade land in a release for an Angular minor, with a release note: upgrades reach consumers sooner, but a routine update can change what their pages look like.

## Consequences

- npm's caret treats the middle number of a `0.x` version as breaking: `^0.2202.3` accepts `0.2202.x` only. A consumer moves to `0.2203.x` deliberately, which `nx migrate` and `ng update` do when they move Angular to 22.3, running the library's migrations in the same step.
- A release declares the Angular packages as peers from the minor it names (`^22.2.0` for `0.2202.x`), so an application may take a later Angular 22 minor before the library releases for it.
- The library stays below 1.0 under this scheme; leaving it would be a new decision.
- Each spec's "when the target moves" note names upgrades that wait for the next Angular major; a spec that adopts one says which major.
- The policy starts with the first published release: a rename decided before it, such as the one [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md) may make, needs no deprecation. After it, a renamed input keeps its old name, deprecated, until the next Angular major.
