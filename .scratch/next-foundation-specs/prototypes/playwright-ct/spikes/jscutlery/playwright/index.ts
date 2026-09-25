// PROTOTYPE spike: zoneless per the jscutlery README (provideZonelessChangeDetection since Angular 20).
import '@angular/compiler';
import '../src/disclosure.css';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeMount } from '@jscutlery/playwright-ct-angular/hooks';

beforeMount(async ({ TestBed }) => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
});
