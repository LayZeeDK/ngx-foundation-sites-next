const { dirname, join } = require('path');

/**
 * Storybook preset for the Foundation Theme Panel addon.
 */
function managerEntries(entry = []) {
  return [...entry, join(__dirname, 'manager')];
}

module.exports = { managerEntries };
