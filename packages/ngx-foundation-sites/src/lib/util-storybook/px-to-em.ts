/**
 * Converts a pixel value to em for readable test assertions.
 *
 * Unlike rem (relative to root), em is relative to the element's own font-size.
 * Use this to convert computed styles back to em for comparison.
 *
 * @param px - The pixel value (e.g., '12.24px' or 12.24)
 * @param elementFontSizePx - The element's computed font-size in pixels
 * @returns The em value as a string with 'em' suffix (e.g., '0.85em')
 *
 * @example
 * ```ts
 * // If element has font-size: 14.4px
 * pxToEm('12.24px', 14.4); // '0.85em'
 * pxToEm(14.4, 14.4);      // '1em'
 * ```
 */
export function pxToEm(px: string | number, elementFontSizePx: number): string {
  const numericValue = typeof px === 'string' ? parseFloat(px) : px;
  const ems = numericValue / elementFontSizePx;

  // Round to avoid floating point precision issues
  const rounded = Math.round(ems * 1000) / 1000;

  return `${rounded}em`;
}
