import { expect, test } from '@playwright/test';

// PROTOTYPE candidate 1, play-function reuse: without embed=true the Storybook iframe autoplays
// the story's own play function; mount() resolves after storyFinished (play + addon-a11y afterEach)
// and rejects if either failed. The CSF play function is the interaction test.

for (const story of ['disclosure--default', 'disclosure--on-button']) {
  test(`${story}: play function and addon-a11y pass inside Playwright`, async ({ mount }) => {
    const root = await mount(story);

    // State after the play function ran: it clicked the button once.
    await expect(root.getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'true');
  });
}
