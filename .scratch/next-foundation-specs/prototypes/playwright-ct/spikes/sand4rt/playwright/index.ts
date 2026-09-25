// PROTOTYPE spike: zoneless (no zone.js import), Foundation-style CSS for the directive.
import '../src/disclosure.css';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeMount } from '@sand4rt/experimental-ct-angular/hooks';

beforeMount(async ({ TestBed }) => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
});
