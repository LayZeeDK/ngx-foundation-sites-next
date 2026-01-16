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
5. **Input Naming**: Component inputs should match Foundation's naming conventions:
   - Use Foundation's `data-*` attribute names in camelCase (e.g., `data-multi-expand` → `multiExpand`)
   - Document the Foundation equivalent in JSDoc comments
   - **Default values MUST match Foundation defaults**, unless doing so would conflict with accessibility requirements (in which case document the a11y reason)
   - Note: Sass boolean variables (e.g., `$accordion-plusminus`) are compile-time configuration, not Angular inputs
6. **Token Naming**: Injection tokens should use camelCase with a `Token` suffix (e.g., `nfsAccordionToken`)
7. **Foundation JavaScript API Parity**: Components MUST expose Angular equivalents for Foundation's JavaScript plugin methods and events using the same names where possible (e.g., accordion's `toggle()`, `down()`, `up()` methods and `down`/`up` events). If a name would clash on the same Angular class (input vs output vs method), keep the Foundation names across the component set but avoid the clash. Exceptions: `destroy()` is handled via Angular lifecycle / `DestroyRef`, and `init()` is handled by Angular auto-initialization.

### Styling Guidelines

**Prefer Foundation's existing styles over custom CSS.** The goal is to leverage Foundation's battle-tested CSS rather than duplicating or overriding it.

1. **Always apply Foundation's CSS classes** — Use the same class names Foundation expects (`.accordion`, `.accordion-item`, `.accordion-title`, etc.)

2. **Use Foundation's state classes** — Apply state classes like `.is-active`, `.is-open`, `.disabled` via Angular class bindings:

   ```html
   <li class="accordion-item" [class.is-active]="item.expanded()"></li>
   ```

3. **Only add custom CSS when necessary** — Valid reasons include:
   - Using a different HTML element for accessibility (e.g., `<button>` instead of `<a>` may need `width: 100%`)
   - Integrating with Angular-specific features (e.g., animation hooks)
   - Bridging ARIA attributes to Foundation's class-based styling

4. **Document custom CSS** — When custom styles are unavoidable, add a comment explaining why:
   ```css
   /* Button elements need explicit width (Foundation assumes <a> elements) */
   .accordion-title {
     width: 100%;
   }
   ```

### Implementation Hierarchy

When building components, follow this priority order:

1. **@angular/aria** - Always use Angular ARIA building blocks first. Ask before falling back to alternatives.
2. **@angular/cdk** - Use CDK primitives when ARIA doesn't provide what's needed
3. **Custom Angular** - Only as a last resort when neither ARIA nor CDK suffices

### Component vs Directive Choice

**Prefer directives over components when possible.** Use this decision tree:

1. **Directive** - When the element:
   - Adds behavior or styling to existing DOM elements
   - Doesn't need a template or its own view
   - Enhances content without wrapping it
   - Can leverage Foundation CSS classes applied to host elements
   - Examples: `[nfsAccordionContent]`, `[nfsButton]`, `[nfsTooltip]`, `[nfsDropdownToggle]`

2. **Component** - When the element:
   - Renders its own template and manages view logic
   - Has complex internal structure (header, body, footer)
   - Needs lifecycle hooks for DOM manipulation
   - Requires content projection with multiple slots
   - Examples: `<nfs-accordion>`, `<nfs-modal>`, `<nfs-tabs>`

**Key principle**: Because Foundation component styles are loaded programmatically (not via component styleUrls), directives can apply Foundation CSS classes to host elements without needing a component wrapper. For example, a `[nfsButton]` directive can add `.button` classes to a consumer's `<button>` element directly, avoiding unnecessary component overhead.

When in doubt, start with a directive and refactor to a component only if template complexity demands it.

### Content Projection and DI

When building components that support content projection (e.g., `<nfs-accordion>` containing `<nfs-accordion-item>`), follow this pattern to avoid DI failures:

1. **Export the injection token** so consumers can provide alternatives
2. **Use optional injection** with `skipSelf` in child components
3. **Allow standalone usage** when parent is not required

Example:

```typescript
// Token file
export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');

// Parent component
@Component({
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion { ... }

// Child component (content-projected)
export class NfsAccordionItem {
  readonly accordion = inject(nfsAccordionToken, { optional: true, skipSelf: true });
}
```

This pattern is required because Angular's DI for content-projected elements follows the **declaration site** injector, not the DOM tree.

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

### Storybook Demo Styling

When writing Storybook stories, **prefer Foundation Prototype utility classes over inline styles**:

1. **Spacing** (values: 0=0, 1=1rem, 2=2rem, 3=3rem):
   - `.margin-0` through `.margin-3` (all sides)
   - `.margin-top-1`, `.margin-bottom-2`, `.margin-left-1`, `.margin-right-1`
   - `.padding-0` through `.padding-3` with same directional variants

2. **Display & Overflow**:
   - `.display-inline`, `.display-block`, `.display-inline-block`
   - `.overflow-hidden`, `.overflow-scroll`, `.overflow-x-scroll`

3. **Lists**:
   - `.no-bullet`, `.list-disc`, `.list-circle`, `.list-square`

4. **Text Colors** (use utility classes for theme colors):
   - `.text-primary`, `.text-secondary`, `.text-success`, `.text-warning`, `.text-alert`

5. **Keep inline styles only for**:
   - CSS custom property demonstrations (`--nfs-*`)
   - `[style.--nfs-*]` bindings for interactive controls
   - Values not available in Foundation (e.g., arbitrary pixel values)
   - Semantic attributes like `dir="rtl"`

**Note:** These utilities are only available in Storybook (not in the public API). Values must match Foundation's scale (0, 1rem, 2rem, 3rem) — adjust non-standard values to the nearest option.

### Visual Testing with Playwright

**Always use the Playwright MCP server** (not WebFetch) when you need to browse websites visually. Playwright provides accurate rendering, interactive capabilities, and screenshots that are essential for component development.

#### Playwright as WebFetch Fallback

**When WebFetch fails** (403 Forbidden, paywall, JavaScript-required content), use Playwright MCP as a fallback:

1. **403 Forbidden** — Many sites block automated requests. Use `browser_navigate` instead.
2. **Paywalled content** — Medium, news sites may show previews. Use `browser_snapshot` to capture visible content.
3. **JavaScript-rendered content** — SPAs won't work with WebFetch. Playwright renders the full page.

```
WebFetch fails with 403
  ↓
MCPSearch → select:mcp__playwright__browser_navigate
  ↓
browser_navigate to URL
  ↓
browser_snapshot to extract content
  ↓
browser_close when done
```

#### When to Use Playwright

Use the Playwright MCP tools for:

- **Inspecting Storybook stories** — View component rendering, test interactions, verify styling
- **Comparing against Foundation docs** — Ensure components match Foundation for Sites examples
- **Referencing Angular docs** — Verify ARIA patterns and framework best practices
- **Referencing Angular Material docs** — CDK primitives and component API design patterns
- **Debugging visual issues** — Take screenshots, inspect accessibility trees

#### Key Reference Sites

| Site                     | URL                                  | Use Case                                               |
| ------------------------ | ------------------------------------ | ------------------------------------------------------ |
| **Storybook (local)**    | `http://localhost:4400`              | Component development and testing                      |
| **Foundation for Sites** | `https://get.foundation/sites/docs/` | CSS classes, component structure, design patterns      |
| **Angular Docs**         | `https://angular.dev`                | Framework APIs, @angular/aria patterns                 |
| **Angular Material**     | `https://material.angular.dev`       | @angular/cdk primitives, component API design patterns |

#### Playwright Workflow

1. **Navigate** — Use `browser_navigate` to open the target URL
2. **Snapshot** — Use `browser_snapshot` to get the accessibility tree (preferred for interactions)
3. **Screenshot** — Use `browser_take_screenshot` when you need visual verification
4. **Interact** — Use `browser_click`, `browser_type`, etc. to test component behavior
5. **Close** — Use `browser_close` when done to free resources

#### Example: Comparing with Foundation Docs

```
1. browser_navigate to Foundation's accordion docs
2. browser_snapshot to understand the expected HTML structure
3. browser_navigate to local Storybook accordion story
4. browser_snapshot to compare our implementation
5. Verify CSS classes and ARIA attributes match
```

**Note:** Ensure Storybook is running (`npx nx storybook ngx-foundation-sites`) before browsing localhost:4400.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Member Visibility

Use these guidelines for class member visibility (ensures proper runtime privacy and clean Storybook Controls):

- **`#` (ES private fields)**: Use for truly private members not accessed by templates or Angular APIs
- **`protected`**: Use for members accessed by component templates OR Angular signal queries (`viewChild`, `contentChild`, `contentChildren`) — Angular needs compile-time access so `#` cannot be used
- **`public` (no modifier)**: Use for the component's public API (`input()`, `output()`, public methods)

Do NOT use TypeScript's `private` keyword — use `#` for true runtime privacy instead.

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

### Testing Strategy

**Prefer Storybook interactive tests over component unit tests.** Storybook's play functions provide better documentation-as-tests and cover real user interactions in a browser environment.

| Test Type             | Tool                     | Use Case                                                      |
| --------------------- | ------------------------ | ------------------------------------------------------------- |
| **Interactive tests** | Storybook play functions | UI interactions, state changes, a11y checks                   |
| **E2E tests**         | Playwright               | Web-native APIs not testable in Storybook (History API, etc.) |
| **Unit tests**        | Vitest                   | Pure functions, services, complex logic (rare)                |

### Storybook Interactive Tests (Primary)

Use Storybook play functions for most component testing:

```typescript
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Interaction test
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    // a11y check
    await expect(button).toBeAccessible();
  },
};
```

### Playwright E2E Tests (Web-Native APIs)

Use Playwright e2e tests when testing features that require real browser APIs not available in Storybook's test environment:

- **History API** (deep linking, URL hash changes, pushState/replaceState)
- **Navigation** (page reloads, back/forward)
- **Storage APIs** (localStorage, sessionStorage persistence)
- **Viewport-dependent behaviors** (responsive breakpoints)

**Always use `getBy*` locators instead of `page.locator()`** for more resilient, semantically meaningful tests:

| Locator Method | Use Case                                       | Example                                        |
| -------------- | ---------------------------------------------- | ---------------------------------------------- |
| `getByRole`    | Semantic elements (buttons, regions, headings) | `page.getByRole('button', { name: 'Submit' })` |
| `getByTestId`  | Elements without semantic roles                | `page.getByTestId('accordion-header-1')`       |
| `getByText`    | Text content matching                          | `page.getByText('Panel 1')`                    |
| `getByLabel`   | Form fields by label                           | `page.getByLabel('Email')`                     |

**Consider Angular ARIA runtime attributes:** Components using `@angular/aria` directives add semantic roles and ARIA attributes at runtime (e.g., `role`, `aria-expanded`, `aria-controls`). These aren't visible in the static template but enable semantic `getBy*` queries. Before writing locators, inspect the rendered DOM via Playwright MCP's `browser_snapshot` or `browser_evaluate` to identify queryable attributes.

**When `page.locator()` is acceptable:**

- Querying non-semantic DOM elements (e.g., `link[href$=".css"]` for stylesheets)
- Technical checks on HTML attributes (e.g., `html` element direction)
- Pseudo-element inspection via `evaluate()`

Navigate to Storybook's **iframe story view** for isolation:

```typescript
// packages/ngx-foundation-sites-e2e/src/example.spec.ts
test('deep link updates URL hash', async ({ page }) => {
  // Use iframe view for isolated story testing
  await page.goto('/iframe.html?id=components-accordion--deep-link&viewMode=story');

  // Test History API integration - use getByRole, not locator
  await page.getByRole('button', { name: /Section 2/ }).click();
  await expect(page).toHaveURL(/#section-2$/);
});
```

### Verification

- **Full CI**: `npm run ci`
- **Individual tasks**: `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`

## Tooling

- Stylesheets: SCSS
- Linting: ESLint (flat config)
- Formatting: Prettier (single quotes) - `npm run format` to fix, `npm run format:check` to verify

## Shell & Git

- Assume the shell is already in the repository root unless a `cd` command was previously used in the session.
- If uncertain about the current directory, check with `pwd` (Unix) or `cd` (Windows) before running commands.
- Do NOT use commands that embed absolute paths to change directories:
  - `git -C "<absolute-repo-path>"` — run git commands directly instead
  - `cd /d <absolute-repo-path> && ...` — run commands directly instead
  - `Push-Location "<absolute-repo-path>"; ...; Pop-Location` — run commands directly instead
  - `Set-Location "<absolute-repo-path>"` with absolute paths — use relative paths or run directly
- Run git commands directly (e.g., `git status`, `git diff`) without path specifiers.

## Storybook

Component development and visual testing uses Storybook on port 4400.

- **Dev server**: `npx nx storybook ngx-foundation-sites`
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
