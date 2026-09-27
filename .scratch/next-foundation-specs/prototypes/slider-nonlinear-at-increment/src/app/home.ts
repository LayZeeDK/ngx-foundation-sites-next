// PROTOTYPE -- fixtures for the assistive-technology increment question. Every
// non-linear case uses Foundation's `log` or `pow` option, base 5.
import { Component, signal, type WritableSignal } from '@angular/core';
import { NfsSlider, NfsSliderHandle, type NfsNativeStepMode, type NfsPositionValueFunction } from './slider';

interface Case {
  id: string;
  label: string;
  fn: NfsPositionValueFunction;
  mode: NfsNativeStepMode;
  res: 'fixed' | 'auto';
  guard: boolean;
  end: number;
  values: WritableSignal<number>[];
}

const c = (
  id: string,
  label: string,
  fn: NfsPositionValueFunction,
  mode: NfsNativeStepMode,
  values: number[],
  end = 100,
  res: 'fixed' | 'auto' = 'fixed',
  guard = true,
): Case => ({ id, label, fn, mode, res, end, guard, values: values.map((v) => signal(v)) });

@Component({
  selector: 'app-home',
  imports: [NfsSlider, NfsSliderHandle],
  template: `
    <main>
      <h1>PROTOTYPE: assistive-technology increments on a non-linear Slider Handle</h1>
      <p>
        Question: can a numeric native step and an input rule make an assistive-technology increment or
        decrement move a non-linear Handle one value step? Each case names its native step mode.
      </p>
      @for (k of cases; track k.id) {
        <section class="case" [attr.data-case]="k.id">
          <h2 [id]="k.id + '-label'">{{ k.label }}</h2>
          @if (k.values.length === 1) {
            <div nfsSlider #s="nfsSlider" [positionValueFunction]="k.fn" [nativeStepMode]="k.mode" [resolution]="k.res" [end]="k.end" [pressGuard]="k.guard">
              <input type="range" nfsSliderHandle #h="nfsSliderHandle" [id]="k.id" [attr.aria-label]="k.label" [(value)]="k.values[0]" />
              <span class="slider-fill"></span>
            </div>
            <p data-state>value={{ k.values[0]() }} rule={{ h.ruleSteps() }}</p>
            <p>mode={{ k.mode }} range=0..{{ s.positionMax() }}</p>
          } @else {
            <div nfsSlider #s="nfsSlider" [positionValueFunction]="k.fn" [nativeStepMode]="k.mode" [resolution]="k.res" [end]="k.end" [pressGuard]="k.guard"
                 role="group" [attr.aria-labelledby]="k.id + '-label'">
              <input type="range" nfsSliderHandle #lo="nfsSliderHandle" [id]="k.id + '-min'" [attr.aria-label]="k.label + ' minimum'" [(value)]="k.values[0]" />
              <span class="slider-fill"></span>
              <input type="range" nfsSliderHandle #hi="nfsSliderHandle" [id]="k.id + '-max'" [attr.aria-label]="k.label + ' maximum'" [(value)]="k.values[1]" />
            </div>
            <p data-state>lo={{ k.values[0]() }} hi={{ k.values[1]() }} rule={{ lo.ruleSteps() }}/{{ hi.ruleSteps() }}</p>
            <p>mode={{ k.mode }} range=0..{{ s.positionMax() }}</p>
          }
        </section>
      }
      <button type="button" id="set-nl-60" (click)="cases[1].values[0].set(60)">Set nl to 60 from code</button>
    </main>
  `,
})
export class Home {
  protected readonly cases: Case[] = [
    c('nl-any', 'nl-any log', 'log', 'any', [50]),
    c('nl', 'nl log', 'log', 'grid', [50]),
    c('nl5', 'nl5 log', 'log', 'grid', [5]),
    c('nl-raw', 'nl-raw log', 'log', 'raw', [50]),
    c('nld', 'nld log', 'log', 'grid', [25, 75]),
    c('nld-raw', 'nld-raw log', 'log', 'raw', [25, 75]),
    c('nld-any', 'nld-any log', 'log', 'any', [25, 75]),
    c('pow', 'pow scale', 'pow', 'grid', [50]),
    c('dense', 'dense log', 'log', 'grid', [5], 1000),
    c('dense-auto', 'dense-auto log', 'log', 'grid', [5], 1000, 'auto'),
    c('lin', 'lin linear', 'linear', 'grid', [25, 75]),
    c('nl-noguard', 'nl-noguard log', 'log', 'grid', [50], 100, 'fixed', false),
  ];
}
