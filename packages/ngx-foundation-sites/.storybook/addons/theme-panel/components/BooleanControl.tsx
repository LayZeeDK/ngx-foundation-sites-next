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

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${(props) => props.theme.color.secondary};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StateLabel = styled.span<{ checked: boolean }>`
  font-size: 12px;
  color: ${(props) =>
    props.checked ? props.theme.color.positive : props.theme.color.mediumdark};
`;

/**
 * Checkbox control for boolean values.
 */
export function BooleanControl({
  value,
  onChange,
  variable,
  disabled,
}: ControlProps<boolean>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <Container>
      <Label>{variable.label}</Label>
      <Checkbox
        type="checkbox"
        checked={value}
        onChange={handleChange}
        disabled={disabled}
      />
      <StateLabel checked={value}>{value ? 'true' : 'false'}</StateLabel>
    </Container>
  );
}
