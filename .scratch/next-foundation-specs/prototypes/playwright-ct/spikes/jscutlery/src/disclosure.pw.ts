import { expect, test } from '@jscutlery/playwright-ct-angular';
import { NfsDisclosure } from './disclosure';
import { NfsDisclosureHost } from './disclosure-host';

test('mounts the host component and toggles it', async ({ mount }) => {
  const component = await mount(NfsDisclosureHost, { props: { label: 'Details' } });
  const button = component.getByRole('button', { name: 'Details' });

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveClass(/\bis-active\b/);
});

test('mounts the directive in a template', async ({ mount }) => {
  const component = await mount(`<button nfsDisclosure="p">Details</button><div id="p">Panel content</div>`, { imports: [NfsDisclosure] });
  await component.getByRole('button', { name: 'Details' }).click();
  await expect(component.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
});
