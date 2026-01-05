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

const SliderWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
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
    width: 14px;
    height: 14px;
    background: ${(props) => props.theme.color.secondary};
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.15s;
  }

  &::-webkit-slider-thumb:hover {
    background: ${(props) => props.theme.color.positive};
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
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
  flex: 0 0 50px;
  font-size: 12px;
  font-family: ${(props) => props.theme.typography.fonts.mono};
  color: ${(props) => props.theme.color.defaultText};
  text-align: right;
`;

/**
 * Parses a percentage string to a number.
 * @example parsePercentage('-20%') => -20
 */
function parsePercentage(value: string): number {
  const match = value.match(/^(-?\d+(?:\.\d+)?)\s*%?$/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
}

/**
 * Percentage control for values like $button-background-hover-lightness.
 *
 * Supports negative percentages (e.g., -20% for darkening).
 * Range defaults to -100% to 100%.
 */
export function PercentageControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<string>) {
  const numValue = parsePercentage(value);
  const min = variable.min ?? -100;
  const max = variable.max ?? 100;
  const step = variable.step ?? 5;

  // Local state for live preview while dragging
  const [localValue, setLocalValue] = useState(numValue);
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
    setLocalValue(numValue);
  }, [numValue]);

  // Update local preview immediately, debounce parent callback
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = parseFloat(e.target.value);
    setLocalValue(newNum);
    debouncedOnChange(`${newNum}%`);
  };

  // Blur triggers immediate commit (cancels pending debounce)
  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const newValue = `${localValue}%`;
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <SliderWrapper>
        <Slider
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleInput}
          onBlur={handleBlur}
          disabled={disabled}
        />
        <ValueDisplay>{localValue}%</ValueDisplay>
      </SliderWrapper>
    </Container>
  );
}
