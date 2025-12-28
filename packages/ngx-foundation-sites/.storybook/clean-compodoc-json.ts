/** JSON-compatible value type for recursive transformation */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Recursively transforms Compodoc JSON to clean up placeholder strings.
 * Compodoc uses `___COMPODOC_EMPTY_LINE___` to preserve empty lines in JSDoc,
 * but Storybook doesn't process these. This removes them (surrounding \n provides spacing).
 */
export function cleanCompodocJson<T extends Record<string, JsonValue>>(
  obj: T,
): T {
  return cleanValue(obj) as T;
}

/** Internal recursive helper that handles all JSON value types */
function cleanValue(value: JsonValue): JsonValue {
  if (typeof value === 'string') {
    return value.replaceAll('___COMPODOC_EMPTY_LINE___', '');
  }
  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, cleanValue(v)]),
    );
  }
  return value;
}
