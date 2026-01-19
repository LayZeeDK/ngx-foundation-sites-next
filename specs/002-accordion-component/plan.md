# Implementation Plan: Accessible Accordion Component

**Branch**: `002-accordion-component` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-accordion-component/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an accessible, self-contained Accordion component for ngx-foundation-sites using template-directive composition (`ng-template[nfsAccordionItem]`) that leverages @angular/aria primitives for WCAG AA compliance. The component provides single/multi-expand modes, keyboard navigation, screen reader support, deep linking, and lazy content loading. Supports up to 100 items with performance targets of 5s initial render and 200ms toggle responsiveness.

## Technical Context

**Language/Version**: Angular 21.0.6, TypeScript 5.9.2 (ES2015 target, ESNext modules)
**Primary Dependencies**: @angular/aria 21.0.6, @angular/cdk 21.0.6, Foundation for Sites 6.9.0, RxJS 7.8.0
**Storage**: N/A (component library, no persistence layer)
**Testing**: Vitest 4.0.9 with @analogjs/vitest-angular, Playwright 1.36.0 (E2E), Storybook 10.1.10 with test-runner and axe-playwright
**Target Platform**: Modern browsers (Chromium-based tested), SSR-ready (@angular/platform-server available)
**Project Type**: Nx monorepo (v22.3.1) with Angular library package (`packages/ngx-foundation-sites/`)
**Performance Goals**: 100 accordion items max, 5s initial render, 200ms toggle responsiveness, <100ms keyboard navigation
**Constraints**: WCAG AA compliance mandatory, no Foundation JavaScript dependencies, ViewEncapsulation.None with runtime CSS loading
**Scale/Scope**: Single-feature component library contribution (accordion + 3 structural directives), Storybook stories with interactive tests, E2E tests for History API integration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Angular-Native Components**: ✅

- [x] Component implementation uses Angular APIs only (no Foundation JS) — Uses @angular/aria primitives exclusively
- [x] Component names align with Foundation for Sites conventions — `nfs-accordion` matches Foundation's `.accordion` class
- [x] Input properties use camelCase equivalents of Foundation `data-*` attributes — `multiExpand` from `data-multi-expand`, `allowAllClosed` from `data-allow-all-closed`, `deepLink` from `data-deep-link`
- [x] Injection tokens follow `Token` suffix convention — `nfsAccordionToken` per spec FR-007
- [x] Directive-vs-component decision justified — Uses template-directive composition (`ng-template[nfsAccordionItem]`) for @angular/aria integration and performance; component (`<nfs-accordion>`) only for root container
- [x] API design doc created/updated using `foundation-api-design` skill — `contracts/accordion-api.ts` defines complete API surface

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

- [x] Storybook interactive tests planned — US1-US10 define acceptance scenarios for play functions
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
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/ngx-foundation-sites/
├── src/
│   ├── lib/
│   │   └── accordion/
│   │       ├── accordion.component.ts              # <nfs-accordion> root container
│   │       ├── accordion.component.spec.ts         # Unit tests (if needed for pure logic)
│   │       ├── accordion.stories.ts                # Storybook stories + interactive tests
│   │       ├── directives/
│   │       │   ├── accordion-item.directive.ts     # ng-template[nfsAccordionItem]
│   │       │   ├── accordion-header.directive.ts   # ng-template[nfsAccordionHeader]
│   │       │   └── accordion-content.directive.ts  # ng-template[nfsAccordionContent]
│   │       ├── services/
│   │       │   └── accordion-id-generator.service.ts  # Auto-generates unique panelId values
│   │       ├── tokens/
│   │       │   └── accordion.token.ts              # nfsAccordionToken for DI
│   │       ├── types/
│   │       │   └── accordion.types.ts              # AccordionItem interface, event types
│   │       └── index.ts                            # Public API exports
│   └── styles/
│       └── nfs-accordion.scss                      # Minimal custom styles (if needed)
└── public-api.ts                                   # Library exports

packages/ngx-foundation-sites-e2e/
└── src/
    └── accordion/
        └── accordion-deep-link.spec.ts             # E2E tests for History API integration

apps/docs/ (or similar Storybook consumer app)
└── src/
    └── stories/
        └── accordion/                              # Additional story examples
```

**Structure Decision**: Nx Angular library monorepo structure. Component implementation lives under `packages/ngx-foundation-sites/src/lib/accordion/` as a self-contained feature module. The accordion folder contains the root component, three structural directives, ID generation service, DI tokens, and TypeScript types. Storybook stories co-locate with component implementation for easy testing. E2E tests for History API deep linking live in the separate `packages/ngx-foundation-sites-e2e/` project per Nx conventions.

## Architecture Decision Record: Template-Directive Composition

**Context**: The accordion component must leverage `@angular/aria` primitives (`AccordionGroup`, `AccordionTrigger`, `AccordionPanel`) for WCAG AA compliance while maintaining Foundation for Sites CSS styling and supporting up to 100 items with 200ms toggle responsiveness.

**Decision**: Use **template-directive composition** (`ng-template[nfsAccordionItem]`, `ng-template[nfsAccordionHeader]`, `ng-template[nfsAccordionContent]`) instead of component-based API (`<nfs-accordion-item>`, `<nfs-accordion-title>`).

**Consequences**:

**Positive**:
- ✅ **Direct @angular/aria integration**: Angular ARIA directives can be applied directly to consumer-provided templates without wrapper components
- ✅ **Performance**: `ViewContainerRef.createEmbeddedView()` is more efficient than component instantiation for 100 items
- ✅ **Reduced custom ARIA**: Framework handles `aria-expanded`, `aria-controls`, `aria-labelledby` automatically
- ✅ **Constitution alignment**: Follows "Accessibility First" hierarchy (prefer `@angular/aria` building blocks)

**Negative**:
- ⚠️ **Less intuitive syntax**: Developers unfamiliar with structural directives may find `ng-template` syntax harder to learn than `<nfs-accordion-item>`
- ⚠️ **Limited to template content**: Cannot easily add methods/properties to individual items (mitigated by exposing `NfsAccordionItemDef` reference)

**Alternatives Considered**:
1. **Component-based API** (`<nfs-accordion-item>`): More intuitive developer experience but requires manual ARIA management, higher component overhead, and doesn't leverage `@angular/aria` as effectively
2. **Hybrid approach** (both APIs): Increased maintenance burden, API surface complexity, and documentation overhead outweigh flexibility benefits

**Rationale**: Template-directive composition enables direct use of Angular ARIA primitives while meeting performance goals. The less intuitive syntax is an acceptable trade-off for improved accessibility compliance and performance.

**See Also**:
- [spec.md Implementation Architecture](./spec.md#implementation-architecture) (lines 61-113)
- [research.md Decision 1](./research.md#1-template-directive-composition-vs-component-based-api)
- [quickstart.md](./quickstart.md) for working examples

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
