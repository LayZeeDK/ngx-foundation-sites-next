import React from 'react';
import { styled } from 'storybook/theming';
import type { ControlProps } from '../types';

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
 */
export function ColorControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<string>) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
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

    // Update if valid
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex.toLowerCase());
    }
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <ColorSwatch
        type="color"
        value={value}
        onChange={handleColorChange}
        disabled={disabled}
      />
      <HexInput
        type="text"
        value={value}
        onChange={handleHexChange}
        onBlur={handleHexBlur}
        disabled={disabled}
        maxLength={7}
        placeholder="#000000"
      />
    </Container>
  );
}
