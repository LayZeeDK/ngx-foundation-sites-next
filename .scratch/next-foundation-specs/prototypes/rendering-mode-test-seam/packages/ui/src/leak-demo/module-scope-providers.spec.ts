import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { NfsToggle } from '../lib/toggle/toggle';
import { readServerMode } from '../test-utils/render-server';

/**
 * PROTOTYPE, negative control (excluded from the default `test` target, run with
 * `--include=src/leak-demo/*.spec.ts`): the usual `app.config.server.ts` shape evaluates
 * provideServerRendering() at module scope, before renderApplication creates the platform,
 * so the platform does not own ngServerMode and never resets it.
 */
const serverProviders = [provideServerRendering(), provideClientHydration()];

@Component({
  selector: 'nfs-root',
  imports: [NfsToggle],
  template: `<button type="button" nfsToggle id="toggle">Toggle</button>`,
})
class LeakFixture {}

describe('provideServerRendering() evaluated at module scope', () => {
  it('sets ngServerMode as soon as the spec module loads', () => {
    expect(readServerMode()).toBe(true);
  });

  it('keeps ngServerMode set after the render', async () => {
    await renderApplication((context) => bootstrapApplication(LeakFixture, { providers: serverProviders }, context), {
      document: '<nfs-root></nfs-root>',
    });

    expect(readServerMode()).toBe(true);
  });

  it('breaks a later client render in the same module graph: afterNextRender never runs', async () => {
    const fixture = TestBed.createComponent(LeakFixture);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('#toggle');

    expect(button.hasAttribute('data-ready')).toBe(false);
  });

  afterAll(() => {
    (globalThis as Record<string, unknown>)['ngServerMode'] = undefined;
  });
});
