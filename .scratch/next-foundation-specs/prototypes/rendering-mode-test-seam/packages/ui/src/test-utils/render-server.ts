import { Provider, Type } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication, \u0275DominoAdapter } from '@angular/platform-server';

/**
 * PROTOTYPE: the SSR smoke-test helper for the node-level layer.
 *
 * The document carries an (empty) `ng-event-dispatch-contract` script: platform-server only
 * emits the `__jsaction_bootstrap` replay script when it finds that element
 * (`packages/platform-server/src/utils.ts`, `insertEventRecordScript`). The CLI build inlines
 * the real contract; the server output does not depend on its contents.
 */
const DOCUMENT_HTML =
  '<!doctype html><html><head><script id="ng-event-dispatch-contract"></script></head>' +
  '<body><nfs-root></nfs-root></body></html>';

export function readServerMode(): unknown {
  // Read through globalThis: the unit-test builder compiles spec code with the esbuild
  // define `ngServerMode: false`, which would replace a bare `ngServerMode` identifier.
  return (globalThis as Record<string, unknown>)['ngServerMode'];
}

export async function renderServer(component: Type<unknown>, providers: Provider[] = []): Promise<Document> {
  const html = await renderApplication(
    (context) =>
      bootstrapApplication(
        component,
        // Built inside the callback, after renderApplication created the server platform, so
        // provideServerRendering() finds ngServerMode already set and the platform's destroy
        // hook resets it.
        { providers: [provideServerRendering(), provideClientHydration(), ...providers] },
        context,
      ),
    { document: DOCUMENT_HTML },
  );

  return parseHtml(html);
}

function parseHtml(html: string): Document {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  // Plain `node` environment (no jsdom): parse with the domino document platform-server ships.
  const doc = new \u0275DominoAdapter().createHtmlDocument();
  doc.documentElement.innerHTML = html.replace(/^<!doctype html>/i, '');

  return doc;
}
