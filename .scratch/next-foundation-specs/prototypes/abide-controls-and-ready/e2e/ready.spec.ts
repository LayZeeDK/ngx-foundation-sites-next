// PROTOTYPE case 3: the ready gate (ADR 0027). A submit control bound to
// [disabled]="!abide.ready()" must block a pre-hydration click and Enter with no navigation
// and no query string, on a server-rendered route, a prerendered route, and inside
// `@defer (hydrate on interaction)`, then work after hydration.
import { expect, test, type Page } from '@playwright/test';

const DELAY_MS = 4000;
const hydrated = (page: Page) => page.locator('html[data-hydrated]');

async function delayMainBundle(page: Page, path: string, errors: string[]): Promise<void> {
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
    }
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/\/main-[A-Z0-9]+\.js$/, async (route) => {
    await new Promise((r) => setTimeout(r, DELAY_MS));
    await route.continue();
  });
  await page.goto(path, { waitUntil: 'commit' });
  await page.getByRole('button', { name: 'Submit' }).first().waitFor();
}

for (const path of ['/ready', '/prerender']) {
  test(`pre-hydration click and Enter are blocked on ${path} (RenderMode.${
    path === '/ready' ? 'Server' : 'Prerender'
  })`, async ({ page }) => {
    const errors: string[] = [];
    const startUrl = new URL(path, 'http://x').pathname;
    await delayMainBundle(page, path, errors);
    const form = page.getByRole('form', { name: 'Ready gate' });
    const email = form.getByLabel('Email');
    const submit = form.getByRole('button', { name: 'Submit' });

    await expect(submit).toBeDisabled();
    await submit.click({ force: true }); // a native disabled button ignores this
    await email.pressSequentially('larsbrinknielsen@gmail.com');
    await email.press('Enter'); // implicit submission is blocked while the default button is disabled
    expect(await hydrated(page).count()).toBe(0); // still pre-hydration

    await page.waitForTimeout(500);
    expect(new URL(page.url()).pathname).toBe(startUrl);
    expect(new URL(page.url()).search).toBe('');

    await expect(hydrated(page)).toHaveCount(1, { timeout: DELAY_MS + 10000 });
    await expect(submit).toBeEnabled();
    // The typed value survived (event-based adoption) and the field is ready to submit.
    await expect(email).toHaveValue('larsbrinknielsen@gmail.com');
    await submit.click();
    await expect(form.locator('output')).toHaveText(/submitted:/);
    expect(errors).toEqual([]);
  });
}

test('@defer (hydrate on interaction): the triggering Enter neither navigates nor submits pre-hydration', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
    }
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/defer');
  const form = page.getByRole('form', { name: 'Ready gate' });
  const email = form.getByLabel('Email');
  const submit = form.getByRole('button', { name: 'Submit' });

  await expect(submit).toBeDisabled(); // server HTML: ready() is false before this block hydrates
  // A single keystroke is both the block's hydration trigger and the pre-hydration submit
  // attempt (Enter); the disabled default button must still block implicit submission. A
  // short, single keystroke avoids the race documented below (typing a full string while
  // hydration is in flight mid-stream can drop a character; not what this case tests).
  await email.pressSequentially('x');
  await email.press('Enter');
  await page.waitForTimeout(500);
  expect(new URL(page.url()).pathname).toBe('/defer');
  expect(new URL(page.url()).search).toBe('');

  await expect(submit).toBeEnabled({ timeout: 10000 }); // the block has now hydrated
  await expect(email).toHaveValue('x');
  // Post-hydration: submit works normally.
  await email.fill('larsbrinknielsen@gmail.com');
  await submit.click();
  await expect(form.locator('output')).toHaveText(/submitted:/);
  expect(errors).toEqual([]);
});

test('@defer (hydrate on interaction): typing a full value through the hydration transition can drop a character', async ({
  page,
}) => {
  // Documents a race distinct from the gate itself (see README "What the prototype does not
  // prove" / OPEN FOR HUMAN): the first keystroke both types a character AND triggers the
  // block's hydration; FormField's first write can race with the event-based adoption rescue
  // for keystrokes that land while hydration is still in flight, sometimes dropping one
  // character. Recorded as an annotation, not asserted pass/fail: the ticket's case 3 does not
  // require full-string integrity through this specific transition (case 2 covers value
  // adoption once hydration itself is not racing mid-keystroke).
  await page.goto('/defer');
  const form = page.getByRole('form', { name: 'Ready gate' });
  const email = form.getByLabel('Email');
  await email.pressSequentially('larsbrinknielsen@gmail.com');
  await page.waitForTimeout(500);
  const value = await email.inputValue();
  test.info().annotations.push({
    type: 'defer mid-typing race',
    description: `typed "larsbrinknielsen@gmail.com", got "${value}"`,
  });
  // eslint-disable-next-line no-console
  console.log(`[defer mid-typing race] ${test.info().project.name}: got "${value}"`);
});
