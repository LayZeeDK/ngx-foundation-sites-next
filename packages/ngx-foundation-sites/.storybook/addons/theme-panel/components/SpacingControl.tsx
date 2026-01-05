import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from 'storybook/theming';
import type { SpacingControlProps, SpacingValue } from '../types';
import { DEBOUNCE_MS } from '../constants';

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
 *
 * Uses local state for live preview while dragging and debounces
 * parent onChange to throttle Sass compilation. Blur triggers immediate commit.
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

  // Local state for live preview while dragging
  const [localVertical, setLocalVertical] = useState(vNum);
  const [localHorizontal, setLocalHorizontal] = useState(hNum);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced onChange to throttle Sass compilation
  const debouncedOnChange = useCallback(
    (newValue: SpacingValue) => {
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
    setLocalVertical(vNum);
  }, [vNum]);

  useEffect(() => {
    setLocalHorizontal(hNum);
  }, [hNum]);

  // Update local preview immediately, debounce parent callback
  const handleVerticalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = parseFloat(e.target.value);
    setLocalVertical(newNum);
    debouncedOnChange({ ...value, vertical: `${newNum}${unit}` });
  };

  const handleHorizontalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = parseFloat(e.target.value);
    setLocalHorizontal(newNum);
    debouncedOnChange({ ...value, horizontal: `${newNum}${unit}` });
  };

  // Blur triggers immediate commit (cancels pending debounce)
  const handleVerticalBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const newVertical = `${localVertical}${unit}`;
    if (newVertical !== value.vertical) {
      onChange({ ...value, vertical: newVertical });
    }
  };

  const handleHorizontalBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const newHorizontal = `${localHorizontal}${unit}`;
    if (newHorizontal !== value.horizontal) {
      onChange({ ...value, horizontal: newHorizontal });
    }
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
          value={localVertical}
          onChange={handleVerticalInput}
          onBlur={handleVerticalBlur}
          disabled={disabled}
        />
        <ValueDisplay>
          {localVertical}
          {unit}
        </ValueDisplay>
      </SliderRow>
      <SliderRow>
        <SubLabel>Horizontal</SubLabel>
        <Slider
          type="range"
          min={min}
          max={max}
          step={step}
          value={localHorizontal}
          onChange={handleHorizontalInput}
          onBlur={handleHorizontalBlur}
          disabled={disabled}
        />
        <ValueDisplay>
          {localHorizontal}
          {unit}
        </ValueDisplay>
      </SliderRow>
    </Container>
  );
}
