// PROTOTYPE 198: `?nonce=copy` makes the link-styles service (189 and 192 copies) copy CSP_NONCE
// onto the elements it inserts, on the server and the client, as 188's own-style does.
// Usage: node tools/patch-198-nonce.mjs <path to link-styles.ts>
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
let src = readFileSync(file, 'utf8');

const swap = (from, to, all = false) => {
  if (!src.includes(from)) {
    throw new Error(`not found in ${file}: ${from.slice(0, 60)}`);
  }

  src = all ? src.split(from).join(to) : src.replace(from, to);
};

if (src.includes('#copyNonce')) {
  console.log('already patched', file);
  process.exit(0);
}

swap(
  `import {
  DestroyRef,`,
  `import {
  CSP_NONCE,
  REQUEST,
  DestroyRef,`,
);

swap(
  `  readonly #search = this.#browser ? this.#document.location.search : '';`,
  `  readonly #search = this.#browser ? this.#document.location.search : '';
  /** PROTOTYPE 198 switch \`?nonce=copy\` (browser and server): copy CSP_NONCE like 188's own-style. */
  readonly #nonce = inject(CSP_NONCE, { optional: true });
  readonly #copyNonce = (
    this.#browser ? this.#search : new URL(inject(REQUEST, { optional: true })?.url ?? 'http://x/').search
  ).includes('nonce=copy');`,
);

// Every element the service inserts goes through appendChild on document.head.
swap(
  `this.#document.head.appendChild(`,
  `this.#withNonce(`,
  true,
);

swap(
  `  #bundlePrefix(): string {`,
  `  #withNonce<T extends HTMLElement>(element: T): T {
    if (this.#copyNonce && this.#nonce) {
      element.setAttribute('nonce', this.#nonce);
    }

    return this.#document.head.appendChild(element); // the server DOM (domino) has no append()
  }

  #bundlePrefix(): string {`,
);

writeFileSync(file, src);
console.log('patched', file);
