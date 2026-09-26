// PROTOTYPE case 1: explicit label/error/alert directives (ADR 0026) for every control kind
// -- radio group, checkbox group (min count), select, textarea, custom FormValueControl --
// plus the original text/password/checkbox fields, in Signal Forms and Reactive Forms.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const INVALID = /(^|\s)is-invalid-input(\s|$)/;
const INVALID_LABEL = /(^|\s)is-invalid-label(\s|$)/;
const VISIBLE = /(^|\s)is-visible(\s|$)/;

test.describe('Signal Forms: every control kind under the explicit directives', () => {
  test('invalid submit: classes, aria-invalid, aria-describedby, role=alert per control kind', async ({
    page,
  }) => {
    await page.goto('/');
    const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
    await form.getByRole('button', { name: 'Submit' }).click();

    // text (wrapping label)
    const email = form.getByLabel('Email');
    await expect(email).toHaveClass(INVALID);
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription(/We never share it\.\s*Enter your email address\./);

    // password / confirm (label[for], typed references)
    const password = form.getByLabel('Password', { exact: true });
    await expect(password).toHaveClass(INVALID);
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('A password is required.')).toHaveClass(VISIBLE);
    await expect(form.getByText('A password is required.')).toHaveAttribute('role', 'alert');

    // radio group: shared field state across all three radios; never aria-invalid
    for (const name of ['Basic', 'Pro', 'Enterprise']) {
      const radio = form.getByLabel(name);
      await expect(radio).toHaveClass(INVALID);
      await expect(radio).not.toHaveAttribute('aria-invalid');
    }
    await expect(form.getByText('Choose a plan.')).toHaveClass(VISIBLE);

    // checkbox group with a minimum count: each box invalid together (one validate() rule each)
    for (const name of ['News', 'Offers', 'Events']) {
      const box = form.getByLabel(name);
      await expect(box).toHaveClass(INVALID);
      await expect(box).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(form.getByText('Pick at least 2 topics.')).toHaveClass(VISIBLE);

    // select
    const country = form.getByLabel('Country');
    await expect(country).toHaveClass(INVALID);
    await expect(country).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Choose your country.')).toHaveClass(VISIBLE);

    // textarea
    const bio = form.getByLabel(/^Bio/);
    await expect(bio).toHaveClass(INVALID);
    await expect(bio).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Tell us something about you.')).toHaveClass(VISIBLE);

    // custom FormValueControl (star rating, linked by the wrapping label)
    const rating = form.locator('app-star-rating');
    await expect(rating).toHaveClass(INVALID);
    await expect(rating).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Pick at least one star.')).toHaveClass(VISIBLE);
    await expect(rating.locator('..')).toHaveClass(INVALID_LABEL); // the wrapping label

    // terms checkbox
    const terms = form.getByLabel('I accept the terms');
    await expect(terms).toHaveClass(INVALID);
    await expect(form.getByText('Accept the terms to continue.')).toHaveClass(VISIBLE);

    // form-level alert
    const alert = form.locator('[nfsabidealert]');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute('role', 'alert');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('valid submit: every control kind clears, alert hides, axe clean', async ({ page }) => {
    await page.goto('/');
    const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });

    await form.getByLabel('Email').fill('larsbrinknielsen@gmail.com');
    await form.getByLabel('Password', { exact: true }).fill('hunter22');
    await form.getByLabel('Repeat password').fill('hunter22');
    await form.getByLabel('Pro').check();
    await form.getByLabel('News').check();
    await form.getByLabel('Offers').check();
    await form.getByLabel('Country').selectOption('dk');
    await form.getByLabel(/^Bio/).fill('More than ten characters.');
    await form.locator('app-star-rating button', { hasText: '4' }).click();
    await form.getByLabel('I accept the terms').check();
    await form.getByRole('button', { name: 'Submit' }).click();

    await expect(form.locator('output')).toHaveText(/submitted:/);
    for (const locator of [
      form.getByLabel('Email'),
      form.getByLabel('Password', { exact: true }),
      form.getByLabel('Repeat password'),
      form.getByLabel('Country'),
      form.getByLabel(/^Bio/),
      form.locator('app-star-rating'),
    ]) {
      await expect(locator).not.toHaveClass(INVALID);
    }
    await expect(form.locator('[nfsabidealert]')).toBeHidden();

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});

test.describe('Reactive Forms twin: the same directives, same control kinds', () => {
  test('invalid submit: classes and aria for text, checkbox group, radio, select, textarea', async ({
    page,
  }) => {
    await page.goto('/');
    const form = page.getByRole('form', { name: 'Reactive Forms (NgControl courtesy)' });
    await form.getByLabel('Name').fill('x');
    await form.getByLabel('Name').blur();
    await form.getByRole('button', { name: 'Submit' }).click();

    const email = form.getByLabel('Email');
    await expect(email).toHaveClass(INVALID);
    await expect(email).toHaveAttribute('aria-invalid', 'true');

    for (const name of ['News', 'Offers', 'Events']) {
      await expect(form.getByLabel(name)).toHaveClass(INVALID);
    }
    await expect(form.getByText('Pick at least 2 topics.')).toHaveClass(VISIBLE);

    for (const name of ['Basic', 'Pro']) {
      await expect(form.getByLabel(name)).toHaveClass(INVALID);
      await expect(form.getByLabel(name)).not.toHaveAttribute('aria-invalid');
    }
    await expect(form.getByText('Choose a plan.')).toHaveClass(VISIBLE);

    await expect(form.getByLabel('Country')).toHaveClass(INVALID);
    await expect(form.getByLabel('Bio')).toHaveClass(INVALID);

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
