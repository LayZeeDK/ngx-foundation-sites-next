import {
  DOCUMENT,
  EnvironmentInjector,
  InjectionToken,
  afterEveryRender,
  inject,
} from '@angular/core';
import { nfsImportManifest } from './manifest';
import { ngDebugApi } from './strategies';
import { strategy } from './strategy';
import { NfsImportManifestEntry, NfsImportVerdict, nfsRuntimeChecksToken } from './types';

/** Manifest entries by the attribute name the DOM holds (HTML lowercases attribute names).
 * Built inside the service, not at module level: a top-level statement is a side effect that
 * would keep this module in a production bundle that never constructs the service. */
function indexManifest(): Map<string, NfsImportManifestEntry[]> {
  const byAttribute = new Map<string, NfsImportManifestEntry[]>();

  for (const entry of nfsImportManifest) {
    const key = entry.attribute.toLowerCase();
    byAttribute.set(key, [...(byAttribute.get(key) ?? []), entry]);
  }

  return byAttribute;
}

export interface NfsImportFinding {
  readonly check: 'strictDirectiveImports' | 'strictUnknownAttributes';
  readonly directive: string | null;
  readonly attribute: string;
  readonly owner: string | null;
  readonly wrongElement: boolean;
  readonly text: string;
}

interface NfsImportCheckStats {
  approach: string;
  scans: number;
  lastMs: number;
  maxMs: number;
  totalMs: number;
  lastMatched: number;
  findings: NfsImportFinding[];
  warnings: string[];
}

let token: InjectionToken<NfsImportCheck> | undefined;

/**
 * The scan service's root token, created on first use. Measured with Angular 22.2 production
 * builds of this app: an `@Injectable` class kept its static provider field (a
 * `defineInjectable` call) and a top-level `new InjectionToken(...)` stayed as a bare
 * expression even with a
 * `@__PURE__` annotation, both with the whole checker behind them; with no call at module
 * level, nothing of the check reaches the production bundle.
 */
export function nfsImportCheckToken(): InjectionToken<NfsImportCheck> {
  return (token ??= new InjectionToken<NfsImportCheck>('nfsImportCheckToken', {
    providedIn: 'root',
    factory: () => new NfsImportCheck(),
  }));
}

class NfsImportCheck {
  readonly #byAttribute = indexManifest();
  /** One selector list for the whole library; attribute selectors match case-insensitively. */
  readonly #selector = [...this.#byAttribute.keys()].map((a) => `[${a}]`).join(',');
  readonly #document = inject(DOCUMENT);
  readonly #injector = inject(EnvironmentInjector);
  readonly #checks = inject(nfsRuntimeChecksToken(), { optional: true }) ?? {};
  /** Per element, the attributes already decided (present, or reported once). */
  readonly #decided = new WeakMap<Element, Set<string>>();
  readonly #subjects = new Set<string>();
  readonly #stats: NfsImportCheckStats = {
    approach: strategy.name,
    scans: 0,
    lastMs: 0,
    maxMs: 0,
    totalMs: 0,
    lastMatched: 0,
    findings: [],
    warnings: [],
  };
  #started = false;
  /** 'mutations' (default): scan the document once, then only subtrees a MutationObserver saw
   * added, plus elements still undecided. 'every' (`?hook=every`): the whole document each time. */
  readonly #hook =
    typeof location !== 'undefined' && new URLSearchParams(location.search).get('hook') === 'every'
      ? 'every'
      : 'mutations';
  #observer: MutationObserver | null = null;
  readonly #added: Node[] = [];
  readonly #pending = new Set<Element>();

  start(): void {
    if (this.#started || this.#checks.strictDirectiveImports === false) {
      return;
    }

    this.#started = true;
    (globalThis as { __nfsImportCheck?: NfsImportCheckStats }).__nfsImportCheck = this.#stats;
    // A no-op on the server; in the browser it runs after every application render, so blocks
    // that render later (@if, @for, @defer, hydration) are scanned when they appear.
    afterEveryRender({ read: () => this.scan() }, { injector: this.#injector });
  }

  #collect(): Element[] {
    const keep = (records: MutationRecord[]) => {
      for (const record of records) {
        this.#added.push(...record.addedNodes);
      }
    };

    if (this.#hook === 'every' || this.#observer === null) {
      const all = [...this.#document.querySelectorAll(this.#selector)];
      this.#pending.clear();

      if (this.#hook === 'mutations') {
        this.#observer = new MutationObserver(keep);
        this.#observer.observe(this.#document, { childList: true, subtree: true });
      }

      return all;
    }

    // The render that triggered this scan queued its records as a microtask, which has not run
    // yet: take them now, or the latest render is seen only on the next one.
    keep(this.#observer.takeRecords());
    const elements = [...this.#pending];
    this.#pending.clear();

    for (const node of this.#added.splice(0)) {
      if (node instanceof Element && node.isConnected) {
        if (node.matches(this.#selector)) {
          elements.push(node);
        }

        elements.push(...node.querySelectorAll(this.#selector));
      }
    }

    return elements;
  }

  scan(): void {
    const start = performance.now();
    const elements = this.#collect();

    for (const element of elements) {
      for (const attribute of element.getAttributeNames()) {
        const entries = this.#byAttribute.get(attribute);

        if (entries !== undefined) {
          this.#checkAttribute(element, attribute, entries);
        }
      }
    }

    if (this.#checks.strictUnknownAttributes === true) {
      this.#scanUnknownAttributes();
    }

    const ms = performance.now() - start;
    this.#stats.scans++;
    this.#stats.lastMs = ms;
    this.#stats.maxMs = Math.max(this.#stats.maxMs, ms);
    this.#stats.totalMs += ms;
    this.#stats.lastMatched = elements.length;
  }

  #checkAttribute(element: Element, attribute: string, entries: NfsImportManifestEntry[]): void {
    let decided = this.#decided.get(element);

    if (decided?.has(attribute)) {
      return;
    }

    // Satisfied when any library directive listed for the attribute is on the element.
    let verdict: NfsImportVerdict = 'missing';

    for (const entry of entries) {
      const one = strategy.check(element, entry);

      if (one === 'present') {
        verdict = 'present';
        break;
      }

      if (one === 'unknown') {
        verdict = 'unknown';
      }
    }

    if (verdict === 'unknown') {
      // Look again on the next scan (hydration claims server DOM without adding nodes).
      this.#pending.add(element);

      return;
    }

    if (decided === undefined) {
      decided = new Set();
      this.#decided.set(element, decided);
    }

    decided.add(attribute);

    if (verdict === 'missing') {
      this.#report(element, entries);
    }
  }

  #report(element: Element, entries: NfsImportManifestEntry[]): void {
    const entry = entries[0];
    // esbuild names a compiled class expression `_Name`; the message wants the source name.
    const owner =
      ngDebugApi()?.getOwningComponent(element)?.constructor.name.replace(/^_/, '') ?? null;
    const wrongElement = !entries.some((e) => element.matches(e.selector));
    const tag = element.localName;
    this.#stats.findings.push({
      check: 'strictDirectiveImports',
      directive: entry.directive,
      attribute: entry.attribute,
      owner,
      wrongElement,
      text: (element.textContent ?? '').trim().slice(0, 60),
    });

    const subject = `${entry.directive}|${owner}|${wrongElement}`;

    if (this.#subjects.has(subject)) {
      return;
    }

    this.#subjects.add(subject);
    const where = owner === null ? '' : ` in a template of ${owner}`;
    const message = wrongElement
      ? `ngx-foundation-sites [strictDirectiveImports]: <${tag} ${entry.attribute}>${where} ` +
        `matches no selector of ${entry.directive} ('${entry.selector}'), so no directive ` +
        `applies. Use one of the selector's elements.`
      : `ngx-foundation-sites [strictDirectiveImports]: <${tag} ${entry.attribute}>${where} ` +
        `has no ${entry.directive}. Add ${entry.directive} from '${entry.entryPoint}' to the ` +
        `imports of the component whose template declares this element.`;
    this.#stats.warnings.push(message);
    console.warn(message, element);
  }

  #scanUnknownAttributes(): void {
    const result = this.#document.evaluate(
      "//*[@*[starts-with(name(), 'nfs')]]",
      this.#document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );

    for (let i = 0; i < result.snapshotLength; i++) {
      const element = result.snapshotItem(i) as Element;

      for (const attribute of element.getAttributeNames()) {
        if (!attribute.startsWith('nfs') || this.#byAttribute.has(attribute)) {
          continue;
        }

        const subject = `unknown|${attribute}`;

        if (this.#subjects.has(subject)) {
          continue;
        }

        this.#subjects.add(subject);
        this.#stats.findings.push({
          check: 'strictUnknownAttributes',
          directive: null,
          attribute,
          owner: ngDebugApi()?.getOwningComponent(element)?.constructor.name ?? null,
          wrongElement: false,
          text: (element.textContent ?? '').trim().slice(0, 60),
        });
        const message =
          `ngx-foundation-sites [strictUnknownAttributes]: <${element.localName} ${attribute}> ` +
          `names no library directive. Check its spelling.`;
        this.#stats.warnings.push(message);
        console.warn(message, element);
      }
    }
  }
}
