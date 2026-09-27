import { Page, test } from '@playwright/test';

// Re-judge of ticket 74: the specs' current recipe (a signal updated from Location.onUrlChange) after
// a parameter change and a query change started inside the routed OnPush page, and after a navigation
// started from the application shell; plus the vsalt lens's unmeasured case: the template-call form
// (angular.dev's) after a shell-started navigation. Rule B routes only (the rule does not matter for
// hrefs that do not start with '#'). Observations only; the only assertion is that the page loaded.

function note(label: string, value: unknown): void {
  test.info().annotations.push({ type: label, description: JSON.stringify(value) });
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text().slice(0, 160));
    }
  });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));

  return errors;
}

async function waitHydrated(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as unknown as { __hydrated?: boolean }).__hydrated === true, null, {
    timeout: 15_000,
  });
}

async function links(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const w = window as unknown as { __docId: string };
    const attr = (id: string) => document.querySelector(`[data-testid=${id}]`)?.getAttribute('href') ?? null;

    return {
      docId: w.__docId,
      documentURL: document.URL,
      pathField: document.querySelector('[data-testid=path]')?.textContent ?? null,
      cSafe: attr('c-safe'),
      cLive: attr('c-live'),
      cUrl: attr('c-url'),
      shellUrl: attr('shell-url'),
    };
  });
}

async function observe(page: Page): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await page.waitForLoadState('load');

      return await page.evaluate(() => {
        const w = window as unknown as { __docId: string; __events: string[]; __nfsClicks: Record<string, unknown>[] };
        const active = document.activeElement as HTMLElement | null;

        return {
          docId: w.__docId,
          url: location.pathname + location.search + location.hash,
          historyLength: history.length,
          scrollY: Math.round(scrollY),
          homeMarker: !!document.querySelector('[data-testid=home-marker]'),
          active: active ? active.getAttribute('data-testid') || active.id || active.tagName : null,
          events: w.__events,
          clicks: w.__nfsClicks,
        };
      });
    } catch {
      await page.waitForTimeout(500);
    }
  }

  return { error: 'could not evaluate' };
}

async function targetTop(page: Page, id: string): Promise<number> {
  return page.evaluate((i) => {
    const el = document.getElementById(i);

    return el ? Math.round(el.getBoundingClientRect().top + scrollY) : -1;
  }, id);
}

async function navigate(page: Page, via: string, urlGlob: string): Promise<Record<string, unknown>> {
  await page.goto('/param-b/x');
  await waitHydrated(page);
  const before = await links(page);
  await page.getByTestId(via).click();
  await page.waitForURL(urlGlob);
  await page.waitForTimeout(300);
  const after = await links(page);
  note('before-nav', before);
  note('after-nav', after);
  note('componentReused', before['docId'] === after['docId'] && before['pathField'] === after['pathField']);

  return after;
}

const cases: { name: string; via: string; url: string; link: string }[] = [
  { name: 'onUrlChange recipe in the page, after a parameter change from the page', via: 'go-b-y', url: '**/param-b/y', link: 'c-url' },
  { name: 'onUrlChange recipe in the page, after a query change from the page', via: 'go-b-yq', url: '**/param-b/y?q=1', link: 'c-url' },
  { name: 'onUrlChange recipe in the page, after a parameter change from the shell', via: 'shell-go-b-y', url: '**/param-b/y', link: 'c-url' },
  { name: 'template-call form in the page, after a parameter change from the shell', via: 'shell-go-b-y', url: '**/param-b/y', link: 'c-live' },
  { name: 'onUrlChange recipe in the shell, after a parameter change from the shell', via: 'shell-go-b-y', url: '**/param-b/y', link: 'shell-url' },
];

for (const c of cases) {
  test(c.name, async ({ page }) => {
    const errors = collectErrors(page);
    const after = await navigate(page, c.via, c.url);
    const targetS3 = await targetTop(page, 's3');
    await page.getByTestId(c.link).click();
    await page.waitForTimeout(1500);
    const obs = await observe(page);
    note(`click-${c.link}`, { ...obs, targetS3, leftDocument: obs['docId'] !== after['docId'] });
    note('errors', errors);
  });
}
