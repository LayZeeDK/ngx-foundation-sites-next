// PROTOTYPE 198: adds cost counters to the link-styles service (189 and 192 copies).
// Usage: node tools/patch-198-link-styles.mjs <path to link-styles.ts>
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
let src = readFileSync(file, 'utf8');

const swap = (from, to) => {
  if (!src.includes(from)) {
    throw new Error(`not found in ${file}: ${from.slice(0, 60)}`);
  }

  src = src.replace(from, to);
};

if (src.includes('__nfsStats')) {
  console.log('already patched', file);
  process.exit(0);
}

swap(
  `/** Host attribute every family directive sets`,
  `/** PROTOTYPE 198: cost counters, read by the candidate-costs measurements. */
const nfsStats: Record<string, number> = ((globalThis as { __nfsStats?: Record<string, number> })
  .__nfsStats ??= {});
const stat = (name: string, ms: number) => {
  nfsStats[name + 'Calls'] = (nfsStats[name + 'Calls'] ?? 0) + 1;
  nfsStats[name + 'Ms'] = (nfsStats[name + 'Ms'] ?? 0) + ms;
  nfsStats[name + 'MaxMs'] = Math.max(nfsStats[name + 'MaxMs'] ?? 0, ms);
};

/** Host attribute every family directive sets`,
);

swap(
  `      if (!this.#search.includes('hold=off')) {
        for (const element of this.#document.querySelectorAll(\`[\${nfsStylesAttribute}]\`)) {
          for (const family of element.getAttribute(nfsStylesAttribute)!.split(' ')) {
            this.#set(this.#serverHeld, family).add(element);
          }
        }
      }`,
  `      if (!this.#search.includes('hold=off')) {
        const t = performance.now();
        let hosts = 0;

        for (const element of this.#document.querySelectorAll(\`[\${nfsStylesAttribute}]\`)) {
          hosts++;

          for (const family of element.getAttribute(nfsStylesAttribute)!.split(' ')) {
            this.#set(this.#serverHeld, family).add(element);
          }
        }

        stat('hold', performance.now() - t);
        nfsStats['holdHosts'] = hosts;
      }`,
);

swap(
  `  acquire(host: Element, families: readonly string[]): void {
    for (const family of families) {`,
  `  acquire(host: Element, families: readonly string[]): void {
    const t = performance.now();
    this.#acquire(host, families);
    stat('acquire', performance.now() - t);
  }

  #acquire(host: Element, families: readonly string[]): void {
    for (const family of families) {`,
);

swap(
  `  release(host: Element, families: readonly string[]): void {
    for (const family of families) {`,
  `  release(host: Element, families: readonly string[]): void {
    const t = performance.now();
    this.#release(host, families);
    stat('release', performance.now() - t);
  }

  #release(host: Element, families: readonly string[]): void {
    for (const family of families) {`,
);

swap(
  `this.#observer = new MutationObserver(() => this.#checkAll());`,
  `this.#observer = new MutationObserver((records) => {
        const t = performance.now();
        this.#checkAll();
        stat('mo', performance.now() - t);
        nfsStats['moRecords'] = (nfsStats['moRecords'] ?? 0) + records.length;
      });`,
);

swap(
  `void nextFrame().then(() => this.#checkAll());`,
  `void nextFrame().then(() => {
        const t = performance.now();
        this.#checkAll();
        stat('frameCheck', performance.now() - t);
      });`,
);

swap(
  `    if (this.#keyCount(key) === 0) {
      const element = this.#elements.get(key);
      element?.parentNode?.removeChild(element);`,
  `    if (this.#keyCount(key) === 0) {
      const element = this.#elements.get(key);
      nfsStats['unloads'] = (nfsStats['unloads'] ?? 0) + 1;
      element?.parentNode?.removeChild(element);`,
);

writeFileSync(file, src);
console.log('patched', file);
