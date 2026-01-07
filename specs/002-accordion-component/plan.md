# Implementation Plan: Accessible Accordion Component

**Branch**: `002-accordion-component` | **Date**: 2025-06-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-accordion-component/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a fully accessible, WCAG AA-compliant accordion component for ngx-foundation-sites using Angular-native implementation. The component set includes `<nfs-accordion>`, `<nfs-accordion-item>`, `<nfs-accordion-title>`, and `<nfs-accordion-content>` components with support for single/multi-expand modes, keyboard navigation, screen reader compatibility, lazy content loading, and deep linking. Implementation uses modern Angular APIs (standalone components, signals, @if/@for control flow) and applies Foundation for Sites CSS classes without Foundation JavaScript dependency.

## Technical Context

**Language/Version**: TypeScript 5.9, Angular 21.0.6  
**Primary Dependencies**: @angular/core ~21.0.6, @angular/common ~21.0.6, @angular/aria ~21.0.5, @angular/cdk ~21.0.5, foundation-sites ~6.9.0 (CSS only), rxjs ~7.8.0  
**Storage**: N/A (component state managed in-memory via signals)  
**Testing**: Vitest 4.0.9 (unit tests), Storybook 10.1.10 with play functions (interaction tests), Playwright 1.36.0 (e2e for deep linking), @storybook/addon-a11y for accessibility checks  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), Angular Universal SSR compatible  
**Project Type**: Nx monorepo library (`packages/ngx-foundation-sites`)  
**Performance Goals**: Support 100 accordion items without performance degradation, <100ms keyboard interaction response time, efficient DOM updates via OnPush change detection  
**Constraints**: WCAG 2.1 AA compliance (mandatory), no Foundation JavaScript dependency, SSR compatible (no browser-only APIs during initialization), OnPush change detection only  
**Scale/Scope**: Self-contained component library feature with 4 components, comprehensive Storybook documentation, full ARIA pattern implementation per spec

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Angular-Native Components**: ✅

- [x] Component implementation uses Angular APIs only (no Foundation JS)
- [x] Component names align with Foundation for Sites conventions (accordion → nfs-accordion)
- [x] Input properties use camelCase equivalents of Foundation `data-*` attributes (multiExpand ← data-multi-expand, allowAllClosed ← data-allow-all-closed)
- [x] Injection tokens follow `Token` suffix convention (nfsAccordionToken)
- [x] API design doc created/updated using `foundation-api-design` skill (required before implementation)

**Accessibility First**: ✅

- [x] Component will pass AXE checks (verified via @storybook/addon-a11y)
- [x] WCAG AA minimum standards addressed (focus, contrast, ARIA patterns per spec)
- [x] Implementation hierarchy: @angular/aria → @angular/cdk → custom Angular (prefer @angular/aria utilities)

**Foundation CSS-Only Integration**: ✅

- [x] Foundation CSS classes applied as Foundation expects (.accordion, .accordion-item, .accordion-title, .accordion-content, .is-active)
- [x] Foundation state classes used via Angular class bindings (@HostBinding or [class.is-active])
- [x] Custom CSS limited and justified with comments (only for accessibility or Angular-specific features)

**Modern Angular APIs**: ✅

- [x] Standalone components only (no NgModules)
- [x] Signals for state management (expanded(), openItems(), computed states)
- [x] `input()`/`output()` functions instead of decorators
- [x] Native control flow (`@if` for conditional rendering, `@for` for dynamic items)
- [x] `ChangeDetectionStrategy.OnPush` set on all components
- [x] Member visibility follows guidelines (`#` private, `protected` for template/queries, public for API)

**Component Testing Strategy**: ✅

- [x] Storybook interactive tests planned (Basic.story.ts, KeyboardNavigation.story.ts, MultiExpand.story.ts, DisabledItems.story.ts, DynamicContent.story.ts)
- [x] E2E tests only for web-native APIs (deep linking with URL hash manipulation - User Story 10)
- [x] Stories include interaction tests (play functions for all acceptance scenarios)
- [x] Semantic locators planned for E2E tests (getByRole, getByText, getByTestId)

**Nx Monorepo Organization**: ✅

- [x] Library follows Nx conventions (packages/ngx-foundation-sites)
- [x] Selector prefix: `nfs-` (components: nfs-accordion, nfs-accordion-item, nfs-accordion-title) and `nfs` (directive: nfsAccordionContent)
- [x] Module boundaries respected (accordion feature in src/lib/accordion/)
- [x] Tasks run through Nx (nx storybook, nx test, nx build)

## Project Structure

### Documentation (this feature)

```text
specs/002-accordion-component/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── accordion-api.ts        # TypeScript API contract for all 4 components
│   └── accordion-aria.md       # ARIA attribute requirements and relationships
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/ngx-foundation-sites/
├── src/
│   ├── index.ts                           # Public API exports
│   ├── lib/
│   │   ├── accordion/                     # Accordion feature module
│   │   │   ├── accordion.component.ts     # NfsAccordion container
│   │   │   ├── accordion.component.spec.ts
│   │   │   ├── accordion-item.component.ts # NfsAccordionItem
│   │   │   ├── accordion-item.component.spec.ts
│   │   │   ├── accordion-title.component.ts # NfsAccordionTitle
│   │   │   ├── accordion-title.component.spec.ts
│   │   │   ├── accordion-content.directive.ts # nfsAccordionContent
│   │   │   ├── accordion-content.directive.spec.ts
│   │   │   ├── accordion.token.ts         # nfsAccordionToken DI token
│   │   │   ├── accordion.stories.ts       # Basic usage stories
│   │   │   ├── accordion-keyboard.stories.ts # Keyboard navigation stories
│   │   │   ├── accordion-multiexpand.stories.ts # Multi-expand stories
│   │   │   ├── accordion-disabled.stories.ts # Disabled items stories
│   │   │   ├── accordion-dynamic.stories.ts # Dynamic content stories
│   │   │   ├── accordion-lazy.stories.ts  # Lazy loading stories
│   │   │   ├── accordion-deeplink.stories.ts # Deep linking stories
│   │   │   └── index.ts                   # Barrel export
│   │   ├── core/                          # Shared utilities
│   │   │   └── id-generator.ts            # Unique ID generation utility
│   │   └── scss/                          # Styles (if any custom CSS needed)
│   └── storybook/                         # Storybook configuration
└── project.json                           # Nx project configuration

packages/ngx-foundation-sites-e2e/
└── src/
    └── accordion/
        └── accordion-deeplink.spec.ts     # Playwright E2E for URL hash deep linking
```

**Structure Decision**: Nx monorepo library structure with component feature in `packages/ngx-foundation-sites/src/lib/accordion/`. All accordion-related components, directives, tokens, and stories colocated in the `accordion/` directory. Storybook stories placed alongside components per project convention. E2E tests for deep linking (web-native History API) in separate e2e package. Core utilities like ID generation placed in `core/` for reusability across components.

## Complexity Tracking

_No constitutional violations detected. All requirements align with established principles._
