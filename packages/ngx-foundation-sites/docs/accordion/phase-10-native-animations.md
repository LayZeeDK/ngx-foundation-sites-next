# Phase 10: Revert to `ngAccordionContent` + Native Animations (✅ Completed)

> **Status:** ✅ Completed (January 2026)
>
> PR [angular/components#32591](https://github.com/angular/components/pull/32591) merged January 2, 2026.
> Available in @angular/aria 21.0.6+. Implemented with AccordionContent directive and preserveContent=false (default).

**Goal:** Restore the original implementation using Angular ARIA's `AccordionContent` directive with `animate.enter`/`animate.leave` for smoother animations.

## 10.1 Background

The original implementation used:

```html
<ng-template ngAccordionContent>
  <div class="accordion-content-inner" animate.enter="nfs-accordion-enter" animate.leave="nfs-accordion-leave">
    <!-- content -->
  </div>
</ng-template>
```

This approach provides:

- **Native Angular animations** via `animate.enter`/`animate.leave` with `@starting-style`
- **Deferred content loading** via `AccordionContent` directive
- **`preserveContent` support** to keep content in DOM during animations

## 10.2 Current Workaround

Due to [NG3004: Unable to import symbol DeferredContentAware](./ANGULAR_ARIA_BUG_REPORT.md), the library currently uses `@defer (when expanded)` instead of `AccordionContent`:

```html
<div class="accordion-content-inner">
  @defer (when item.expanded()) {
  <ng-container *ngTemplateOutlet="contentDef.templateRef" />
  }
</div>
```

**Trade-offs:**

| Aspect              | Original (`ngAccordionContent`)                    | Current (`@defer`)        |
| ------------------- | -------------------------------------------------- | ------------------------- |
| Animation           | `animate.enter`/`animate.leave` with CSS keyframes | CSS Grid transitions only |
| Deferred loading    | Via `DeferredContent` directive                    | Via `@defer` block        |
| Content persistence | `preserveContent` input                            | Automatic (once loaded)   |
| Library build       | ❌ NG3004 error                                    | ✅ Works                  |

## 10.3 When to Revert

Once [angular/components#32591](https://github.com/angular/components/pull/32591) is merged and released:

1. `DeferredContentAware` will be exported from `@angular/aria/accordion`
2. The `preserveContent` input binding will work in library builds
3. The original implementation can be restored

## 10.4 Implementation Steps

1. **Update imports** — Re-add `AccordionContent` to imports
2. **Restore template** — Replace `@defer` with `<ng-template ngAccordionContent>`
3. **Add animations** — Re-add `animate.enter`/`animate.leave` directives
4. **Add `preserveContent`** — Bind `[preserveContent]="true"` to keep content during animations
5. **Restore CSS** — Re-add `.nfs-accordion-enter`/`.nfs-accordion-leave` animation classes
6. **Update tests** — Adjust any tests affected by the change
7. **Remove workaround comment** — Delete the TODO comment in `accordion.ts`

## 10.5 Files to Modify

| File                         | Changes                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `accordion.ts`               | Restore `AccordionContent`, add `animate.enter`/`animate.leave`, add `[preserveContent]` |
| `accordion.spec.ts`          | Update tests if timing behavior changes                                                  |
| `ANGULAR_ARIA_BUG_REPORT.md` | Mark as resolved, add link to fix                                                        |

## 10.6 Tracking

- **PR:** [angular/components#32591](https://github.com/angular/components/pull/32591)
- **Bug Report:** [ANGULAR_ARIA_BUG_REPORT.md](./ANGULAR_ARIA_BUG_REPORT.md)
