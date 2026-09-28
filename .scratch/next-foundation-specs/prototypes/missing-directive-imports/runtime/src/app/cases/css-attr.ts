import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from '../../nfs/button';

/** Consumer attributes that start with `nfs`: a CSS-only hook, a typo, and a directive's
 * attribute on an element its selector does not accept (NfsButton is imported). */
@Component({
  selector: 'app-css-attr-case',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    [nfsHighlight] {
      outline: 2px solid gold;
    }
  `,
  template: `
    <div nfsHighlight>Consumer CSS hook</div>
    <button nfsButon>Typo of nfsButton</button>
    <div nfsButton>Wrong element</div>
    <button nfsButton>Imported button</button>
  `,
})
export class CssAttrCase {}
