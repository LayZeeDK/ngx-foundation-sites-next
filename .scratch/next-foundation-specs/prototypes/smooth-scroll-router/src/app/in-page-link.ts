/**
 * Resolves a link to an in-page fragment, the way the Smooth Scroll spec's click handler does
 * (step 3): "its raw href attribute starts with '#', or its resolved URL equals the document URL
 * apart from the fragment and has a non-empty fragment." A bare "#frag" href resolves against
 * `<base href>`, which the spec's Problem Statement calls out as a cross-document hazard on any
 * non-root route; a full-path href ("/page-a#frag") is the base-href-safe form its usage example
 * recommends for Router applications.
 */
export function inPageFragment(link: HTMLAnchorElement, doc: Document): string | null {
  const raw = link.getAttribute('href') ?? '';

  if (raw.startsWith('#')) {
    return raw.length > 1 ? raw.slice(1) : null;
  }

  const resolved = new URL(link.href, doc.baseURI);
  const current = new URL(doc.URL);

  if (resolved.pathname === current.pathname && resolved.search === current.search && resolved.hash) {
    return decodeURIComponent(resolved.hash.slice(1));
  }

  return null;
}
