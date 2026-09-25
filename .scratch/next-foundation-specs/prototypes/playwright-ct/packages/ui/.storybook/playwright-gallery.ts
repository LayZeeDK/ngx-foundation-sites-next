/**
 * PROTOTYPE: turns the Storybook iframe into a Playwright 1.62+ component gallery.
 *
 * Playwright's built-in `mount(storyId, props)` fixture does `page.goto(baseURL)`, calls
 * `window.mount({ story, props })`, and returns `page.locator('#root')` with `update(props)`
 * and `unmount()`. Here `story` is a Storybook story id (`disclosure--default`), rendered by
 * Storybook's own preview: decorators, providers, global CSS, addon annotations, and (without
 * `embed=true`) the story's play function. Storybook's `storyFinished` event carries the
 * addon-a11y report, so a failing play function or an axe violation (a11y.test: 'error')
 * rejects mount() / update().
 */
type Listener = (payload?: unknown) => void;
type Channel = {
  emit(event: string, ...args: unknown[]): void;
  on(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
};
type PreviewWeb = {
  channel: Channel;
  storeInitializationPromise: Promise<void>;
  currentRender?: unknown;
  teardownRender(render: unknown): Promise<void>;
};
type Report = { type: string; status: string; result?: { violations?: { id: string }[] } };
type Finished = { storyId: string; status: 'success' | 'error'; reporters: Report[] };
type MountParams = { story: string; props?: Record<string, unknown> };
type GalleryWindow = Window & {
  __STORYBOOK_PREVIEW__?: PreviewWeb;
  __galleryLastFinished?: Finished;
  __resolveGallery?: (gallery: { mount: typeof mount; unmount: typeof unmount }) => void;
};

const galleryWindow = window as GalleryWindow;
let current: string | undefined;

async function preview(): Promise<PreviewWeb> {
  while (!galleryWindow.__STORYBOOK_PREVIEW__) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  await galleryWindow.__STORYBOOK_PREVIEW__.storeInitializationPromise;

  return galleryWindow.__STORYBOOK_PREVIEW__;
}

/**
 * Emits `trigger` and settles when the preview emits `done` for this story. Rejects on the
 * preview's failure events and on a `storyFinished` with status `error`.
 */
function run(channel: Channel, storyId: string, trigger: [string, unknown], done: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let finished: Finished | undefined;
    const fail = (event: string, payload?: unknown) => {
      off();
      reject(new Error(`Story "${storyId}" failed: ${event} ${JSON.stringify(payload ?? '')}`));
    };
    const settle = () => {
      off();

      if (finished?.status === 'error') {
        const summary = finished.reporters.map((r) => ({
          type: r.type,
          status: r.status,
          violations: r.result?.violations?.map((v) => v.id),
        }));
        reject(new Error(`Story "${storyId}" finished with errors: ${JSON.stringify(summary)}`));

        return;
      }

      resolve();
    };
    const listeners: Record<string, Listener> = {
      storyFinished: (payload) => {
        finished = payload as Finished;
        galleryWindow.__galleryLastFinished = finished;

        if (done === 'storyFinished' && finished.storyId === storyId) {
          settle();
        }
      },
      storyArgsUpdated: (payload) => {
        if (done === 'storyArgsUpdated' && (payload as { storyId: string }).storyId === storyId) {
          settle();
        }
      },
      storyMissing: (payload) => fail('storyMissing', payload),
      storyErrored: (payload) => fail('storyErrored', payload),
      storyThrewException: (payload) => fail('storyThrewException', payload),
      playFunctionThrewException: (payload) => fail('playFunctionThrewException', payload),
    };
    const off = () => Object.entries(listeners).forEach(([event, listener]) => channel.off(event, listener));
    Object.entries(listeners).forEach(([event, listener]) => channel.on(event, listener));
    channel.emit(...trigger);
  });
}

/** Playwright's fixture locates `#root`; wrap Storybook's own root instead of changing story DOM. */
function ensureRoot(): void {
  if (document.getElementById('root')) {
    return;
  }

  const storybookRoot = document.getElementById('storybook-root');

  if (!storybookRoot) {
    throw new Error('No #storybook-root in this page; is baseURL the Storybook iframe?');
  }

  const root = document.createElement('div');
  root.id = 'root';
  storybookRoot.before(root);
  root.append(storybookRoot);
}

async function mount({ story, props }: MountParams): Promise<void> {
  const { channel } = await preview();
  ensureRoot();

  if (story !== current) {
    await run(channel, story, ['setCurrentStory', { storyId: story, viewMode: 'story' }], 'storyFinished');
    current = story;
  }

  if (props && Object.keys(props).length > 0) {
    await run(channel, story, ['updateStoryArgs', { storyId: story, updatedArgs: props }], 'storyArgsUpdated');
  }
}

async function unmount(): Promise<void> {
  // ponytail: Storybook has no public "render nothing" event and the Angular renderer only
  // destroys its ApplicationRef on the next render. Tear the render down through PreviewWeb
  // (internal API) and empty the canvas: DOM-only, DestroyRef callbacks do not run.
  const web = await preview();
  await web.teardownRender(web.currentRender);
  document.getElementById('storybook-root')?.replaceChildren();
  current = undefined;
}

/**
 * window.mount / window.unmount are stubs from previewHead in main.ts; hand them the implementation.
 * Called from preview.ts rather than run as a side-effect import: the library's package.json says
 * "sideEffects": false, so the production build drops a bare `import './playwright-gallery'`.
 */
export function installPlaywrightGallery(): void {
  galleryWindow.__resolveGallery?.({ mount, unmount });
}
