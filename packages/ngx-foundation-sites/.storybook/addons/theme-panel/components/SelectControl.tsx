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

const Select = styled.select`
  flex: 1;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  font-family: ${(props) => props.theme.typography.fonts.base};
  color: ${(props) => props.theme.color.defaultText};
  background-color: ${(props) => props.theme.input.background};
  border: 1px solid ${(props) => props.theme.input.border};
  border-radius: 4px;
  cursor: pointer;
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
`;

/**
 * Select control for dropdown options.
 *
 * Used for variables with predefined choices like text direction (ltr/rtl)
 * or button fill style (solid/hollow).
 */
export function SelectControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<string>) {
  const options = variable.options ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <Select value={value} onChange={handleChange} disabled={disabled}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Container>
  );
}
