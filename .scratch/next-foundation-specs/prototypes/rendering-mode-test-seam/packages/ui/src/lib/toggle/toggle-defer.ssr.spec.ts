import { Component } from '@angular/core';
import { readServerMode, renderServer } from '../../test-utils/render-server';
import { NfsToggle } from './toggle';

@Component({
  selector: 'nfs-root',
  imports: [NfsToggle],
  template: `
    @defer (hydrate on interaction) {
      <button type="button" nfsToggle id="deferred">Deferred</button>
    } @placeholder {
      <span>placeholder</span>
    }
  `,
})
class FixtureB {}

describe('NfsToggle server render inside @defer (hydrate on interaction) (file B)', () => {
  it('starts outside server mode', () => {
    expect(readServerMode()).toBeUndefined();
  });

  it('renders the main block with jsaction and the block marker', async () => {
    const doc = await renderServer(FixtureB);
    const deferred = doc.getElementById('deferred')!;

    expect(deferred).not.toBeNull();
    expect(doc.body.textContent).not.toContain('placeholder');
    expect(deferred.getAttribute('jsaction')).toBe('click:;keydown:;');
    expect(deferred.getAttribute('ngb')).toMatch(/^d\d+$/);
    expect(deferred.hasAttribute('data-ready')).toBe(false);
  });

  it('leaves server mode after the render', () => {
    expect(readServerMode()).toBeUndefined();
  });
});
