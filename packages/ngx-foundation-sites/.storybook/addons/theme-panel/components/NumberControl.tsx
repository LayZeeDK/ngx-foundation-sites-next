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

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
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
  transition: border-color 0.15s;
  text-align: right;

  &:focus {
    border-color: ${(props) => props.theme.color.secondary};
  }

  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.color.mediumdark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Hide spin buttons */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
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

/**
 * Number control for unitless numeric values.
 *
 * Provides both a slider and text input for precise control.
 * Used for line-height, opacity, and other unitless numbers.
 */
export function NumberControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<string>) {
  const numValue = parseFloat(value) || 0;
  const min = variable.min ?? 0;
  const max = variable.max ?? 100;
  const step = variable.step ?? 0.1;

  // Local state for live preview
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
    if (!isNaN(newNum)) {
      setLocalValue(newNum);
      debouncedOnChange(String(newNum));
    }
  };

  // Blur triggers immediate commit (cancels pending debounce)
  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const newValue = String(localValue);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <InputWrapper>
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
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleInput}
          onBlur={handleBlur}
          disabled={disabled}
        />
      </InputWrapper>
    </Container>
  );
}
