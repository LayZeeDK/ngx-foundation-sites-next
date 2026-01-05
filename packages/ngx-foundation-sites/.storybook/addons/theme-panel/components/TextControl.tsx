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

const Input = styled.input`
  flex: 1;
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

  &::placeholder {
    color: ${(props) => props.theme.color.mediumdark};
    opacity: 0.7;
  }
`;

/**
 * Text control for free-form string values.
 *
 * Uses debouncing to throttle Sass compilation during typing.
 * Used for font families, icon content, CSS transitions, etc.
 */
export function TextControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<string>) {
  // Local state for live preview while typing
  const [localValue, setLocalValue] = useState(value);
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
    setLocalValue(value);
  }, [value]);

  // Update local preview immediately, debounce parent callback
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  // Blur triggers immediate commit (cancels pending debounce)
  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={variable.placeholder}
        disabled={disabled}
      />
    </Container>
  );
}
