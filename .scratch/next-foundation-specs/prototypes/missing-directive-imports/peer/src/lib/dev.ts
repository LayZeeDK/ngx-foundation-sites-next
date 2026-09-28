// Development-only helpers for the in-family checks (the Angular Aria style).
// Every call site sits behind an inline `typeof ngDevMode === 'undefined' || ngDevMode`,
// so a production build drops this module (measured: see the README).
import { afterEveryRender, afterRenderEffect } from '@angular/core';

/** A part of a family: the attribute its selector matches and its class name. */
export interface NfsDevPart {
  readonly attr: string;
  readonly name: string;
}

/** Elements that host an instance, by directive name. Only the directive itself adds to it. */
const instances = new WeakMap<Element, Set<string>>();
/** Reported (element, key) pairs, so each misuse is reported once (guide P23). */
const reported = new WeakMap<Element, Set<string>>();

// Measured both ways (README): 'effect' is Angular Aria's afterRenderEffect, which
// reruns only when a signal it read changes, so an orphan that appears later
// (an @if inside an item, a hydrated @defer block) is never seen; 'every' reruns
// after every render in development builds and sees it.
const HOOK = 'every' as 'effect' | 'every';

/** Runs `check` after render, in the browser only (never on the server). */
export function nfsDevAfterRender(check: () => void): void {
  if (HOOK === 'every') {
    afterEveryRender({ read: check });
  } else {
    afterRenderEffect({ read: check });
  }
}

export function nfsDevMark(host: Element, part: NfsDevPart): void {
  let names = instances.get(host);

  if (!names) {
    names = new Set();
    instances.set(host, names);
  }

  names.add(part.name);
}

function hosts(el: Element, part: NfsDevPart): boolean {
  return instances.get(el)?.has(part.name) ?? false;
}

type NgGlobal = { getOwningComponent?(el: Element): object | null };

/**
 * The component whose template declares `el`, from Angular's development-mode
 * `ng` debugging global; `null` for a node Angular has not claimed, such as the
 * server-rendered DOM of a `@defer` block that has not hydrated yet.
 */
function owningComponent(el: Element): object | null | undefined {
  return (globalThis as { ng?: NgGlobal }).ng?.getOwningComponent?.(el);
}

// ponytail: skip a node Angular does not know yet (dehydrated @defer content),
// instead of reporting it as a forgotten import. `undefined` (no `ng` global) counts as known.
function known(el: Element): boolean {
  return owningComponent(el) !== null;
}

function owner(el: Element): string {
  const component = owningComponent(el);

  // esbuild's development output renames `class Page` with static fields to `_Page`.
  return component ? component.constructor.name.replace(/^_/, '') : 'the component that declares it';
}

function tag(el: Element, part: NfsDevPart): string {
  return `<${el.tagName.toLowerCase()} ${part.attr}>`;
}

function report(el: Element, key: string, message: string): void {
  let keys = reported.get(el);

  if (!keys) {
    keys = new Set();
    reported.set(el, keys);
  }

  if (keys.has(key)) {
    return;
  }

  keys.add(key);
  console.warn(`[ngx-foundation-sites] ${message}`, el);
}

function forgotten(el: Element, missing: NfsDevPart, by: NfsDevPart): void {
  report(
    el,
    missing.name,
    `${tag(el, missing)} has no ${missing.name} instance, so it renders unstyled and does nothing: ` +
      `add ${missing.name} to the imports of ${owner(el)} (found by ${by.name}).`,
  );
}

/**
 * The parent check: `found` is what the part's optional injection returned.
 * Reports a forgotten parent import, a parent that projection hides from DI,
 * or a part with no parent at all.
 */
export function nfsDevCheckParent(
  host: Element,
  self: NfsDevPart,
  parent: NfsDevPart,
  found: boolean,
): void {
  if (found) {
    return;
  }

  const ancestor = host.parentElement?.closest(`[${parent.attr}]`);

  if (ancestor && hosts(ancestor, parent)) {
    report(
      host,
      `projected:${parent.name}`,
      `${tag(host, self)} sits inside a ${parent.name} that its injector cannot reach: it is declared in ` +
        `another template (content projection or a template outlet), and DI follows the declaration site.`,
    );

    return;
  }

  if (ancestor && known(ancestor)) {
    forgotten(ancestor, parent, self);

    return;
  }

  report(host, `alone:${parent.name}`, `${tag(host, self)} is not inside a ${parent.attr} element.`);
}

/**
 * The child check: reports every element in this part's scope that carries a
 * child's attribute but hosts no instance of it. A part with no child at all is
 * not reported: under @defer, an empty @for, or an @if that is still false, that
 * state is legal and temporary (measured: every such report was premature).
 */
export function nfsDevCheckChildren(
  host: Element,
  self: NfsDevPart,
  child: NfsDevPart,
  // Read only so that the "effect" hook reruns when a child registers.
  _registered?: unknown,
): void {
  for (const el of host.querySelectorAll(`[${child.attr}]`)) {
    if (el.parentElement?.closest(`[${self.attr}]`) === host && !hosts(el, child) && known(el)) {
      forgotten(el, child, self);
    }
  }
}
