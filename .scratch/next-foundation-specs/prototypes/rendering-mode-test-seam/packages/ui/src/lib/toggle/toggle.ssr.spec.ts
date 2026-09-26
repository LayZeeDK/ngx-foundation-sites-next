import { Component } from '@angular/core';
import { readServerMode, renderServer } from '../../test-utils/render-server';
import { NfsToggle } from './toggle';

@Component({
  selector: 'nfs-root',
  imports: [NfsToggle],
  template: `
    <button type="button" nfsToggle id="closed">Closed</button>
    <button type="button" nfsToggle id="open" [active]="true">Open</button>
  `,
})
class FixtureA {}

describe('NfsToggle server render (file A)', () => {
  it('starts outside server mode', () => {
    expect(readServerMode()).toBeUndefined();
  });

  it('renders host classes and jsaction on the elements expected to replay', async () => {
    const doc = await renderServer(FixtureA);

    const closed = doc.getElementById('closed')!;
    const open = doc.getElementById('open')!;

    expect(closed.classList.contains('is-active')).toBe(false);
    expect(open.classList.contains('is-active')).toBe(true);
    expect(closed.getAttribute('jsaction')).toBe('click:;');
    expect(open.getAttribute('jsaction')).toBe('click:;');
    // afterNextRender never ran on the server.
    expect(open.hasAttribute('data-ready')).toBe(false);
    // The replay bootstrap script follows the contract script.
    expect(doc.head.innerHTML + doc.body.innerHTML).toContain('window.__jsaction_bootstrap(document.body,"ng",["click"],[])');
    // Hydration annotations are present.
    expect(doc.querySelector('nfs-root')!.hasAttribute('ngh')).toBe(true);
  });

  it('leaves server mode after the render', () => {
    expect(readServerMode()).toBeUndefined();
  });
});
