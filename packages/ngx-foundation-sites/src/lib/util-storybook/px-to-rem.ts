/**
 * Converts a pixel value to rem for readable test assertions.
 *
 * Use this to convert computed styles (which are always in px) back to rem
 * so test expectations can use the same units as the CSS custom properties.
 *
 * @param px - The pixel value (e.g., '14.4px' or 14.4)
 * @param baseFontSize - The root font size in pixels (default: 16)
 * @returns The rem value as a string with 'rem' suffix (e.g., '0.9rem')
 *
 * @example
 * ```ts
 * pxToRem('14.4px'); // '0.9rem'
 * pxToRem(16);       // '1rem'
 * pxToRem('32px');   // '2rem'
 * ```
 */
export function pxToRem(px: string | number, baseFontSize = 16): string {
  const numericValue = typeof px === 'string' ? parseFloat(px) : px;
  const rems = numericValue / baseFontSize;

  // Round to avoid floating point precision issues
  const rounded = Math.round(rems * 1000) / 1000;

  return `${rounded}rem`;
}
