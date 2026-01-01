# Accordion Component Implementation Plan

## Overview

This plan implements the Foundation for Sites Accordion component using Angular ARIA directives as the primary building block, with Foundation's CSS styling.

## References

- [Foundation for Sites Accordion Docs](https://get.foundation/sites/docs/accordion.html)
- [Angular ARIA Accordion](https://angular.dev/api/aria/accordion/AccordionGroup)
- [LayZeeDK/ngx-foundation-sites styling pattern](https://github.com/LayZeeDK/ngx-foundation-sites)

---

## Implementation Phases

| Phase                                                        | Title                                 | Status   | Description                                              |
| ------------------------------------------------------------ | ------------------------------------- | -------- | -------------------------------------------------------- |
| [Phase 0](./docs/accordion/phase-0-foundation-styles.md)     | Foundation Styles Infrastructure      | ✅       | Set up global Foundation styles for Storybook            |
| [Phase 1](./docs/accordion/phase-1-core-implementation.md)   | Core Accordion Implementation         | ✅       | Basic accordion with expand/collapse using @angular/aria |
| [Phase 2](./docs/accordion/phase-2-storybook-stories.md)     | Storybook Stories & Interaction Tests | ✅       | Comprehensive stories with interaction tests             |
| [Phase 3](./docs/accordion/phase-3-advanced-features.md)     | Advanced Features                     | ✅       | Animation, deep linking, allowAllClosed                  |
| [Phase 4](./docs/accordion/phase-4-keyboard-navigation.md)   | Keyboard Navigation                   | ✅       | Full keyboard accessibility via @angular/aria            |
| [Phase 5](./docs/accordion/phase-5-testing-documentation.md) | Testing & Documentation               | ✅       | Unit tests, accessibility tests, E2E tests               |
| [Phase 6](./docs/accordion/phase-6-router-integration.md)    | Angular Router Integration            | Deferred | Optional Router integration for deep linking             |
| [Phase 7](./docs/accordion/phase-7-feature-parity.md)        | Feature Parity & Theming              | ✅       | Complete Foundation parity, CSS custom properties        |
| [Phase 8](./docs/accordion/phase-8-private-fields.md)        | JS-Native Private Fields              | ✅       | Migrate to `#` private fields                            |
| [Phase 9](./docs/accordion/phase-9-zoneless-config.md)       | Zoneless Angular Configuration        | ✅       | Configure zoneless change detection                      |
| [Phase 10](./docs/accordion/phase-10-native-animations.md)   | Native Animations                     | Pending  | Restore `ngAccordionContent` with animations             |
| [Phase 11](./docs/accordion/phase-11-styles-architecture.md) | Styles Architecture                   | ✅       | Separate global and component-scoped styles              |
| [Phase 12](./docs/accordion/phase-12-template-api.md)        | Template-Based API                    | ✅       | Template directives replacing structural directives      |

---

## Files Created/Modified

### New Files

| Path                                                    | Purpose                     | Status |
| ------------------------------------------------------- | --------------------------- | ------ |
| `src/lib/_foundation-settings.scss`                     | Global Foundation settings  | ✅     |
| `src/lib/_foundation-components.scss`                   | Foundation component mixins | ✅     |
| `src/storybook/styles.scss`                             | Storybook global styles     | ✅     |
| `src/lib/accordion/index.ts`                            | Public exports              | ✅     |
| `src/lib/accordion/accordion.ts`                        | Accordion group component   | ✅     |
| `src/lib/accordion/accordion-item-def.ts`               | Accordion item directive    | ✅     |
| `src/lib/accordion/accordion-header-def.ts`             | Header template directive   | ✅     |
| `src/lib/accordion/accordion-content.ts`                | Content template directive  | ✅     |
| `src/lib/scss/accordion.scss`                           | Component SCSS (distributed)| ✅     |
| `src/lib/accordion/accordion.stories.ts`                | Storybook stories           | ✅     |
| `src/lib/accordion/accordion.spec.ts`                   | Unit tests                  | ✅     |
| `src/lib/accordion/accordion-deep-link.service.ts`      | Deep linking service        | ✅     |
| `src/lib/accordion/accordion-deep-link.service.spec.ts` | Service unit tests          | ✅     |
| `packages/.../accordion-deep-link.spec.ts`              | Playwright E2E tests        | ✅     |

### Modified Files

| Path                                                  | Change                             | Status |
| ----------------------------------------------------- | ---------------------------------- | ------ |
| `packages/ngx-foundation-sites/project.json`          | Add styles to storybook targets    | ✅     |
| `packages/ngx-foundation-sites/project.json`          | Add Vitest Browser mode (chromium) | ✅     |
| `packages/ngx-foundation-sites/.storybook/preview.ts` | Add preview configuration          | ✅     |
| `packages/ngx-foundation-sites/src/index.ts`          | Export accordion module            | ✅     |
| `package.json`                                        | Add @vitest/browser-playwright     | ✅     |

---

## Implementation Order

1. **Phase 0** - Foundation styles infrastructure (required for all components) ✅
2. **Phase 1** - Core accordion with @angular/aria ✅
3. **Phase 2** - Storybook stories with interaction tests ✅
4. **Phase 3** - Advanced features (animation, deep linking) ✅
5. **Phase 4** - Keyboard navigation verification (partially done in Phase 2) ✅
6. **Phase 5** - Testing and documentation
   - **5.1** Unit tests ✅ (48 tests: 33 component + 15 service)
   - **5.2** Accessibility tests ✅
   - **5.3** Deep linking E2E tests (Playwright) ✅ (7 tests)
   - **5.4** CI verification ✅
7. **Phase 6** - Angular Router integration (Future Enhancement) — Deferred
8. **Phase 7** - Feature Parity & Theming Enhancements ✅
9. **Phase 8** - JS-Native Private Fields Migration ✅
10. **Phase 9** - Zoneless Angular Configuration ✅
11. **Phase 10** - Native Animations — Pending (blocked by Angular ARIA PR)
12. **Phase 11** - Styles Architecture Refactoring ✅
13. **Phase 12** - Template-Based API ✅

---

## Decision Points (Ask Before Proceeding)

1. **@angular/aria limitations**: If AccordionGroup doesn't support `allowAllClosed`, should we:
   - Extend with custom logic?
   - Use @angular/cdk/accordion instead?

2. **Deep linking scope**: Should deep linking be:
   - Built into the accordion component?
   - Provided as a separate optional service?

3. **Animation approach**: Should we use:
   - CSS transitions (simpler, recommended)?
   - Angular animations (`animate.enter`/`animate.leave`)?

---

## Naming Conventions

All custom CSS properties and class prefixes use `nfs-` (ngx-foundation-sites):

- CSS custom properties: `--nfs-primary-color`, `--nfs-accordion-background`
- Component selectors: `nfs-accordion`, `nfs-accordion-item`
- Directive selectors: `nfsAccordionItem`, `nfsAccordionHeader`, `nfsAccordionContent`
