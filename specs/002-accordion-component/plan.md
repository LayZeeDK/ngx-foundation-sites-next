# Implementation Plan: Accessible Accordion Component

**Branch**: `002-accordion-component` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-accordion-component/spec.md`

## Summary

Build an accessible, Angular-native accordion component that provides Foundation for Sites visual design with full WCAG AA compliance. The component must achieve **API parity with Foundation's accordion JavaScript plugin**: all Foundation JS methods (`toggle`, `down`, `up`, `destroy`) and events (`down`, `up` — emitted by Foundation as `down.zf.accordion` / `up.zf.accordion`) must be exposed as equivalent Angular methods and outputs. Implementation uses standalone components, signals, and Angular ARIA/CDK primitives without Foundation JavaScript dependencies.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Angular 20+  
**Primary Dependencies**: @angular/core, @angular/aria, @angular/cdk, Foundation for Sites CSS  
**Storage**: N/A (component library)  
**Testing**: Storybook (primary), Vitest (unit), Playwright (E2E for deep linking)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions), SSR compatible
**Project Type**: Web component library (Nx monorepo)  
**Performance Goals**: Support 100 items without degradation, <100ms keyboard response  
**Constraints**: WCAG AA compliance mandatory, OnPush change detection, no Foundation JS dependency, **Foundation JS API parity required**  
**Scale/Scope**: 4 components (accordion, item, title, content), ~1000 LOC estimate, Storybook stories with interaction tests

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Angular-Native Components**: ✅

- [x] Component implementation uses Angular APIs only (no Foundation JS)
- [x] Component names align with Foundation for Sites conventions
- [x] Input properties use camelCase equivalents of Foundation `data-*` attributes
- [x] Injection tokens follow `Token` suffix convention
- [x] API design doc created/updated using `foundation-api-design` skill
- [x] **Foundation JS API parity: Methods (`toggle`, `down`, `up`, `destroy`) and events (`down`, `up`) exposed as Angular methods and outputs (Foundation emits these as `down.zf.accordion` / `up.zf.accordion`)**

**Accessibility First**: ✅

- [x] Component will pass AXE checks
- [x] WCAG AA minimum standards addressed (focus, contrast, ARIA)
- [x] Implementation hierarchy: @angular/aria → @angular/cdk → custom Angular

**Foundation CSS-Only Integration**: ✅

- [x] Foundation CSS classes applied as Foundation expects
- [x] Foundation state classes used via Angular class bindings
- [x] Custom CSS limited and justified with comments

**Modern Angular APIs**: ✅

- [x] Standalone components only (no NgModules)
- [x] Signals for state management
- [x] `input()`/`output()` functions instead of decorators
- [x] Native control flow (`@if`, `@for`, `@switch`)
- [x] `ChangeDetectionStrategy.OnPush` set
- [x] Member visibility follows guidelines (`#`, `protected`, public)

**Component Testing Strategy**: ✅

- [x] Storybook interactive tests planned
- [x] E2E tests only for web-native APIs (deep linking with History API)
- [x] Stories include interaction tests
- [x] Semantic locators planned for E2E tests

**Nx Monorepo Organization**: ✅

- [x] Library follows Nx conventions (packages/)
- [x] Selector prefix: `nfs-` (components) or `nfs` (directives)
- [x] Module boundaries respected
- [x] Tasks run through Nx

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

### FR-020a (panelId validation)

- Maintain a registration registry in the accordion parent: `Map<string, NfsAccordionItem[]>` mapping `panelId` -> array of registered items (in registration order). Note: `NfsAccordionItem` is the concrete component class; no separate ref type is needed. On each item registration and on `panelId` changes, validate the array length. If length > 1 (duplicate within same accordion instance), call the injected `ErrorHandler.handleError()` with a structured Error (`new Error(`Duplicate panelId "${id}" in accordion ${accordionInstanceId || '<no-id>'}`)`) and proceed by using the first entry in the registry as the deep-link target. Do not auto-suffix or rename developer-provided `panelId` values.

- Add unit tests that stub `ErrorHandler` to assert invocation and that verify deterministic expansion of the first-registered item.

### FR-067b / FR-067c (deep link missing-targets and multiExpand interaction)

- On initialization and on `hashchange` events: parse the current hash, lookup registered panel(s) via the parent registry (see FR-020a). If no registered panel found, call the injected `ErrorHandler.handleError()` with a `DeepLinkNotFound` diagnostic and return (no expansion). If a target exists, call the accordion's canonical expansion API (e.g., `accordion.expandById(panelId)`) so the existing `multiExpand` and `allowAllClosed` enforcement logic runs (this ensures deep-link expansion collapses other panels when `multiExpand=false`).

- Add Playwright E2E tests that: (a) navigate to page with non-existent `#id` and assert that `ErrorHandler` received a diagnostic and no panels expanded; (b) navigate from `#idA` to `#idB` with `multiExpand=false` and assert collapse/expand behavior matches user interaction semantics.

### FR-050a (softDisabled navigation semantics)

- Keyboard navigation iterator should consult a resolved `isDisabled(item)` predicate which factors both accordion-level `disabled` and item-level `disabled` plus the `softDisabled` mode. Implement navigation filtering rules as:
  - If `softDisabled === true`: keep item in tab order (don't change native tabindex), set `aria-disabled="true"`, and exclude it from arrow-key iteration (filter it out when computing next/previous indexes).
  - If `softDisabled === false`: remove from tab order (no tabindex/`disabled` attribute) and exclude from both tab and arrow-key navigation.

- Update unit tests to validate: (a) Tab focuses soft-disabled items, (b) Arrow navigation skips soft-disabled items, (c) activation on soft-disabled items is prevented, and (d) hard-disabled items are not reachable via Tab or Arrow.

### AR-027a (announce live-region opt-in)

- Provide an InputSignal `announce = input(false)` on `<nfs-accordion>` (or at `<nfs-accordion-item>` level as appropriate). When `announce` is `true`, render a single visually-hidden element with `aria-live="polite"` (e.g., `<div class="visually-hidden" aria-live="polite" aria-atomic="true">...</div>`). On expand/collapse, set the live region's textContent to a concise message (e.g., `Section "${titleText}" expanded`). Debounce updates by 100ms to prevent duplicate/rapid announcements during rapid toggles (source: spec.md AR-027a). Add unit and e2e tests that assert (when `announce=true`) the live region receives the expected message on expand/collapse, and that when `announce=false` no live region is present.

### FR-026a (missing title handling)

- If an item registers without a `nfs-accordion-title` child, the item should still register but mark itself as `noTrigger=true`. Do not include it in title-focused navigation lists. Call `ErrorHandler.handleError(new Error('Missing <nfs-accordion-title> in <nfs-accordion-item>'))` to surface diagnostics. Add unit tests that render an item without title and assert no focusable title exists and ErrorHandler was called.

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
│           ├── accordion.component.ts       # NfsAccordion (container)
│           ├── accordion-item.component.ts  # NfsAccordionItem
│           ├── accordion-title.component.ts # NfsAccordionTitle
│           ├── accordion-content.directive.ts # NfsAccordionContent
│           ├── accordion.token.ts           # nfsAccordionToken (DI)
│           ├── index.ts                     # Public API exports
│           └── README.md                    # Component documentation
│
├── .storybook/
│   └── stories/
│       └── accordion/
│           ├── accordion.stories.ts         # Storybook stories
│           ├── Basic.story.ts
│           ├── KeyboardNavigation.story.ts
│           ├── MultiExpand.story.ts
│           ├── DisabledItems.story.ts
│           ├── DynamicContent.story.ts
│           ├── LazyContent.story.ts
│           ├── DeepLinking.story.ts
│           └── ScreenReader.story.ts
```

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

**Foundation API Parity Justification**: Foundation's accordion JavaScript plugin exposes public methods (`toggle`, `down`, `up`, `destroy`) and events (`down`, `up` — emitted by Foundation as `down.zf.accordion` / `up.zf.accordion`). To ensure developers migrating from Foundation JS to ngx-foundation-sites have equivalent programmatic control, these must be exposed as:

- **Methods**: `NfsAccordionItem.toggle()`, `NfsAccordionItem.down()` (≈ Foundation's `down`), `NfsAccordionItem.up()` (≈ Foundation's `up`)
- **Events**: `NfsAccordion.down` output (≈ `down.zf.accordion`), `NfsAccordion.up` output (≈ `up.zf.accordion`)
- **Exceptions**: `destroy()` is handled by Angular lifecycle / `DestroyRef` (no public method), and `init()` is auto-handled by Angular (no public method)

This ensures **API parity** without introducing Foundation JavaScript dependency, maintaining Angular-native implementation while preserving developer familiarity.

## Tasks (additional remediation items)

The following tasks address top-priority specification gaps found during cross-artifact analysis and are blocking for a robust implementation.

- T-AC-001: Implement per-item toggle queue + 50ms debounce and input-source coalescing
  - Description: Add a per-item FIFO toggle queue with a 50ms debounce for UI-sourced actions. Coalesce identical repeated toggles within 50ms. Ensure queueing preserves deterministic final state and add timing-sensitive integration tests (Storybook play + Vitest simulation).
  - Acceptance: Unit + integration tests simulate rapid clicks (10x within 200ms) and assert stable final state and no unhandled rejections.
  - Blocking: YES (race conditions observed in manual testing without this)
  - Status: DONE (implemented in accordion-item-def.ts)

- T-AC-002: _(meta-task)_ `announce` live-region opt-in — **resolved by T196-T199**
  - Description: Add `announce = input(false)` on `<nfs-accordion>` and render a visually-hidden live region with `aria-live="polite"` & `aria-atomic="true"` when enabled. Debounce announcements by 100ms. Add Storybook play tests asserting live region updates on expand/collapse and title changes.
  - Acceptance: Play tests confirm live region message on expand/collapse when `announce=true`, and no live region when `announce=false`.
  - Blocking: NO (accessibility enhancement but high priority)
  - Status: Meta-task — implementation tracked via tasks.md T196-T199 (Phase 5, US3). No separate work item.

- T-AC-003: Input validators & tests for FR-110a (titleHeadingLevel, deepLinkSmudgeDelay, deepLinkSmudgeOffset)
  - Description: Implement input sanitizers/coercers and `ErrorHandler.handleError()` diagnostics per FR-110a. Add unit tests for invalid/edge inputs and ensure bound models reflect coerced values.
  - Acceptance: Unit tests assert `ErrorHandler` called on invalid inputs and final internal values match coercion rules.
  - Blocking: NO (important for robustness)

  - Status: DONE (validators.ts + validators.spec.ts present and wired into accordion)

  - Evidence: `validators.ts` added and wired; `validators.spec.ts` added; `accordion.ts` applies sanitizers on construction.

- T-AC-004: Harmonize ID generator filename and task references
  - Description: Choose canonical implementation filename `accordion-id-generator.service.ts` and update task references (T057/T057b) and documentation to reference that filename. Ensure the service export scope and DI provider location are documented.
  - Acceptance: All references in `plan.md`, `spec.md`, and `contracts/accordion-api.ts` point to `accordion-id-generator.service.ts` and a short Implementation Note documents provider scope.
  - Blocking: NO (documentation/task consistency)
  - Status: DONE — T057b now documents export status: service is `providedIn: 'platform'` and intentionally NOT exported from public API (internal implementation detail).
