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
 * Global sections that affect ALL components.
 * Changes to any of these sections trigger full recompilation.
 */
export const GLOBAL_SECTIONS: (keyof ThemeState)[] = [
  'palette',
  'globalColors',
  'typography',
  'spacing',
  'layout',
];

/**
 * Maps each component to the ThemeState sections it depends on.
 *
 * - All components depend on global sections (palette, globalColors, typography, spacing, layout)
 * - Each component depends on its own settings section
 *
 * When adding new components, add an entry here with its dependencies.
 */
export const COMPONENT_DEPENDENCIES: Record<
  AvailableComponent,
  (keyof ThemeState)[]
> = {
  accordion: [...GLOBAL_SECTIONS, 'accordion'],
  button: [...GLOBAL_SECTIONS, 'button'],
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
 * Checks if any global section has changed between two theme states.
 * Global sections affect all components, so any change triggers full recompilation.
 */
function hasGlobalSectionChanged(
  oldState: ThemeState,
  newState: ThemeState,
): boolean {
  for (const section of GLOBAL_SECTIONS) {
    if (
      JSON.stringify(oldState[section]) !== JSON.stringify(newState[section])
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Determines which components need recompilation when ThemeState changes.
 *
 * Optimization logic:
 * 1. If oldState is null (first compilation), all components are affected
 * 2. If any global section changed, all components are affected
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

  // Check global section changes (affects all components)
  if (hasGlobalSectionChanged(oldState, newState)) {
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
