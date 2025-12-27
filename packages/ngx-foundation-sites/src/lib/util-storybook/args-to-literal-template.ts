/**
 * Storybook utility functions for Angular component stories.
 */

/**
 * Options for the argsToLiteralTemplate function.
 */
export interface ArgsToLiteralTemplateOptions<T> {
  /**
   * Properties to exclude from the output.
   */
  readonly exclude?: (keyof T)[];
  /**
   * Properties to include in the output. If not specified, all properties are included.
   */
  readonly include?: (keyof T)[];
}

/**
 * Converts story args to Angular template bindings with literal values.
 *
 * Unlike Storybook's `argsToTemplate` which outputs `[propName]="propName"` (referencing a variable),
 * this function outputs `[propName]="true"` or `[propName]="'stringValue'"` with the actual values
 * embedded in the template.
 *
 * @example
 * ```typescript
 * // Input
 * argsToLiteralTemplate({ allowAllClosed: true, disabled: false, name: 'test' })
 *
 * // Output
 * '[allowAllClosed]="true" [disabled]="false" [name]="\'test\'"'
 * ```
 *
 * @example
 * ```typescript
 * // With exclude option
 * argsToLiteralTemplate({ disabled: true, name: 'test' }, { exclude: ['name'] })
 *
 * // Output
 * '[disabled]="true"'
 * ```
 *
 * @param args - The story args object containing property names and values
 * @param options - Optional configuration for include/exclude lists
 * @returns A string of Angular template bindings with literal values
 */
export function argsToLiteralTemplate<T extends Record<string, unknown>>(
  args: T,
  { exclude, include }: ArgsToLiteralTemplateOptions<T> = {},
): string {
  // Convert to Sets for O(1) lookups (inspired by Storybook's argsToTemplate)
  const excludeSet = exclude ? new Set(exclude) : null;
  const includeSet = include ? new Set(include) : null;

  return Object.entries(args)
    .filter(([key, value]) => {
      // Skip undefined values (matches Storybook behavior)
      if (value === undefined) {
        return false;
      }
      // Apply include filter
      if (includeSet && !includeSet.has(key as keyof T)) {
        return false;
      }
      // Apply exclude filter
      if (excludeSet && excludeSet.has(key as keyof T)) {
        return false;
      }
      return true;
    })
    .map(([key, value]) => {
      const formattedValue = formatValue(value);
      return `[${key}]="${formattedValue}"`;
    })
    .join(' ');
}

/**
 * Formats a value for embedding in an Angular template binding.
 *
 * @param value - The value to format
 * @returns A string representation suitable for Angular template binding
 */
function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  switch (typeof value) {
    case 'boolean':
    case 'number':
      return String(value);

    case 'string':
      // Strings need to be wrapped in single quotes within the double-quoted binding
      // Escape any existing single quotes in the string
      return `'${value.replace(/'/g, "\\'")}'`;

    case 'object':
      // For arrays and objects, use JSON serialization
      // Note: This creates a new object on each change detection cycle,
      // so use sparingly for static documentation purposes only
      return JSON.stringify(value).replace(/"/g, "'");

    default:
      return String(value);
  }
}
