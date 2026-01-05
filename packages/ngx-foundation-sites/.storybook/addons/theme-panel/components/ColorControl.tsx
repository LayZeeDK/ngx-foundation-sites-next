import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from 'storybook/theming';
import type { ControlProps } from '../types';
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

const ColorSwatch = styled.input`
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${(props) => props.theme.color.border};
  border-radius: 4px;
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }

  &::-moz-color-swatch {
    border: none;
    border-radius: 2px;
  }
`;

const HexInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  font-family: ${(props) => props.theme.typography.fonts.mono};
  border: 1px solid ${(props) => props.theme.color.border};
  border-radius: 4px;
  background: ${(props) => props.theme.input.background};
  color: ${(props) => props.theme.input.color};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.color.secondary};
  }
`;

/**
 * Color picker control with hex input.
 *
 * Uses local state for live preview while dragging and debounces
 * parent onChange to throttle Sass compilation.
 */
export function ColorControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<string>) {
  // Local state for live preview while dragging
  const [localColor, setLocalColor] = useState(value);
  const [hexInput, setHexInput] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced onChange to throttle Sass compilation
  const debouncedOnChange = useCallback(
    (newValue: string) => {
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

  // Sync local state when parent value changes (e.g., reset)
  useEffect(() => {
    setLocalColor(value);
    setHexInput(value);
  }, [value]);

  // Update local preview immediately, debounce parent callback
  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);
    setHexInput(newColor);
    debouncedOnChange(newColor);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexInput(hex);

    // Update color swatch preview and trigger debounced change if valid
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setLocalColor(hex);
      debouncedOnChange(hex);
    }
  };

  const handleHexBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let hex = e.target.value.trim();

    // Add # if missing
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    // Expand 3-digit hex to 6-digit
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    // Update if valid (immediate, not debounced)
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const normalized = hex.toLowerCase();
      setLocalColor(normalized);
      setHexInput(normalized);
      // Cancel any pending debounce and apply immediately on blur
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (normalized !== value) {
        onChange(normalized);
      }
    } else {
      // Revert to current value if invalid
      setHexInput(value);
    }
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <ColorSwatch
        type="color"
        value={localColor}
        onChange={handleColorInput}
        disabled={disabled}
      />
      <HexInput
        type="text"
        value={hexInput}
        onChange={handleHexChange}
        onBlur={handleHexBlur}
        disabled={disabled}
        maxLength={7}
        placeholder="#000000"
      />
    </Container>
  );
}
