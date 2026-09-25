import { Component, input } from '@angular/core';

/** Standalone deferred dependency: the element animate.enter is tested on. */
@Component({
  selector: 'app-deferred-box',
  template: `
    <div class="box" animate.enter="nfs-fade-in" [attr.data-testid]="testId()">
      {{ testId() }}
    </div>
  `,
  styleUrl: '../full/full.css',
})
export class DeferredBox {
  readonly testId = input.required<string>();
}
