import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from 'storybook/theming';
import type { MapControlProps } from '../types';
import { DEBOUNCE_MS } from '../constants';

const Container = styled.div`
  margin-bottom: 8px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Label = styled.label`
  font-size: 12px;
  color: ${(props) => props.theme.color.defaultText};
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  padding: 2px 6px;
  font-size: 10px;
  color: ${(props) => props.theme.color.mediumdark};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    background: ${(props) => props.theme.color.border};
    color: ${(props) => props.theme.color.defaultText};
  }
`;

const EntriesContainer = styled.div<{ $expanded: boolean }>`
  display: ${(props) => (props.$expanded ? 'block' : 'none')};
  margin-left: 16px;
  padding-left: 8px;
  border-left: 2px solid ${(props) => props.theme.color.border};
`;

const EntryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const EntryLabel = styled.span`
  flex: 0 0 60px;
  font-size: 11px;
  color: ${(props) => props.theme.color.mediumdark};
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
  flex: 0 0 50px;
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
 * Map control for key-value Sass maps like $button-sizes.
 *
 * Displays an expandable list of entries, each with its own slider control.
 * The unit is inferred from the first entry's value.
 */
export function MapControl({
  value,
  onChange,
  variable,
  disabled,
}: MapControlProps) {
  const [expanded, setExpanded] = useState(false);
  const entries = variable.mapEntries ?? [];
  const unit = variable.unit ?? 'rem';
  const min = variable.min ?? 0.5;
  const max = variable.max ?? 2;
  const step = variable.step ?? 0.05;

  // Local state for live preview while dragging
  const [localValues, setLocalValues] = useState<Record<string, number>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize local values from props
  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const entry of entries) {
      const current = value[entry.key] ?? entry.defaultValue;
      const { number } = parseValue(current);
      initial[entry.key] = number;
    }
    setLocalValues(initial);
  }, [value, entries]);

  // Debounced onChange to throttle Sass compilation
  const debouncedOnChange = useCallback(
    (newValue: Record<string, string>) => {
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

  // Handle entry value change
  const handleEntryChange = (key: string, newNum: number) => {
    setLocalValues((prev) => ({ ...prev, [key]: newNum }));

    // Build complete map with new value
    const newMap: Record<string, string> = {};
    for (const entry of entries) {
      const num = entry.key === key ? newNum : localValues[entry.key];
      newMap[entry.key] = `${num}${unit}`;
    }
    debouncedOnChange(newMap);
  };

  // Blur triggers immediate commit
  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const newMap: Record<string, string> = {};
    for (const entry of entries) {
      newMap[entry.key] = `${localValues[entry.key]}${unit}`;
    }
    onChange(newMap);
  };

  return (
    <Container>
      <Header>
        <Label>{variable.label}</Label>
        <ExpandButton onClick={() => setExpanded(!expanded)}>
          {expanded ? '▼ Collapse' : '▶ Expand'}
        </ExpandButton>
      </Header>

      <EntriesContainer $expanded={expanded}>
        {entries.map((entry) => (
          <EntryRow key={entry.key}>
            <EntryLabel>{entry.label}</EntryLabel>
            <SliderWrapper>
              <Slider
                type="range"
                min={min}
                max={max}
                step={step}
                value={localValues[entry.key] ?? 0}
                onChange={(e) =>
                  handleEntryChange(entry.key, parseFloat(e.target.value))
                }
                onBlur={handleBlur}
                disabled={disabled}
              />
              <ValueDisplay>
                {localValues[entry.key]?.toFixed(2) ?? '0.00'}
                {unit}
              </ValueDisplay>
            </SliderWrapper>
          </EntryRow>
        ))}
      </EntriesContainer>
    </Container>
  );
}
