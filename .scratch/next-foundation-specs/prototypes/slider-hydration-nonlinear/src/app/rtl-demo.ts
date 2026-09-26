// PROTOTYPE -- case 3: a two-handle slider under an ACTUAL RTL Foundation
// compile (rtl.scss sets $global-text-direction: rtl before importing
// Foundation), so Foundation's `.slider:not(.vertical) { transform: scale(-1,
// 1) }` is really emitted and rule 12 (../_nfs-slider.scss) really has
// something to cancel.
import { Component, signal } from '@angular/core';
import { NfsSlider, NfsSliderHandle } from './slider';

@Component({
  selector: 'app-rtl-demo',
  imports: [NfsSlider, NfsSliderHandle],
  styleUrl: './rtl.scss',
  template: `
    <main dir="rtl">
      <h1>PROTOTYPE: RTL Foundation compile (rule 12)</h1>

      <section class="case" data-case="rtl-double">
        <h2 id="rtl-double-label">Two-handle, RTL compile (0 to 100)</h2>
        <p><label for="rtl-min">Minimum</label> / <label for="rtl-max">Maximum</label></p>
        <div nfsSlider role="group" aria-labelledby="rtl-double-label">
          <input id="rtl-min" type="range" nfsSliderHandle [(value)]="lo" />
          <span class="slider-fill"></span>
          <input id="rtl-max" type="range" nfsSliderHandle [(value)]="hi" />
        </div>
        <p data-state>lo={{ lo() }} hi={{ hi() }}</p>
      </section>
    </main>
  `,
})
export class RtlDemo {
  protected readonly lo = signal(25);
  protected readonly hi = signal(75);
}
