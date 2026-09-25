import { expect as ngExpect, test } from '@playwright-labs/selectors-angular';
import { expect } from '@playwright/test';

test('queries the mounted story by Angular component state', async ({ mount, $ng }) => {
  const root = await mount('disclosure--default');
  await root.getByRole('button', { name: 'Details' }).click();

  await ngExpect(root.locator('nfs-disclosure-host')).toBeNgComponent();
  expect(await $ng('angular=nfs-disclosure-host[label="Details"]').signal('expanded')).toBe(true);
});

test('$ng with a CSS selector reads signals (no angular= engine)', async ({ mount, $ng }) => {
  const root = await mount('disclosure--default');
  await root.getByRole('button', { name: 'Details' }).click();

  expect(await $ng('nfs-disclosure-host').signal('expanded')).toBe(true);
  expect(await $ng('nfs-disclosure-host').input('label')).toBe('Details');
});
