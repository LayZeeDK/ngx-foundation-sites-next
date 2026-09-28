import { InjectionToken } from '@angular/core';

/** One attribute of one library directive's selector, as the library's build lists it. */
export interface NfsImportManifestEntry {
  readonly directive: string;
  readonly entryPoint: string;
  readonly selector: string;
  /** The attribute as the selector spells it (camelCase); the DOM holds it lowercased. */
  readonly attribute: string;
  /** The Structural class the directive always binds, or null for a behaviour directive. */
  readonly hostClass: string | null;
}

/** 'unknown': this approach cannot tell yet (look again on the next scan). */
export type NfsImportVerdict = 'present' | 'missing' | 'unknown';

export interface NfsImportCheckStrategy {
  readonly name: string;
  onDirective?(host: object, directive: string): void;
  check(element: Element, entry: NfsImportManifestEntry): NfsImportVerdict;
}

/** The runtime checks of ADR 0040 plus the two this prototype adds. */
export interface NfsRuntimeChecks {
  /** An element carrying a library directive's attribute with no instance of that directive. */
  strictDirectiveImports: boolean;
  /** Prototype only, off unless set: any `nfs*` attribute the manifest does not list (typos). */
  strictUnknownAttributes: boolean;
}

let token: InjectionToken<Partial<NfsRuntimeChecks>> | undefined;

/** Created on first use: see nfsImportCheckToken for why nothing is created at module level. */
export function nfsRuntimeChecksToken(): InjectionToken<Partial<NfsRuntimeChecks>> {
  return (token ??= new InjectionToken<Partial<NfsRuntimeChecks>>('nfsRuntimeChecksToken'));
}
