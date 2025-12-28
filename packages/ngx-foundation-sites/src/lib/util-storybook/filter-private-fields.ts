import type { JsonObject, JsonValue } from './json-value';

/**
 * TypeScript SyntaxKind value for ES private fields.
 * @see https://github.com/compodoc/compodoc/issues/1687
 */
const PRIVATE_KEYWORD = 123;

/** Arrays in Compodoc JSON that contain members with modifierKind */
const MEMBER_ARRAYS = [
  'propertiesClass',
  'methodsClass',
  'inputsClass',
  'outputsClass',
  'hostBindings',
  'hostListeners',
] as const;

/**
 * Filters ES private fields from Compodoc JSON output.
 *
 * Compodoc's `disablePrivate` option doesn't filter ES private fields (declared with `#`)
 * from JSON output, even though they're correctly detected with modifierKind 123.
 * This function provides a workaround until the issue is fixed upstream.
 *
 * @see https://github.com/compodoc/compodoc/issues/1687
 *
 * @example
 * ```typescript
 * // In preview.ts
 * import docJson from '../documentation.json';
 * import { cleanCompodocJson } from './clean-compodoc-json';
 * import { filterPrivateFields } from './filter-private-fields';
 *
 * const cleanedJson = filterPrivateFields(cleanCompodocJson(docJson));
 * setCompodocJson(cleanedJson);
 * ```
 */
export function filterPrivateFields<T extends JsonObject>(obj: T): T {
  return filterValue(obj) as T;
}

/** Check if a member is an ES private field (modifierKind includes 123) */
function isPrivateField(member: JsonObject): boolean {
  const modifierKind = member['modifierKind'];
  if (!Array.isArray(modifierKind)) {
    return false;
  } else {
    return modifierKind.some(
      (kind) => typeof kind === 'number' && kind === PRIVATE_KEYWORD,
    );
  }
}

/** Recursively filter ES private fields from Compodoc JSON */
function filterValue(value: JsonObject[string]): JsonObject[string] {
  if (value === undefined || value === null) {
    return value;
  } else if (Array.isArray(value)) {
    return value
      .filter((item) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          return !isPrivateField(item as JsonObject);
        } else {
          return true;
        }
      })
      .map((item) => filterValue(item)) as JsonValue[];
  } else if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => {
        // For known member arrays, filter items that are ES private fields
        if (MEMBER_ARRAYS.includes(k as (typeof MEMBER_ARRAYS)[number])) {
          if (Array.isArray(v)) {
            const filtered = v.filter((item) => {
              if (
                item !== null &&
                typeof item === 'object' &&
                !Array.isArray(item)
              ) {
                return !isPrivateField(item as JsonObject);
              } else {
                return true;
              }
            });
            return [k, filtered.map((item) => filterValue(item))];
          }
        }
        return [k, filterValue(v)];
      }),
    );
  }
  return value;
}
