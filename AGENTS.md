You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Overview

**ngx-foundation-sites** is an Angular component library that provides Angular implementations of UI components from the [Foundation for Sites](https://get.foundation/sites/docs/) CSS framework.

### Purpose

- Provide **Angular-native components** based on Foundation's design system
- Use **Foundation's Sass styles only** - no Foundation JavaScript dependencies
- Build with **modern Angular APIs** (signals, input/output functions, new control flow)
- Ensure **accessibility first** using `@angular/aria` and `@angular/cdk`

### Design Philosophy

1. **CSS-Only Integration**: Components apply Foundation's CSS classes directly (`.button`, `.menu`, `.accordion`) without relying on Foundation's JavaScript
2. **Composable Architecture**: Small, focused components following Angular's composition patterns
3. **Progressive Enhancement**: Core functionality works without JavaScript; interactivity is layered on top
4. **Naming Alignment**: Component names should follow both Foundation for Sites component names from their docs AND their CSS class names (e.g., `Accordion` from docs → `.accordion` class, `Reveal` from docs → `.reveal` class)

### Implementation Hierarchy

When building components, follow this priority order:

1. **@angular/aria** - Always use Angular ARIA building blocks first. Ask before falling back to alternatives.
2. **@angular/cdk** - Use CDK primitives when ARIA doesn't provide what's needed
3. **Custom Angular** - Only as a last resort when neither ARIA nor CDK suffices

### Building Blocks

Consider these Angular patterns as building blocks:

- `@defer` - For performance optimizations and lazy loading (preferred over IntersectionObserver)
- `@angular/cdk/portal` - For dynamic content projection
- `NgComponentOutlet` - For dynamic component rendering
- `NgTemplateOutlet` - For template-based content projection
- **Structural directives** - When attribute directives or components are not possible

### Storybook Stories

- Add **interaction tests** to component stories using Storybook's play functions
- Cover user interactions, state changes, and accessibility behaviors

### Visual Testing with Playwright

Use the Playwright MCP server to:

- Inspect component stories in Storybook
- Compare implementations against Foundation for Sites docs
- Verify behavior matches Angular ARIA and Angular CDK examples

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Workspace

This is an integrated Nx monorepo with Angular support.

- Apps in `apps/`, libraries in `packages/`
- Selector prefix: `nfs-` (components), `nfs` (directives)

## Testing

- **Unit tests**: Vitest
- **E2E tests**: Playwright
- **Verification**: `npm run ci` (or individual tasks: `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`)

## Tooling

- Stylesheets: SCSS
- Linting: ESLint (flat config)
- Formatting: Prettier (single quotes) - `npm run format` to fix, `npm run format:check` to verify

## Git

- Do NOT use `git -C "<absolute-repo-path>"` commands. Assume the shell is already in the repository root unless a `cd` command was previously used in the session.
- If uncertain about the current directory, check with `pwd` (Unix) or `cd` (Windows) before running git commands.
- Run git commands directly (e.g., `git status`, `git diff`) without path specifiers.

## Storybook

Component development and visual testing uses Storybook on port 4400.

- **Dev server**: `npm run storybook`
- **Build**: `npx nx build-storybook ngx-foundation-sites`
- **Test**: `npx nx test-storybook ngx-foundation-sites`
- **Kill process**: `npm run kill-storybook` (kills any process on port 4400)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
