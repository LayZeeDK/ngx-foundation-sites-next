// PROTOTYPE tests against the SSR server (hydrated app). Run: npx playwright test
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const INVALID = /(^|\s)is-invalid-input(\s|$)/;
const INVALID_LABEL = /(^|\s)is-invalid-label(\s|$)/;
const VISIBLE = /(^|\s)is-visible(\s|$)/;

const errorsSeen: string[] = [];

async function ready(page: Page): Promise<void> {
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errorsSeen.push(m.text());
    }
  });
  page.on('pageerror', (e) => errorsSeen.push(e.message));
  await page.goto('/');
  await expect(page.locator('html[data-hydrated]')).toHaveCount(1);
}

/** Negative assertions pass instantly; give change detection a moment first. */
async function settle(page: Page): Promise<void> {
  await page.waitForTimeout(150);
}

function fields(form: Locator) {
  const email = form.getByLabel('Email');

  return {
    email,
    emailLabel: form.locator('label').filter({ hasText: /^\s*Email/ }),
    emailError: form.getByText('Enter a valid email address.'),
    password: form.getByLabel('Password', { exact: true }),
    passwordLabel: form.locator('label', { hasText: /^Password$/ }),
    passwordError: form.getByText('A password is required.'),
    confirm: form.getByLabel('Repeat password'),
    confirmRequired: form.getByText('Repeat the password.'),
    confirmEqual: form.getByText('Passwords do not match.'),
    zip: form.getByLabel('Postal code'),
    zipLabel: form.locator('label', { hasText: 'Postal code' }),
    zipError: form.getByText('Use four digits.'),
    agree: form.getByLabel('I agree'),
    agreeError: form.getByText('You must agree.'),
    alert: form.locator('[data-abide-error]'),
    submit: form.getByRole('button', { name: 'Submit' }),
    result: form.locator('output'),
  };
}

test.afterAll(() => {
  // Surfaced in the report; the SSR tests assert on it directly.
  if (errorsSeen.length) {
    console.log('console errors:', JSON.stringify(errorsSeen));
  }
});

test.describe('default policy (validateOn fieldChange)', () => {
  test('pristine, blur-without-change, then change timing', async ({ page }) => {
    await ready(page);
    const f = fields(page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' }));

    await expect(f.email).not.toHaveClass(INVALID);
    await expect(f.emailError).not.toHaveClass(VISIBLE);
    await expect(f.alert).toBeHidden();

    // Blur with no change: Abide fires no change event, so no validation.
    await f.email.focus();
    await f.email.blur();
    await settle(page);
    await expect(f.email).not.toHaveClass(INVALID);

    // Typing does not validate (even after the earlier blur); the commit (change) does.
    await f.email.focus();
    await f.email.pressSequentially('x');
    await settle(page);
    await expect(f.email).not.toHaveClass(INVALID);
    await f.email.blur();
    await expect(f.email).toHaveClass(INVALID);
    await expect(f.email).toHaveAttribute('aria-invalid', 'true');
    await expect(f.emailLabel).toHaveClass(INVALID_LABEL);
    await expect(f.emailError).toHaveClass(VISIBLE);
    const errId = await f.emailError.getAttribute('id');
    expect(errId).toBeTruthy();
    await expect(f.email).toHaveAttribute('aria-describedby', `change-email-hint ${errId}`);

    // Second visit: the error stays until the next commit, then clears.
    await f.email.fill('larsbrinknielsen@gmail.com');
    await settle(page);
    await expect(f.email).toHaveClass(INVALID);
    await f.email.blur();
    await expect(f.email).not.toHaveClass(INVALID);
    await expect(f.email).not.toHaveAttribute('aria-invalid', /.*/);
    await expect(f.emailLabel).not.toHaveClass(INVALID_LABEL);
    await expect(f.emailError).not.toHaveClass(VISIBLE);
    await expect(f.email).toHaveAttribute('aria-describedby', 'change-email-hint');
  });

  test('checkbox validates on click (change), no blur needed', async ({ page }) => {
    await ready(page);
    const f = fields(page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' }));
    await f.agree.check();
    await f.agree.uncheck();
    // No blur happened (WebKit does not even focus a clicked checkbox): change alone shows it.
    await expect(f.agree).toHaveClass(INVALID);
    await expect(f.agreeError).toHaveClass(VISIBLE);
  });

  test('equalTo is a cross-field rule with per-kind errors', async ({ page }) => {
    await ready(page);
    const f = fields(page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' }));
    await f.password.fill('secret');
    await f.password.blur();
    await f.confirm.fill('other');
    await f.confirm.blur();
    await expect(f.confirm).toHaveClass(INVALID);
    await expect(f.confirmEqual).toHaveClass(VISIBLE);
    await expect(f.confirmRequired).not.toHaveClass(VISIBLE);
    const eqId = await f.confirmEqual.getAttribute('id');
    await expect(f.confirm).toHaveAttribute('aria-describedby', eqId!);
    // Changing the other field re-validates this one (Abide re-validates equalTo dependants).
    await f.password.fill('other');
    await f.password.blur();
    await expect(f.confirm).not.toHaveClass(INVALID);
    await expect(f.confirmEqual).not.toHaveClass(VISIBLE);
  });

  test('label[for] and data-form-error-for', async ({ page }) => {
    await ready(page);
    const f = fields(page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' }));
    await f.zip.fill('12');
    await f.zip.blur();
    await expect(f.zip).toHaveClass(INVALID);
    await expect(f.zipLabel).toHaveClass(INVALID_LABEL);
    await expect(f.zipError).toHaveClass(VISIBLE);
    await f.zip.fill('');
    await f.zip.blur();
    await expect(f.zip).not.toHaveClass(INVALID);
    await expect(f.zipError).not.toHaveClass(VISIBLE);
  });

  test('submit shows every error and the [data-abide-error] alert; axe clean', async ({ page }) => {
    await ready(page);
    const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
    const f = fields(form);
    await f.submit.click();
    await expect(f.alert).toBeVisible();
    for (const input of [f.email, f.password, f.confirm, f.agree]) {
      await expect(input).toHaveClass(INVALID);
    }
    await expect(f.passwordLabel).toHaveClass(INVALID_LABEL);
    await expect(f.passwordError).toHaveClass(VISIBLE);
    await expect(f.confirmRequired).toHaveClass(VISIBLE);
    await expect(f.confirmEqual).not.toHaveClass(VISIBLE);
    await expect(f.zip).not.toHaveClass(INVALID);
    await expect(f.result).toHaveText('');

    // WCAG 2.2 AA rule set, nothing disabled. With Foundation's default colours this reported
    // color-contrast 4.49:1 (#cc4b37 on #fefefe); styles.scss fixes it with Foundation settings.
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => `${n.target} ${n.any[0]?.message ?? ''}`).join(', ')}`),
    ).toEqual([]);

    // Fix everything: alert hides once the form is valid, submission runs.
    await f.email.fill('larsbrinknielsen@gmail.com');
    await f.password.fill('pw');
    await f.confirm.fill('pw');
    // Commit before clicking: in Firefox and WebKit the blur caused by the checkbox's
    // mousedown hides the confirm field's .form-error (display: none), the layout shifts up
    // before mouseup, and the click misses the checkbox ("Clicking the checkbox did not
    // change its state"). Foundation's error CSS does the same under Abide.
    await f.confirm.blur();
    await f.agree.check();
    await expect(f.alert).toBeHidden();
    await f.submit.click();
    await expect(f.result).toContainText('submitted');
  });

  test('WCAG 2.2 AA: 3.3.1, 3.3.3, 3.3.7, 4.1.3, 1.4.3, 1.4.11 on the invalid state', async ({ page }) => {
    await ready(page);
    const form = page.getByRole('form', { name: 'Default policy (validateOn fieldChange)' });
    const f = fields(form);
    await f.password.fill('secret');
    await f.password.blur();
    await f.confirm.fill('other');
    await f.confirm.blur();
    await f.zip.fill('12');
    await f.zip.blur();
    await f.submit.click();

    // 3.3.1: every field in error is flagged (aria-invalid) and described in text by the
    // visible error it references.
    for (const [input, error] of [
      [f.email, f.emailError],
      [f.confirm, f.confirmEqual],
      [f.zip, f.zipError],
      [f.agree, f.agreeError],
    ] as const) {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(error).toBeVisible();
      await expect(input).toHaveAccessibleDescription(new RegExp((await error.textContent())!.trim()));
    }
    // 3.3.3: the message follows the failed rule (equalTo, not required) and says how to fix it.
    await expect(f.confirmRequired).toBeHidden();
    await expect(f.confirm).toHaveAccessibleDescription('Passwords do not match.');
    // 3.3.7: an invalid submit keeps every entry (the password confirmation re-entry is the
    // Understanding document's security exception).
    await expect(f.password).toHaveValue('secret');
    await expect(f.zip).toHaveValue('12');
    // 4.1.3: errors appear without taking focus, so they are status messages: role="alert"
    // on the form-level region and on each field error.
    await expect(f.alert).toHaveAttribute('role', 'alert');
    for (const error of [f.emailError, f.confirmEqual, f.zipError, f.agreeError]) {
      await expect(error).toHaveAttribute('role', 'alert');
    }

    // 1.4.3 / 1.4.11 from computed styles (axe does not read ::placeholder or borders).
    await page.locator('h1').click(); // nothing focused: Foundation drops invalid styles on :focus
    await page.waitForTimeout(600); // Foundation's input border-color transition (0.25s)
    const c = await page.evaluate(() => {
      const rgb = (s: string) => s.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const lum = (s: string) => {
        const [r, g, b] = rgb(s).map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a: string, b: string) => {
        const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
        return Math.floor(((x + 0.05) / (y + 0.05)) * 100) / 100; // floor: 4.497 must fail 4.5
      };
      const q = (sel: string) => document.querySelector(sel)!;
      const cs = (sel: string, pseudo?: string) => getComputedStyle(q(sel), pseudo);
      const page = getComputedStyle(document.body).backgroundColor;
      const zip = cs('#change-zip');
      return {
        formErrorText: ratio(cs('[data-form-error-for="change-zip"]').color, page),
        invalidLabelText: ratio(cs('label[for="change-zip"]').color, page),
        invalidBorderVsPage: ratio(zip.borderTopColor, page),
        invalidBorderVsInside: ratio(zip.borderTopColor, zip.backgroundColor),
        placeholder: ratio(cs('#live-zip', '::placeholder').color, page),
        placeholderOnInvalidBg: ratio(cs('#change-zip', '::placeholder').color, zip.backgroundColor),
        defaultBorderVsPage: ratio(cs('#live-zip').borderTopColor, page),
      };
    });
    test.info().annotations.push({ type: 'contrast', description: JSON.stringify(c) });
    expect(c.formErrorText).toBeGreaterThanOrEqual(4.5);
    expect(c.invalidLabelText).toBeGreaterThanOrEqual(4.5);
    expect(c.invalidBorderVsPage).toBeGreaterThanOrEqual(3);
    expect(c.invalidBorderVsInside).toBeGreaterThanOrEqual(3);
    expect(c.placeholder).toBeGreaterThanOrEqual(4.5);
    expect(c.placeholderOnInvalidBg).toBeGreaterThanOrEqual(4.5);
    expect(c.defaultBorderVsPage).toBeGreaterThanOrEqual(3);
  });

  for (const [name, flushed] of [
    ['Default policy (validateOn fieldChange)', true],
    ['Default policy with the prototype fixes off', false],
  ] as const) {
    test(`Enter-key submit while a debounced field has focus (flush ${flushed})`, async ({ page }) => {
      await ready(page);
      const f = fields(page.getByRole('form', { name }));
      await f.password.fill('pw');
      await f.confirm.fill('pw');
      await f.agree.check();
      await f.email.fill('larsbrinknielsen@gmail.com');
      await f.email.press('Enter'); // no blur: the email value is still buffered
      if (flushed) {
        await expect(f.result).toContainText('"email":"larsbrinknielsen@gmail.com"');
        await expect(f.email).not.toHaveClass(INVALID);
      } else {
        // submit() flushes only the root's pending sync, so the focused child's buffered
        // value is validated stale: the input shows a valid address but the field is invalid.
        await expect(f.email).toHaveClass(INVALID);
        await expect(f.alert).toBeVisible();
        await expect(f.result).toHaveText('');
        await expect(f.email).toHaveValue('larsbrinknielsen@gmail.com');
      }
    });
  }
});

test('liveValidate validates while typing', async ({ page }) => {
  await ready(page);
  const f = fields(page.getByRole('form', { name: 'liveValidate' }));
  await f.email.pressSequentially('x');
  await expect(f.email).toBeFocused();
  await expect(f.email).toHaveClass(INVALID);
  await expect(f.emailError).toHaveClass(VISIBLE);
  await f.email.pressSequentially('@gmail.com');
  await expect(f.email).not.toHaveClass(INVALID);
});

test('validateOnBlur validates on blur without a change', async ({ page }) => {
  await ready(page);
  const f = fields(page.getByRole('form', { name: 'validateOnBlur' }));
  await f.email.focus();
  await f.email.blur();
  await expect(f.email).toHaveClass(INVALID);
  await expect(f.emailLabel).toHaveClass(INVALID_LABEL);
  await expect(f.emailError).toHaveClass(VISIBLE);
});

test('Reactive Forms: same classes through the NgControl courtesy', async ({ page }) => {
  await ready(page);
  const form = page.getByRole('form', { name: /Reactive Forms/ });
  const name = form.getByLabel('Name');
  const email = form.getByLabel('Email');
  await name.focus();
  await name.blur();
  await settle(page);
  await expect(name).not.toHaveClass(INVALID);
  await email.fill('x');
  await email.blur();
  await expect(email).toHaveClass(INVALID);
  await expect(form.locator('label[for="rf-email"]')).toHaveClass(INVALID_LABEL);
  await expect(form.getByText('Enter a valid email address.')).toHaveClass(VISIBLE);
  await form.getByRole('button', { name: 'Submit' }).click();
  await expect(name).toHaveClass(INVALID);
  await expect(form.locator('label').filter({ hasText: /^\s*Name/ })).toHaveClass(INVALID_LABEL);
  await expect(form.locator('[data-abide-error]')).toBeVisible();
  await email.fill('larsbrinknielsen@gmail.com');
  await email.blur();
  await expect(email).not.toHaveClass(INVALID);
});
