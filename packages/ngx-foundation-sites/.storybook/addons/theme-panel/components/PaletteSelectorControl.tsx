import React, { useMemo } from 'react';
import { styled } from 'storybook/theming';
import type { PaletteState } from '../types';
import { PALETTE_PRESETS } from '../../../../src/storybook/theme-defaults';

// ═══════════════════════════════════════════════════════════════════════════════
// Styled Components
// ═══════════════════════════════════════════════════════════════════════════════

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${(props) => props.theme.color.border};
`;

const Label = styled.label`
  flex: 0 0 100px;
  font-size: 12px;
  color: ${(props) => props.theme.color.defaultText};
`;

const Select = styled.select`
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid ${(props) => props.theme.color.border};
  border-radius: 4px;
  background: ${(props) => props.theme.input.background};
  color: ${(props) => props.theme.input.color};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.color.secondary};
  }

  &:hover {
    border-color: ${(props) => props.theme.color.mediumdark};
  }
`;

const SwatchRow = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

const Swatch = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.color.border};
  background-color: ${(props) => props.color};
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const SwatchLabel = styled.span`
  font-size: 10px;
  color: ${(props) => props.theme.color.mediumdark};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaletteSelectorControlProps {
  /** Current palette colors */
  currentPalette: PaletteState;
  /** Callback when a palette preset is selected */
  onSelectPalette: (palette: PaletteState) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Palette preset selector with color swatch preview.
 *
 * Allows users to quickly apply pre-defined color palettes from popular
 * design systems (Bootstrap, Material, Tailwind, etc.) or use custom colors.
 *
 * The dropdown auto-detects which preset matches the current colors,
 * showing "Custom" when the colors don't match any preset.
 */
export function PaletteSelectorControl({
  currentPalette,
  onSelectPalette,
}: PaletteSelectorControlProps) {
  // Detect which preset matches current colors (or 'custom')
  const selectedPresetId = useMemo(() => {
    const match = PALETTE_PRESETS.find(
      (p) =>
        p.colors.primary === currentPalette.primary &&
        p.colors.secondary === currentPalette.secondary &&
        p.colors.success === currentPalette.success &&
        p.colors.warning === currentPalette.warning &&
        p.colors.alert === currentPalette.alert,
    );
    return match?.id ?? 'custom';
  }, [currentPalette]);

  // Handle dropdown change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    if (presetId === 'custom') {
      // "Custom" selected - keep current colors (no change)
      return;
    }
    const preset = PALETTE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onSelectPalette(preset.colors);
    }
  };

  return (
    <Container>
      <Label>Palette</Label>
      <Select value={selectedPresetId} onChange={handleChange}>
        <option value="custom">Custom</option>
        {PALETTE_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </Select>
      <SwatchRow title="Current palette colors">
        <Swatch color={currentPalette.primary} title="Primary" />
        <Swatch color={currentPalette.secondary} title="Secondary" />
        <Swatch color={currentPalette.success} title="Success" />
        <Swatch color={currentPalette.warning} title="Warning" />
        <Swatch color={currentPalette.alert} title="Alert" />
      </SwatchRow>
    </Container>
  );
}
