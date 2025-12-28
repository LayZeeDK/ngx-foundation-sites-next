/** Object with potentially absent properties (compatible with exactOptionalPropertyTypes) */
export type JsonObject = { [K in string]?: JsonValue };

/** JSON-compatible value type for recursive transformation */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | JsonObject;
