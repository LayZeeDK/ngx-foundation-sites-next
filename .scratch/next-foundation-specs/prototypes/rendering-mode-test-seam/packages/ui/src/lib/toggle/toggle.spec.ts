import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readServerMode } from '../../test-utils/render-server';
import { NfsToggle } from './toggle';

@Component({
  imports: [NfsToggle],
  template: `<button type="button" nfsToggle id="toggle">Toggle</button>`,
})
class ClientFixture {}

describe('NfsToggle client render (TestBed)', () => {
  it('does not see server mode', () => {
    expect(readServerMode()).toBeUndefined();
  });

  it('runs afterNextRender and toggles the class on click', async () => {
    const fixture = TestBed.createComponent(ClientFixture);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('#toggle');

    // afterNextRender ran, so this code did not execute in server mode.
    expect(button.hasAttribute('data-ready')).toBe(true);
    expect(button.classList.contains('is-active')).toBe(false);

    button.click();
    await fixture.whenStable();

    expect(button.classList.contains('is-active')).toBe(true);
  });
});
