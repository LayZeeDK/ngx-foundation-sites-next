# Phase 6: Angular Router Integration (Future Enhancement)

> **Status:** Deferred — Current native implementation is sufficient for initial release.

**Goal:** Provide optional Angular Router integration for deep linking, enabling seamless interoperability with Angular's navigation system.

## 6.1 Background: Why Both Native and Router Strategies?

| Use Case                                                    | Router Available? | Best Strategy             |
| ----------------------------------------------------------- | ----------------- | ------------------------- |
| Landing pages / One-pagers                                  | ❌ No             | Native                    |
| Widget libraries / Micro-frontends                          | ❌ No             | Native                    |
| Angular apps with path-based routing                        | ✅ Yes            | Either (Native works)     |
| Angular apps with hash-based routing (`useHash: true`)      | ✅ Yes            | **Router required**       |
| Apps using Router's `anchorScrolling` or scroll restoration | ✅ Yes            | Router (avoids conflicts) |

**Current limitation:** The native implementation conflicts with hash-based routing because both the accordion and router manipulate the URL hash.

## 6.2 Architecture: Dual Strategy with Auto-Detection

```
┌─────────────────────────────────────────────┐
│     AccordionDeepLinkService (Interface)    │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌──────────────────┐    ┌─────────────────────┐
│ NativeDeepLink   │    │ RouterDeepLink      │
│ (current impl)   │    │ (new)               │
├──────────────────┤    ├─────────────────────┤
│ location.hash    │    │ ActivatedRoute      │
│ history.pushState│    │ Router.navigate()   │
│ hashchange event │    │ fragment observable │
│ scrollIntoView() │    │ ViewportScroller    │
└──────────────────┘    └─────────────────────┘
```

## 6.3 Angular Router Scrolling APIs

**`withInMemoryScrolling()` options:**

```typescript
provideRouter(
  routes,
  withInMemoryScrolling({
    anchorScrolling: 'enabled', // Scroll to #fragment on navigation
    scrollPositionRestoration: 'top', // Reset to top, or restore previous position
  }),
);
```

| Option                      | Values                               | Default      | Behavior                                                          |
| --------------------------- | ------------------------------------ | ------------ | ----------------------------------------------------------------- |
| `anchorScrolling`           | `'disabled'` / `'enabled'`           | `'disabled'` | When `'enabled'`, Router scrolls to anchor on fragment navigation |
| `scrollPositionRestoration` | `'disabled'` / `'enabled'` / `'top'` | `'disabled'` | `'enabled'` restores previous position on back navigation         |

**`ViewportScroller` service:**

```typescript
abstract class ViewportScroller {
  setOffset(offset: [number, number]): void; // Global scroll offset (for fixed headers)
  scrollToAnchor(anchor: string): void; // Scroll to element by ID
  scrollToPosition(position: [number, number]): void;
}
```

**Benefits of `ViewportScroller.scrollToAnchor()`:**

- Respects `setOffset()` for fixed headers
- Integrates with Router's scroll management
- Works in SSR contexts (can be mocked)

## 6.4 Key Insight: Fragment vs Hash Routing

```typescript
// Router fragment (works with ANY routing strategy, including useHash)
this.router.navigate(['/products'], { fragment: 'panel-1' });
// → example.com/products#panel-1  (path strategy)
// → example.com/#/products#panel-1  (hash strategy - fragment is separate!)

// Reading fragment
this.route.fragment.subscribe((fragment) => console.log(fragment));
```

The Router treats fragment as metadata, separate from the route path — this is why the Router strategy works correctly even with hash-based routing.

## 6.5 Implementation Plan

### Files to Create

| File                                    | Purpose                                |
| --------------------------------------- | -------------------------------------- |
| `accordion-deep-link.interface.ts`      | Extract interface from current service |
| `router-accordion-deep-link.service.ts` | Router-based implementation            |
| `accordion-deep-link.provider.ts`       | Factory provider with auto-detection   |

### Files to Modify

| File                             | Changes                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| `accordion-deep-link.service.ts` | Rename class to `NativeAccordionDeepLinkService`, implement interface |
| `accordion.ts`                   | Inject via token instead of concrete class                            |
| `index.ts`                       | Export new types and provider function                                |

## 6.6 Provider API

```typescript
// Auto-detect: uses Router strategy if Router is available
provideAccordionDeepLink();

// Explicit native (for landing pages without Router)
provideAccordionDeepLink('native');

// Explicit router (force Router strategy)
provideAccordionDeepLink('router');
```

**Factory implementation:**

```typescript
export const ACCORDION_DEEP_LINK_SERVICE = new InjectionToken<AccordionDeepLinkService>('AccordionDeepLinkService');

export function provideAccordionDeepLink(strategy: 'native' | 'router' | 'auto' = 'auto') {
  return {
    provide: ACCORDION_DEEP_LINK_SERVICE,
    useFactory: (router?: Router, route?: ActivatedRoute, scroller?: ViewportScroller) => {
      if (strategy === 'native') return new NativeAccordionDeepLinkService();
      if (strategy === 'router') return new RouterAccordionDeepLinkService(router!, route!, scroller!);
      // 'auto' - detect if Router is available
      return router ? new RouterAccordionDeepLinkService(router, route!, scroller!) : new NativeAccordionDeepLinkService();
    },
    deps: [
      [new Optional(), Router],
      [new Optional(), ActivatedRoute],
      [new Optional(), ViewportScroller],
    ],
  };
}
```

## 6.7 RouterAccordionDeepLinkService Implementation

```typescript
@Injectable()
export class RouterAccordionDeepLinkService implements AccordionDeepLinkService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly scroller = inject(ViewportScroller);

  getHashPanelId(): string | null {
    return this.route.snapshot.fragment;
  }

  updateHash(panelId: string, useHistory: boolean): void {
    this.router.navigate([], {
      fragment: panelId,
      replaceUrl: !useHistory, // replaceUrl=true → replaceState behavior
    });
  }

  clearHash(useHistory: boolean): void {
    this.router.navigate([], {
      fragment: undefined,
      replaceUrl: !useHistory,
    });
  }

  scrollToPanel(panelId: string, delay = 300): void {
    setTimeout(() => {
      this.scroller.scrollToAnchor(panelId);
    }, delay);
  }

  onHashChange(callback: (panelId: string | null) => void): () => void {
    const subscription = this.route.fragment.subscribe((fragment) => {
      callback(fragment ?? null);
    });
    return () => subscription.unsubscribe();
  }
}
```

## 6.8 Documentation Note

Add to accordion component documentation:

> **Note on Angular Router:** The deep linking feature uses native browser APIs by default and works
> with Angular Router's default path-based routing. If you use hash-based routing (`useHash: true`),
> or Router's `anchorScrolling`/`scrollPositionRestoration` options, add `provideAccordionDeepLink()`
> to your providers for seamless Router integration.

## 6.9 Test Cases (Future)

| Test Case                    | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| Auto-detect with Router      | Verify Router strategy is used when Router is provided     |
| Auto-detect without Router   | Verify Native strategy is used when Router is absent       |
| Explicit native with Router  | Verify Native strategy when explicitly requested           |
| Fragment navigation          | Verify `Router.navigate()` is called with correct fragment |
| Fragment subscription        | Verify `ActivatedRoute.fragment` updates trigger callbacks |
| ViewportScroller integration | Verify `scrollToAnchor()` is called with offset support    |
| Hash routing compatibility   | Verify works correctly with `useHash: true`                |

## 6.10 References

- [Angular ViewportScroller API](https://angular.dev/api/common/ViewportScroller)
- [withInMemoryScrolling()](https://angular.dev/api/router/withInMemoryScrolling)
- [Router.navigate() fragment option](https://angular.dev/api/router/NavigationExtras#fragment)
- Current implementation: `src/lib/accordion/accordion-deep-link.service.ts`
