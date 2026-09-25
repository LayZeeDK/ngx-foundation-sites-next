// PROTOTYPE -- one page, one section per case. Every section prints its state.
import { afterNextRender, Component, signal } from '@angular/core';
import { NfsSlider, NfsSliderHandle } from './slider';

@Component({
  selector: 'app-root',
  imports: [NfsSlider, NfsSliderHandle],
  template: `
    <main>
      <h1>PROTOTYPE: Foundation-styled native range Slider</h1>

      <section class="case" data-case="single">
        <h2><label for="single">Single (0 to 200)</label></h2>
        <div nfsSlider [end]="200">
          <input id="single" type="range" nfsSliderHandle [(value)]="single" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ single() }}</p>
      </section>

      <section class="case" data-case="double">
        <h2 id="double-label">Double (0 to 100)</h2>
        <p><label for="double-min">Minimum</label> / <label for="double-max">Maximum</label></p>
        <div nfsSlider role="group" aria-labelledby="double-label">
          <input id="double-min" type="range" nfsSliderHandle [(value)]="lo" />
          <span class="slider-fill"></span>
          <input id="double-max" type="range" nfsSliderHandle [(value)]="hi" />
        </div>
        <p data-state>lo={{ lo() }} hi={{ hi() }}</p>
      </section>

      <section class="case" data-case="vertical">
        <h2><label for="vertical">Vertical (0 to 200)</label></h2>
        <div nfsSlider vertical [end]="200">
          <input id="vertical" type="range" nfsSliderHandle [(value)]="vert" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ vert() }}</p>
      </section>

      <section class="case" data-case="vertical-double">
        <h2 id="vd-label">Vertical double</h2>
        <p><label for="vd-min">Low</label> / <label for="vd-max">High</label></p>
        <div nfsSlider vertical role="group" aria-labelledby="vd-label">
          <input id="vd-min" type="range" nfsSliderHandle [(value)]="vlo" />
          <span class="slider-fill"></span>
          <input id="vd-max" type="range" nfsSliderHandle [(value)]="vhi" />
        </div>
        <p data-state>lo={{ vlo() }} hi={{ vhi() }}</p>
      </section>

      <section class="case" data-case="disabled-soft">
        <h2><label for="disabled-soft">Disabled (aria-disabled, focusable)</label></h2>
        <div nfsSlider disabled>
          <input id="disabled-soft" type="range" nfsSliderHandle [(value)]="dis1" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ dis1() }}</p>
      </section>

      <section class="case" data-case="disabled-native">
        <h2><label for="disabled-native">Disabled (native disabled)</label></h2>
        <div nfsSlider disabled [softDisabled]="false">
          <input id="disabled-native" type="range" nfsSliderHandle [(value)]="dis2" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ dis2() }}</p>
      </section>

      <section class="case" data-case="stepped">
        <h2><label for="stepped">Stepped (step 5)</label></h2>
        <div nfsSlider [step]="5">
          <input id="stepped" type="range" nfsSliderHandle [(value)]="stepped" [displayWith]="pct" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ stepped() }}</p>
      </section>

      <section class="case" data-case="log">
        <h2><label for="log">Non-linear log (base 5)</label></h2>
        <div nfsSlider positionValueFunction="log" [nonLinearBase]="5">
          <input id="log" type="range" nfsSliderHandle [(value)]="log" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ log() }}</p>
      </section>

      <section class="case" data-case="pow">
        <h2><label for="pow">Non-linear pow (base 5)</label></h2>
        <div nfsSlider positionValueFunction="pow" [nonLinearBase]="5">
          <input id="pow" type="range" nfsSliderHandle [(value)]="pow" />
          <span class="slider-fill"></span>
        </div>
        <p data-state>value={{ pow() }}</p>
      </section>

      <section class="case" data-case="rtl" dir="rtl">
        <h2 id="rtl-label">RTL double</h2>
        <p><label for="rtl-min">Minimum</label> / <label for="rtl-max">Maximum</label></p>
        <div nfsSlider role="group" aria-labelledby="rtl-label">
          <input id="rtl-min" type="range" nfsSliderHandle [(value)]="rlo" />
          <span class="slider-fill"></span>
          <input id="rtl-max" type="range" nfsSliderHandle [(value)]="rhi" />
        </div>
        <p data-state>lo={{ rlo() }} hi={{ rhi() }}</p>
      </section>

      <section class="case" data-case="bare">
        <h2><label for="bare">Bare input, mixin only, gradient fill</label></h2>
        <input
          id="bare"
          type="range"
          class="nfs-gradient"
          [value]="bare()"
          [style.--nfs-slider-fill]="bare() / 100"
          (input)="bare.set($any($event.target).valueAsNumber)"
        />
        <p data-state>value={{ bare() }}</p>
      </section>
    </main>
  `,
})
export class App {
  protected readonly single = signal(50);
  protected readonly lo = signal(25);
  protected readonly hi = signal(75);
  protected readonly vert = signal(25);
  protected readonly vlo = signal(20);
  protected readonly vhi = signal(60);
  protected readonly dis1 = signal(40);
  protected readonly dis2 = signal(40);
  protected readonly stepped = signal(50);
  protected readonly log = signal(50);
  protected readonly pow = signal(50);
  protected readonly rlo = signal(25);
  protected readonly rhi = signal(75);
  protected readonly bare = signal(30);
  protected readonly pct = (v: number) => `${v} percent`;

  constructor() {
    // Test hook: set once the client has hydrated and rendered.
    afterNextRender(() => document.body.setAttribute('data-hydrated', ''));
  }
}
