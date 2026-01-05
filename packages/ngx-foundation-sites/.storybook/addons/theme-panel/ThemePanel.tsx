import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGlobals } from 'storybook/manager-api';
import { styled } from 'storybook/theming';
import { ZoomResetIcon, CopyIcon, DownloadIcon } from '@storybook/icons';

import { THEME_STATE_KEY, DEBOUNCE_MS } from './constants';
import type {
  ThemeState,
  SpacingValue,
  VariableSection,
  VariableDefinition,
} from './types';
import {
  VARIABLE_SECTIONS,
  getDefaultThemeState,
  generateScssExport,
} from '../../../src/storybook/theme-defaults';
import {
  ColorControl,
  SliderControl,
  SpacingControl,
  BooleanControl,
  SectionHeader,
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
    accordion: {
      'accordion-background': 'accordion.background',
      'accordion-plusminus': 'accordion.plusminus',
      'accordion-title-font-size': 'accordion.titleFontSize',
      'accordion-item-padding': 'accordion.itemPadding',
      'nfs-accordion-slide-speed': 'accordion.slideSpeed',
    },
    button: {
      'button-padding': 'button.padding',
      'button-radius': 'button.radius',
      'button-font-size': 'button.fontSize',
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeState: ThemeState =
    (globals[THEME_STATE_KEY] as ThemeState) || getDefaultThemeState();

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
