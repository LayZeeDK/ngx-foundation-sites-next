<!--
SYNC IMPACT REPORT
==================
Version: 0.1.0 → 1.0.0
Rationale: Initial constitution establishment for ngx-foundation-sites project

Principles Defined:
- I. Angular-Native Components — New principle defining component implementation strategy
- II. Accessibility First — New principle mandating WCAG AA compliance and ARIA patterns
- III. Foundation CSS-Only Integration — New principle establishing CSS-only approach without Foundation JS
- IV. Modern Angular APIs — New principle requiring signals, standalone components, and modern syntax
- V. Component Testing Strategy — New principle defining Storybook-first testing approach
- VI. Nx Monorepo Organization — New principle establishing library boundaries and module structure

Templates Status:
✅ Updated: plan-template.md (Constitution Check section aligned with principles)
✅ Updated: spec-template.md (Requirements section aligned with accessibility and testing principles)
✅ Updated: tasks-template.md (Phase organization aligned with component development workflow)

Follow-up Items:
- None - All placeholders resolved
-->

# ngx-foundation-sites Constitution

## Core Principles

### I. Angular-Native Components

All components MUST be implemented as Angular-native solutions without Foundation JavaScript dependencies. Components apply Foundation's CSS classes directly (`.button`, `.menu`, `.accordion`) and implement interactivity using Angular primitives. Component names MUST align with Foundation for Sites component names and CSS class conventions. Input properties MUST use camelCase equivalents of Foundation's `data-*` attributes and document the Foundation equivalent in JSDoc comments. Injection tokens MUST use camelCase with a `Token` suffix (e.g., `nfsAccordionToken`). For new or changed Foundation component APIs, an API design document MUST be created/updated using the `foundation-api-design` skill (`.claude/skills/foundation-api-design/SKILL.md`).

**Rationale**: This ensures components integrate seamlessly with Angular's change detection and lifecycle while maintaining Foundation's visual design system. CSS-only integration reduces bundle size and eliminates JavaScript framework conflicts.

### II. Accessibility First

All components MUST pass AXE checks and follow WCAG AA minimum standards including focus management, color contrast, and ARIA attributes. Implementation hierarchy is strictly enforced: `@angular/aria` MUST be used first; `@angular/cdk` when ARIA doesn't provide what's needed; custom Angular only as last resort. All interactive elements MUST be keyboard accessible and screen reader compatible.

**Rationale**: Accessibility is non-negotiable. Using Angular's ARIA building blocks ensures consistent, tested accessibility patterns and reduces maintenance burden.

### III. Foundation CSS-Only Integration

Components MUST prefer Foundation's existing styles over custom CSS. Foundation's CSS classes MUST be applied as Foundation expects them. Foundation's state classes (`.is-active`, `.is-open`, `.disabled`) MUST be applied via Angular class bindings. Custom CSS is permitted ONLY when necessary for accessibility (e.g., button width adjustments), Angular-specific features (e.g., animation hooks), or bridging ARIA attributes to Foundation's class-based styling. All custom CSS MUST include comments explaining the necessity.

**Rationale**: Leveraging Foundation's battle-tested CSS reduces duplication, ensures visual consistency, and minimizes maintenance burden. Custom CSS should be the exception requiring justification.

### IV. Modern Angular APIs

All code MUST use modern Angular APIs: standalone components (no NgModules), signals for state management, `input()` and `output()` functions instead of decorators, `computed()` for derived state, native control flow (`@if`, `@for`, `@switch`) instead of structural directives, and `ChangeDetectionStrategy.OnPush`. Components MUST use `inject()` function instead of constructor injection. Host bindings MUST be placed inside the `host` object of decorators, NOT `@HostBinding`/`@HostListener`. Member visibility MUST use `#` for private fields (except template-accessed members), `protected` for template-accessed members or Angular signal queries, and public (no modifier) for component API.

**Rationale**: Modern APIs improve performance (OnPush, signals), developer experience (less boilerplate), and future-proof the codebase. Angular 20+ makes standalone the default; signals are the future of state management.

### V. Component Testing Strategy

Testing strategy MUST prioritize Storybook interactive tests over component unit tests. Storybook play functions provide documentation-as-tests and cover real user interactions in browser environments. Playwright e2e tests are reserved for web-native APIs not testable in Storybook (History API, Navigation, Storage APIs, viewport-dependent behaviors) and for verifying Foundation + ngx-foundation-sites Sass variables in the test consumer app. Vitest unit tests are used ONLY for pure functions, services, and complex logic. All Storybook stories MUST include interaction tests covering user interactions, state changes, and accessibility behaviors. E2E tests MUST use semantic `getBy*` locators (`getByRole`, `getByTestId`, `getByText`, `getByLabel`) instead of `page.locator()` for resilience.

**Rationale**: Storybook tests double as documentation and provide better developer experience. Testing in real browser environments catches more issues than isolated component tests. Semantic locators create more maintainable tests aligned with accessibility best practices.

### VI. Nx Monorepo Organization

Project structure MUST follow Nx monorepo conventions: applications in `apps/`, libraries in `packages/`, with component selector prefix `nfs-` (components) and `nfs` (directives). All libraries MUST be independently publishable with clear boundaries. Module boundaries MUST be enforced using Nx tags (`scope:*`, `type:*`). Tasks MUST be run through Nx (`nx run`, `nx run-many`, `nx affected`) instead of direct tooling. Each library MUST have clear purpose and be self-contained with independent tests and documentation.

**Rationale**: Nx provides caching, task orchestration, and dependency graph management essential for monorepo scalability. Clear boundaries prevent circular dependencies and enable independent versioning.

## Development Standards

### Code Quality Requirements

- **Type Safety**: TypeScript strict mode MUST be enabled. Prefer type inference when obvious; avoid `any` type; use `unknown` when type is uncertain.
- **Formatting**: Prettier MUST be used with single quotes. Run `npm run format` to fix, `npm run format:check` to verify.
- **Linting**: ESLint flat config MUST be used. All code MUST pass linting with zero warnings (`maxWarnings: 0`).
- **Stylesheets**: SCSS MUST be used for all styles.

### Storybook Development Standards

- All stories MUST include interaction tests using Storybook play functions.
- Stories MUST use Foundation Prototype utility classes for demo styling (`.margin-*`, `.padding-*`, `.display-*`, `.text-*`) instead of inline styles.
- Inline styles are permitted ONLY for CSS custom property demonstrations (`--nfs-*`), interactive control bindings (`[style.--nfs-*]`), values not available in Foundation, or semantic attributes (`dir="rtl"`).
- Utility class values MUST match Foundation's scale (0, 1rem, 2rem, 3rem).

### Visual Testing and Reference

- Playwright MCP server MUST be used (not WebFetch) for browsing websites visually.
- Playwright MUST be used for: inspecting Storybook stories (`http://localhost:4400`), comparing against Foundation docs (`https://get.foundation/sites/docs/`), referencing Angular docs (`https://angular.dev`), referencing Angular Material docs (`https://material.angular.dev`), debugging visual issues.
- Workflow: Navigate → Snapshot (accessibility tree) → Screenshot (visual verification) → Interact → Close.

### Content Projection and Dependency Injection

When building components supporting content projection (parent-child relationships):

1. Export the injection token for consumer alternatives
2. Use optional injection with `skipSelf` in child components
3. Allow standalone usage when parent is not required

**Pattern**:

```typescript
// Token file
export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');

// Parent component
@Component({
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion { ... }

// Child component
export class NfsAccordionItem {
  readonly accordion = inject(nfsAccordionToken, { optional: true, skipSelf: true });
}
```

**Rationale**: Angular's DI for content-projected elements follows declaration site injector, not DOM tree. This pattern enables proper parent-child communication.

## Workflow and CI

### Continuous Integration

- Full CI pipeline MUST run: `npm run ci` (format check, lint, test, build, e2e)
- Individual verification: `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`
- All tasks SHOULD be run through Nx for caching benefits: `nx run-many -t lint test build`
- Affected commands SHOULD be used in CI: `nx affected -t build test`

### Shell and Git Operations

- Commands MUST be run from repository root unless explicitly changed with `cd`
- Git commands MUST be run directly without absolute path specifiers
- FORBIDDEN patterns: `git -C "<absolute-path>"`, `cd /d <absolute-path>`, `Push-Location "<absolute-path>"`
- Git pagers MUST be disabled: use `git --no-pager` for all output commands

### Storybook Operations

- Dev server: `npm run storybook` (port 4400)
- Build: `npx nx build-storybook ngx-foundation-sites`
- Test: `npx nx test-storybook ngx-foundation-sites`
- Kill process: `npm run kill-storybook`

## Governance

This constitution supersedes all other development practices and conventions. All code reviews, pull requests, and architectural decisions MUST verify compliance with these principles. Any deviation MUST be explicitly justified and documented. Amendments to this constitution require:

1. Documented rationale for the change
2. Impact analysis on existing code and templates
3. Update to all dependent templates (plan, spec, tasks)
4. Team approval before adoption
5. Migration plan for existing code if applicable

For runtime development guidance, implementation details, and examples, refer to `AGENTS.md`. That file provides tactical guidance while this constitution defines strategic principles.

Complexity that violates principles (e.g., using NgModules, bypassing accessibility requirements, custom CSS without justification, using deprecated Angular APIs) MUST be justified in the "Complexity Tracking" section of `plan.md` with explanation of why simpler alternatives are insufficient.

### Constitution Version Management

Version numbering follows semantic versioning:

- **MAJOR**: Backward incompatible governance changes or principle removals/redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
