# Implementation Plan: Accessible Accordion Component

**Branch**: `002-accordion-component` | **Date**: 2026-01-07 (Updated: 2026-01-19) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-accordion-component/spec.md`

## Summary

Build an accessible, Angular-native accordion component that provides Foundation for Sites visual design with full WCAG AA compliance. The component must achieve **API parity with Foundation's accordion JavaScript plugin**: all Foundation JS methods (`toggle`, `down`, `up`, `destroy`) and events (`down`, `up` — emitted by Foundation as `down.zf.accordion` / `up.zf.accordion`) must be exposed as equivalent Angular methods and outputs. Implementation uses standalone components, signals, and Angular ARIA/CDK primitives without Foundation JavaScript dependencies.

## Implementation Architecture (Actual)

⚠️ **UPDATE 2026-01-09**: The actual implementation diverged from the originally planned component-based architecture to use **template-directive composition**. This architectural choice leverages `@angular/aria`'s accordion primitives more effectively. (See [quickstart.md Glossary](./quickstart.md#glossary) for definitions and architectural comparison.)

**Implemented API**:

- `<nfs-accordion>` - Container component (unchanged from plan)
- `ng-template[nfsAccordionItem]` - Item template directive (replaces `<nfs-accordion-item>` component)
- `ng-template[nfsAccordionHeader]` - Header template directive (replaces `<nfs-accordion-title>` component)
- `ng-template[nfsAccordionContent]` - Lazy content directive (unchanged from plan)

**Key Differences from Original Plan**:

1. Items are defined via `ng-template[nfsAccordionItem]` directives using **template-directive composition** pattern
2. Uses `@angular/aria`'s `AccordionGroup`, `AccordionTrigger`, `AccordionPanel` primitives
3. Container component orchestrates template instantiation via `ViewContainerRef`

### Architecture Decision Record: Template-Directive Composition

**Decision**: Use template-directive composition (`ng-template[nfsAccordionItem]`) instead of component wrappers (`<nfs-accordion-item>`)

**Context**: The original plan specified a component-based architecture with `<nfs-accordion>`, `<nfs-accordion-item>`, and `<nfs-accordion-title>` components. During implementation, we identified that this approach would require significant custom ARIA handling and state management complexity.

**Rationale**:

1. **@angular/aria Integration**: Template-directive composition allows direct use of Angular ARIA's `AccordionGroup`, `AccordionTrigger`, and `AccordionPanel` primitives, which provide battle-tested WCAG AA compliance out of the box
2. **Constitution Compliance**: Aligns with project constitution principle "Always use @angular/aria building blocks first" (Implementation Hierarchy, priority 1)
3. **Reduced Custom ARIA**: Eliminates need for manual `aria-expanded`, `aria-controls`, `aria-labelledby` management - the framework handles it
4. **Simpler State Management**: Signal-based state coordination via `@angular/aria` primitives is more robust than custom DI token patterns
5. **Performance**: `ViewContainerRef` template instantiation is more efficient than nested component trees for 100-item accordions

**Consequences**:

- **API Divergence**: Consumer-facing API differs from spec.md's documented component-based API (addressed via quickstart.md examples)
- **DX Trade-off**: Template syntax is slightly more verbose than component composition, but gains significant accessibility and maintainability benefits
- **Testing Strategy**: Storybook tests cover template-directive API; spec.md remains as architectural reference

**Implementation Scope**: All user stories (US1-US10) implemented via template-directive composition. No migration to component-based API planned.

**Known Implementation Gaps**: See **[GAPS_REMEDIATION.md](./GAPS_REMEDIATION.md)** for comprehensive tracking with evidence, fix estimates, and validation methodology. _(Last validated: 2026-01-16 via automated gap implementation)_

**P0 - BLOCKING** (32 min):

- **GAP-3**: Input naming — `multiExpandable` → should be `multiExpand` (violates FR-014, CA-007)
- **GAP-1**: Foundation API methods — `down()`, `up()`, `toggle()` not on items (violates FR-075, CA-009)
- **GAP-2**: Foundation API outputs — `(down)`, `(up)` events not on container (violates FR-076, CA-010)

**P1 - IMPORTANT** (135 min):

- **GAP-4**: `titleHeadingLevel` input not implemented (violates FR-016, FR-110a, FR-176a)
- **GAP-5**: ErrorHandler diagnostics missing for FR-017a, FR-026a, FR-067b, FR-089a, FR-110a (partial: validators.ts exists but no ErrorHandler calls)
- **GAP-6**: Storybook tests for Foundation API missing (violates T134-T139 testing requirements)

**P2 - POLISH** (15 min):

- **GAP-8**: SSR error handling missing try/catch in `afterNextRender` blocks (violates FR-062a)

**Not Gaps** (working as designed per spec):

- Animation hooks are CSS-only (Goals/Non-Goals:575-577)
- ARIA live regions are opt-in via `announce` input (AR-027a tracked as T196-T199)
- ARIA edge cases handled by @angular/aria primitives (AccordionTrigger/AccordionPanel)
- Custom content projection enforced by template-directive architecture
- Foundation CSS classes present via @angular/aria integration

**Rationale**: Template-directive composition provides better integration with `@angular/aria`'s injector patterns and avoids content projection DI issues documented in research phase.

## Technical Context

**Language/Version**: Angular 21.0.6, TypeScript 5.9.2 (ES2015 target, ESNext modules)
**Primary Dependencies**: @angular/aria 21.0.6, @angular/cdk 21.0.6, Foundation for Sites 6.9.0, RxJS 7.8.0
**Storage**: N/A (component library, no persistence layer)
**Testing**: Vitest 4.0.9 with @analogjs/vitest-angular, Playwright 1.36.0 (E2E), Storybook 10.1.10 with test-runner and axe-playwright
**Target Platform**: Modern browsers (Chromium-based tested), SSR-ready (@angular/platform-server available)
**Project Type**: Nx monorepo (v22.3.1) with Angular library package (`packages/ngx-foundation-sites/`)
**Performance Goals**: 100 accordion items max, 5s initial render, 200ms toggle responsiveness, <100ms keyboard navigation
**Constraints**: WCAG AA compliance mandatory, no Foundation JavaScript dependencies, ViewEncapsulation.None with runtime CSS loading, **Foundation JS API parity required**
**Scale/Scope**: Single-feature component library contribution (accordion + 3 structural directives), Storybook stories with interactive tests, E2E tests for History API integration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Angular-Native Components**: ✅

- [x] Component implementation uses Angular APIs only (no Foundation JS) — Uses @angular/aria primitives exclusively
- [x] Component names align with Foundation for Sites conventions — `nfs-accordion` matches Foundation's `.accordion` class
- [x] Input properties use camelCase equivalents of Foundation `data-*` attributes — `multiExpand` from `data-multi-expand` (⚠️ GAP-3: currently `multiExpandable`), `allowAllClosed` from `data-allow-all-closed`, `deepLink` from `data-deep-link`
- [x] Injection tokens follow `Token` suffix convention — `nfsAccordionToken` per spec FR-007
- [x] Directive-vs-component decision justified — Uses template-directive composition (`ng-template[nfsAccordionItem]`) for @angular/aria integration and performance; component (`<nfs-accordion>`) only for root container
- [x] API design doc created/updated using `foundation-api-design` skill — `contracts/accordion-api.ts` defines complete API surface
- [x] **Foundation JS API parity: Methods (`toggle`, `down`, `up`, `destroy`) and events (`down`, `up`) exposed as Angular methods and outputs** — ⚠️ GAP-1 (methods), GAP-2 (outputs): Tracked in P0 blockers above

**Accessibility First**: ✅

- [x] Component will pass AXE checks — Storybook a11y addon integration planned (see spec US3)
- [x] WCAG AA minimum standards addressed (focus, contrast, ARIA) — FR-042 through FR-067 define comprehensive ARIA requirements
- [x] Implementation hierarchy: @angular/aria → @angular/cdk → custom Angular — Spec explicitly chooses @angular/aria `AccordionGroup`, `AccordionTrigger`, `AccordionPanel` primitives

**Foundation CSS-Only Integration**: ✅

- [x] Foundation CSS classes applied as Foundation expects — FR-033 requires `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`, `.is-active` classes
- [x] Foundation state classes used via Angular class bindings — `.is-active` applied via `[class.is-active]="item.expanded()"`
- [x] Custom CSS limited and justified with comments — Only for button width adjustments and animation hooks (documented in research phase)

**Modern Angular APIs**: ✅

- [x] Standalone components only (no NgModules) — FR-001 specifies standalone component and structural directives
- [x] Signals for state management — FR-014 through FR-017 use signal inputs; internal state uses signals
- [x] `input()`/`output()` functions instead of decorators — All inputs use `input()`, outputs use `output()` per FR-075
- [x] Native control flow (`@if`, `@for`, `@switch`) — FR-012 requires `@if` conditional rendering for collapsed content
- [x] `ChangeDetectionStrategy.OnPush` set — Required per constitution, verified in existing components
- [x] Member visibility follows guidelines (`#`, `protected`, public) — `#` for private, `protected` for template-accessed, public for API

**Component Testing Strategy**: ✅

- [x] Storybook interactive tests planned — US1-US10 define acceptance scenarios for play functions (⚠️ GAP-6: Foundation API tests missing)
- [x] E2E tests only for web-native APIs or Sass variable verification in the test consumer app (if applicable) — US10 deep linking requires History API (E2E); Sass variable testing planned
- [x] Stories include interaction tests — Each user story maps to interactive test scenarios
- [x] Semantic locators planned for E2E tests — `getByRole('button')`, `getByTestId('accordion-header-*')` per constitution

**Nx Monorepo Organization**: ✅

- [x] Library follows Nx conventions (packages/) — Component lives in `packages/ngx-foundation-sites/src/lib/accordion/`
- [x] Selector prefix: `nfs-` (components) or `nfs` (directives) — FR-002 specifies `nfs-` prefix; directives use `nfs` attribute selector
- [x] Module boundaries respected — Accordion is self-contained feature with no cross-library dependencies
- [x] Tasks run through Nx — Build, test, lint, storybook all use `nx run` commands

## Project Structure

### Documentation (this feature)

```text
specs/002-accordion-component/
├── plan.md              # This file (updated for Foundation API parity)
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output (complete, requires update for API parity)
├── quickstart.md        # Phase 1 output (generated)
└── contracts/           # Phase 1 output (requires update for API parity)
    ├── accordion-api.ts       # TypeScript interfaces (requires Foundation API methods/events)
    └── accordion-aria.md      # ARIA requirements documentation
```

## Implementation Notes (Clarifications)

### FR-017a (panelId validation)

- Maintain a registration registry in the accordion parent: `Map<string, NfsAccordionItem[]>` mapping `panelId` -> array of registered items (in registration order). Note: `NfsAccordionItem` is the concrete component class; no separate ref type is needed. On each item registration and on `panelId` changes, validate the array length. If length > 1 (duplicate within same accordion instance), call the injected `ErrorHandler.handleError()` with a structured Error matching the format defined in FR-017a: `Duplicate panelId "${id}" detected in accordion ${accordionInstanceId || '<unnamed>'}. Conflicting items at indexes: [${indexes.join(', ')}]. Using first registered item.` Do not auto-suffix or rename developer-provided `panelId` values.

- Add unit tests that stub `ErrorHandler` to assert invocation and that verify deterministic expansion of the first-registered item.

### FR-067b / FR-067c (deep link missing-targets and multiExpand interaction)

- On initialization and on `hashchange` events: parse the current hash, lookup registered panel(s) via the parent registry (see FR-017a). If no registered panel found, call the injected `ErrorHandler.handleError()` with a `DeepLinkNotFound` diagnostic and return (no expansion). If a target exists, call the accordion's canonical expansion API (e.g., `accordion.expandById(panelId)`) so the existing `multiExpand` and `allowAllClosed` enforcement logic runs (this ensures deep-link expansion collapses other panels when `multiExpand=false`).

- Add Playwright E2E tests that: (a) navigate to page with non-existent `#id` and assert that `ErrorHandler` received a diagnostic and no panels expanded; (b) navigate from `#idA` to `#idB` with `multiExpand=false` and assert collapse/expand behavior matches user interaction semantics.

### FR-050a (softDisabled navigation semantics)

- Keyboard navigation iterator should consult a resolved `isDisabled(item)` predicate which factors both accordion-level `disabled` and item-level `disabled` plus the `softDisabled` mode. Implement navigation filtering rules as:
  - If `softDisabled === true`: keep item in tab order (don't change native tabindex), set `aria-disabled="true"`, and exclude it from arrow-key iteration (filter it out when computing next/previous indexes).
  - If `softDisabled === false`: remove from tab order (no tabindex/`disabled` attribute) and exclude from both tab and arrow-key navigation.

- Update unit tests to validate: (a) Tab focuses soft-disabled items, (b) Arrow navigation skips soft-disabled items, (c) activation on soft-disabled items is prevented, and (d) hard-disabled items are not reachable via Tab or Arrow.

### AR-027a (announce live-region opt-in)

- Provide an InputSignal `announce = input(false)` on `<nfs-accordion>` (or at `<nfs-accordion-item>` level as appropriate). When `announce` is `true`, render a single visually-hidden element with `aria-live="polite"` (e.g., `<div class="visually-hidden" aria-live="polite" aria-atomic="true">...</div>`). On expand/collapse, set the live region's textContent to a concise message (e.g., `Section "${titleText}" expanded`). Debounce updates by 100ms to prevent duplicate/rapid announcements during rapid toggles (source: spec.md AR-027a). Add unit and e2e tests that assert (when `announce=true`) the live region receives the expected message on expand/collapse, and that when `announce=false` no live region is present.

### FR-026a (missing title handling)

- If an item registers without a `nfs-accordion-title` child, the item should still register but mark itself as `noTrigger=true`. Do not include it in title-focused navigation lists. Call `ErrorHandler.handleError()` with an Error matching the format defined in FR-026a: `Missing required <nfs-accordion-title> in <nfs-accordion-item> at index ${itemIndex}. Item will render panel content but will not be keyboard accessible.` Add unit tests that render an item without title and assert no focusable title exists and ErrorHandler was called.

### FR-089a (rapid toggle serialization and debounce)

- Implement a per-item toggle queue and an input-source debounce of 50ms. Internally represent pending requests as a small FIFO per item; if a toggle arrives during an in-progress transition, enqueue it; when the transition completes, dequeue and execute the next request. For UI-sourced toggles (click/keyboard), coalesce identical repeated toggles within 50ms to a single action. Add timing-sensitive integration tests to simulate rapid user clicks and assert final state is stable and no uncaught exceptions occur.

- **Input Source Definition**: An "input source" is identified by the event type that triggered the toggle request:
  - `'click'`: Mouse click on title element
  - `'keyboard'`: Enter/Space key on title element
  - `'programmatic'`: Direct call to `toggle()`, `down()`, or `up()` methods
  - Debounce coalescing applies only within the same input source category. For example, rapid clicks coalesce together, but a click followed immediately by a programmatic call do NOT coalesce (both execute in order).

### FR-038a (explicit state transitions)

- Internally model item state as an enum: `State = 'COLLAPSED' | 'EXPANDING' | 'EXPANDED' | 'COLLAPSING'`. Expose only `expanded` boolean and events; ensure `aria-expanded` is set to `true` only when state === 'EXPANDED'. Guard concurrent operations by checking state (e.g., ignore `down()` calls if state === 'EXPANDING' and coalesce/queue per FR-089a rules).

### FR-110a (input validation)

- Implement a simple input sanitizer/validator helper at the parent level. For `titleHeadingLevel`, accept numbers 1..6; on invalid input call `ErrorHandler.handleError()` and set `titleHeadingLevel=null`. For `deepLinkSmudgeDelay` negative values, convert to absolute value and call `ErrorHandler.handleError()`; for `deepLinkSmudgeOffset` non-numeric values set `0` and call `ErrorHandler.handleError()`. Add unit tests to assert validator behavior.

### FR-062a (SSR hydration fallback)

- On client bootstrap, wrap hydration steps in a guarded try/catch and call `ErrorHandler.handleError()` on exceptions. Preserve server-rendered HTML and schedule a single rehydrate attempt using `requestIdleCallback`/`setTimeout(0)` guarded by `isPlatformBrowser()`.

### FR-106a (concurrent interactions)

- Implement event timestamp ordering at the accordion root: enqueue events as `{ ts: performance.now(), type, payload }` and process FIFO while allowing cross-item concurrency except where FR-089a serialization applies. Focus updates get priority for focus placement; expansion state resolves by event timestamp ordering.

### FR-113a (interactive title content)

- Keep the host trigger as the primary clickable element: render `button.accordion-title` as host and project consumer content inside. If projected content contains tabbable elements, ensure their tabIndex remains local and that keyboard activation of host still toggles. If detection of a focusable element that appears to replace the host trigger occurs, call `ErrorHandler.handleError()` with remediation guidance.

### FR-114a (empty content placeholder)

- Render a visually-hidden placeholder when panel inner content is empty and `announce` is `true` to aid screen readers. Provide an `emptyState` slot for consumers to project placeholder UI.

### FR-115a (dynamic title announcements)

- When `announce=true`, publish live-region messages for title changes using the same debounced live-region used for expand/collapse (AR-027a). Ensure messages are brief and rate-limited.

### FR-147a (method failure semantics)

- Implement `tryAction()` wrapper that checks preconditions and either executes action or calls `ErrorHandler.handleError()` and returns silently. Ensure public methods call `tryAction()` and that prevented actions do not emit output events.

### FR-174a (binding coercion)

- Implement binding coercion in the `expanded` model setter: if `allowAllClosed === false` and the change would close the last open item, ignore the setter and call `ErrorHandler.handleError()`; update bound value to reflect the coerced state so the consumer's model stays in sync.

### FR-176a (heading level dynamics)

- When `titleHeadingLevel` updates, perform DOM updates in a single microtask to replace wrappers and preserve focus by temporarily tracking focused item id and restoring focus to the correct button after swap.

### Source Code (repository root)

```text
packages/ngx-foundation-sites/
├── src/
│   └── lib/
│       └── accordion/
│           ├── accordion.component.ts                # NfsAccordion (container)
│           ├── accordion-item.component.ts           # NfsAccordionItem
│           ├── accordion-title.component.ts          # NfsAccordionTitle
│           ├── accordion-content.ts                  # NfsAccordionContent directive
│           ├── accordion-header-def.ts               # Template definition directive
│           ├── accordion-item-def.ts                 # Item template definition directive
│           ├── accordion.token.ts                    # nfsAccordionToken (DI)
│           ├── accordion-deep-link.service.ts        # Deep linking service
│           ├── accordion-deep-link.service.spec.ts   # Deep linking service tests
│           ├── accordion-id-generator.service.ts     # ID generation service
│           ├── accordion-id-generator.service.spec.ts # ID generator tests
│           ├── accordion.ts                          # Re-exports and interfaces
│           ├── accordion.spec.ts                     # Component tests
│           ├── accordion.stories.ts                  # Storybook stories (colocated)
│           └── index.ts                              # Public API exports
```

Note: Template-directive files use `-def` suffix per project conventions. The `.directive.ts` suffix is not used in this implementation.

**Unit Test Location** (Nx colocated convention):

```text
packages/ngx-foundation-sites/src/lib/accordion/
├── accordion.component.spec.ts        # Colocated unit tests (Vitest)
├── accordion-item.component.spec.ts
└── validators.spec.ts
```

**E2E Test Location** (Playwright for browser-specific APIs only):

```text
packages/ngx-foundation-sites-e2e/src/accordion/
└── accordion-deeplink.spec.ts         # Deep linking, History API tests
```

**Structure Decision**: Nx monorepo with library in `packages/ngx-foundation-sites/`. Accordion component is a self-contained feature module within the library. Unit tests are colocated with source files per Nx convention. Storybook stories colocated in `.storybook/stories/` for easy development. E2E tests only for browser-specific APIs (deep linking) in the separate e2e project.

## Complexity Tracking

_No violations. All constitution principles satisfied._

**Foundation API Parity Justification** (per CA-009, CA-010, FR-075, FR-076): Foundation's accordion JavaScript plugin exposes public methods (`toggle`, `down`, `up`, `destroy`) and events (`down`, `up` — emitted by Foundation as `down.zf.accordion` / `up.zf.accordion`). To ensure developers migrating from Foundation JS to ngx-foundation-sites have equivalent programmatic control, these must be exposed as:

- **Methods** (CA-009): `NfsAccordionItem.toggle()`, `NfsAccordionItem.down()` (≈ Foundation's `down`), `NfsAccordionItem.up()` (≈ Foundation's `up`)
- **Events** (CA-010): `NfsAccordion.down` output (≈ `down.zf.accordion`), `NfsAccordion.up` output (≈ `up.zf.accordion`)
- **Exceptions** (CA-011): `destroy()` is handled by Angular lifecycle / `DestroyRef` (no public method), and `init()` is auto-handled by Angular (no public method)

This ensures **API parity** (FR-075, FR-076) without introducing Foundation JavaScript dependency, maintaining Angular-native implementation while preserving developer familiarity.

See tasks.md for remediation task tracking (T-AC-001 through T-AC-004).
