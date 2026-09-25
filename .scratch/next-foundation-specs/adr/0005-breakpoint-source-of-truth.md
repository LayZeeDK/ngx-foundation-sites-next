---
status: accepted
---

# Breakpoints come from a TypeScript token mirroring Foundation's Sass map, read through a signal service over CDK `MediaMatcher`, with a server default

Foundation's JavaScript learns its breakpoints by reading a serialized Sass map out of the computed `font-family` of a `<meta class="foundation-mq">` (`research/foundation-utilities-conventions.md` 3), which needs a rendered stylesheet and a browser, so it cannot work during server rendering or prerendering. We decided that `nfsBreakpointsToken` (root factory with Foundation's defaults: small 0, medium 640, large 1024, xlarge 1200, xxlarge 1440 px, plus `serverBreakpoint: 'small'`) is the source of truth for JavaScript; the library Sass emits the same values as `--nfs-breakpoint-*` custom properties and a dev-mode check warns on drift; the `NfsMediaQuery` service wraps CDK `MediaMatcher` (SSR-safe stub) and exposes Foundation's `atLeast`/`upTo`/`only`/`is`/`current` API as signals plus `reducedMotion()`; and every breakpoint-gated directive renders the server breakpoint's mode on the server and states its post-hydration swap.

## Considered options

- Keep the `meta.foundation-mq` handshake: rejected, no computed style on the server, and it forces `foundation-global-styles` to be compiled.
- CDK `BreakpointObserver` with Material's `Breakpoints`: rejected; the constants are Material's values and the Observable API would need `toSignal` everywhere (`research/angular-cdk-inventory.md` layout).
- Reading breakpoints from CSS custom properties only: rejected as the primary source because it also needs a browser; kept as the verification channel.
- Container queries as the breakpoint mechanism: rejected for options because Foundation documents them as viewport breakpoints; allowed inside library CSS for component-internal sizing.

## Consequences

- Consumers who change `$breakpoints` must provide the token; the dev-mode check catches the mismatch.
- Server HTML is deterministic at `small`; consumers may set `serverBreakpoint` per request from client hints through a `useFactory` provider reading `REQUEST` (null when prerendering); the Breakpoint service spec documents it. CDK `MediaMatcher` answers `false` to every query on the server, so the service owns its server answer rather than delegating it.
- ResponsiveMenu, ResponsiveToggle, ResponsiveAccordionTabs, Sticky, Equalizer, Interchange, OffCanvas reveal, and Tooltip `showOn` all state their swap and focus rule.
