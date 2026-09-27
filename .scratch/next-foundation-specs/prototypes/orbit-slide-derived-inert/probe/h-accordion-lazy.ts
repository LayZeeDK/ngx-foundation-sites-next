// Probe H: does Aria's AccordionPanel, hosted by an attribute-selector
// component with its own template around <ng-content> (the shape of
// NfsAccordionContent), find an AccordionContent hosted by a library lazy
// directive in the consumer's projected content? Reads Aria's private
// contentChild signal only to report discovery (probe, not library code).
import '@angular/compiler';
import { Component, Directive, computed, inject, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent } from '@angular/aria/accordion';

@Directive({
  selector: 'ng-template[probeLazyContent]',
  hostDirectives: [AccordionContent],
})
export class ProbeLazyContent {}

@Component({
  selector: '[probeAccContent]',
  exportAs: 'probeAccContent',
  hostDirectives: [{ directive: AccordionPanel, inputs: ['id'] }],
  host: { class: 'accordion-content', '[attr.data-found]': 'found()' },
  template: '<div class="inner"><ng-content /></div>',
})
export class ProbeAccContent {
  readonly panel = inject(AccordionPanel);
  readonly found = computed(() =>
    (this.panel['_accordionContent'] as () => unknown)() ? 'content-found' : 'content-missing',
  );
}

@Component({
  selector: 'probe-root',
  imports: [AccordionGroup, AccordionTrigger, ProbeAccContent, ProbeLazyContent],
  template: `
    <div ngAccordionGroup>
      <h3><button ngAccordionTrigger [panel]="c1.panel" [expanded]="true">One</button></h3>
      <div probeAccContent #c1="probeAccContent" id="h-1" [preserveContent]="true">
        <ng-template probeLazyContent><p>One lazy</p></ng-template>
      </div>
      <h3><button ngAccordionTrigger [panel]="c2.panel">Two</button></h3>
      <div probeAccContent #c2="probeAccContent" id="h-2"><p>Two projected</p></div>
    </div>
  `,
})
export class ProbeRoot {}

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(
    ProbeRoot,
    { providers: [provideZonelessChangeDetection(), provideServerRendering()] },
    context,
  );

const html = await renderApplication(bootstrap, {
  document: '<!doctype html><html><head></head><body><probe-root></probe-root></body></html>',
  url: 'http://localhost/',
  allowedHosts: ['localhost'],
});

const body = html.slice(html.indexOf('<probe-root'), html.indexOf('</probe-root>') + 13);
console.log(body.replaceAll('><', '>\n<'));
