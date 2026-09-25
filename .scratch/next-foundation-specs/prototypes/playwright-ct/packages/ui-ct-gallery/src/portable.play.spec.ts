import { expect, test } from '@playwright/test';

// PROTOTYPE candidate 3, play-function reuse: the gallery runs the CSF play function (?play) and
// rejects mount() if it throws or addon-a11y reports a failure.

for (const story of ['disclosure--default', 'disclosure--on-button']) {
  test(`${story}: play function and addon-a11y pass inside Playwright`, async ({ mount }) => {
    const root = await mount(story);
    await expect(root.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'true');
  });
}
