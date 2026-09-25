import { expect, test } from '@sand4rt/experimental-ct-angular';
import { NfsDisclosureHost } from '../src/disclosure-host';

test('mounts the host component and toggles it', async ({ mount }) => {
  const toggled: boolean[] = [];
  const component = await mount(NfsDisclosureHost, {
    props: { label: 'Details' },
    on: { toggled: (value: boolean) => toggled.push(value) },
  });
  const button = component.getByRole('button', { name: 'Details' });

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveClass(/\bis-active\b/);
  expect(toggled).toEqual([true]);
});

test('is axe-clean after toggling', async ({ mount, page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  const component = await mount(NfsDisclosureHost);
  await component.getByRole('button', { name: 'Details' }).click();

  const axe = await new AxeBuilder({ page }).include('#root').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test('update() keeps component state', async ({ mount }) => {
  const component = await mount(NfsDisclosureHost, { props: { label: 'More' } });
  await component.getByRole('button').click();
  await component.update({ props: { label: 'Less' } });

  await expect(component.getByRole('button')).toHaveText('Less');
  await expect(component.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
});
