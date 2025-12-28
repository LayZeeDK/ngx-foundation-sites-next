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
  /**
   * Number of spaces for indentation in multiline output. Defaults to 2.
   */
  readonly indentSize?: number;
}

/**
 * Converts story args to Angular template bindings with literal values.
 *
 * Unlike Storybook's `argsToTemplate` which outputs `[propName]="propName"` (referencing a variable),
 * this function outputs the actual values embedded in the template:
 * - String values use static attribute syntax: `name="test"`
 * - Other values use property binding syntax: `[disabled]="true"`
 *
 * When more than 2 properties are present, each binding is placed on its own line
 * with configurable indentation for better readability.
 *
 * @example
 * ```typescript
 * // Two properties (single line)
 * argsToLiteralTemplate({ disabled: false, name: 'test' })
 * // Output: '[disabled]="false" name="test"'
 *
 * // Three+ properties (multiline with indentation)
 * argsToLiteralTemplate({ allowAllClosed: true, disabled: false, name: 'test' })
 * // Output: '\n  [allowAllClosed]="true"\n  [disabled]="false"\n  name="test"\n'
 * // Which renders as:
 * // <my-component
 * //   [allowAllClosed]="true"
 * //   [disabled]="false"
 * //   name="test"
 * // >
 * ```
 *
 * @example
 * ```typescript
 * // With exclude option
 * argsToLiteralTemplate({ disabled: true, name: 'test' }, { exclude: ['name'] })
 * // Output: '[disabled]="true"'
 * ```
 *
 * @param args - The story args object containing property names and values
 * @param options - Optional configuration for include/exclude lists
 * @returns A string of Angular template bindings with literal values
 */
export function argsToLiteralTemplate<T extends Record<string, unknown>>(
  args: T,
  { exclude, include, indentSize = 2 }: ArgsToLiteralTemplateOptions<T> = {},
): string {
  // Convert to Sets for O(1) lookups (inspired by Storybook's argsToTemplate)
  const excludeSet = exclude ? new Set(exclude) : null;
  const includeSet = include ? new Set(include) : null;

  const bindings = Object.entries(args)
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
    .map(([key, value]) => formatBinding(key, value));

  // Use multiline format when more than 2 properties
  // Format: \n<indent>binding1\n<indent>binding2\n (initial newline, indented lines, trailing newline)
  if (bindings.length > 2) {
    const indent = ' '.repeat(indentSize);
    return '\n' + indent + bindings.join('\n' + indent) + '\n';
  }

  return bindings.join(' ');
}

/**
 * Formats a key-value pair as an Angular template binding.
 *
 * Uses static attribute syntax (`prop="value"`) for string literals,
 * and property binding syntax (`[prop]="value"`) for other types.
 *
 * @param key - The property name
 * @param value - The value to bind
 * @returns A formatted Angular template binding
 */
function formatBinding(key: string, value: unknown): string {
  // Use static attribute syntax for strings (cleaner output)
  if (typeof value === 'string') {
    // Escape double quotes for HTML attribute value
    const escaped = value.replace(/"/g, '&quot;');
    return `${key}="${escaped}"`;
  }

  // Use property binding syntax for non-string values
  const formattedValue = formatValue(value);
  return `[${key}]="${formattedValue}"`;
}

/**
 * Formats a value for embedding in an Angular template property binding.
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

    case 'object':
      // For arrays and objects, use JSON serialization
      // Note: This creates a new object on each change detection cycle,
      // so use sparingly for static documentation purposes only
      return JSON.stringify(value).replace(/"/g, "'");

    default:
      return String(value);
  }
}
