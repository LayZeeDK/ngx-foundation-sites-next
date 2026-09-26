// PROTOTYPE -- default (LTR) fixtures: a two-handle linear slider (case 1's
// pre-hydration drag, and a crossing baseline) and a two-handle non-linear
// slider (cases 1 and 2: pre-hydration keys/drags, bar-position bounds, fill).
import { Component, signal } from '@angular/core';
import { NfsSlider, NfsSliderHandle } from './slider';

@Component({
  selector: 'app-home',
  imports: [NfsSlider, NfsSliderHandle],
  template: `
    <main>
      <h1>PROTOTYPE: Slider before hydration, non-linear bounds, and RTL</h1>

      <section class="case" data-case="double">
        <h2 id="double-label">Two-handle linear (0 to 100)</h2>
        <p><label for="double-min">Minimum</label> / <label for="double-max">Maximum</label></p>
        <div nfsSlider role="group" aria-labelledby="double-label">
          <input id="double-min" type="range" nfsSliderHandle [(value)]="doubleLo" />
          <span class="slider-fill"></span>
          <input id="double-max" type="range" nfsSliderHandle [(value)]="doubleHi" />
        </div>
        <p data-state>lo={{ doubleLo() }} hi={{ doubleHi() }}</p>
      </section>

      <section class="case" data-case="nl-log">
        <h2><label for="nl-log">Non-linear log, single handle (base 5)</label></h2>
        <div nfsSlider positionValueFunction="log" [nonLinearBase]="5">
          <input id="nl-log" type="range" nfsSliderHandle [(value)]="nlLog" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ nlLog() }}</p>
      </section>

      <section class="case" data-case="nl-double">
        <h2 id="nl-double-label">Non-linear log, two handles (base 5)</h2>
        <p><label for="nl-double-min">Minimum</label> / <label for="nl-double-max">Maximum</label></p>
        <div nfsSlider positionValueFunction="log" [nonLinearBase]="5" role="group" aria-labelledby="nl-double-label">
          <input id="nl-double-min" type="range" nfsSliderHandle [(value)]="nlDoubleLo" />
          <span class="slider-fill"></span>
          <input id="nl-double-max" type="range" nfsSliderHandle [(value)]="nlDoubleHi" />
        </div>
        <p data-state>lo={{ nlDoubleLo() }} hi={{ nlDoubleHi() }}</p>
      </section>
    </main>
  `,
})
export class Home {
  protected readonly doubleLo = signal(25);
  protected readonly doubleHi = signal(75);
  protected readonly nlLog = signal(50);
  protected readonly nlDoubleLo = signal(25);
  protected readonly nlDoubleHi = signal(75);
}
