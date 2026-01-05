import React from 'react';
import { styled } from 'storybook/theming';
import { ChevronDownIcon, ChevronRightIcon } from '@storybook/icons';

interface SectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}

const Header = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  border-bottom: 1px solid ${(props) => props.theme.appBorderColor};

  &:hover {
    background: ${(props) => props.theme.background.hoverable};
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.color.mediumdark};
`;

const Title = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => props.theme.color.defaultText};
`;

/**
 * Collapsible section header for the theme panel.
 */
export function SectionHeader({
  title,
  expanded,
  onToggle,
}: SectionHeaderProps) {
  return (
    <Header onClick={onToggle} type="button" aria-expanded={expanded}>
      <IconWrapper>
        {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </IconWrapper>
      <Title>{title}</Title>
    </Header>
  );
}
