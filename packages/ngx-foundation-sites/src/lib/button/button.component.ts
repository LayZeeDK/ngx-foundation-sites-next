import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nfs-button',
  template: `
    <button [type]="type()" [disabled]="disabled()">
      <ng-content />
    </button>
  `,
  styles: `
    button {
      cursor: pointer;
    }

    button:disabled {
      cursor: not-allowed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
}
