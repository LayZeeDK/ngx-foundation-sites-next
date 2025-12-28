/**
 * Recursively transforms Compodoc JSON to clean up placeholder strings.
 * Compodoc uses `___COMPODOC_EMPTY_LINE___` to preserve empty lines in JSDoc,
 * but Storybook doesn't process these. This replaces them with actual newlines.
 */
export function cleanCompodocJson<T>(obj: T): T {
  if (typeof obj === 'string') {
    // Remove Compodoc placeholder - the surrounding \n already provides spacing
    return obj.replaceAll('___COMPODOC_EMPTY_LINE___', '') as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanCompodocJson) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        cleanCompodocJson(value),
      ]),
    ) as T;
  }
  return obj;
}
