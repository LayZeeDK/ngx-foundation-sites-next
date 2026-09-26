import { \u0275getDOM } from '@angular/common';
import { Component } from '@angular/core';
import { \u0275DominoAdapter } from '@angular/platform-server';
import { renderServer } from '../../test-utils/render-server';

@Component({ selector: 'nfs-root', template: '<p>adapter</p>' })
class AdapterFixture {}

// Separate Vitest node project only (no TestBed init): the server platform installs DominoAdapter.
describe('DOM adapter during a server render in the separate Vitest node project', () => {
  it('is DominoAdapter', async () => {
    await renderServer(AdapterFixture);

    expect(\u0275getDOM()).toBeInstanceOf(\u0275DominoAdapter);
    expect(\u0275getDOM().getUserAgent()).toBe('Fake user agent');
  });
});
