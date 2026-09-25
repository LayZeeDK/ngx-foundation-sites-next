import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: '@storybook/angular-vite',
  // PROTOTYPE: Playwright's mount() fixture calls window.mount() right after the load event, which
  // can be before Storybook has imported preview.ts. This stub waits for playwright-gallery.ts.
  previewHead: (head) => `${head}
    <script>
      window.__galleryReady = new Promise((resolve) => { window.__resolveGallery = resolve; });
      window.mount = async (params) => (await window.__galleryReady).mount(params);
      window.unmount = async () => (await window.__galleryReady).unmount();
    </script>`,
};

export default config;
