// PROTOTYPE case 2: pre-hydration value adoption for every native input type and Reactive
// Forms, event-based (the spec's design) with the controlValue.set() fallback tested too.
import { expect, test, type Page } from '@playwright/test';

const DELAY_MS = 4000;
const hydrated = (page: Page) => page.locator('html[data-hydrated]');

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
  await page.goto('/', { waitUntil: 'commit' });
  await page.getByRole('button', { name: 'Submit' }).first().waitFor();
}

test('event-based adoption: every native control kind and Reactive Forms', async ({ page }) => {
  const errors: string[] = [];
  await delayMainBundle(page, errors);

  const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
  const reactive = page.getByRole('form', { name: 'Reactive Forms (NgControl courtesy)' });

  await form.getByLabel('Email').pressSequentially('x');
  await form.getByLabel('Pro').check();
  await form.getByLabel('News').check();
  await form.getByLabel('Country').selectOption('dk');
  await form.getByLabel(/^Bio/).pressSequentially('hello');
  await form.getByLabel('I accept the terms').check();

  await reactive.getByLabel('Name').pressSequentially('Ann');
  await reactive.getByLabel('Country').selectOption('us');
  await reactive.getByLabel('Basic').check();

  expect(await hydrated(page).count()).toBe(0); // everything above happened pre-hydration

  await expect(hydrated(page)).toHaveCount(1, { timeout: DELAY_MS + 10000 });
  await page.waitForTimeout(300); // let replay settle

  await expect(form.getByLabel('Email')).toHaveValue('x');
  await expect(form.getByLabel('Pro')).toBeChecked();
  await expect(form.getByLabel('News')).toBeChecked();
  await expect(form.getByLabel('Country')).toHaveValue('dk');
  await expect(form.getByLabel(/^Bio/)).toHaveValue('hello');
  await expect(form.getByLabel('I accept the terms')).toBeChecked();

  await expect(reactive.getByLabel('Name')).toHaveValue('Ann');
  await expect(reactive.getByLabel('Country')).toHaveValue('us');
  await expect(reactive.getByLabel('Basic')).toBeChecked();

  expect(errors).toEqual([]);
});

test('controlValue.set() fallback: same coverage as the event-based form', async ({ page }) => {
  const errors: string[] = [];
  await delayMainBundle(page, errors);

  const form = page.getByRole('form', {
    name: 'Default policy, controlValue.set() adoption fallback',
  });
  await form.getByLabel('Email').pressSequentially('x');
  await form.getByLabel('Pro').check();
  await form.getByLabel('News').check();
  await form.getByLabel('Country').selectOption('dk');
  await form.getByLabel(/^Bio/).pressSequentially('hello');
  await form.getByLabel('I accept the terms').check();
  expect(await hydrated(page).count()).toBe(0);

  await expect(hydrated(page)).toHaveCount(1, { timeout: DELAY_MS + 10000 });
  await page.waitForTimeout(300);

  await expect(form.getByLabel('Email')).toHaveValue('x');
  await expect(form.getByLabel('Pro')).toBeChecked();
  await expect(form.getByLabel('News')).toBeChecked();
  await expect(form.getByLabel('Country')).toHaveValue('dk');
  await expect(form.getByLabel(/^Bio/)).toHaveValue('hello');
  await expect(form.getByLabel('I accept the terms')).toBeChecked();

  expect(errors).toEqual([]);
});
