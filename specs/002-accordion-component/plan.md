# Implementation Plan: Accessible Accordion Component

**Branch**: `002-accordion-component` | **Date**: 2025-06-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-accordion-component/spec.md`

## Summary

Build an accessible, Angular-native accordion component that provides Foundation for Sites visual design with full WCAG AA compliance. The component must achieve **API parity with Foundation's accordion JavaScript plugin**: all Foundation JS methods (`toggle`, `down`, `up`, `destroy`) and events (`down.zf.accordion`, `up.zf.accordion`) must be exposed as equivalent Angular methods and outputs. Implementation uses standalone components, signals, and Angular ARIA/CDK primitives without Foundation JavaScript dependencies.

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
- [x] **Foundation JS API parity: Methods (`toggle`, `down`, `up`, `destroy`) and events (`down.zf.accordion`, `up.zf.accordion`) exposed as Angular methods and outputs**

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
│
└── tests/
    ├── unit/
    │   └── accordion/
    │       ├── accordion.component.spec.ts
    │       └── accordion-item.component.spec.ts
    └── e2e/
        └── accordion/
            └── accordion-deeplink.spec.ts   # Playwright E2E for History API
```

**Structure Decision**: Nx monorepo with library in `packages/ngx-foundation-sites/`. Accordion component is a self-contained feature module within the library. Storybook stories colocated in `.storybook/stories/` for easy development. E2E tests only for browser-specific APIs (deep linking).

## Complexity Tracking

_No violations. All constitution principles satisfied._

**Foundation API Parity Justification**: Foundation's accordion JavaScript plugin exposes public methods (`toggle`, `down`, `up`, `destroy`) and events (`down.zf.accordion`, `up.zf.accordion`). To ensure developers migrating from Foundation JS to ngx-foundation-sites have equivalent programmatic control, these must be exposed as:

- **Methods**: `NfsAccordionItem.toggle()`, `NfsAccordionItem.open()` (≈ Foundation's `down`), `NfsAccordionItem.close()` (≈ Foundation's `up`), `NfsAccordion.destroy()` (via Angular's component lifecycle)
- **Events**: `NfsAccordionItem.opened` output (≈ `down.zf.accordion`), `NfsAccordionItem.closed` output (≈ `up.zf.accordion`)

This ensures **API parity** without introducing Foundation JavaScript dependency, maintaining Angular-native implementation while preserving developer familiarity.
