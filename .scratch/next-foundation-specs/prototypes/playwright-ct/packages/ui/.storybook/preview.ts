import type { Preview } from '@storybook/angular-vite';
import '../src/lib/disclosure/disclosure.css';
import { installPlaywrightGallery } from './playwright-gallery';

installPlaywrightGallery();

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
  },
};

export default preview;
