import { Component } from '@angular/core';
import { NfsButton } from 'ngx-foundation-sites/button';
import { NfsCell } from 'ngx-foundation-sites/xy-grid';
import { Ui } from '@nx-ws/ui';

@Component({
  imports: [NfsButton, NfsCell, Ui],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
