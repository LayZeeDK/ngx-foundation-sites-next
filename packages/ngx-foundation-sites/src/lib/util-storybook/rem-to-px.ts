/**
 * Converts a rem value to pixels for testing computed styles.
 *
 * CSS computed styles always return pixel values, so this utility helps
 * compare expected rem values against actual computed values in tests.
 *
 * @param rem - The rem value (e.g., '0.9rem' or 0.9)
 * @param baseFontSize - The root font size in pixels (default: 16)
 * @returns The pixel value as a string with 'px' suffix (e.g., '14.4px')
 *
 * @example
 * ```ts
 * remToPx('0.9rem'); // '14.4px'
 * remToPx(0.9);      // '14.4px'
 * remToPx('1rem');   // '16px'
 * ```
 */
export function remToPx(rem: string | number, baseFontSize = 16): string {
  const numericValue = typeof rem === 'string' ? parseFloat(rem) : rem;
  const pixels = numericValue * baseFontSize;

  // Round to avoid floating point precision issues (e.g., 14.400000000000002)
  const rounded = Math.round(pixels * 1000) / 1000;

  return `${rounded}px`;
}
