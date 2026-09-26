import { \u0275getDOM } from '@angular/common';
import { Component } from '@angular/core';
import { \u0275DominoAdapter } from '@angular/platform-server';
import { renderServer } from '../../test-utils/render-server';

@Component({ selector: 'nfs-root', template: '<p>adapter</p>' })
class AdapterFixture {}

// Unit-test builder only. Fidelity caveat: setRootDomAdapter() sets the DOM adapter once per realm
// (`_DOM ??= adapter`) and the builder's TestBed init installs BrowserDomAdapter before any spec
// runs, so the server platform's DominoAdapter.makeCurrent() is a no-op in this layer.
describe('DOM adapter during a server render under the unit-test builder', () => {
  it('is the browser adapter TestBed init installed, not DominoAdapter', async () => {
    await renderServer(AdapterFixture);

    expect(\u0275getDOM()).not.toBeInstanceOf(\u0275DominoAdapter);
    expect(\u0275getDOM().getUserAgent()).not.toBe('Fake user agent');
  });
});
