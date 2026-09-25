// PROTOTYPE path 3: the same CSF stories through the Angular unit-test builder (Vitest Browser),
// composed with Storybook portable stories. Story templates are JIT-compiled at runtime.
import '@angular/compiler';
import { setProjectAnnotations } from '@storybook/angular-vite';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import { composeStory } from 'storybook/preview-api';
import previewAnnotations from '../../../.storybook/preview';
import meta, { Default, OnButton } from './disclosure.stories';

// The framework's viteFinal normally defines this global; the Angular builder does not.
(globalThis as Record<string, unknown>)['STORYBOOK_ANGULAR_OPTIONS'] = { zoneless: true };

setProjectAnnotations([a11yAnnotations, previewAnnotations]);

// @storybook/angular-vite exports no typed composeStory; the core one is typed for any renderer.
type StoryInput = Parameters<typeof composeStory>[0];
type MetaInput = Parameters<typeof composeStory>[1];

describe('disclosure stories under Vitest Browser (Angular unit-test builder)', () => {
  for (const [name, annotations] of [['Default', Default], ['OnButton', OnButton]] as const) {
    it(`${name}: play function and addon-a11y pass`, async () => {
      const story = composeStory(annotations as StoryInput, meta as MetaInput, undefined, undefined, name);
      const canvasElement = document.body.appendChild(document.createElement('div'));

      await story.run({ canvasElement });

      const button = canvasElement.querySelector('button');
      expect(button?.getAttribute('aria-expanded')).toBe('true');
      expect(story.reporting.reports).toMatchObject([{ type: 'a11y', status: 'passed' }]);

      canvasElement.remove();
    });
  }

  it('an axe violation is reported, not thrown, outside addon-vitest', async () => {
    const story = composeStory({ ...Default, play: undefined, args: { label: '' } } as StoryInput, meta as MetaInput, undefined, undefined, 'AxeControl');
    const canvasElement = document.body.appendChild(document.createElement('div'));

    await story.run({ canvasElement });

    expect(story.reporting.reports).toMatchObject([{ type: 'a11y', status: 'failed' }]);
    canvasElement.remove();
  });
});
