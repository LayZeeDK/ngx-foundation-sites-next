import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// PROTOTYPE candidate 1: the CSF stories in packages/ui/src/lib/disclosure/disclosure.stories.ts,
// mounted through Playwright's built-in mount() fixture with the Storybook iframe as the gallery.

const lastFinished = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (window as unknown as { __galleryLastFinished?: { status: string; reporters: { type: string; status: string }[] } }).__galleryLastFinished);

test('mounts the host-component story, toggles it, and is axe-clean', async ({ mount, page }) => {
  const root = await mount('disclosure--default');
  const button = root.getByRole('button', { name: 'Details' });

  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveClass(/\bis-active\b/);
  await expect(root.getByText('Panel content')).toBeVisible();

  // axe 1: Storybook's own addon-a11y run (afterEach), reported through storyFinished.
  expect(await lastFinished(page)).toMatchObject({ status: 'success', reporters: [{ type: 'a11y', status: 'passed' }] });

  // axe 2: @axe-core/playwright on the rendered story, after the interaction.
  const axe = await new AxeBuilder({ page }).include('#storybook-root').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('mounts the directive-in-template story', async ({ mount }) => {
  const root = await mount('disclosure--on-button');
  const button = root.getByRole('button', { name: 'Details' });

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(root.getByText('Panel content')).toBeVisible();
});

test('mount(id, props) sets args; update(props) re-renders without navigating', async ({ mount, page }) => {
  const root = await mount('disclosure--default', { label: 'More' });
  const button = root.getByRole('button');
  await expect(button).toHaveText('More');

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');

  let navigations = 0;
  page.on('framenavigated', () => navigations++);
  await root.update({ label: 'Less' });

  await expect(button).toHaveText('Less');
  expect(navigations).toBe(0);
  // Records whether Angular component state (expanded after the click) survives an args update.
  test.info().annotations.push({ type: 'expanded-after-update', description: String(await button.getAttribute('aria-expanded')) });
});

test('function props reach Node through exposeFunctions', async ({ mount }) => {
  const calls: boolean[] = [];
  const root = await mount('disclosure--default', { toggled: (value: boolean) => calls.push(value) });

  await root.getByRole('button', { name: 'Details' }).click();
  await expect.poll(() => calls).toEqual([true]);
});

test('an unknown story id rejects mount()', async ({ mount }) => {
  await expect(mount('disclosure--does-not-exist')).rejects.toThrow(/storyMissing|failed/);
});

test('an axe violation in the story rejects mount() through addon-a11y', async ({ mount }) => {
  // label '' leaves the button without an accessible name (axe rule button-name).
  await expect(mount('disclosure--default', { label: '' })).rejects.toThrow(/button-name/);
});

test('unmount() tears the story down', async ({ mount }) => {
  const root = await mount('disclosure--default');
  await expect(root.getByRole('button')).toBeVisible();

  await root.unmount();
  await expect(root.getByRole('button')).toHaveCount(0);
});
