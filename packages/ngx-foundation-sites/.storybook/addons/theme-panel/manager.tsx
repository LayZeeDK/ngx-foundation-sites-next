import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { ADDON_ID, PANEL_ID } from './constants';
import { ThemePanel } from './ThemePanel';

/**
 * Register the Foundation Theme addon with Storybook.
 *
 * This addon provides a panel for customizing Foundation Sass variables
 * at runtime, enabling live theme exploration without rebuilding.
 */
addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Theme',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => <ThemePanel active={active} />,
    paramKey: 'nfsTheme',
  });
});
