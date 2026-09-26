// PROTOTYPE: server HTML and event replay. The main bundle is delayed so the user acts
// on the server-rendered (dehydrated) form; assertions run after hydration.
import { expect, test, type Page } from '@playwright/test';

const INVALID = /(^|\s)is-invalid-input(\s|$)/;
const VISIBLE = /(^|\s)is-visible(\s|$)/;
const DELAY_MS = 4000;

async function delayMainBundle(page: Page, errors: string[]): Promise<void> {
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
  // Not domcontentloaded: it waits for deferred module scripts, i.e. for the delayed bundle.
  await page.goto('/', { waitUntil: 'commit' });
  await page.getByRole('button', { name: 'Submit' }).first().waitFor();
}

const hydrated = (page: Page) => page.locator('html[data-hydrated]');

test('server HTML is the pristine form: no error classes, alerts hidden, replay annotations', async ({
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/is-invalid-input|is-invalid-label|aria-invalid/);
  expect(html).not.toMatch(/class="[^"]*\bis-visible\b/);
  expect(html.match(/<div data-abide-error="" role="alert" hidden=""/g)).toHaveLength(5);
  const emailInput = html.match(/<input type="email"[^>]*change-email-hint[^>]*>/)?.[0] ?? '';
  test.info().annotations.push({ type: 'server input', description: emailInput });
  // (keydown.enter) goes through the key-events plugin and is not annotated for replay.
  expect(emailInput).toContain('jsaction="change:;input:;blur:;"');
  // FormField names come from a process-wide counter: they differ per request on the server.
  expect(emailInput).toMatch(/name="ng\.form\d+\.email"/);
  expect(html).toMatch(/<form novalidate=""[^>]*jsaction="submit:;"/);
});


test('input, change, blur/focusout before hydration replay (prototype fixes on)', async ({ page }) => {
  const errors: string[] = [];
  await delayMainBundle(page, errors);
  const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
  const live = page.getByRole('form', { name: 'liveValidate' });
  const email = form.getByLabel('Email');
  const agree = form.getByLabel('I agree');

  await email.pressSequentially('x');
  await email.blur(); // blur + focusout + change
  await agree.check();
  await agree.uncheck();
  await live.getByLabel('I agree').check();
  await live.getByLabel('Email').pressSequentially('larsbrinknielsen@gmail.com');
  expect(await hydrated(page).count()).toBe(0); // all of the above happened before hydration

  await expect(hydrated(page)).toHaveCount(1, { timeout: DELAY_MS + 10000 });
  await expect(email).toHaveValue('x');
  await expect(email).toHaveClass(INVALID);
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByText('Enter a valid email address.')).toHaveClass(VISIBLE);
  await expect(agree).not.toBeChecked();
  await expect(agree).toHaveClass(INVALID); // replayed change on the checkbox
  await expect(live.getByLabel('I agree')).toBeChecked();
  await expect(live.getByLabel('Email')).toHaveValue('larsbrinknielsen@gmail.com');
  await page.waitForTimeout(300);
  await expect(live.getByLabel('I agree')).not.toHaveClass(INVALID);
  await expect(live.getByLabel('Email')).not.toHaveClass(INVALID);
  expect(errors).toEqual([]);
});

test('without the rescue, pre-hydration text and checks are overwritten at hydration', async ({
  page,
}) => {
  const errors: string[] = [];
  await delayMainBundle(page, errors);
  const off = page.getByRole('form', { name: 'Default policy with the prototype fixes off' });
  const reactive = page.getByRole('form', { name: /Reactive Forms/ });
  await off.getByLabel('Email').pressSequentially('x');
  await off.getByLabel('Email').blur();
  await off.getByLabel('I agree').check();
  await reactive.getByLabel('Name').pressSequentially('Ann');
  await reactive.getByLabel('Name').blur();
  expect(await hydrated(page).count()).toBe(0);

  await expect(hydrated(page)).toHaveCount(1, { timeout: DELAY_MS + 10000 });
  await page.waitForTimeout(500);
  // FormField's first update pass writes the model ('' / false) into the reused server node;
  // the replayed input/change then read the overwritten control. The replayed change still
  // sets the error state, so the user sees an empty field flagged invalid.
  await expect(off.getByLabel('Email')).toHaveValue('');
  await expect(off.getByLabel('Email')).toHaveClass(INVALID);
  await expect(off.getByLabel('I agree')).not.toBeChecked();
  // Reactive Forms (DefaultValueAccessor.writeValue at setup) behaves the same way.
  await expect(reactive.getByLabel('Name')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('submit before hydration is a native GET submission: page reloads, nothing replays', async ({
  page,
}) => {
  const errors: string[] = [];
  await delayMainBundle(page, errors);
  const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
  await form.getByLabel('Email').pressSequentially('x');
  await form.getByLabel('Password', { exact: true }).pressSequentially('hunter2');
  await form.getByRole('button', { name: 'Submit' }).click();
  expect(await hydrated(page).count()).toBe(0);
  await expect(hydrated(page)).toHaveCount(1, { timeout: DELAY_MS * 2 + 10000 });
  await page.waitForTimeout(500);
  // FormRoot's novalidate and FormField's server-rendered name="ng.formN.<key>" make the
  // dehydrated form submit natively (GET to the same URL), password included.
  expect(page.url()).toMatch(/\?ng\.form\d+\.email=x&ng\.form\d+\.password=hunter2&/);
  const f2 = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
  await expect(f2.getByLabel('Email')).toHaveValue('');
  await expect(f2.getByLabel('Email')).not.toHaveClass(INVALID);
  await expect(f2.locator('[data-abide-error]')).toBeHidden(); // the submit did not replay
  expect(errors).toEqual([]);
});
