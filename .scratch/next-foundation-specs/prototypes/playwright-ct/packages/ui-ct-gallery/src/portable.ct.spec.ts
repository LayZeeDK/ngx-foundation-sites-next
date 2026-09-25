import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// PROTOTYPE candidate 3: CSF stories through composeStory() in a project-owned Vite gallery.

test('mounts the Default story, toggles it, and is axe-clean', async ({ mount, page }) => {
  const root = await mount('disclosure--default');
  const button = root.getByRole('button', { name: 'Details' });

  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveClass(/\bis-active\b/);
  await expect(root.getByText('Panel content')).toBeVisible();

  const axe = await new AxeBuilder({ page }).include('#root').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('mounts the directive-in-template story', async ({ mount }) => {
  const root = await mount('disclosure--on-button');
  await root.getByRole('button', { name: 'Details' }).click();
  await expect(root.getByText('Panel content')).toBeVisible();
});

test('props become args; update() re-renders', async ({ mount }) => {
  const root = await mount('disclosure--default', { label: 'More' });
  const button = root.getByRole('button');
  await expect(button).toHaveText('More');

  await button.click();
  await root.update({ label: 'Less' });

  await expect(root.getByRole('button')).toHaveText('Less');
  test.info().annotations.push({ type: 'expanded-after-update', description: String(await root.getByRole('button').getAttribute('aria-expanded')) });
});

test('function props reach Node', async ({ mount }) => {
  const calls: boolean[] = [];
  const root = await mount('disclosure--default', { toggled: (value: boolean) => calls.push(value) });

  await root.getByRole('button', { name: 'Details' }).click();
  await expect.poll(() => calls).toEqual([true]);
});

test('an axe violation rejects mount() through addon-a11y', async ({ mount }) => {
  await expect(mount('disclosure--default', { label: '' })).rejects.toThrow(/button-name/);
});
