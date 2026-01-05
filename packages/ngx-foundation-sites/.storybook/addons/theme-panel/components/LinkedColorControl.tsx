import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from 'storybook/theming';
import type {
  LinkedColorControlProps,
  LinkedColorValue,
  PaletteState,
} from '../types';
import { resolveLinkedColor } from '../types';
import { DEBOUNCE_MS } from '../constants';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Label = styled.label`
  flex: 0 0 100px;
  font-size: 12px;
  color: ${(props) => props.theme.color.defaultText};
`;

const ControlWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModeSelect = styled.select`
  width: 100px;
  height: 28px;
  padding: 0 4px;
  font-size: 11px;
  font-family: ${(props) => props.theme.typography.fonts.base};
  color: ${(props) => props.theme.color.defaultText};
  background-color: ${(props) => props.theme.input.background};
  border: 1px solid ${(props) => props.theme.input.border};
  border-radius: 4px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${(props) => props.theme.color.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 32px;
  height: 28px;
  background-color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.theme.color.border};
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${(props) => props.theme.color.secondary};
  }
`;

const ColorInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const HexInput = styled.input`
  width: 80px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  font-family: ${(props) => props.theme.typography.fonts.mono};
  color: ${(props) => props.theme.color.defaultText};
  background-color: ${(props) => props.theme.input.background};
  border: 1px solid ${(props) => props.theme.input.border};
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: ${(props) => props.theme.color.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PalettePreview = styled.div<{ $color: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background-color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.theme.color.border};
  border-radius: 4px;
  font-size: 11px;
  color: ${(props) => {
    // Simple contrast check for text color
    const hex = props.$color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }};
`;

/** Palette key labels for the dropdown */
const PALETTE_OPTIONS: { key: keyof PaletteState; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'alert', label: 'Alert' },
];

/**
 * Validates a hex color string.
 */
function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

/**
 * Expands shorthand hex (#RGB) to full (#RRGGBB).
 */
function expandHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

/**
 * Linked color control with palette reference support.
 *
 * Allows users to either:
 * - Select a palette color (Primary, Secondary, etc.) that stays linked
 * - Use a custom color with a color picker and hex input
 *
 * This creates a design system experience where component colors
 * can stay in sync with brand colors.
 */
export function LinkedColorControl({
  value,
  onChange,
  variable,
  palette,
  disabled,
}: LinkedColorControlProps) {
  const resolvedColor = resolveLinkedColor(value, palette);

  // Local state for custom color input
  const [localHex, setLocalHex] = useState(value.customColor ?? '#000000');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced onChange for custom color
  const debouncedOnChange = useCallback(
    (newValue: LinkedColorValue) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, DEBOUNCE_MS);
    },
    [onChange],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Sync local state when value changes
  useEffect(() => {
    if (value.mode === 'custom' && value.customColor) {
      setLocalHex(value.customColor);
    }
  }, [value]);

  // Handle mode/palette selection change
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === 'custom') {
      // Switch to custom mode with current resolved color as starting point
      onChange({
        mode: 'custom',
        customColor: resolvedColor,
      });
    } else {
      // Switch to palette mode
      onChange({
        mode: 'palette',
        paletteKey: selectedValue as keyof PaletteState,
      });
    }
  };

  // Handle color picker change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toUpperCase();
    setLocalHex(newColor);
    debouncedOnChange({
      mode: 'custom',
      customColor: newColor,
    });
  };

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setLocalHex(newHex);

    if (isValidHex(newHex)) {
      debouncedOnChange({
        mode: 'custom',
        customColor: expandHex(newHex).toUpperCase(),
      });
    }
  };

  // Handle hex input blur - validate and commit
  const handleHexBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isValidHex(localHex)) {
      const finalHex = expandHex(localHex).toUpperCase();
      setLocalHex(finalHex);
      if (finalHex !== value.customColor) {
        onChange({
          mode: 'custom',
          customColor: finalHex,
        });
      }
    } else {
      // Reset to previous valid value
      setLocalHex(value.customColor ?? '#000000');
    }
  };

  // Determine current select value
  const selectValue =
    value.mode === 'palette' ? (value.paletteKey ?? 'primary') : 'custom';

  return (
    <Container>
      <Label>{variable.label}</Label>
      <ControlWrapper>
        <ModeSelect
          value={selectValue}
          onChange={handleModeChange}
          disabled={disabled}
        >
          <option value="custom">Custom</option>
          {PALETTE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </ModeSelect>

        {value.mode === 'custom' ? (
          <>
            <ColorSwatch $color={localHex}>
              <ColorInput
                type="color"
                value={isValidHex(localHex) ? expandHex(localHex) : '#000000'}
                onChange={handleColorPickerChange}
                disabled={disabled}
              />
            </ColorSwatch>
            <HexInput
              type="text"
              value={localHex}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              disabled={disabled}
              placeholder="#RRGGBB"
            />
          </>
        ) : (
          <PalettePreview $color={resolvedColor}>
            {resolvedColor}
          </PalettePreview>
        )}
      </ControlWrapper>
    </Container>
  );
}
