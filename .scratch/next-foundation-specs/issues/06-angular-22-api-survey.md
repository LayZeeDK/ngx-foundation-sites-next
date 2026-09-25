# 06. Modern Angular 22.2 API survey

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which Angular 22.2 APIs are available, at what stability, for building a directive-first component library, and what do they look like? The specs must be written against these, not against Angular 21 habits.

Cover at minimum: `signal`, `computed`, `effect`, `linkedSignal`, `resource` / `rxResource` / `httpResource`, `input` / `model` / `output`, `viewChild` / `contentChildren` and friends, `afterRenderEffect` and `afterNextRender`, host directives, `host` bindings, `@defer`, `animate.enter` / `animate.leave` and the state of `@angular/animations` (deprecated?), native CSS animation guidance, Signal Forms (`@angular/forms/signals`: `form`, `FormField`, schema validators, `Field` directive, stability), route-level features (route resources, `withComponentInputBinding`, `withViewTransitions`, `withInMemoryScrolling` and anchor scrolling), zoneless default, hydration and SSR constraints for DOM-touching directives, `DOCUMENT` and `PLATFORM_ID` replacements, `inject` options, `DestroyRef`, `ElementRef` and `Renderer2` guidance, the Vitest unit-test builder, and TypeScript 7 support.

Method:

1. Read the docs in the local clone first: `d:/projects/github/angular/angular/adev/src/content/guide/{signals,animations,forms,templates,components,directives,routing,testing}/**` and `d:/projects/github/angular/angular/adev/src/content/reference/**`. Version is 22.2.0 (release branch 22.2.x). Also read the `angular-developer` skill references under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/` (notably `signal-forms.md`, `angular-animations.md`, `angular-aria.md`, `resource.md`, `linked-signal.md`, `effects.md`, `host-elements.md`, `naming-conventions.md`, `data-resolvers.md`) and record where they and the clone disagree.
2. Use https://www.angular.courses/caniuse through the `/playwright-cli` skill to list the modern APIs it tracks and the version each became available or stable; capture that table. Load the skill file at `~/.claude/skills/playwright-cli/SKILL.md` for the command set. Close the browser when done.
3. Use the `angular-cli` MCP `search_documentation` tool (load it with ToolSearch, pass `version: 22`, `includeTopContent: true`) to confirm stability labels on angular.dev for anything the clone leaves ambiguous. Prefer markdown.new for full pages: POST JSON `{"url": "<target_url>", "method": "auto", "retain_images": true}` to `https://markdown.new/`.

## Deliverable

`research/angular-22-api-survey.md`: one section per API family with stability (stable, developer preview, experimental), a minimal signature or usage sketch, the doc path or URL it came from, and a short "relevance to a component library" note. Include the caniuse table. Plain ASCII.
