// Compiled on its own (tsconfig.compile-fail.json); the app build never sees it.
// None of these components imports the directive its template names.
import { Component } from '@angular/core';

@Component({ selector: 'cf-static', template: `<button nfsButton color="alert">Static input</button>` })
export class StaticInput {}

@Component({ selector: 'cf-bound', template: `<button nfsButton [color]="'alert'">Bound input</button>` })
export class BoundInput {}

@Component({
  selector: 'cf-title',
  template: `<button nfsAccordionTitle [expanded]="true">Bound input on a title</button>`,
})
export class BoundTitle {}

@Component({
  selector: 'cf-export-as',
  template: `<div nfsAccordionContent #c="nfsAccordionContent">Template reference</div>`,
})
export class ExportAs {}
