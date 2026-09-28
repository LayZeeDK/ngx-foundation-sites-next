import { NfsImportCheckStrategy } from './types';

/** Approach A: every library directive records its host in a development-only registry. */
const hosts = new WeakMap<object, Set<string>>();

export const registryStrategy: NfsImportCheckStrategy = {
  name: 'registry',
  onDirective(host, directive) {
    let names = hosts.get(host);

    if (names === undefined) {
      names = new Set();
      hosts.set(host, names);
    }

    names.add(directive);
  },
  check(element, entry) {
    return hosts.get(element)?.has(entry.directive) ? 'present' : 'missing';
  },
};

/** The part of Angular's development global (`window.ng`) the checks read. */
export interface NgDebugApi {
  getDirectives(node: Node): object[];
  getOwningComponent(element: Element): object | null;
}

export function ngDebugApi(): NgDebugApi | undefined {
  const ng = (globalThis as { ng?: Partial<NgDebugApi> }).ng;

  return ng?.getDirectives && ng.getOwningComponent ? (ng as NgDebugApi) : undefined;
}

function debugCheck(
  element: Element,
  matches: (directive: object) => boolean,
): 'present' | 'missing' | 'unknown' {
  const ng = ngDebugApi();

  if (ng === undefined) {
    return 'unknown';
  }

  // No owning component: Angular has not claimed this element (yet), such as server HTML of
  // a block that has not hydrated. Look again on a later scan.
  if (ng.getOwningComponent(element) === null) {
    return 'unknown';
  }

  return ng.getDirectives(element).some(matches) ? 'present' : 'missing';
}

/** Approach B1: `ng.getDirectives`, compared by class name (public debug API only). */
export const debugNameStrategy: NfsImportCheckStrategy = {
  name: 'debug-name',
  check(element, entry) {
    return debugCheck(element, (d) => d.constructor.name === entry.directive);
  },
};

type CompiledSelectorList = readonly (readonly (string | number)[])[];

/** Approach B2: `ng.getDirectives`, compared by the compiled selector, read from the class's
 * private static field (theta-prefixed `dir`, written as an escape to keep the file ASCII). */
export const debugStrategy: NfsImportCheckStrategy = {
  name: 'debug',
  check(element, entry) {
    const attribute = entry.attribute.toLowerCase();

    return debugCheck(element, (d) => {
      const selectors = (
        d.constructor as unknown as Record<string, { selectors: CompiledSelectorList } | undefined>
      )['\u0275dir']?.selectors;

      return (
        selectors?.some((selector) =>
          selector.some((part) => typeof part === 'string' && part.toLowerCase() === attribute),
        ) ?? false
      );
    });
  },
};

/** Approach C: the Structural class the directive always binds is absent. No directive-side code. */
export const classStrategy: NfsImportCheckStrategy = {
  name: 'class',
  check(element, entry) {
    if (entry.hostClass === null) {
      return 'unknown';
    }

    return element.classList.contains(entry.hostClass) ? 'present' : 'missing';
  },
};

/**
 * Approach D (C then B2): a missing Structural class decides at once, even in server HTML that
 * has not hydrated; otherwise `ng.getDirectives` decides, which also covers class-less
 * behaviour directives and a Foundation class the consumer copied by hand.
 */
export const hybridStrategy: NfsImportCheckStrategy = {
  name: 'hybrid',
  check(element, entry) {
    if (classStrategy.check(element, entry) === 'missing') {
      return 'missing';
    }

    const verdict = debugStrategy.check(element, entry);

    return verdict === 'unknown' && entry.hostClass !== null ? 'present' : verdict;
  },
};
