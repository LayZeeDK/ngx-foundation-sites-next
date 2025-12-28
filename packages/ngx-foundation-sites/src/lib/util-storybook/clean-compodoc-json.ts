import type { JsonObject, JsonValue } from './json-value';

/**
 * Recursively transforms Compodoc JSON to clean up placeholder strings.
 * Compodoc uses `___COMPODOC_EMPTY_LINE___` to preserve empty lines in JSDoc,
 * but Storybook doesn't process these. This removes them (surrounding \n provides spacing).
 */
export function cleanCompodocJson<T extends JsonObject>(obj: T): T {
  return cleanValue(obj) as T;
}

/** Internal recursive helper that handles all JSON value types */
function cleanValue(value: JsonObject[string]): JsonObject[string] {
  if (value === undefined || value === null) {
    return value;
  } else if (typeof value === 'string') {
    return value.replaceAll('___COMPODOC_EMPTY_LINE___', '');
  } else if (Array.isArray(value)) {
    return value.map(cleanValue) as JsonValue[];
  } else if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, cleanValue(v)]),
    );
  }
  return value;
}
