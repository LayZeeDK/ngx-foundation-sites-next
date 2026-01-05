import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGlobals, useChannel } from 'storybook/manager-api';
import { styled, keyframes } from 'storybook/theming';
import { ZoomResetIcon, CopyIcon, DownloadIcon } from '@storybook/icons';

import { THEME_STATE_KEY, DEBOUNCE_MS, EVENTS } from './constants';
import type {
  ThemeState,
  SpacingValue,
  VariableSection,
  VariableDefinition,
  LinkedColorValue,
  PaletteState,
  ButtonSizesMap,
} from './types';
import {
  VARIABLE_SECTIONS,
  getDefaultThemeState,
  generateScssExport,
  mergeWithDefaults,
} from '../../../src/storybook/theme-defaults';
import {
  ColorControl,
  SliderControl,
  SpacingControl,
  BooleanControl,
  SectionHeader,
  SelectControl,
  TextControl,
  NumberControl,
  LinkedColorControl,
  MapControl,
  PercentageControl,
  PaletteSelectorControl,
} from './components';

// ═══════════════════════════════════════════════════════════════════════════════
// Styled Components
// ═══════════════════════════════════════════════════════════════════════════════

const Panel = styled.div`
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  font-family: ${(props) => props.theme.typography.fonts.base};
  font-size: 13px;
  background: ${(props) => props.theme.background.content};
  color: ${(props) => props.theme.color.defaultText};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.color.defaultText};
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  padding: 6px 8px;
  border: 1px solid ${(props) => props.theme.color.border};
  border-radius: 4px;
  background: ${(props) => props.theme['button']?.background ?? 'transparent'};
  color: ${(props) => props.theme.color.defaultText};
  cursor: pointer;
  font-size: 12px;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: ${(props) => props.theme.background.hoverable};
    border-color: ${(props) => props.theme.color.secondary};
  }
`;

const Section = styled.div`
  margin-bottom: 8px;
`;

const SectionContent = styled.div`
  padding: 12px 0;
`;

// Spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const CompileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${(props) => props.theme.color.mediumdark};
`;

const Spinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid ${(props) => props.theme.color.border};
  border-top-color: ${(props) => props.theme.color.secondary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getNestedValue(obj: ThemeState, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function setNestedValue<T>(obj: T, path: string, value: unknown): T {
  const parts = path.split('.');
  const result = { ...obj } as Record<string, unknown>;

  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...(current[part] as Record<string, unknown>) };
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return result as T;
}

function getStatePath(sectionId: string, sassVar: string): string {
  if (sectionId === 'palette') {
    return `palette.${sassVar}`;
  }

  const varMappings: Record<string, Record<string, string>> = {
    // Global Colors
    globalColors: {
      white: 'globalColors.white',
      'light-gray': 'globalColors.lightGray',
      'medium-gray': 'globalColors.mediumGray',
      'dark-gray': 'globalColors.darkGray',
      black: 'globalColors.black',
      'body-background': 'globalColors.bodyBackground',
      'body-font-color': 'globalColors.bodyFontColor',
    },
    // Typography
    typography: {
      'global-font-size': 'typography.globalFontSize',
      'global-lineheight': 'typography.globalLineHeight',
      'global-weight-normal': 'typography.globalWeightNormal',
      'global-weight-bold': 'typography.globalWeightBold',
      'body-font-family': 'typography.bodyFontFamily',
      'header-font-family': 'typography.headerFontFamily',
      'header-lineheight': 'typography.headerLineHeight',
    },
    // Spacing
    spacing: {
      'global-margin': 'spacing.globalMargin',
      'global-padding': 'spacing.globalPadding',
      'global-radius': 'spacing.globalRadius',
      'global-menu-padding': 'spacing.globalMenuPadding',
    },
    // Layout
    layout: {
      'global-text-direction': 'layout.globalTextDirection',
      'global-width': 'layout.globalWidth',
      'global-flexbox': 'layout.globalFlexbox',
    },
    // Accordion
    accordion: {
      'accordion-background': 'accordion.background',
      'accordion-plusminus': 'accordion.plusminus',
      'accordion-title-font-size': 'accordion.titleFontSize',
      'accordion-item-padding': 'accordion.itemPadding',
      'nfs-accordion-slide-speed': 'accordion.slideSpeed',
      'accordion-plus-content': 'accordion.plusContent',
      'accordion-minus-content': 'accordion.minusContent',
      'accordion-item-color': 'accordion.itemColor',
      'accordion-item-background-hover': 'accordion.itemBackgroundHover',
      'accordion-content-background': 'accordion.contentBackground',
      'accordion-content-border': 'accordion.contentBorder',
      'accordion-content-color': 'accordion.contentColor',
      'accordion-content-padding': 'accordion.contentPadding',
    },
    // Button
    button: {
      'button-padding': 'button.padding',
      'button-radius': 'button.radius',
      'button-font-size': 'button.fontSize',
      'button-font-family': 'button.fontFamily',
      'button-font-weight': 'button.fontWeight',
      'button-margin': 'button.margin',
      'button-fill': 'button.fill',
      'button-background': 'button.background',
      'button-background-hover': 'button.backgroundHover',
      'button-color': 'button.color',
      'button-color-alt': 'button.colorAlt',
      'button-border': 'button.border',
      'button-hollow-border-width': 'button.hollowBorderWidth',
      'button-opacity-disabled': 'button.opacityDisabled',
      'button-background-hover-lightness': 'button.backgroundHoverLightness',
      'button-hollow-hover-lightness': 'button.hollowHoverLightness',
      'button-transition': 'button.transition',
      'button-responsive-expanded': 'button.responsiveExpanded',
      'button-sizes': 'button.sizes',
    },
  };

  return varMappings[sectionId]?.[sassVar] || `${sectionId}.${sassVar}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

interface ThemePanelProps {
  active?: boolean;
}

export function ThemePanel({ active }: ThemePanelProps) {
  const [globals, updateGlobals] = useGlobals();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['palette']),
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for compilation status events from preview
  useChannel({
    [EVENTS.COMPILE_START]: () => setIsCompiling(true),
    [EVENTS.COMPILE_END]: () => setIsCompiling(false),
  });

  // Use mergeWithDefaults to handle partial objects from URL globals restoration
  const themeState: ThemeState = mergeWithDefaults(
    globals[THEME_STATE_KEY] as Partial<ThemeState> | undefined,
  );

  const updateThemeState = useCallback(
    (newState: ThemeState) => {
      updateGlobals({ [THEME_STATE_KEY]: newState });

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Theme change will be picked up by the decorator
      }, DEBOUNCE_MS);
    },
    [updateGlobals],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleReset = () => {
    updateThemeState(getDefaultThemeState());
  };

  const handleCopyToClipboard = async () => {
    const scss = generateScssExport(themeState);
    try {
      await navigator.clipboard.writeText(scss);
      console.log('[nfs-theme] SCSS copied to clipboard');
    } catch (error) {
      console.error('[nfs-theme] Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    const scss = generateScssExport(themeState);
    const blob = new Blob([scss], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '_nfs-settings.scss';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChange = (sectionId: string, sassVar: string, value: unknown) => {
    const path = getStatePath(sectionId, sassVar);
    const newState = setNestedValue(themeState, path, value);
    updateThemeState(newState);
  };

  // Handle palette preset selection (updates all 5 colors at once)
  const handlePaletteSelect = (newPalette: PaletteState) => {
    updateThemeState({
      ...themeState,
      palette: newPalette,
    });
  };

  const renderControl = (
    section: VariableSection,
    variable: VariableDefinition,
  ) => {
    const path = getStatePath(section.id, variable.sassVar);
    const value = getNestedValue(themeState, path);

    switch (variable.type) {
      case 'color':
        return (
          <ColorControl
            key={variable.sassVar}
            value={value as string}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'boolean':
        return (
          <BooleanControl
            key={variable.sassVar}
            value={value as boolean}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'spacing':
        return (
          <SpacingControl
            key={variable.sassVar}
            value={value as SpacingValue}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'size':
      case 'duration':
        return (
          <SliderControl
            key={variable.sassVar}
            value={value as string}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'linkedColor':
        return (
          <LinkedColorControl
            key={variable.sassVar}
            value={value as LinkedColorValue}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
            palette={themeState.palette as PaletteState}
          />
        );

      case 'select':
        return (
          <SelectControl
            key={variable.sassVar}
            value={value as string}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'text':
        return (
          <TextControl
            key={variable.sassVar}
            value={value as string}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'number':
        return (
          <NumberControl
            key={variable.sassVar}
            value={value as string}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'map':
        return (
          <MapControl
            key={variable.sassVar}
            value={value as ButtonSizesMap}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      case 'percentage':
        return (
          <PercentageControl
            key={variable.sassVar}
            value={value as string}
            onChange={(v) => handleChange(section.id, variable.sassVar, v)}
            variable={variable}
          />
        );

      default:
        return null;
    }
  };

  if (!active) {
    return null;
  }

  return (
    <Panel>
      <Header>
        <Title>Foundation Theme</Title>
        <Actions>
          {isCompiling && (
            <CompileStatus>
              <Spinner />
              Compiling Sass...
            </CompileStatus>
          )}
          <IconButton onClick={handleReset} title="Reset to defaults">
            <ZoomResetIcon />
          </IconButton>
          <IconButton onClick={handleCopyToClipboard} title="Copy SCSS">
            <CopyIcon />
          </IconButton>
          <IconButton onClick={handleDownload} title="Download">
            <DownloadIcon />
          </IconButton>
        </Actions>
      </Header>

      {VARIABLE_SECTIONS.map((section) => (
        <Section key={section.id}>
          <SectionHeader
            title={section.title}
            expanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
          {expandedSections.has(section.id) && (
            <SectionContent>
              {/* Palette selector at the top of Brand Colors section */}
              {section.id === 'palette' && (
                <PaletteSelectorControl
                  currentPalette={themeState.palette}
                  onSelectPalette={handlePaletteSelect}
                />
              )}
              {section.variables.map((variable) =>
                renderControl(section, variable),
              )}
            </SectionContent>
          )}
        </Section>
      ))}
    </Panel>
  );
}
