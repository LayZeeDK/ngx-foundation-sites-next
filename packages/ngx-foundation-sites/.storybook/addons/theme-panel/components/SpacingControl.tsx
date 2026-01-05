import React from 'react';
import { styled } from 'storybook/theming';
import type { SpacingControlProps } from '../types';

const Container = styled.div`
  margin-bottom: 12px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const Label = styled.label`
  flex: 0 0 100px;
  font-size: 12px;
  color: ${(props) => props.theme.color.defaultText};
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 100px;
  margin-bottom: 4px;
`;

const SubLabel = styled.span`
  flex: 0 0 70px;
  font-size: 11px;
  color: ${(props) => props.theme.color.mediumdark};
`;

const Slider = styled.input`
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: ${(props) => props.theme.color.border};
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: ${(props) => props.theme.color.secondary};
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s;
  }

  &::-webkit-slider-thumb:hover {
    background: ${(props) => props.theme.color.positive};
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: ${(props) => props.theme.color.secondary};
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
  }

  &::-moz-range-thumb:hover {
    background: ${(props) => props.theme.color.positive};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ValueDisplay = styled.span`
  flex: 0 0 60px;
  font-size: 11px;
  font-family: ${(props) => props.theme.typography.fonts.mono};
  color: ${(props) => props.theme.color.defaultText};
  text-align: right;
`;

/**
 * Parses a CSS value string into number and unit.
 */
function parseValue(value: string): { number: number; unit: string } {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (match) {
    return {
      number: parseFloat(match[1]),
      unit: match[2] || '',
    };
  }
  return { number: 0, unit: '' };
}

/**
 * Dual slider control for spacing values (vertical + horizontal).
 */
export function SpacingControl({
  value,
  onChange,
  variable,
  disabled,
}: SpacingControlProps) {
  const unit = variable.unit || 'rem';
  const min = variable.min ?? 0;
  const max = variable.max ?? 3;
  const step = variable.step ?? 0.25;

  const { number: vNum } = parseValue(value.vertical);
  const { number: hNum } = parseValue(value.horizontal);

  const handleVerticalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange({
      ...value,
      vertical: `${newValue}${unit}`,
    });
  };

  const handleHorizontalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange({
      ...value,
      horizontal: `${newValue}${unit}`,
    });
  };

  return (
    <Container>
      <LabelRow>
        <Label>{variable.label}</Label>
      </LabelRow>
      <SliderRow>
        <SubLabel>Vertical</SubLabel>
        <Slider
          type="range"
          min={min}
          max={max}
          step={step}
          value={vNum}
          onChange={handleVerticalChange}
          disabled={disabled}
        />
        <ValueDisplay>{value.vertical}</ValueDisplay>
      </SliderRow>
      <SliderRow>
        <SubLabel>Horizontal</SubLabel>
        <Slider
          type="range"
          min={min}
          max={max}
          step={step}
          value={hNum}
          onChange={handleHorizontalChange}
          disabled={disabled}
        />
        <ValueDisplay>{value.horizontal}</ValueDisplay>
      </SliderRow>
    </Container>
  );
}
