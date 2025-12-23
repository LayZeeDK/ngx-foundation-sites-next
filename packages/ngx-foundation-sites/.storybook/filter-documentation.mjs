/**
 * Post-processes Compodoc's documentation.json to remove private/protected members.
 *
 * TypeScript modifier kinds:
 * - 123 = private
 * - 124 = protected
 * - 148 = readonly (keep these)
 *
 * Run after Compodoc: node .storybook/filter-documentation.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_PATH = join(__dirname, '../documentation.json');

// TypeScript SyntaxKind values for access modifiers
const PRIVATE_MODIFIER = 123;
const PROTECTED_MODIFIER = 124;

/**
 * Checks if a member is non-public:
 * - ES private fields (name starts with #)
 * - TypeScript private/protected (modifierKind contains 123 or 124)
 */
function isNonPublic(member) {
  // ES private fields always start with #
  if (member.name?.startsWith('#')) {
    return true;
  }

  // TypeScript private/protected modifiers
  const modifiers = member.modifierKind ?? [];
  return (
    modifiers.includes(PRIVATE_MODIFIER) ||
    modifiers.includes(PROTECTED_MODIFIER)
  );
}

/**
 * Filters an array to remove non-public members
 */
function filterPublicMembers(members) {
  if (!Array.isArray(members)) return members;
  return members.filter((member) => !isNonPublic(member));
}

/**
 * Processes a component/directive/injectable to remove non-public members
 */
function processEntity(entity) {
  if (!entity) return entity;

  return {
    ...entity,
    propertiesClass: filterPublicMembers(entity.propertiesClass),
    methodsClass: filterPublicMembers(entity.methodsClass),
    // Also filter inputs/outputs if they somehow have non-public modifiers
    inputsClass: filterPublicMembers(entity.inputsClass),
    outputsClass: filterPublicMembers(entity.outputsClass),
  };
}

// Main script
console.log(
  'Filtering documentation.json to remove private/protected members...',
);

const doc = JSON.parse(readFileSync(DOC_PATH, 'utf-8'));

// Process all entity types
doc.components = doc.components?.map(processEntity) ?? [];
doc.directives = doc.directives?.map(processEntity) ?? [];
doc.injectables = doc.injectables?.map(processEntity) ?? [];

// Write back
writeFileSync(DOC_PATH, JSON.stringify(doc, null, 4));

console.log('Done! Removed non-public members from documentation.json');
