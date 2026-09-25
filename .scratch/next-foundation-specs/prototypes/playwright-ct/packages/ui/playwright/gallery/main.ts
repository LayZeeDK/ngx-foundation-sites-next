/**
 * PROTOTYPE gallery for Playwright's built-in mount(storyId, props) fixture, served by Vite.
 *
 * Two story kinds share one page:
 * - candidate 2, Angular-native: `lib/disclosure/disclosure/Default` = export `Default` of
 *   src/lib/disclosure/disclosure.story.ts, a standalone component created with createComponent().
 * - candidate 3, portable stories: `disclosure--default` = a CSF story id, rendered with
 *   composeStory() from storybook/preview-api after @storybook/angular-vite's setProjectAnnotations().
 *   `?play` in the page URL also runs the story's play function.
 */
import '@angular/compiler';
import '../../src/lib/disclosure/disclosure.css';
import { ApplicationRef, ComponentRef, createComponent, OutputEmitterRef, provideZonelessChangeDetection, Type } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/angular-vite';
import { storyNameFromExport, toId } from 'storybook/internal/csf';
import { composeStory } from 'storybook/preview-api';
import previewAnnotations from '../../.storybook/preview';

type Props = Record<string, unknown>;
type MountParams = { story: string; props?: Props };
type Report = { type: string; status: string; result?: { violations?: { id: string }[] } };
type CsfModule = { default: { title: string } } & Record<string, unknown>;

setProjectAnnotations([a11yAnnotations, previewAnnotations]);

const root = document.getElementById('root') as HTMLElement;
const withPlay = new URLSearchParams(location.search).has('play');
const angularStories = import.meta.glob('../../src/**/*.story.ts');
const csfStories = import.meta.glob<CsfModule>('../../src/**/*.stories.ts');
let app: Promise<ApplicationRef> | undefined;
let ref: ComponentRef<unknown> | undefined;
let current: string | undefined;

async function mountComponent(story: string, props: Props): Promise<void> {
  const cut = story.lastIndexOf('/');
  const file = `../../src/${story.slice(0, cut)}.story.ts`;
  const load = angularStories[file];

  if (!load) {
    throw new Error(`Unknown story "${story}" (no ${file})`);
  }

  const type = ((await load()) as Record<string, Type<unknown>>)[story.slice(cut + 1)];

  if (!type) {
    throw new Error(`Unknown story "${story}" (no export)`);
  }

  const appRef = await (app ??= createApplication({ providers: [provideZonelessChangeDetection()] }));

  if (story !== current) {
    ref?.destroy();
    const hostElement = root.appendChild(document.createElement('div'));
    ref = createComponent(type, { environmentInjector: appRef.injector, hostElement });
    appRef.attachView(ref.hostView);
    current = story;
  }

  for (const [name, value] of Object.entries(props)) {
    const member = (ref!.instance as Record<string, unknown>)[name];

    if (typeof value === 'function' && member instanceof OutputEmitterRef) {
      member.subscribe(value as (event: unknown) => void);
    } else {
      ref!.setInput(name, value);
    }
  }

  await appRef.whenStable();
}

async function mountCsf(story: string, props: Props): Promise<void> {
  for (const load of Object.values(csfStories)) {
    const mod = await load();

    for (const [exportName, annotations] of Object.entries(mod)) {
      if (exportName === 'default' || toId(mod.default.title, storyNameFromExport(exportName)) !== story) {
        continue;
      }

      const input = withPlay ? annotations : { ...(annotations as object), play: undefined };
      // @storybook/angular-vite exports no typed composeStory; the core one is typed for any renderer.
      const composed = composeStory(input as Parameters<typeof composeStory>[0], mod.default, undefined, undefined, exportName);
      // composeStory always passes forceRemount: true, so update() re-bootstraps the story.
      await composed.run({ canvasElement: root, args: { ...composed.args, ...props } });
      const failed = (composed.reporting.reports as Report[]).filter((r) => r.status === 'failed');

      if (failed.length > 0) {
        throw new Error(`Story "${story}" reports failed: ${JSON.stringify(failed.map((r) => ({ type: r.type, violations: r.result?.violations?.map((v) => v.id) })))}`);
      }

      return;
    }
  }

  throw new Error(`Unknown story "${story}"`);
}

Object.assign(window, {
  mount: ({ story, props = {} }: MountParams) => (story.includes('--') ? mountCsf(story, props) : mountComponent(story, props)),
  unmount: async () => {
    ref?.destroy();
    ref = undefined;
    current = undefined;
    root.replaceChildren();
  },
});
