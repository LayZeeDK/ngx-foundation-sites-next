import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// PROTOTYPE candidate 2: the directive's host component mounted directly (Angular-native gallery, no CSF).
const story = 'lib/disclosure/disclosure/Default';

test('mounts the host component, toggles it, and is axe-clean', async ({ mount, page }) => {
  const root = await mount(story);
  const button = root.getByRole('button', { name: 'Details' });

  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveClass(/\bis-active\b/);
  await expect(root.getByText('Panel content')).toBeVisible();

  const axe = await new AxeBuilder({ page }).include('#root').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('props become inputs; update() keeps component state', async ({ mount }) => {
  const root = await mount(story, { label: 'More' });
  const button = root.getByRole('button');
  await expect(button).toHaveText('More');

  await button.click();
  await root.update({ label: 'Less' });

  await expect(button).toHaveText('Less');
  test.info().annotations.push({ type: 'expanded-after-update', description: String(await button.getAttribute('aria-expanded')) });
});

test('function props subscribe to outputs', async ({ mount }) => {
  const calls: boolean[] = [];
  const root = await mount(story, { toggled: (value: boolean) => calls.push(value) });

  await root.getByRole('button', { name: 'Details' }).click();
  await expect.poll(() => calls).toEqual([true]);
});

test('an axe violation is caught by @axe-core/playwright', async ({ mount, page }) => {
  await mount(story, { label: '' });
  const axe = await new AxeBuilder({ page }).include('#root').analyze();
  expect(axe.violations.map((v) => v.id)).toContain('button-name');
});
