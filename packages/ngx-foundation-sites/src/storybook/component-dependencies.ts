/**
 * Component Dependencies for Selective Sass Compilation
 *
 * Maps components to their ThemeState dependencies for intelligent cache
 * invalidation. When a theme variable changes, only components that depend
 * on that variable are recompiled.
 *
 * Dependency Rules:
 * - `palette` affects ALL components (global color definitions)
 * - Component-specific sections only affect that component
 *
 * @example
 * ```typescript
 * // User changes only button.fontSize
 * const affected = getAffectedComponents(oldState, newState);
 * // affected = Set(['button']) - only button needs recompilation
 * ```
 */

import type { ThemeState } from '../../.storybook/addons/theme-panel/types';
import {
  AVAILABLE_COMPONENTS,
  type AvailableComponent,
} from './generated/sass-bundle';

// ═══════════════════════════════════════════════════════════════════════════════
// Dependency Mapping
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps each component to the ThemeState sections it depends on.
 *
 * - All components depend on `palette` (global colors like $primary-color)
 * - Each component depends on its own settings section
 *
 * When adding new components, add an entry here with its dependencies.
 */
export const COMPONENT_DEPENDENCIES: Record<
  AvailableComponent,
  (keyof ThemeState)[]
> = {
  accordion: ['palette', 'accordion'],
  button: ['palette', 'button'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Hashing Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extracts the relevant portion of ThemeState for a specific component.
 * Only includes sections the component depends on.
 *
 * @param themeState - Full theme state
 * @param component - Component to extract state for
 * @returns Partial state containing only relevant sections
 */
export function extractComponentState(
  themeState: ThemeState,
  component: AvailableComponent,
): Partial<ThemeState> {
  const dependencies = COMPONENT_DEPENDENCIES[component];
  const result: Partial<ThemeState> = {};

  for (const dep of dependencies) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any)[dep] = themeState[dep];
  }

  return result;
}

/**
 * Generates a cache key for a specific component based only on its dependencies.
 * Two different full ThemeStates will produce the same hash if the component's
 * dependencies are identical.
 *
 * @param themeState - Full theme state
 * @param component - Component to generate hash for
 * @returns Cache key string in format "component:{...relevantState}"
 */
export function hashComponentState(
  themeState: ThemeState,
  component: AvailableComponent,
): string {
  const relevantState = extractComponentState(themeState, component);
  return `${component}:${JSON.stringify(relevantState)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Change Detection
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Determines which components need recompilation when ThemeState changes.
 *
 * Optimization logic:
 * 1. If oldState is null (first compilation), all components are affected
 * 2. If palette changed, all components are affected (global colors)
 * 3. Otherwise, only components whose specific variables changed are affected
 *
 * @param oldState - Previous theme state (null for first compilation)
 * @param newState - New theme state
 * @returns Set of component names that need recompilation
 */
export function getAffectedComponents(
  oldState: ThemeState | null,
  newState: ThemeState,
): Set<AvailableComponent> {
  // First compilation - all components affected
  if (!oldState) {
    return new Set(AVAILABLE_COMPONENTS);
  }

  // Check palette changes (affects all components)
  if (JSON.stringify(oldState.palette) !== JSON.stringify(newState.palette)) {
    return new Set(AVAILABLE_COMPONENTS);
  }

  // Check component-specific changes
  const affected = new Set<AvailableComponent>();

  for (const component of AVAILABLE_COMPONENTS) {
    const oldHash = hashComponentState(oldState, component);
    const newHash = hashComponentState(newState, component);

    if (oldHash !== newHash) {
      affected.add(component);
    }
  }

  return affected;
}
