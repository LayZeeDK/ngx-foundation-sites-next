import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<main><h1>Nested menu prototype</h1><router-outlet /></main>',
})
export class App {}
