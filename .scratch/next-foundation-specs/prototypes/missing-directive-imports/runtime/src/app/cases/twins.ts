import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsColumn as NfsFlexColumn } from '../../nfs/flex-grid';
import { NfsColumn as NfsFloatColumn } from '../../nfs/float-grid';

@Component({
  selector: 'app-flex-twin',
  imports: [NfsFlexColumn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div nfsColumn>Flex column</div>`,
})
export class FlexTwin {}

@Component({
  selector: 'app-float-twin',
  imports: [NfsFloatColumn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div nfsColumn>Float column</div>`,
})
export class FloatTwin {}

/** Two library classes named NfsColumn in one chunk, both imported correctly. */
@Component({
  selector: 'app-twins-case',
  imports: [FlexTwin, FloatTwin],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-flex-twin /><app-float-twin />`,
})
export class TwinsCase {}
